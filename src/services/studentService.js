import { getDataProvider } from "../data";
import { getSubjectsForStudent } from "./academicsService";
import { isSeniorSecondary } from "../shared/utils/classIdentity";
import { getFeeDetails } from "./financeService";
import { studentTimetableProjectionService } from "./timetable";
import { getBrandingInfo, getNoticesAndEvents } from "./sharedService";
import { getAcademicProgress, getAcademicTimeline } from "./assignmentService";
import { getExamData } from "./examService";
import { getUpdatesForStudent } from "./classUpdatesService";
import { normalizeGender } from "../utils/genderUtils";

/**
 * Fetches the student profile (Purely Relational via storage)
 */
export const getStudentProfile = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();

  const students = await provider.getStudents();
  const student = students.find((s) => s.studentId === id || s.id === id);
  if (!student) return null;

  // Use flattened class data directly from student
  const classData = {
    name: student.className,
    section: student.section,
    level: student.classLevel,
  };

  const subjects = await getSubjectsForStudent(id);

  // Resolve Class Teacher relationally (find teacher who is CT for this class)
  let classTeacherName = "N/A";
  const teachers = await provider.getTeachers();
  const classTeacher = teachers.find(
    (t) => t.isClassTeacher && t.className === student.className,
  );
  if (classTeacher) {
    classTeacherName = classTeacher.teacherName || classTeacher.name;
  }

  // Resolve Parent for Family Section (using parentId from student)
  const parentsList = await provider.getParents();
  const parentsMap = new Map(parentsList.map((p) => [p.parentId || p.id, p]));
  const parent = student.parentId ? parentsMap.get(student.parentId) : null;

  // Derive initials and colors
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate unique credentials dynamically
  const classCode = classData
    ? `${classData.name}${classData.section}`.toUpperCase()
    : "11A";
  const firstName = student.name.split(" ")[0];
  const emailUsername = student.name.toLowerCase().replace(/\s/g, ".");

  const studentIdNum = student.studentId.split("-")[1];
  const libraryCardNo = `LIB-${classCode}-${studentIdNum}`;
  const libraryPin = `lib@${firstName}${studentIdNum}`;
  const schoolEmail = `${emailUsername}@springdale.edu.in`;
  const emailPassword = `${firstName}@Spring#${studentIdNum}`;

  // Return a structured entity-driven profile
  return {
    personal: {
      fullName: student.name,
      firstName: firstName,
      lastName: student.name.split(" ").slice(1).join(" "),
      studentId: student.studentId,
      admissionNumber: student.studentId,
      rollNumber: studentIdNum, // Derived
      email: schoolEmail,
      avatarInitials: initials,
      avatarColor: "#03045e",
      status: "Active",
      phoneNumber: student.phoneNumber || "+91 98765 43210",
      gender: student.gender || "Male",
      nationality: student.nationality || "Indian",
      category: student.category || "General",
      dateOfBirth: student.dob || "2008-04-12",
      aadhaarNumber: student.aadhar || "4532-9812-7364",
    },
    academic: {
      class: student.classLevel || classData?.name || "N/A",
      section: student.section || classData?.section || "A",
      stream: isSeniorSecondary(student.classLevel)
        ? student.stream || "General"
        : null,
      subjects: subjects.map((s) => s.name),
      academicSession: "2024-25",
      cgpa: 8.8,
      classTeacher: classTeacherName,
      house: student.houseGroup || "Saturn (Blue)",
      admissionDate:
        student.admissionDate || student.enrollDate || "2024-04-05",
      performance: student.performance,
    },
    family: {
      father: {
        name: student.fatherName || parent?.name || "N/A",
        occupation: student.fatherOccupation || "Professional",
        phoneNumber:
          student.fatherMobile || student.fatherPhone || parent?.phoneNumber || "+91 90000 00001",
      },
      mother: {
        name: student.motherName || "N/A",
        occupation: student.motherOccupation || "Home Maker",
        phoneNumber: student.motherMobile || student.motherPhone || "+91 90000 00002",
      },
      guardian: {
        name: parent?.name || "N/A",
        relation: "Father",
        phoneNumber:
          parent?.phoneNumber || student.fatherMobile || student.fatherPhone || "+91 90000 00001",
        address: "123, Park Avenue, New Delhi, India",
      },
    },
    credentials: {
      library: {
        cardNumber: libraryCardNo,
        pin: libraryPin,
      },
      email: {
        address: schoolEmail,
        password: emailPassword,
      },
    },
    medical: {
      bloodGroup: ["O+", "A+", "B+", "AB+", "O-", "A-"][
        student.id.charCodeAt(student.id.length - 1) % 6
      ],
      height: "172 cm",
      weight: "64 kg",
      identificationMark: "Mole on right arm",
      allergies: ["None reported"],
      emergencyNotes:
        "NO KNOWN DRUG ALLERGIES. IN CASE OF EMERGENCY, CALL GUARDIAN.",
    },
    address: {
      current: {
        address: "123, Park Avenue, Vasant Kunj",
        city: "New Delhi",
        state: "Delhi",
        postalCode: "110070",
      },
    },
  };
};

export const getProfile = getStudentProfile;

/**
 * Fetches student attendance summary (Relational via storage)
 */
export const getAttendance = async (studentId) => {
  const id = studentId || "stud-001";
  const { getAttendanceSummary } = await import("./attendanceService");
  const summary = await getAttendanceSummary(id);

  // Only full-day attendance is used in this school (marked by class teacher)
  // Subject-wise attendance concept has been removed
  return {
    overall: {
      percentage: summary.percentage,
      totalClasses: summary.totalClasses,
      attended: summary.attended,
    },
  };
};

/**
 * Fetches student transport details (Relational via storage)
 */
export const getTransportDetails = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();
  const assignments = await provider.getTransportAssignments();
  const assignment = assignments.find((ta) => ta.studentId === id);
  if (!assignment) return null;

  const routes = await provider.getTransportRoutes();
  const route = routes.find((tr) => tr.id === assignment.routeId);

  return {
    summary: {
      ...route,
      pickupStop: assignment.pickupStop,
      status: assignment.status,
      validTill: "31 March 2026",
    },
  };
};

/**
 * Fetches student documents (Relational via storage)
 */
export const getDocuments = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();
  const docs = await provider.getDocuments();
  return docs.filter((d) => d.studentId === id);
};

/**
 * Fetches student achievements (Relational via storage)
 */
export const getAchievements = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();
  const achs = await provider.getAchievements();
  return achs.filter((a) => a.studentId === id);
};

export const getStudentAchievements = getAchievements;

/**
 * Fetches document categories for documents page
 */
export const getDocumentCategories = async () => {
  return [
    { id: "all", labelEn: "All Documents", labelHi: "सभी दस्तावेज़" },
    { id: "identity", labelEn: "Identity Proofs", labelHi: "पहचान पत्र" },
    { id: "academic", labelEn: "Academics", labelHi: "शैक्षणिक" },
    { id: "administrative", labelEn: "Administrative", labelHi: "प्रशासनिक" },
    { id: "medical", labelEn: "Medical", labelHi: "चिकित्सा" },
  ];
};

export const getAllStudents = async () => {
  const provider = getDataProvider();
  return await provider.getStudents();
};

export const updateStudentProfile = async (id, updates) => {
  const provider = getDataProvider();
  const students = await provider.getStudents();
  const idx = students.findIndex((s) => s.studentId === id || s.id === id);
  if (idx === -1) throw new Error("Student not found");

  const finalUpdates = { ...updates };
  if (finalUpdates.gender) {
    finalUpdates.gender = normalizeGender(finalUpdates.gender);
  }
  
  if (updates.classLevel && updates.section) {
    finalUpdates.classId = `class-${updates.classLevel.toLowerCase()}${updates.section.toLowerCase()}`;
  }
  // Clear stream fields for non-senior secondary
  if (updates.classLevel && !isSeniorSecondary(updates.classLevel)) {
    finalUpdates.stream = null;
    finalUpdates.streamId = null;
  } else if (updates.stream) {
    const streamNameToId = {
      "Science Non-Medical": "SCIENCE_NON_MEDICAL",
      "Science Medical": "SCIENCE_MEDICAL",
      Commerce: "COMMERCE",
      Humanities: "HUMANITIES",
    };
    finalUpdates.streamId = streamNameToId[updates.stream] || null;
  }

  const updatedStudent = await provider.updateStudent(id, finalUpdates);
  return updatedStudent;
};

/**
 * ADD STUDENT - Simple CRUD helper
 */
export const addStudent = async (studentData) => {
  const provider = getDataProvider();
  const newStudent = {
    ...studentData,
    gender: normalizeGender(studentData.gender),
    id: `stu-${Date.now()}`,
    admissionNo: studentData.admissionNo || `ADM${Date.now()}`,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  return await provider.addStudent(newStudent);
};

/**
 * SOFT DELETE STUDENT - Sets isActive: false (keeps record in localStorage)
 */
export const softDeleteStudent = async (studentId) => {
  const provider = getDataProvider();
  return await provider.updateStudent(studentId, { isActive: false });
};

/**
 * CHECK DEPENDENCIES - Visual warning only (NO cascade)
 */
export const getStudentDependencies = async (studentId) => {
  const provider = getDataProvider();
  const [fees, attendance, results] = await Promise.all([
    provider.getFees(),
    provider.getDailyAttendance(),
    provider.getResults(),
  ]);

  return {
    hasFees: fees.some((f) => f.studentId === studentId),
    hasAttendance: attendance.some((a) => a.studentId === studentId),
    hasResults: results.some((r) => r.studentId === studentId),
  };
};

// ─── From studentDashboardService (inlined) ───────────────────────────────────

const _dashCache = new Map();
const CACHE_TTL = 10000;

export const getCriticalStudentDashboardPayload = async (
  studentId,
  forceRefresh = false,
) => {
  const sId = studentId || "stud-001";
  const cacheKey = `student-dashboard-critical-${sId}`;
  if (!forceRefresh && _dashCache.has(cacheKey)) {
    const entry = _dashCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) return entry.payload;
  }
  const [profile, attendance, finance, timetable] = await Promise.all([
    getStudentProfile(sId),
    getAttendance(sId),
    getFeeDetails(sId),
    studentTimetableProjectionService.buildStudentTimetableProjection(sId),
  ]);
  const attendanceWarnings =
    (attendance?.overall?.percentage || 100) < 75
      ? [
          {
            name: "attendance",
            percentage: attendance?.overall?.percentage || 100,
          },
        ]
      : [];
  const payload = {
    profile,
    attendance,
    finance,
    timetable,
    derived: { attendanceWarnings },
  };
  _dashCache.set(cacheKey, { payload, timestamp: Date.now() });
  return payload;
};

export const getDeferredStudentDashboardPayload = async (
  studentId,
  isParent,
  forceRefresh = false,
) => {
  const sId = studentId || "stud-001";
  const cacheKey = `student-dashboard-deferred-${sId}-${!!isParent}`;
  if (!forceRefresh && _dashCache.has(cacheKey)) {
    const entry = _dashCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) return entry.payload;
  }
  const [
    progress,
    timeline,
    branding,
    shared,
    documents,
    examData,
    classUpdates,
  ] = await Promise.all([
    getAcademicProgress(sId),
    getAcademicTimeline(sId),
    getBrandingInfo(),
    getNoticesAndEvents(sId),
    getDocuments(sId),
    getExamData(sId),
    getUpdatesForStudent(sId, !!isParent),
  ]);
  const missingDocuments = (documents || []).filter(
    (doc) => doc.isMandatory && doc.status === "missing",
  );
  const totalTasks = (progress || []).reduce(
    (acc, curr) => acc + (curr.totalTasks || 0),
    0,
  );
  const completedTasks = (progress || []).reduce(
    (acc, curr) => acc + (curr.completedTasks || 0),
    0,
  );
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingCount = timeline?.upcoming?.length || 0;
  const overdueCount = timeline?.overdue?.length || 0;
  const nextExam = (() => {
    if (!examData?.schedule || examData.schedule.length === 0) return null;
    const firstExam = examData.schedule[0];
    return { name: firstExam.subject, date: firstExam.date };
  })();
  const payload = {
    progress,
    timeline,
    branding,
    shared,
    documents,
    examData,
    classUpdates,
    derived: {
      missingDocuments,
      completionRate,
      pendingCount,
      overdueCount,
      nextExam,
    },
  };
  _dashCache.set(cacheKey, { payload, timestamp: Date.now() });
  return payload;
};

export const getStudentDashboardPayload = async (
  studentId,
  isParent,
  forceRefresh = false,
) => {
  const sId = studentId || "stud-001";
  const cacheKey = `student-dashboard-${sId}-${!!isParent}`;
  if (!forceRefresh && _dashCache.has(cacheKey)) {
    const entry = _dashCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) return entry.payload;
  }
  const [critical, deferred] = await Promise.all([
    getCriticalStudentDashboardPayload(sId, forceRefresh),
    getDeferredStudentDashboardPayload(sId, isParent, forceRefresh),
  ]);
  const payload = {
    profile: critical.profile,
    attendance: critical.attendance,
    finance: critical.finance,
    timetable: critical.timetable,
    progress: deferred.progress,
    timeline: deferred.timeline,
    branding: deferred.branding,
    shared: deferred.shared,
    documents: deferred.documents,
    examData: deferred.examData,
    classUpdates: deferred.classUpdates,
    derived: {
      attendanceWarnings: critical.derived.attendanceWarnings,
      missingDocuments: deferred.derived.missingDocuments,
      completionRate: deferred.derived.completionRate,
      pendingCount: deferred.derived.pendingCount,
      overdueCount: deferred.derived.overdueCount,
      nextExam: deferred.derived.nextExam,
    },
  };
  _dashCache.set(cacheKey, { payload, timestamp: Date.now() });
  return payload;
};

export const clearStudentDashboardCache = (studentId, isParent) => {
  const sId = studentId || "stud-001";
  _dashCache.delete(`student-dashboard-critical-${sId}`);
  _dashCache.delete(`student-dashboard-deferred-${sId}-${!!isParent}`);
  _dashCache.delete(`student-dashboard-${sId}-${!!isParent}`);
};

export const clearDeferredCache = (studentId, isParent) => {
  const sId = studentId || "stud-001";
  _dashCache.delete(`student-dashboard-deferred-${sId}-${!!isParent}`);
  _dashCache.delete(`student-dashboard-${sId}-${!!isParent}`);
};

export const studentDashboardService = {
  getCriticalStudentDashboardPayload,
  getDeferredStudentDashboardPayload,
  getStudentDashboardPayload,
  clearStudentDashboardCache,
};

export const getStudentCapacityMetrics = async () => {
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  const students = await provider.getStudents();

  const totalCapacity = classes.reduce((sum, cls) => sum + (cls.capacity || 40), 0);
  const totalEnrolled = students.length;
  const availableSeats = totalCapacity - totalEnrolled;
  const occupancyPercentage = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return {
    totalCapacity,
    totalEnrolled,
    availableSeats,
    occupancyPercentage
  };
};

export const getClassCapacityMetrics = async (classId) => {
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  const students = await provider.getStudents();

  const cls = classes.find(c => c.id === classId || c.classId === classId);
  if (!cls) throw new Error("Class not found");

  const capacity = cls.capacity || 40;
  const enrolled = students.filter(s => s.classId === classId || s.className === classId).length;
  const vacant = capacity - enrolled;
  const occupancyPercentage = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

  return {
    capacity,
    enrolled,
    vacant,
    occupancyPercentage
  };
};

export const getTeacherCoverageMetrics = async () => {
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  const subjects = await provider.getSubjects();
  const assignments = await provider.getTeacherSubjectAssignments();

  let totalExpectedAssignments = 0;
  let coveredAssignments = 0;
  let coverageGaps = 0;
  const assignedTeachers = new Set();

  for (const cls of classes) {
    const classLevel = cls.level;
    const streamId = cls.streamId;
    
    const expectedSubjects = subjects.filter(sub => {
      if (!sub.applicableClasses || !sub.applicableClasses.includes(classLevel)) return false;
      if (["11", "12"].includes(classLevel)) {
        if (sub.streamApplicability && sub.streamApplicability.length > 0) {
          return sub.streamApplicability.includes(streamId);
        }
        return true; 
      }
      return true;
    });

    totalExpectedAssignments += expectedSubjects.length;

    expectedSubjects.forEach(sub => {
      const assignment = assignments.find(a => a.classId === cls.id && a.subjectId === (sub.id || sub.subjectId));
      if (assignment && assignment.teacherId) {
        coveredAssignments++;
        assignedTeachers.add(assignment.teacherId);
      } else {
        coverageGaps++;
      }
    });
  }

  return {
    totalExpectedAssignments,
    coveredAssignments,
    coverageGaps,
    assignedTeachers: assignedTeachers.size
  };
};

export const getCoverageLedger = async () => {
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  const subjects = await provider.getSubjects();
  const assignments = await provider.getTeacherSubjectAssignments();
  const teachers = await provider.getTeachers();

  const ledger = [];

  for (const cls of classes) {
    const classLevel = cls.level;
    const streamId = cls.streamId;
    
    const expectedSubjects = subjects.filter(sub => {
      if (!sub.applicableClasses || !sub.applicableClasses.includes(classLevel)) return false;
      if (["11", "12"].includes(classLevel)) {
        if (sub.streamApplicability && sub.streamApplicability.length > 0) {
          return sub.streamApplicability.includes(streamId);
        }
        return true;
      }
      return true;
    });

    expectedSubjects.forEach(sub => {
      const assignment = assignments.find(a => a.classId === cls.id && a.subjectId === (sub.id || sub.subjectId));
      let status = "Coverage Gap";
      let teacherName = "No Teacher Assigned";
      let department = "N/A";
      let teacherId = null;

      if (assignment && assignment.teacherId) {
        status = "Covered";
        teacherId = assignment.teacherId;
        const teacher = teachers.find(t => t.id === teacherId || t.teacherId === teacherId);
        if (teacher) {
          teacherName = teacher.name || teacher.teacherName;
          department = teacher.department || "General";
        } else {
          teacherName = "Unknown Teacher";
        }
      }

      ledger.push({
        classId: cls.id,
        className: cls.name || cls.id,
        section: cls.section,
        subjectId: sub.id || sub.subjectId,
        subjectName: sub.name || sub.subjectName,
        teacherId,
        teacherName,
        department,
        status
      });
    });
  }

  return ledger;
};
