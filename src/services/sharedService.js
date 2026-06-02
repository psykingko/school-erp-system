import { getDataProvider } from "../data";
import { notificationsData } from "../data/shared/notifications";
import { navItems } from "../data/shared/navigation";
import { schoolBranding } from "../data/shared/branding";
import { schoolCalendar } from "../data/shared/calendar";

/**
 * services/sharedService.js
 * Shared utilities and common service functions
 */

export const simulateNetwork = (data) => data;

export const getNotifications = async () => notificationsData;

/**
 * Fetches notices and events (Relational)
 * Uses proper audience resolution to filter notices for the user
 */
export const getNoticesAndEvents = async (studentId) => {
  const provider = getDataProvider();
  const allEvents = await provider.getEvents();

  // If no studentId is specified, fallback to a default
  const activeId = studentId || "stud-001";
  const students = await provider.getStudents();
  const student = students.find((s) => s.id === activeId);

  const studentClassId = student?.classId || null;

  // Use proper audience resolution for notices
  const { resolveNoticesForUser } = await import("./noticeService");
  const filteredNotices = await resolveNoticesForUser({
    id: activeId,
    role: "student",
    classId: studentClassId,
  });

  // Filter events for this student based on stream and class targeting (legacy)
  const studentStreamId = student?.streamId || null;
  const filteredEvents = allEvents.filter((e) => {
    if (e.targetStreamId && e.targetStreamId !== studentStreamId) return false;
    if (e.targetClassId && e.targetClassId !== studentClassId) return false;
    return true;
  });

  return {
    general: filteredNotices.filter((n) => n.category !== "examination"),
    exam: filteredNotices.filter((n) => n.category === "examination"),
    events: filteredEvents.filter((e) => e.status === "happening"),
    upcoming: filteredEvents.filter((e) => e.status === "upcoming"),
  };
};

/**
 * Fetches navigation items
 */
export const getNavigation = async () => navItems;

/**
 * Fetches school branding and general info
 */
export const getBrandingInfo = async () => schoolBranding;

/**
 * Fetches the school academic calendar
 */
export const getSchoolCalendar = async () => schoolCalendar;
