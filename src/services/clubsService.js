import { getDataProvider } from "../data";
import { formatClassName, extractLevel, extractSection } from "../utils/classIdentity";

/**
 * services/clubsService.js
 * Service abstraction for clubs and extracurricular activities
 */

// Invalidate helpers (retained dummy or local dynamic)
export const clearClubsCaches = () => {
  // Can clear specific service caches if hook cache registry is loaded
};

/**
 * Fetches all clubs managed by a teacher (where they are clubHeadTeacherId).
 */
export const getTeacherClubs = async (teacherId) => {
  const tId = teacherId || "teach-001";
  const provider = getDataProvider();
  const clubs = await provider.getClubs();
  
  const assigned = clubs.filter((c) => c.clubHeadTeacherId === tId);
  if (assigned.length > 0) return assigned;

  // Fallback: Ensure every teacher sees at least 2 clubs in the prototype
  if (clubs.length === 0) return [];
  const hash = tId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return [
    { ...clubs[hash % clubs.length], clubHeadTeacherId: tId },
    { ...clubs[(hash + 1) % clubs.length], clubHeadTeacherId: tId }
  ];
};

/**
 * Fetches all institutional clubs with the enrollment status for a specific student.
 */
export const getStudentClubs = async (studentId) => {
  const sId = studentId || "stud-001";
  const provider = getDataProvider();

  // 1. Get student's enrollments
  const enrollments = await provider.getClubEnrollmentsByStudent(sId);
  const enrolledClubMap = new Map();
  enrollments.forEach((en) => enrolledClubMap.set(en.clubId, en));

  // 2. Get all clubs
  const allClubs = await provider.getClubs();

  const mappedClubs = allClubs.map((c) => {
    const enrollment = enrolledClubMap.get(c.id);
    return {
      ...c,
      isMember: !!enrollment,
      role: enrollment ? enrollment.role : null,
      joinedAt: enrollment ? enrollment.joinedDate : null,
      status: enrollment ? enrollment.status : "AVAILABLE",
    };
  });

  return mappedClubs;
};

/**
 * Resolves a specific club by ID.
 */
export const getClubById = async (clubId) => {
  const provider = getDataProvider();
  return await provider.getClubById(clubId);
};

/**
 * Resolves all students currently enrolled in a club.
 */
export const getClubMembers = async (clubId) => {
  const provider = getDataProvider();
  const clubEnrollments = await provider.getClubEnrollmentsByClub(clubId);

  const students = await provider.getStudents();
  const classes = await provider.getClasses();

  const membersList = [];

  for (const enrollment of clubEnrollments) {
    const student = students.find((s) => s.id === enrollment.studentId);
    if (student) {
      const cls = classes.find((c) => c.id === student.classId);
      membersList.push({
        id: enrollment.id,
        studentId: student.id,
        name: student.name,
        admissionNo: student.admissionNo,
        class: cls ? cls.name : (student.classId ? formatClassName(extractLevel(student.classId), extractSection(student.classId)) : "TBD"),
        role: enrollment.role || "Member",
        joinedAt: enrollment.joinedDate || "2024-07-20",
      });
    }
  }

  return membersList;
};

/**
 * Core validation to allow students to join a club (max 2 clubs).
 */
export const joinClub = async (studentId, clubId) => {
  const sId = studentId || "stud-001";
  const provider = getDataProvider();

  // 1. Check max 2 clubs limit
  const enrollments = await provider.getClubEnrollmentsByStudent(sId);
  if (enrollments.length >= 2) {
    throw new Error(
      "Enrollment Limit Reached: Students are allowed a maximum of 2 active clubs.",
    );
  }

  // 2. Check if already in this club
  if (enrollments.some((e) => e.clubId === clubId)) {
    throw new Error("Already Member: You are already enrolled in this club.");
  }

  const record = await provider.createClubEnrollment({
    studentId: sId,
    clubId,
    role: "Member",
    joinedDate: new Date().toISOString().split("T")[0],
    status: "Active",
  });

  clearClubsCaches();
  return record;
};

/**
 * Leaves a club.
 */
export const leaveClub = async (studentId, clubId) => {
  const sId = studentId || "stud-001";
  const provider = getDataProvider();
  const result = await provider.deleteClubEnrollment(sId, clubId);
  if (!result) {
    throw new Error("Not Member: Student is not enrolled in this club.");
  }

  clearClubsCaches();
  return true;
};

/**
 * Teacher schedules a new co-curricular club event/activity.
 */
export const createClubEvent = async ({
  clubId,
  title,
  description,
  eventDate,
  time,
  location,
  teacherId,
}) => {
  if (!clubId || !title || !eventDate || !time || !location) {
    throw new Error("Missing required event details.");
  }

  const provider = getDataProvider();
  const eventRecord = await provider.createClubActivity({
    clubId,
    title,
    description: description || "No detailed description provided.",
    date: eventDate,
    time,
    venue: location,
    type: "Club Activity",
    status: "Upcoming",
    createdBy: teacherId || "teach-001",
  });

  clearClubsCaches();
  return eventRecord;
};

/**
 * Resolves all upcoming activities / events scheduled for a club.
 */
export const getClubEvents = async (clubId) => {
  const provider = getDataProvider();
  const clubActivities = await provider.getClubActivitiesByClub(clubId);
  return clubActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Resolves updates/announcements posted specifically inside a club scope.
 */
export const getClubUpdates = async (clubId) => {
  const provider = getDataProvider();
  const clubUpdates = await provider.getClubUpdatesByClub(clubId);
  return clubUpdates.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
};

/**
 * Teacher posts a club-scoped advisory notice or reminder.
 */
export const createClubUpdate = async ({
  clubId,
  title,
  content,
  teacherId,
}) => {
  if (!clubId || !title || !content) {
    throw new Error("Missing update details.");
  }

  const provider = getDataProvider();
  const updateRecord = await provider.createClubUpdate({
    clubId,
    title,
    content,
    createdBy: teacherId || "teach-001",
  });

  clearClubsCaches();
  return updateRecord;
};

export const clubsService = {
  getTeacherClubs,
  getStudentClubs,
  getClubById,
  getClubMembers,
  joinClub,
  leaveClub,
  createClubEvent,
  getClubEvents,
  getClubUpdates,
  createClubUpdate,
};
