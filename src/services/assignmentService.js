import { getDataProvider } from "../data";
import { getCourses } from "./academicsService";
import { clearServiceCache } from "../hooks/useService";
import { formatClassName, extractLevel, extractSection } from "../shared/utils/classIdentity";

/**
 * assignmentService.js
 *
 * Operational service for managing assignments, submissions, and academic task tracking.
 * Designed as a lightweight relational ERP module.
 */

/**
 * Helper to resolve course and class names for assignments
 */
const resolveAssignmentDetails = async (assignments) => {
  const provider = getDataProvider();
  const allSubjects = await provider.getSubjects();
  const allClasses = await provider.getClasses();

  return assignments.map((asgn) => {
    const subject = allSubjects.find((s) => s.id === asgn.subjectId);
    const cls = allClasses.find((c) => c.id === asgn.classId);
    return {
      ...asgn,
      subjectName: subject ? subject.name : asgn.subjectId,
      className: cls ? cls.name : asgn.classId,
      classDisplayName: cls ? cls.displayName : asgn.classId,
    };
  });
};

/**
 * Fetches all assignments for a class
 */
export const getAssignmentsByClass = async (classId) => {
  const provider = getDataProvider();
  const assignments = await provider.getAssignmentsByClass(classId);
  return resolveAssignmentDetails(assignments);
};

/**
 * Fetches all assignments for a specific student's class
 * and resolves their current submission status.
 * Standardizes status derivations to prevent duplicate db states.
 */
export const getStudentAssignments = async (studentId) => {
  const provider = getDataProvider();
  
  const classAssignments = await provider.getAssignmentsByStudent(studentId);
  
  // Basic relationship: Only show assignments for subjects the student is actually enrolled in
  const enrolledCourses = await getCourses(studentId);
  const subjectIds = enrolledCourses.map((c) => c.id);
  
  const assignments = classAssignments.filter((a) => subjectIds.includes(a.subjectId));
  
  const submissions = await provider.getSubmissionsByStudent(studentId);
  const subjects = await provider.getSubjects();

  // Relational Mapping: Join assignments with student submissions
  return assignments.map((asgn) => {
    const submission = submissions.find((s) => s.assignmentId === asgn.id);

    // Status Logic
    let status = "PENDING";
    const dueDate = new Date(asgn.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now;
    const isDueSoon = !isOverdue && dueDate - now < 48 * 60 * 60 * 1000; // 48 hours

    if (submission) {
      status = submission.status === "GRADED" ? "REVIEWED" : "SUBMITTED";
    } else if (isOverdue) {
      status = "OVERDUE";
    } else if (isDueSoon) {
      status = "DUE_SOON";
    }

    const course = subjects.find((c) => c.id === asgn.subjectId);

    return {
      ...asgn,
      subjectName: course ? course.name : asgn.subjectId,
      status,
      submissionDetails: submission || null,
    };
  });
};

/**
 * Alias of getStudentAssignments to satisfy getAssignmentsByStudent requirement
 */
export const getAssignmentsByStudent = getStudentAssignments;

/**
 * Fetches all assignments created by or assigned to a specific teacher
 */
export const getAssignmentsByTeacher = async (teacherId) => {
  const provider = getDataProvider();
  
  // Basic relationship: Teachers only see assignments they created for their subjects
  const assignments = await provider.getAssignmentsByTeacher(teacherId);

  const resolved = await resolveAssignmentDetails(assignments);

  const allSubmissions = await provider.getSubmissions();
  const allStudents = await provider.getStudents();

  return resolved.map((asgn) => {
    // Roster count: Find how many students in this class take this subject (respecting stream)
    const classStudents = allStudents.filter((s) => s.classId === asgn.classId);

    const asgnSubmissions = allSubmissions.filter(
      (s) => s.assignmentId === asgn.id,
    );
    const submittedCount = asgnSubmissions.filter(
      (s) => s.status === "SUBMITTED" || s.status === "GRADED",
    ).length;
    const gradedCount = asgnSubmissions.filter(
      (s) => s.status === "GRADED",
    ).length;

    return {
      ...asgn,
      submissionsCount: submittedCount,
      totalStudents: classStudents.length, // relational total class roster
      gradedCount: gradedCount,
      gradingProgress:
        submittedCount > 0
          ? Math.round((gradedCount / submittedCount) * 100)
          : 0,
    };
  });
};

export const createAssignment = async (assignmentData) => {
  if (!assignmentData.description?.trim() && !assignmentData.attachment) {
    throw new Error("Provide assignment description or attachment.");
  }

  const provider = getDataProvider();
  const allSubjects = await provider.getSubjects();
  const allClasses = await provider.getClasses();

  const subject = allSubjects.find((s) => s.id === assignmentData.subjectId);
  const cls = allClasses.find((c) => c.id === assignmentData.classId);

  let classNameVal = assignmentData.classId;
  if (cls) {
    classNameVal = formatClassName(cls.level || extractLevel(cls.id), cls.section || extractSection(cls.id));
  } else {
    classNameVal = formatClassName(extractLevel(assignmentData.classId), extractSection(assignmentData.classId));
  }

  const enrichedData = {
    ...assignmentData,
    subjectName: subject ? subject.name : assignmentData.subjectId,
    className: classNameVal,
    classDisplayName: classNameVal,
  };

  const newAssignment = await provider.createAssignment(enrichedData);
  clearServiceCache("assignmentService");
  return newAssignment;
};

/**
 * Updates an assignment
 */
export const updateAssignment = async (assignmentId, updates) => {
  const provider = getDataProvider();
  
  let enrichedUpdates = { ...updates };
  
  if (updates.subjectId || updates.classId) {
    const allSubjects = await provider.getSubjects();
    const allClasses = await provider.getClasses();
    
    if (updates.subjectId) {
      const subject = allSubjects.find((s) => s.id === updates.subjectId);
      enrichedUpdates.subjectName = subject ? subject.name : updates.subjectId;
    }
    
    if (updates.classId) {
      const cls = allClasses.find((c) => c.id === updates.classId);
      let classNameVal = updates.classId;
      if (cls) {
        classNameVal = formatClassName(cls.level || extractLevel(cls.id), cls.section || extractSection(cls.id));
      } else {
        classNameVal = formatClassName(extractLevel(updates.classId), extractSection(updates.classId));
      }
      enrichedUpdates.className = classNameVal;
      enrichedUpdates.classDisplayName = classNameVal;
    }
  }

  const updatedAssignment = await provider.updateAssignment(assignmentId, {
    ...enrichedUpdates,
    updatedAt: new Date().toISOString(),
  });
  return updatedAssignment;
};

/**
 * Deletes an assignment
 */
export const deleteAssignment = async (assignmentId) => {
  const provider = getDataProvider();
  const result = await provider.deleteAssignment(assignmentId);
  return result;
};

/**
 * Submit assignment response.
 * Simulates text and link based submissions to central submissions registry.
 */
export const submitAssignment = async (
  studentId,
  assignmentId,
  submissionData,
) => {
  if (!submissionData.submissionText?.trim() && !submissionData.attachment) {
    throw new Error("Provide submission text or attachment.");
  }

  const provider = getDataProvider();
  const newSubmission = await provider.createSubmission({
    assignmentId,
    studentId,
    ...submissionData,
  });
  return {
    success: true,
    submission: newSubmission,
  };
};

/**
 * Grade a student's submission.
 * Supports direct grading of student roster items.
 */
export const gradeSubmission = async (submissionId, gradeData) => {
  const provider = getDataProvider();

  let submission;
  if (!submissionId || submissionId.startsWith("draft-")) {
    // Roster grading mode: student hasn't submitted yet, teacher directly assigns a grade
    submission = await provider.createSubmission({
      ...gradeData,
      status: "GRADED",
      gradedAt: new Date().toISOString()
    });
  } else {
    submission = await provider.updateSubmission(submissionId, {
      ...gradeData,
      status: "GRADED",
      gradedAt: new Date().toISOString(),
    });
  }

  return {
    success: true,
    submission,
  };
};

/**
 * Fetches all submissions (the entire class roster) for an assignment
 * representing real-world grading dashboards.
 */
export const getSubmissionsByAssignment = async (assignmentId) => {
  const provider = getDataProvider();
  const submissions = await provider.getSubmissionsByAssignment(assignmentId);
  const assignment = await provider.getAssignmentById(assignmentId);
  if (!assignment) return [];

  const students = await provider.getStudents();

  // Find students in this assignment's class
  const classStudents = students.filter(s => {
    if (assignment.classId && s.classId === assignment.classId) return true;
    if (assignment.className && s.className === assignment.className) return true;
    return false;
  });

  if (classStudents.length === 0) {
    return submissions.map(sub => {
      const student = students.find(s => s.studentId === sub.studentId || s.id === sub.studentId) || {};
      return {
        ...sub,
        admissionNo: student.admissionNumber || student.admissionNo || "N/A"
      };
    });
  }

  return classStudents.map(student => {
    const studentIdentifier = student.studentId || student.id;
    const subm = submissions.find(s => s.studentId === studentIdentifier);
    return {
      studentId: studentIdentifier,
      studentName: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      admissionNo: student.admissionNumber || student.admissionNo || "N/A",
      ...(subm || {}),
      id: subm ? subm.id : `draft-${studentIdentifier}`,
      status: subm ? subm.status : "PENDING",
    };
  });
};

/**
 * Fetches specific submission status for a student and assignment
 */
export const getSubmissionStatus = async (studentId, assignmentId) => {
  const provider = getDataProvider();
  const submission = await provider.getSubmissionStatus(
    studentId,
    assignmentId,
  );
  return submission || null;
};

/**
 * Calculates academic task progress per subject for a student
 */
export const getAcademicProgress = async (studentId) => {
  const assignments = await getStudentAssignments(studentId);
  const enrolledCourses = await getCourses(studentId);

  return enrolledCourses.map((course) => {
    const subjectId = course.id;
    const subAssignments = assignments.filter((a) => a.subjectId === subjectId);
    const total = subAssignments.length;
    const completed = subAssignments.filter((a) =>
      ["SUBMITTED", "REVIEWED", "GRADED"].includes(a.status),
    ).length;

    return {
      subjectId: subjectId,
      subjectName: course.name,
      totalTasks: total,
      completedTasks: completed,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      status:
        total === 0
          ? "NO_TASKS"
          : completed === total
            ? "COMPLETED"
            : "IN_PROGRESS",
    };
  });
};

/**
 * Fetches the academic timeline (upcoming and overdue work) for students
 */
export const getAcademicTimeline = async (studentId) => {
  const assignments = await getStudentAssignments(studentId);

  return {
    overdue: assignments.filter((a) => a.status === "OVERDUE"),
    upcoming: assignments
      .filter((a) => ["PENDING", "DUE_SOON"].includes(a.status))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    recent: assignments
      .filter((a) => ["SUBMITTED", "REVIEWED"].includes(a.status))
      .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
      .slice(0, 5),
  };
};
