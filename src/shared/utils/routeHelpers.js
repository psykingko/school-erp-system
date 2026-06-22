import { ROLES } from "../../auth/roles";

/**
 * Maps sidebar navigation IDs to their corresponding route paths based on the user role.
 */
export function getRouteForNavItem(id, role) {
  if (role === ROLES.STUDENT) {
    switch (id) {
      case "home":
        return "/student/dashboard";
      case "student_notices":
        return "/student/notices";
      case "assignments":
        return "/student/assignments";
      case "courses":
        return "/student/subjects";
      case "timetable":
        return "/student/timetable";
      case "examination":
        return "/student/examinations";
      case "feeDetails":
        return "/student/fees";
      case "transport":
        return "/student/transport";
      case "clubsCommittees":
        return "/student/clubs";
      case "mentorSupport":
        return "/student/mentor-support";
      case "documents":
        return "/student/documents";
      case "achievements":
        return "/student/achievements";
      case "calendar":
        return "/student/calendar";
      case "profile":
        return "/student/profile";
      case "leave":
        return "/student/leave";
      case "support_center":
        return "/student/support";
      case "student_duty":
        return "/student/my-duties";
      default:
        return "/student/dashboard";
    }
  }
  if (role === ROLES.PARENT) {
    switch (id) {
      case "home":
        return "/parent/dashboard";
      case "parent_notices":
        return "/parent/notices";
      case "assignments":
        return "/parent/assignments";
      case "courses":
        return "/parent/subjects";
      case "timetable":
        return "/parent/timetable";
      case "examination":
        return "/parent/examinations";
      case "feeDetails":
        return "/parent/fees";
      case "transport":
        return "/parent/transport";
      case "mentorSupport":
        return "/parent/mentor-support";
      case "documents":
        return "/parent/documents";
      case "achievements":
        return "/parent/achievements";
      case "clubsCommittees":
        return "/parent/clubs";
      case "profile":
        return "/parent/profile";
      case "leave":
        return "/parent/leave";
      case "support_center":
        return "/parent/support";
      case "duty_records":
        return "/parent/duty-records";
      default:
        return "/parent/dashboard";
    }
  }
  if (role === ROLES.TEACHER) {
    switch (id) {
      case "teacher_home":
        return "/teacher/dashboard";
      case "teacher_leaves":
        return "/teacher/leaves";
      case "teacher_notices":
        return "/teacher/notices";
      case "attendance_mgmt":
        return "/teacher/attendance";
      case "assignments_mgmt":
        return "/teacher/assignments";
      case "marks_exams":
        return "/teacher/marks";
      case "question_papers":
        return "/teacher/question-papers";
      case "class_timetable":
        return "/teacher/timetable";
      case "student_perf":
        return "/teacher/students";
      case "mentorship_mgmt":
        return "/teacher/mentorship";
      case "class_updates":
        return "/teacher/class-updates";
      case "clubs_activities":
        return "/teacher/clubs";
      case "profile_settings":
        return "/teacher/profile-settings";
      case "leave_mgmt":
        return "/teacher/leave-management";
      case "support_center":
        return "/teacher/support";
      case "student_duty":
        return "/teacher/student-duty";
      default:
        return "/teacher/dashboard";
    }
  }
  if (role === ROLES.ADMIN) {
    switch (id) {
      case "admin_home":
        return "/admin/dashboard";
      case "admin_students":
        return "/admin/students";
      case "admin_employees":
        return "/admin/employees";
      case "admin_employee_leaves":
        return "/admin/employee-leaves";
      case "admin_teachers":
        return "/admin/teachers";
      case "admin_parents":
        return "/admin/parents";
      case "admin_classes":
        return "/admin/classes";
      case "admin_timetable":
        return "/admin/timetable";
      case "admin_exams":
        return "/admin/exams";
      case "admin_question_papers":
        return "/admin/question-papers";
      case "admin_academic_performance":
        return "/admin/academic-performance";
      case "admin_attendance":
        return "/admin/attendance";
      case "admin_leave_management":
        return "/admin/leave-management";
      case "admin_transport":
        return "/admin/transport";
      case "admin_fees":
        return "/admin/fees";
      case "admin_documents":
        return "/admin/documents";
      case "admin_clubs":
        return "/admin/clubs";
      case "admin_club_management":
        return "/admin/club-management";
      case "admin_achievements":
        return "/admin/achievements";
      case "admin_calendar":
        return "/admin/calendar";
      case "admin_notices":
        return "/admin/notices";
      case "admin_analytics_workload":
        return "/admin/analytics-workload";
      case "admin_institutional_planning":
        return "/admin/institutional-planning";
      case "admin_manage_departments":
        return "/admin/manage-departments";
      case "admin_communication_center":
        return "/admin/communication-center";
      case "admin_access_control":
        return "/admin/access-control";
      case "admin_profile":
        return "/admin/profile";
      case "admin_school_settings":
        return "/admin/school-settings";
      case "admin_support_management":
        return "/admin/support-management";
      case "support_center":
        return "/admin/support";
      case "student_duty":
        return "/admin/student-duty";
      default:
        return "/admin/dashboard";
    }
  }
  return "/";
}

/**
 * Checks if a navigation item is active based on the current route path and user role.
 */
export function isNavItemActive(id, role, pathname) {
  if (id === "logout") return false;

  const targetRoute = getRouteForNavItem(id, role);

  if (id === "courses") {
    // Both courses overview and individual subject details map to the courses sidebar item
    return pathname.startsWith(targetRoute);
  }
  if (id === "admin_students") {
    return pathname === targetRoute || pathname.startsWith(`${targetRoute}/`);
  }

  return pathname === targetRoute;
}

