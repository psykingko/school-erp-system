import { getDataProvider } from "../data";
import { getAttendanceSummary } from "./attendanceService";
import { getStudentResults } from "./examService";

/**
 * mentorshipService.js
 *
 * Centralized service layer for Student ↔ Mentor Teacher Session Management & Scheduling.
 * Provides real-time status transitions (Pending, Approved, Rejected, Completed) and
 * backwards-compatible adapters for existing observers and composers.
 */

// Cache invalidator helpers
export const clearMentorshipCachesLocal = () => {
  const { clearServiceCache } = require("../hooks/useService");
  clearServiceCache(getMentorStudents);
  clearServiceCache(getStudentMentorshipHistory);
  clearServiceCache(getStudentSessions);
  clearServiceCache(getMentorSessions);
  clearServiceCache(getMentorshipSummary);
};

const clearAllLocalCaches = () => {
  try {
    clearMentorshipCachesLocal();
  } catch (e) {
    // catch clearServiceCache import if dynamic loading issues occur in test contexts
  }
};

/**
 * Resolves students assigned to this teacher as their mentor (Class Teacher fallback or explicit override).
 */
export const getMentorStudents = async (teacherId) => {
  const tId = teacherId || "teach-001";
  const provider = getDataProvider();

  // 1. Get explicit active assignments for this teacher
  const assignments = await provider.getMentorAssignments();
  const explicitAssignments = assignments.filter(
    (ma) => ma.mentorTeacherId === tId && ma.status === "Active",
  );
  const explicitStudentIds = explicitAssignments.map((a) => a.studentId);

  // 2. Get fallback homeroom students (where they are class teacher and no other active mentor override exists)
  const allClasses = await provider.getClasses();
  const homeroomClasses = allClasses.filter((c) => c.classTeacherId === tId);
  const homeroomClassIds = homeroomClasses.map((c) => c.id);

  const students = await provider.getStudents();
  const homeroomStudents = students.filter((s) =>
    homeroomClassIds.includes(s.classId),
  );

  const otherAssignments = assignments.filter((ma) => ma.status === "Active");
  const otherAssignedStudentIds = new Set(
    otherAssignments
      .filter((a) => a.mentorTeacherId !== tId)
      .map((a) => a.studentId),
  );

  const fallbackStudents = homeroomStudents.filter(
    (s) => !otherAssignedStudentIds.has(s.id),
  );

  // Combine unique students
  const combinedMap = new Map();
  fallbackStudents.forEach((s) => combinedMap.set(s.id, s));

  for (const sid of explicitStudentIds) {
    const sObj = students.find((s) => s.id === sid);
    if (sObj) combinedMap.set(sid, sObj);
  }

  return Array.from(combinedMap.values());
};

/**
 * Resolves the student's active assigned mentor (explicit or class teacher fallback).
 */
export const getStudentAssignedMentor = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();
  const students = await provider.getStudents();
  const student = students.find((s) => s.id === id);
  if (!student) return null;

  const classes = await provider.getClasses();
  const classData = classes.find((c) => c.id === student.classId);
  if (!classData) return null;

  // Resolve explicit active mentor assignment overlay
  const mentorAssignments = await provider.getMentorAssignments();
  const explicitAssignment = mentorAssignments.find(
    (ma) => ma.studentId === id && ma.status === "Active",
  );

  const activeMentorId = explicitAssignment
    ? explicitAssignment.mentorTeacherId
    : classData.classTeacherId;
  if (!activeMentorId) return null;

  const teacher = await provider.getTeacherById(activeMentorId);
  if (!teacher) return null;

  const initials = (teacher.name || teacher.teacherName || "M")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const colorMap = {
    "teach-001": "#03045e",
    "teach-002": "#6d28d9",
    "teach-003": "#059669",
    "teach-004": "#dc2626",
  };

  const isOverride = explicitAssignment ? true : false;
  const roleName = isOverride ? "Assigned Mentor" : "Class Teacher (Mentor)";
  const bioDesc = isOverride
    ? `Designated institutional student mentor. Dedicated to guidance, personal development plans, and individual counseling.`
    : `Dedicated class teacher and academic advisor for ${classData.name}. Feel free to schedule counseling for curriculum or personal growth plans.`;
  const bioDescHi = isOverride
    ? `नामित संस्थागत छात्र मेंटर। मार्गदर्शन, व्यक्तिगत विकास योजनाओं और व्यक्तिगत परामर्श के लिए समर्पित।`
    : `${classData.name} के लिए समर्पित कक्षा शिक्षक और शैक्षणिक सलाहकार। पाठ्यक्रम या व्यक्तिगत विकास योजनाओं के लिए परामर्श सत्र निर्धारित कर सकते हैं।`;

  return {
    id: teacher.id || teacher.teacherId,
    name: teacher.name || teacher.teacherName,
    designation: teacher.designation || roleName,
    department: teacher.department || "Academic Staff",
    officeHours: "Mon-Fri: 2:00 PM - 3:00 PM",
    officeHoursHi: "सोम-शुक्र: दोपहर 2:00 - 3:00 बजे",
    room: classData.room || "Room 101",
    roomHi: classData.room
      ? `कमरा ${classData.room.split(" ").slice(1).join(" ")}`
      : "कमरा 101",
    bio: bioDesc,
    bioHi: bioDescHi,
    status: "available",
    avatarInitials: initials,
    avatarColor: colorMap[teacher.id || teacher.teacherId] || "#03045e",
    isOverride,
  };
};

/**
 * Retrieves all scheduled sessions or requests for a student, resolved with mentor name.
 */
export const getStudentSessions = async (studentId) => {
  const sId = studentId || "stud-001";
  const provider = getDataProvider();
  const sessions = await provider.getMentorSessionsByStudent(sId);
  return sessions.sort(
    (a, b) =>
      new Date(b.scheduledAt || b.createdAt) -
      new Date(a.scheduledAt || a.createdAt),
  );
};

/**
 * Retrieves all sessions for a mentor teacher, resolved with student name.
 */
export const getMentorSessions = async (teacherId) => {
  const tId = teacherId || "teach-001";
  const provider = getDataProvider();
  const sessions = await provider.getMentorSessionsByTeacher(tId);
  return sessions.sort(
    (a, b) =>
      new Date(b.scheduledAt || b.createdAt) -
      new Date(a.scheduledAt || a.createdAt),
  );
};

/**
 * Submits a new session request from student portal.
 */
export const createSessionRequest = async ({
  studentId,
  topic,
  scheduledAt,
  message,
}) => {
  if (!studentId || !topic || !scheduledAt || !message) {
    throw new Error("Missing required session scheduler details.");
  }

  // 1. Resolve student's assigned mentor dynamically
  const mentor = await getStudentAssignedMentor(studentId);
  if (!mentor) {
    throw new Error("No assigned mentor teacher found to schedule session.");
  }

  const provider = getDataProvider();
  const students = await provider.getStudents();
  const student = students.find((s) => s.id === studentId);
  if (!student) {
    throw new Error("Student record not found.");
  }

  // 2. Construct session
  const sessionData = {
    studentId,
    studentName: student.name,
    classId: student.classId,
    mentorTeacherId: mentor.id,
    mentorTeacherName: mentor.name,
    topic,
    scheduledAt,
    message,
    status: "Pending",
    mentorNotes: "",
  };

  const session = await provider.createMentorSession(sessionData);

  clearAllLocalCaches();
  return session;
};

/**
 * Updates a session's state and outcome notes.
 */
export const updateSessionStatus = async (
  sessionId,
  status,
  mentorNotes = "",
) => {
  if (!sessionId || !status) {
    throw new Error("Missing session update arguments.");
  }

  const provider = getDataProvider();
  const updates = { status, updatedAt: new Date().toISOString() };
  if (mentorNotes.trim()) {
    updates.mentorNotes = mentorNotes.trim();
  }

  const session = await provider.updateMentorSession(sessionId, updates);

  clearAllLocalCaches();
  return session;
};

/**
 * Backwards-compatible bridge. Creates a completed session immediately.
 */
export const addMentorRemark = async (data) => {
  const provider = getDataProvider();
  const students = await provider.getStudents();
  const student = students.find((s) => s.id === data.studentId);

  const teachers = await provider.getTeachers();
  const teacher = teachers.find((t) => t.id === data.teacherId);

  if (!student || !teacher) {
    throw new Error("Invalid student or teacher relationship.");
  }

  const topicName =
    data.category === "ACADEMIC"
      ? "Academic Guidance"
      : data.category === "COUNSELING"
        ? "Personal Support"
        : "Other Support";

  const sessionData = {
    studentId: data.studentId,
    studentName: student.name,
    classId: data.classId || student.classId,
    mentorTeacherId: data.teacherId,
    mentorTeacherName: teacher.name,
    topic: topicName,
    scheduledAt: new Date().toISOString(),
    message: data.title || "Advisory feedback review",
    status: "Completed",
    mentorNotes: data.note || "Discussed progress strategies.",
  };

  const session = await provider.createMentorSession(sessionData);

  clearAllLocalCaches();
  return session;
};

/**
 * Resolves student mentorship history mapped into chronological timelines.
 */
export const getStudentMentorshipHistory = async (studentId, teacherId) => {
  const sId = studentId || "stud-001";
  const provider = getDataProvider();
  const sessions = await provider.getMentorSessionsByStudent(sId);

  // Map to the observation remark format for the timeline rendering
  return sessions
    .map((s) => {
      let category = "ACADEMIC";
      if (s.topic.includes("Personal")) category = "COUNSELING";
      if (s.topic.includes("Career")) category = "COUNSELING";
      if (s.topic.includes("Peer")) category = "BEHAVIOR";
      if (s.topic.includes("Other")) category = "POSITIVE_FEEDBACK";

      return {
        id: s.id,
        studentId: s.studentId,
        teacherId: s.mentorTeacherId,
        teacherName: s.mentorTeacherName,
        category,
        title: `Mentorship: ${s.topic}`,
        note: s.message,
        createdAt: s.createdAt || s.scheduledAt,
        followUpRequired: s.status === "Pending",
        followUpResolved: s.status === "Completed",
        tags: [s.topic, s.status],
        originalSession: s, // Attach actual session object for dynamic control overlays!
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Computes mentorship metrics for a teacher's cockpit dashboard.
 */
export const getMentorshipSummary = async (teacherId) => {
  const tId = teacherId || "teach-001";
  const provider = getDataProvider();

  // 1. Total mentees
  const mentees = await getMentorStudents(tId);
  const totalMentees = mentees.length;

  // 2. Load all sessions for this mentor teacher
  const sessions = await provider.getMentorSessionsByTeacher(tId);

  const pendingSessions = sessions.filter((s) => s.status === "Pending").length;
  const scheduledSessions = sessions.filter(
    (s) => s.status === "Approved",
  ).length;
  const completedDiscussions = sessions.filter(
    (s) => s.status === "Completed",
  ).length;

  return {
    totalMentees,
    pendingSessions,
    scheduledSessions,
    completedDiscussions,
  };
};

export const getRemarksByStudent = getStudentMentorshipHistory;

export const getParentVisibleRemarks = async (studentId) => {
  return getStudentMentorshipHistory(studentId);
};

export const addRemark = addMentorRemark;

export const getStudentWellbeingFlags = async (studentId) => {
  const flags = [];
  try {
    const sId = studentId || "stud-001";

    // Check attendance percentage using the authoritative getAttendanceSummary service
    const attSummary = await getAttendanceSummary(sId);
    const attendancePct = attSummary.percentage;

    if (attendancePct < 75) {
      flags.push({ label: "Attendance Warning" });
    } else if (attendancePct < 85) {
      flags.push({ label: "Low Attendance" });
    }

    // Check academic results using the authoritative getStudentResults service
    const results = await getStudentResults(sId);
    const academicResults = results.filter(
      (r) => r.marksObtained !== null && r.maxMarks !== null,
    );
    if (academicResults.length > 0) {
      const totalObtained = academicResults.reduce(
        (sum, r) => sum + r.marksObtained,
        0,
      );
      const totalMax = academicResults.reduce((sum, r) => sum + r.maxMarks, 0);
      const avgPct =
        totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      if (avgPct < 65) {
        flags.push({ label: "Performance Drop" });
      } else if (avgPct < 75) {
        flags.push({ label: "Needs Improvement" });
      }
    }
  } catch (e) {
    console.error("Error generating wellbeing flags:", e);
  }

  return flags;
};

export const updateMentorRemark = async (remarkId, updates) => {
  const status = updates.followUpResolved ? "Completed" : "Approved";
  return updateSessionStatus(remarkId, status, updates.mentorNotes || "");
};
