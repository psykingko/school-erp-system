import { getDataProvider } from "../data";
import { getClassAttendance, updateClassAttendance } from "./attendanceService";
import { extractLevel, isFoundationClass } from "../shared/utils/classIdentity";
import { teacherTimetableService } from "./timetable";
import { facultyData } from "../data/teachers/faculty";
import {
  mentorProfile,
  quickResources,
  sessionHistory,
  supportCategories,
} from "../data/teachers/mentors";
import { normalizeGender } from "../utils/genderUtils";

/**
 * services/teacherService.js
 * Service abstraction for faculty and operational teacher workflows
 */

// --- RESTORED LEGACY EXPORTS (Top Priority to fix HMR) ---
export const getMentorResources = async () => quickResources;
export const getMentors = async () => mentorProfile;
export const getMentorSessions = async () => sessionHistory;
export const getFaculty = async () => facultyData;
export const getMentorCategories = async () => supportCategories;
export const getMentorshipData = async () => {
  return {
    mentorProfile,
    supportCategories,
    quickResources,
    sessionHistory,
  };
};

// --- NEW RELATIONAL OPERATIONAL EXPORTS ---

/**
 * Fetches the teacher profile and assigned homeroom class (attendance authority).
 * Only the homeroom class can be used for marking attendance.
 */
export const getTeacherWorkload = async (teacherId) => {
  const id = teacherId || "teach-001";
  const provider = getDataProvider();

  const teachers = await provider.getTeachers();
  const teacher = teachers.find((t) => t.id === id) || teachers[0];
  if (!teacher) return null;

  const classes = await provider.getClasses();
  const subjects = await provider.getSubjects();

  // Prototype bypass: Ensure we have a homeroom class for attendance
  const homeroomClass = classes.find((c) => c.classTeacherId === id) || classes[0];

  // Prototype bypass: Ensure teacher has subjects for Marks entry
  if (!teacher.subjectIds || teacher.subjectIds.length === 0) {
    teacher.subjectIds = subjects.slice(0, 2).map(s => s.id);
  }

  // Target classes for this teacher
  let targetClasses = classes.filter((c) => c.classTeacherId === id);
  if (targetClasses.length === 0 && classes.length >= 2) {
    targetClasses = [classes[0], classes[1]];
  } else if (targetClasses.length === 0) {
    targetClasses = classes;
  }

  return {
    profile: teacher,
    homeroomClass, // The class where this teacher marks attendance
    classes: targetClasses, // Specific classes this teacher teaches
  };
};

/**
 * Checks if a teacher is the class teacher of a given class (attendance authority check)
 */
export const isClassTeacher = async (teacherId, classId) => {
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  const cls = classes.find((c) => c.id === classId);
  return cls?.classTeacherId === teacherId;
};

/**
 * Fetches students in a specific class
 */
export const getStudentsInClass = async (classId) => {
  const provider = getDataProvider();
  const students = await provider.getStudents();
  return students.filter((s) => s.classId === classId);
};

/**
 * Submits attendance for a class
 */
export const submitAttendance = async (
  teacherId,
  classId,
  attendanceList,
  date,
) => {
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  const cls = classes.find((c) => c.id === classId);
  if (!cls) throw new Error("Class not found.");
  if (cls.classTeacherId !== teacherId) {
    throw new Error(
      "Relational Authority Violated: Only the assigned Homeroom Class Teacher is authorized to mark daily attendance.",
    );
  }

  const submitDate = date || new Date().toISOString().split("T")[0];
  const records = attendanceList.map((item) => ({
    studentId: item.studentId,
    classId: classId,
    date: submitDate,
    status: item.status.toUpperCase(), // Map 'present', 'absent' to 'PRESENT', 'ABSENT'
    markedBy: teacherId,
  }));

  return await updateClassAttendance(records, classId, submitDate, teacherId);
};

/**
 * Fetches existing attendance for a class on a specific date
 */
export const getAttendanceForClass = async (classId, date) => {
  const records = await getClassAttendance(classId, date);
  // Map back the status to lowercase for Teacher UI if needed
  return records.map((r) => ({
    ...r,
    status: r.status.toLowerCase(),
  }));
};

/**
 * Fetches attendance session metadata for a class
 */
export const getAttendanceSessionForClass = async (classId, date) => {
  const { getAttendanceSession } = await import("./attendanceService");
  return await getAttendanceSession(classId, date);
};

/**
 * Fetches existing marks for a class, subject, and exam
 */
export const getMarksForClass = async (classId, subjectId, examId) => {
  const provider = getDataProvider();
  const results = await provider.getResults();
  return results.filter(
    (r) =>
      r.classId === classId && r.subjectId === subjectId && r.examId === examId,
  );
};

/**
 * Submits marks for a list of students
 */
export const submitMarks = async (
  teacherId,
  classId,
  subjectId,
  examId,
  marksList,
  publishResults = false,
) => {
  const provider = getDataProvider();
  const records = marksList.map((item) => ({
    studentId: item.studentId,
    classId: classId,
    subjectId: subjectId,
    examId: examId,
    marksObtained: parseFloat(item.marks),
    maxMarks: parseFloat(item.maxMarks || 100),
    remarks: item.remarks || "",
    grade: calculateGrade(item.marks, item.maxMarks || 100),
    teacherId: teacherId,
  }));

  const results = await provider.getResults();
  records.forEach(async (record) => {
    const existingIdx = results.findIndex(
      (r) =>
        r.studentId === record.studentId &&
        r.examId === record.examId &&
        r.subjectId === record.subjectId,
    );

    if (existingIdx !== -1) {
      await provider.updateResult(results[existingIdx].id, record);
    } else {
      await provider.createResult(record);
    }
  });

  return true;
};

/**
 * Simple grade calculator
 */
const calculateGrade = (marks, max) => {
  const percentage = (marks / max) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

/**
 * Fetches the complete detailed professional teacher profile relationally.
 */
export const getTeacherProfile = async (teacherId) => {
  const tId = teacherId || "teach-001";
  const provider = getDataProvider();

  const teachers = await provider.getTeachers();
  const rawTeacher = teachers.find((t) => t.id === tId);
  if (!rawTeacher) return null;

  let teacher = rawTeacher;
  if (rawTeacher.employeeId) {
    const employees = await provider.getEmployees();
    const emp = employees.find(e => e.employeeId === rawTeacher.employeeId);
    if (emp) {
      teacher = {
        ...rawTeacher,
        name: emp.employeeName,
        teacherName: emp.employeeName,
        phone: emp.phone,
        phoneNumber: emp.phone,
        email: emp.email,
        address: emp.address || rawTeacher.address,
        dob: emp.dob || rawTeacher.dob,
        gender: emp.gender || rawTeacher.gender,
        department: emp.departmentId,
        designation: emp.designation,
        joiningDate: emp.joiningDate,
        emergencyContact: emp.emergencyContact || rawTeacher.emergencyContact,
        isActive: emp.status === "active"
      };
    }
  }

  // Resolve assigned class & subjects
  const assignments = await provider.getTeacherSubjectAssignments();
  let teacherAssignments = assignments.filter((a) => a.teacherId === tId);

  const subjects = await provider.getSubjects();
  const classes = await provider.getClasses();

  // If no relational assignments exist, fallback to flattened schema in teachersSeed
  if (teacherAssignments.length === 0 && teacher.subjectId) {
    let classNames = [];
    if (teacher.className === "All Classes") {
      classNames = ["10-A", "10-B", "10-C", "10-D", "11-A", "11-B", "11-C", "11-D"];
    } else if (teacher.className) {
      classNames = teacher.className.split(",").map((c) => c.trim());
    }

    classNames.forEach((cName) => {
      const cls = classes.find((c) => c.className === cName || c.name === cName || c.id === `class-${cName.toLowerCase().replace("-", "")}`);
      if (cls) {
        teacherAssignments.push({
          teacherId: tId,
          subjectId: teacher.subjectId,
          classId: cls.id,
          schedule: "09:00 AM - 09:45 AM",
          room: cls.room || "Block A",
        });
      }
    });
  }

  const assignedSubjects = [];
  for (const assignment of teacherAssignments) {
    const sub = subjects.find((s) => s.id === assignment.subjectId);
    const cls = classes.find((c) => c.id === assignment.classId);
    if (sub && cls) {
      assignedSubjects.push({
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code || "SUB-GEN",
        classId: cls.id,
        className: cls.name,
        displayName: cls.displayName || cls.name,
        schedule: assignment.schedule || sub.schedule || "N/A",
        room: assignment.room || sub.room || cls.room || "N/A",
      });
    }
  }

  // Resolve Class Teacher ownership
  const homeroomClass = classes.find((c) => c.classTeacherId === tId) || null;

  // Resolve Mentorship count
  const mentorAssignments = await provider.getMentorAssignments();
  const teacherMentors = mentorAssignments.filter(
    (ma) => ma.mentorTeacherId === tId,
  );

  return {
    ...teacher,
    name: teacher.name || teacher.teacherName,
    phoneNumber: teacher.phoneNumber || teacher.phone || "+91 98765 00000",
    address: teacher.address || "123, School Staff Quarters, Delhi",
    dob: teacher.dob || "1985-06-15",
    gender: teacher.gender || "Male",
    subjectSpecialization: teacher.subjectSpecialization || teacher.department || "General",
    certifications: teacher.certifications || "B.Ed Qualified, CTET Passed",
    emergencyContact: teacher.emergencyContact || "Spouse: +91 99999 00000",
    assignedSubjects,
    isClassTeacher: !!homeroomClass,
    homeroomClass,
    mentorshipCount: teacherMentors.length,
  };
};

/**
 * Updates editable contact and professional fields for the logged-in teacher.
 */
export const updateTeacherProfile = async (teacherId, updates) => {
  const tId = teacherId || "teach-001";
  const provider = getDataProvider();

  const teachers = await provider.getTeachers();
  const idx = teachers.findIndex((t) => t.id === tId);
  if (idx === -1) throw new Error("Teacher not found");

  const teacher = teachers[idx];

  // Split updates into HR vs Academic
  const hrKeys = ["phoneNumber", "phone", "email", "emergencyContact", "address", "dob", "gender", "name", "teacherName"];
  const hrUpdates = {};
  const academicUpdates = {};

  Object.keys(updates).forEach(key => {
    if (hrKeys.includes(key)) {
      if (key === "phoneNumber" || key === "phone") hrUpdates.phone = updates[key];
      else if (key === "name" || key === "teacherName") hrUpdates.employeeName = updates[key];
      else if (key === "gender") hrUpdates.gender = normalizeGender(updates[key]);
      else hrUpdates[key] = updates[key];
    } else {
      academicUpdates[key] = updates[key];
    }
  });

  if (teacher.employeeId && Object.keys(hrUpdates).length > 0) {
    await provider.updateEmployee(teacher.employeeId, hrUpdates);
  }

  if (Object.keys(academicUpdates).length > 0 || !teacher.employeeId) {
    // If no employeeId (edge case), just save to teacher
    await provider.updateTeacher(tId, Object.keys(academicUpdates).length > 0 ? academicUpdates : updates);
  }

  return await getTeacherProfile(tId);
};

export const getAllTeachers = async () => {
  const provider = getDataProvider();
  const teachers = await provider.getTeachers();
  const employees = await provider.getEmployees();

  return teachers.map(teacher => {
    if (teacher.employeeId) {
      const emp = employees.find(e => e.employeeId === teacher.employeeId);
      if (emp) {
        return {
          ...teacher,
          name: emp.employeeName,
          teacherName: emp.employeeName,
          phone: emp.phone,
          phoneNumber: emp.phone,
          email: emp.email,
          address: emp.address || teacher.address,
          dob: emp.dob || teacher.dob,
          gender: emp.gender || teacher.gender,
          department: emp.departmentId,
          designation: emp.designation,
          joiningDate: emp.joiningDate,
          emergencyContact: emp.emergencyContact || teacher.emergencyContact,
          isActive: emp.status === "active"
        };
      }
    }
    return teacher;
  });
};

/**
 * ADD TEACHER - Simple CRUD helper
 */
export const addTeacher = async (teacherData) => {
  const provider = getDataProvider();
  const newTeacher = {
    ...teacherData,
    gender: normalizeGender(teacherData.gender),
    id: `teach-${Date.now()}`,
    employeeId: teacherData.employeeId || `EMP${Date.now()}`,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  return await provider.addTeacher(newTeacher);
};

/**
 * SOFT DELETE TEACHER - Sets isActive: false (keeps record in localStorage)
 */
export const softDeleteTeacher = async (teacherId) => {
  const provider = getDataProvider();
  return await provider.updateTeacher(teacherId, { isActive: false });
};

/**
 * CHECK DEPENDENCIES - Visual warning only (NO cascade)
 */
export const getTeacherDependencies = async (teacherId) => {
  const provider = getDataProvider();
  const [assignments, classes] = await Promise.all([
    provider.getTeacherSubjectAssignments(),
    provider.getClasses(),
  ]);

  return {
    hasAssignments: assignments.some((a) => a.teacherId === teacherId),
    isClassTeacher: classes.some((c) => c.classTeacherId === teacherId),
  };
};

// ─── From teacherMappingService (inlined) ─────────────────────────────────────

export const getTeacherSubjectAssignments = async (classId) => {
  const provider = getDataProvider();
  if (classId) {
    return provider.getTeacherSubjectAssignmentsByClass(classId);
  }
  return provider.getTeacherSubjectAssignments();
};

export const getTeacherType = async (teacherId) => {
  const provider = getDataProvider();
  const teachers = await provider.getTeachers();
  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher) return null;
  const assigned = teacher.assignedClasses || [];
  if (
    assigned.length > 0 &&
    assigned.some((cId) => isFoundationClass(extractLevel(cId)))
  ) {
    return "FOUNDATION";
  }
  return "SPECIALIZED";
};

export const getTeacherSpecialization = async (teacherId) => {
  const provider = getDataProvider();
  const teachers = await provider.getTeachers();
  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher) return null;
  const type = await getTeacherType(teacherId);
  if (type === "FOUNDATION") return "multi-subject";
  return teacher.specializationSubjectId || teacher.subjectId || null;
};

export const getClassTeacher = async (classId) => {
  const provider = getDataProvider();
  const [classes, teachers] = await Promise.all([
    provider.getClasses(),
    provider.getTeachers(),
  ]);
  const cls = classes.find((c) => c.id === classId);
  if (!cls || !cls.classTeacherId) return null;
  const teacher = teachers.find((t) => t.id === cls.classTeacherId);
  if (!teacher) return null;
  const teacherType = await getTeacherType(teacher.id);
  return { teacher, classId, teacherType };
};

export const getSubjectTeachersForClass = async (classId) => {
  const provider = getDataProvider();
  const [teachers, subjects, assignments, classes] = await Promise.all([
    provider.getTeachers(),
    provider.getSubjects(),
    provider.getTeacherSubjectAssignments(),
    provider.getClasses(),
  ]);
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return [];
  const level = extractLevel(classId);
  if (isFoundationClass(level)) {
    const classTeacher = cls.classTeacherId
      ? teachers.find((t) => t.id === cls.classTeacherId)
      : teachers.find((t) => (t.assignedClasses || []).includes(classId));
    if (!classTeacher) return [];
    const applicableSubjects = subjects.filter(
      (s) => s.applicableClasses && s.applicableClasses.includes(level),
    );
    return applicableSubjects.map((sub) => ({
      subjectId: sub.id,
      subjectName: sub.name,
      teacherId: classTeacher.id,
      teacherName: classTeacher.name,
      teacherType: "FOUNDATION",
    }));
  }
  const classAssignments = assignments.filter((a) => a.classId === classId);
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const seen = new Set();
  const result = [];
  for (const assignment of classAssignments) {
    if (seen.has(assignment.subjectId)) continue;
    seen.add(assignment.subjectId);
    const teacher = teacherMap.get(assignment.teacherId);
    const subject = subjectMap.get(assignment.subjectId);
    if (!teacher || !subject) continue;
    result.push({
      subjectId: assignment.subjectId,
      subjectName: subject.name,
      teacherId: assignment.teacherId,
      teacherName: teacher.name,
      teacherType: teacher.assignedClasses?.some((c) =>
        isFoundationClass(extractLevel(c)),
      )
        ? "FOUNDATION"
        : "SPECIALIZED",
    });
  }
  return result;
};

export const getTeacherAssignments = async (teacherId) => {
  const provider = getDataProvider();
  const [teachers, subjects, assignments, classes] = await Promise.all([
    provider.getTeachers(),
    provider.getSubjects(),
    provider.getTeacherSubjectAssignments(),
    provider.getClasses(),
  ]);
  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher) return null;
  const teacherType = await getTeacherType(teacherId);
  const specialization =
    teacherType === "FOUNDATION"
      ? "multi-subject"
      : teacher.specializationSubjectId || teacher.subjectId || null;
  const classTeacherOf =
    classes.find((c) => c.classTeacherId === teacherId) || null;
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const classMap = new Map(classes.map((c) => [c.id, c]));
  let teachingAssignments = [];
  if (teacherType === "FOUNDATION") {
    for (const cId of teacher.assignedClasses || []) {
      const cls = classMap.get(cId);
      if (!cls) continue;
      const level = extractLevel(cId);
      for (const sub of subjects.filter(
        (s) => s.applicableClasses && s.applicableClasses.includes(level),
      )) {
        teachingAssignments.push({
          classId: cId,
          className: cls.name || cls.className || cId,
          subjectId: sub.id,
          subjectName: sub.name,
        });
      }
    }
  } else {
    const seen = new Set();
    for (const a of assignments.filter((a) => a.teacherId === teacherId)) {
      const key = `${a.classId}::${a.subjectId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const cls = classMap.get(a.classId);
      const sub = subjectMap.get(a.subjectId);
      if (!cls || !sub) continue;
      teachingAssignments.push({
        classId: a.classId,
        className: cls.name || cls.className || a.classId,
        subjectId: a.subjectId,
        subjectName: sub.name,
      });
    }
  }
  return {
    teacher,
    teacherType,
    specialization,
    classTeacherOf,
    teachingAssignments,
  };
};

export const getEligibleClassTeachers = async (classId) => {
  const provider = getDataProvider();
  return await provider.getTeachers();
};

export const validateTeacherAssignment = async (
  teacherId,
  classId,
  subjectId,
) => {
  return { valid: true };
};

export const validateClassTeacherChange = async (teacherId, classId) => {
  return { valid: true };
};

export const changeClassTeacher = async (
  classId,
  newTeacherId,
  options = {},
) => {
  if (!classId) throw new Error("Class ID is required");
  if (!newTeacherId) throw new Error("New Teacher ID is required");
  const provider = getDataProvider();
  await provider.updateClass(classId, { classTeacherId: newTeacherId });
  return { success: true, timetableUpdated: false, primarySubjectId: null };
};

export const auditTeacherSpecializations = async () => {
  const provider = getDataProvider();
  const teachers = await provider.getTeachers();
  return teachers.map((teacher) => ({
    teacherId: teacher.id,
    teacherName: teacher.name,
    teacherType: "SPECIALIZED",
    valid: true,
  }));
};

export const auditClassTeacherAssignments = async () => {
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  return classes.map((c) => ({ classId: c.id, valid: true }));
};

export const getTeacherTypeSummary = async () => {
  const provider = getDataProvider();
  const teachers = await provider.getTeachers();
  return {
    foundation: Math.round(teachers.length / 3),
    specialized: teachers.length - Math.round(teachers.length / 3),
    activity: 0,
    total: teachers.length,
  };
};

export const getEligibleTeachersForSubject = async (subjectId, classId) => {
  const provider = getDataProvider();
  const [teachers, assignments, subjects] = await Promise.all([
    provider.getTeachers(),
    provider.getTeacherSubjectAssignments(),
    provider.getSubjects(),
  ]);
  const subjectNameMap = Object.fromEntries(
    subjects.map((s) => [s.id, s.name || s.subjectName]),
  );
  return teachers.map((t) => {
    const taughtSubjectIds = [
      ...new Set(
        assignments.filter((a) => a.teacherId === t.id).map((a) => a.subjectId),
      ),
    ];
    return {
      ...t,
      eligibleStages: t.eligibleStages || [
        "primary",
        "secondary",
        "senior_secondary",
      ],
      taughtSubjects: taughtSubjectIds
        .map((sid) => subjectNameMap[sid])
        .filter(Boolean),
    };
  });
};

export const changeSubjectTeacher = async (
  assignmentId,
  newTeacherId,
  options = {},
) => {
  if (!assignmentId) throw new Error("Assignment ID is required");
  if (!newTeacherId) throw new Error("New Teacher ID is required");
  const provider = getDataProvider();
  const assignments = await provider.getTeacherSubjectAssignments();
  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment) throw new Error(`Assignment "${assignmentId}" not found.`);
  const updatedAssignment = { ...assignment, teacherId: newTeacherId };
  await provider.updateTeacherSubjectAssignment(
    assignmentId,
    updatedAssignment,
  );
  return { success: true, assignment: updatedAssignment, workloadImpact: null };
};

export const createTeacherSubjectAssignment = async (data) => {
  if (!data.classId) throw new Error("Class ID is required");
  if (!data.subjectId) throw new Error("Subject ID is required");
  if (!data.teacherId) throw new Error("Teacher ID is required");
  if (
    data.periodsPerWeek !== undefined &&
    (isNaN(data.periodsPerWeek) ||
      data.periodsPerWeek < 1 ||
      data.periodsPerWeek > 10)
  ) {
    throw new Error("Periods per week must be a number between 1 and 10");
  }
  const provider = getDataProvider();
  const assignment = await provider.createTeacherSubjectAssignment({
    classId: data.classId,
    subjectId: data.subjectId,
    teacherId: data.teacherId,
    periodsPerWeek: data.periodsPerWeek || 6,
    room: data.room || null,
    createdAt: new Date().toISOString(),
  });
  return { success: true, assignment };
};

export const deleteTeacherSubjectAssignment = async (assignmentId) => {
  if (!assignmentId) throw new Error("Assignment ID is required");
  const provider = getDataProvider();
  const deleted = await provider.deleteTeacherSubjectAssignment(assignmentId);
  if (!deleted)
    return { success: false, error: "Failed to delete assignment." };
  return { success: true };
};

export const updateAssignmentPeriodsAndRoom = async (assignmentId, updates) => {
  if (updates.periodsPerWeek !== undefined) {
    const periods = parseInt(updates.periodsPerWeek);
    if (isNaN(periods) || periods < 1 || periods > 10) {
      return {
        success: false,
        error: "Periods per week must be between 1 and 10.",
      };
    }
  }
  const provider = getDataProvider();
  try {
    const updatedAssignment = await provider.updateTeacherSubjectAssignment(
      assignmentId,
      updates,
    );
    return { success: true, assignment: updatedAssignment };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Failed to update configuration.",
    };
  }
};

/** Capacity/periods workload — renamed from teacherMappingService's getTeacherWorkload to avoid collision. */
export const getTeacherCapacity = async (teacherId, options = {}) => {
  const provider = getDataProvider();
  const assignments = await provider.getTeacherSubjectAssignments();
  const teacherAssignments = assignments.filter(
    (a) =>
      a.teacherId === teacherId && a.id !== options.prospectiveAssignmentId,
  );
  const totalPeriods = teacherAssignments.reduce(
    (sum, a) => sum + (a.periodsPerWeek || 6),
    0,
  );
  const projectedPeriods = totalPeriods + (options.additionalPeriods || 0);
  return {
    sections: teacherAssignments.length,
    periodsPerWeek: totalPeriods,
    projectedPeriods,
    maxAllowed: 42,
    isOverloaded: projectedPeriods > 42,
    utilization: Math.round((projectedPeriods / 42) * 100),
    assignments: teacherAssignments.map((a) => ({
      classId: a.classId,
      subjectId: a.subjectId,
      periodsPerWeek: a.periodsPerWeek || 6,
    })),
  };
};

// ─── From teacherScheduleService (inlined) ────────────────────────────────────

const PERIOD_CONFIG = {
  P1: {
    label: "P1",
    time: "08:00 – 08:45",
    startTime: "08:00",
    endTime: "08:45",
  },
  P2: {
    label: "P2",
    time: "08:50 – 09:35",
    startTime: "08:50",
    endTime: "09:35",
  },
  P3: {
    label: "P3",
    time: "09:40 – 10:25",
    startTime: "09:40",
    endTime: "10:25",
  },
  P4: {
    label: "P4",
    time: "10:30 – 11:15",
    startTime: "10:30",
    endTime: "11:15",
  },
  P5: {
    label: "Lunch",
    time: "11:15 – 11:50",
    startTime: "11:15",
    endTime: "11:50",
  },
  P6: {
    label: "P6",
    time: "11:50 – 12:35",
    startTime: "11:50",
    endTime: "12:35",
  },
  P7: {
    label: "P7",
    time: "12:40 – 13:25",
    startTime: "12:40",
    endTime: "13:25",
  },
  P8: {
    label: "P8",
    time: "13:30 – 14:15",
    startTime: "13:30",
    endTime: "14:15",
  },
  P9: {
    label: "P9",
    time: "14:20 – 15:05",
    startTime: "14:20",
    endTime: "15:05",
  },
};

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIOD_ORDER = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9"];

const weeklyScheduleCache = new Map();
const todayScheduleCache = new Map();

export const clearScheduleCache = (teacherId) => {
  if (teacherId) {
    weeklyScheduleCache.delete(teacherId);
    for (const key of todayScheduleCache.keys()) {
      if (key.startsWith(`${teacherId}-`)) todayScheduleCache.delete(key);
    }
  } else {
    weeklyScheduleCache.clear();
    todayScheduleCache.clear();
  }
};

export const getTeacherWeeklySchedule = async (teacherId) => {
  const tId = teacherId || "teach-001";
  if (weeklyScheduleCache.has(tId)) return weeklyScheduleCache.get(tId);
  
  const provider = getDataProvider();
  const [subjects, classesList] = await Promise.all([
    provider.getSubjects(),
    provider.getClasses(),
  ]);

  const weeklyScheduleObj = await teacherTimetableService.getTeacherSchedule(tId);
  
  const flatSchedule = [];
  ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach(day => {
    (weeklyScheduleObj[day] || []).forEach(slot => {
      flatSchedule.push({
        ...slot,
        day: day.charAt(0).toUpperCase() + day.slice(1)
      });
    });
  });

  const formatted = flatSchedule.map((slot) => {
    const sub = subjects.find(s => s.id === slot.subjectId);
    const cls = classesList.find(c => c.id === slot.classId);
    const pNum = String(slot.periodNumber);
    const normalizedPeriod = pNum.startsWith("P") ? pNum : `P${pNum}`;
    return {
      ...slot,
      period: normalizedPeriod,
      subject: sub ? sub.name : slot.subjectId,
      class: cls ? cls.name.replace("Class ", "") : slot.classId,
      time: `${slot.startTime} - ${slot.endTime}`,
      status: "Upcoming",
    };
  });
  const sorted = formatted.sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period);
  });
  weeklyScheduleCache.set(tId, sorted);
  return sorted;
};

export const getTeacherTodaySchedule = async (teacherId, dayName) => {
  const tId = teacherId || "teach-001";
  const targetDay =
    dayName || new Date().toLocaleDateString("en-US", { weekday: "long" });
  const cacheKey = `${tId}-${targetDay}`;
  if (todayScheduleCache.has(cacheKey)) return todayScheduleCache.get(cacheKey);
  const weekly = await getTeacherWeeklySchedule(tId);
  const todayClasses = weekly
    .filter((w) => w.day.toLowerCase() === targetDay.toLowerCase())
    .sort(
      (a, b) => PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period),
    );
  todayScheduleCache.set(cacheKey, todayClasses);
  return todayClasses;
};

export const getCurrentClass = async (teacherId, todaySchedule) => {
  const today = todaySchedule || (await getTeacherTodaySchedule(teacherId));
  if (today.length > 0) return { ...today[0], status: "Ongoing" };
  return null;
};

export const getNextClass = async (teacherId, todaySchedule) => {
  const today = todaySchedule || (await getTeacherTodaySchedule(teacherId));
  if (today.length > 1) return { ...today[1], status: "Upcoming" };
  return null;
};

export const getClassTeacherResponsibilities = async (teacherId) => {
  const tId = teacherId || "teach-001";
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  const homeroom = classes.find((c) => c.classTeacherId === tId);
  if (!homeroom) return null;
  const students = await provider.getStudents();
  const classStudents = students.filter((s) => s.classId === homeroom.id);
  const todayStr = new Date().toISOString().split("T")[0];
  const dailyAttendance = await provider.getDailyAttendance();
  const dailyAtt = dailyAttendance.filter(
    (a) => a.classId === homeroom.id && a.date === todayStr,
  );
  const presentCount = dailyAtt.filter((a) => a.status === "PRESENT").length;
  const isMarked = dailyAtt.length > 0;
  const leaveRequests = await provider.getLeaveRequests();
  const pendingLeaves = leaveRequests.filter(
    (l) => l.classId === homeroom.id && l.status === "PENDING",
  );
  const mentorAssignments = await provider.getMentorAssignments();
  const studentIds = classStudents.map((s) => s.id);
  const pendingMentors = mentorAssignments.filter(
    (ma) => ma.status === "PENDING" && studentIds.includes(ma.studentId),
  ).length;
  return {
    isClassTeacher: true,
    classId: homeroom.id,
    className: homeroom.name,
    room: homeroom.room,
    displayName: homeroom.displayName,
    totalStudents: classStudents.length,
    presentStudents: isMarked ? presentCount : 0,
    attendanceMarked: isMarked,
    pendingLeavesCount: pendingLeaves.length,
    pendingMentorsCount: pendingMentors,
  };
};

export const getClassSchedule = async (classId) => {
  if (!classId) return [];
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return [];
  
  const timetable = await provider.getTimetableByClass(classId);
  if (!timetable || !timetable.weeklySchedule) return [];
  
  const subjects = await provider.getSubjects();
  const teachers = await provider.getTeachers();
  const subjectsMap = new Map(subjects.map((s) => [s.id, s]));
  const teachersMap = new Map(teachers.map((t) => [t.id, t]));
  
  const classSchedule = [];
  ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day) => {
    const slots = timetable.weeklySchedule[day] || timetable.weeklySchedule[day.toLowerCase()] || [];
    slots.forEach((slot) => {
      const pNum = String(slot.periodNumber);
      const normalizedPeriod = pNum.startsWith("P") ? pNum : `P${pNum}`;
      if (!PERIOD_CONFIG[normalizedPeriod]) return;
      const periodInfo = PERIOD_CONFIG[normalizedPeriod];
      
      const sub = subjectsMap.get(slot.subjectId);
      const teacher = teachersMap.get(slot.teacherId);
      
      classSchedule.push({
        day,
        period: normalizedPeriod,
        time: periodInfo.time,
        startTime: slot.startTime || periodInfo.startTime,
        endTime: slot.endTime || periodInfo.endTime,
        subject: sub ? sub.name : slot.subjectId,
        subjectId: slot.subjectId,
        teacher: teacher ? teacher.name : (slot.teacherId || "Faculty"),
        teacherId: slot.teacherId,
        room: slot.roomId || slot.room || sub?.room || cls.room || "Room 101",
        status: "Upcoming",
      });
    });
  });
  
  return classSchedule.sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period);
  });
};

export const getTeacherSchedule = async (teacherId) =>
  getTeacherWeeklySchedule(teacherId);

export const teacherScheduleService = {
  getTeacherWeeklySchedule,
  getTeacherTodaySchedule,
  getCurrentClass,
  getNextClass,
  getClassTeacherResponsibilities,
  getClassSchedule,
  getTeacherSchedule,
  clearScheduleCache,
};
