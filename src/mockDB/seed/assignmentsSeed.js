import { teachersSeed } from "./teachersSeed";
import { studentsSeed } from "./studentsSeed";

const expandClasses = (className) => {
  if (!className) return [];
  if (className === "All Classes") {
    return ["10-A", "10-B", "10-C", "10-D", "11-A", "11-B", "11-C", "11-D"];
  }
  if (className === "10") {
    return ["10-A", "10-B", "10-C", "10-D"];
  }
  if (className.includes(",")) {
    return className.split(",").map((c) => c.trim());
  }
  return [className];
};

const generateAssignmentsData = () => {
  const assignments = [];
  const submissions = [];
  let asgnCount = 1;

  for (const teacher of teachersSeed) {
    if (
      !teacher.subjectId ||
      teacher.subjectName === "Physical Education" ||
      teacher.subjectName === "Art & Music"
    ) {
      continue;
    }

    const targetClasses = expandClasses(teacher.className);

    for (const className of targetClasses) {
      const classStudents = studentsSeed.filter(
        (s) => s.className === className
      );
      if (classStudents.length < 2) continue; // Safety check

      const student1 = classStudents[0];
      const student2 = classStudents[1];

      const [classLevel, section] = className.split("-");

      // Assignment 1: Completed / Graded
      const closedAsgnId = `asgn-${String(asgnCount++).padStart(4, "0")}`;

      assignments.push({
        id: closedAsgnId,
        assignmentId: closedAsgnId,
        title: `${teacher.subjectName} - Assignment 1`,
        description: `Past assignment for ${teacher.subjectName} in class ${className}`,
        subjectName: teacher.subjectName,
        subjectId: teacher.subjectId,
        className: className,
        classLevel: classLevel,
        section: section,
        stream: teacher.stream || null,
        teacherName: teacher.teacherName,
        teacherId: teacher.teacherId,
        dueDate: "2026-05-15", // Past date
        maxMarks: 20,
        status: "completed",
        submissions: [],
      });

      // Exactly 2 student submissions
      submissions.push({
        id: `subm-${closedAsgnId}-1`,
        assignmentId: closedAsgnId,
        studentId: student1.studentId,
        studentName: student1.name,
        status: "GRADED",
        submittedAt: "2026-05-14",
        marksObtained: 18,
        grade: "A",
        remarks: "Excellent work!",
      });

      submissions.push({
        id: `subm-${closedAsgnId}-2`,
        assignmentId: closedAsgnId,
        studentId: student2.studentId,
        studentName: student2.name,
        status: "GRADED",
        submittedAt: "2026-05-14",
        marksObtained: 15,
        grade: "B",
        remarks: "Good effort.",
      });

      // Assignment 2: Active / Pending
      const openAsgnId = `asgn-${String(asgnCount++).padStart(4, "0")}`;
      assignments.push({
        id: openAsgnId,
        assignmentId: openAsgnId,
        title: `${teacher.subjectName} - Assignment 2`,
        description: `Active assignment requiring submission by the due date.`,
        subjectName: teacher.subjectName,
        subjectId: teacher.subjectId,
        className: className,
        classLevel: classLevel,
        section: section,
        stream: teacher.stream || null,
        teacherName: teacher.teacherName,
        teacherId: teacher.teacherId,
        dueDate: "2026-06-15", // Future date
        maxMarks: 20,
        status: "active",
        submissions: [],
      });
    }
  }

  return { assignments, submissions };
};

const data = generateAssignmentsData();
export const assignmentsSeed = data.assignments;
export const submissionsSeed = data.submissions;

export const getAssignmentsByStudent = (studentId) =>
  assignmentsSeed.filter((a) =>
    submissionsSeed.some(
      (s) => s.assignmentId === a.id && s.studentId === studentId
    )
  );

export const getAssignmentsByClass = (className) =>
  assignmentsSeed.filter(
    (a) =>
      a.className === className ||
      (a.className && a.className.includes(className))
  );

export const getAssignmentsByTeacher = (teacherId) =>
  assignmentsSeed.filter((a) => a.teacherId === teacherId);

export const getPendingAssignments = () =>
  assignmentsSeed.filter((a) => a.status === "active");

export const getStudentSubmission = (assignmentId, studentId) => {
  return submissionsSeed.find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );
};

export default {
  assignmentsSeed,
  submissionsSeed,
  getAssignmentsByStudent,
  getAssignmentsByClass,
  getAssignmentsByTeacher,
  getPendingAssignments,
  getStudentSubmission,
};
