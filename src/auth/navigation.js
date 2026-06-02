import { ROLES } from "./roles";

/**
 * Enterprise navigation mapping by role.
 */
export const ROLE_NAVIGATION = {
  [ROLES.STUDENT]: [
    { id: "home", icon: "LayoutDashboard" },
    { id: "assignments", icon: "ClipboardList" },
    { id: "courses", icon: "BookOpen" },
    { id: "timetable", icon: "Calendar" },
    { id: "examination", icon: "GraduationCap" },
    { id: "feeDetails", icon: "Wallet" },
    { id: "transport", icon: "Bus" },
    { id: "clubsCommittees", icon: "Users" },
    { id: "mentorSupport", icon: "MessageSquare" },
    { id: "documents", icon: "Folder" },
    { id: "achievements", icon: "Award" },
    { id: "calendar", icon: "CalendarDays" },
    { id: "leave", icon: "CalendarDays" },
    { id: "profile", icon: "User" },
    { id: "logout", icon: "LogOut" },
  ],
  [ROLES.PARENT]: [
    { id: "home", icon: "LayoutDashboard" },
    { id: "assignments", icon: "ClipboardList" },
    { id: "courses", icon: "BookOpen" },
    { id: "timetable", icon: "Calendar" },
    { id: "examination", icon: "GraduationCap" },
    { id: "feeDetails", icon: "Wallet" },
    { id: "transport", icon: "Bus" },
    { id: "mentorSupport", icon: "MessageSquare" },
    { id: "documents", icon: "Folder" },
    { id: "achievements", icon: "Award" },
    { id: "leave", icon: "CalendarDays" },
    { id: "profile", icon: "User" },
    { id: "logout", icon: "LogOut" },
  ],
  [ROLES.TEACHER]: [
    { id: "teacher_home", icon: "LayoutDashboard" },
    { id: "attendance_mgmt", icon: "CheckSquare" },
    { id: "assignments_mgmt", icon: "ClipboardList" },
    { id: "marks_exams", icon: "FileEdit" },
    { id: "question_papers", icon: "FileText" },
    { id: "class_timetable", icon: "Calendar" },
    { id: "student_perf", icon: "BarChart2" },
    { id: "class_updates", icon: "Megaphone" },
    { id: "mentorship_mgmt", icon: "MessageSquare" },
    { id: "clubs_activities", icon: "Users" },
    { id: "leave_mgmt", icon: "CalendarDays" },
    { id: "profile_settings", icon: "User" },
    { id: "logout", icon: "LogOut" },
  ],
  [ROLES.ADMIN]: [
    { id: "admin_home", icon: "LayoutDashboard" },
    { id: "admin_students", icon: "Users" },
    { id: "admin_teachers", icon: "Briefcase" },
    { id: "admin_parents", icon: "User" },
    { id: "admin_admins", icon: "ShieldCheck" },
    { id: "admin_classes", icon: "Building2" },
    { id: "admin_subjects", icon: "BookOpen" },
    { id: "admin_subject_alloc", icon: "ClipboardList" },
    { id: "admin_timetable", icon: "Calendar" },
    { id: "admin_exams", icon: "GraduationCap" },
    { id: "admin_question_papers", icon: "FileText" },
    { id: "admin_academic_performance", icon: "BarChart2" },
    { id: "admin_attendance", icon: "CheckSquare" },
    { id: "admin_leaves", icon: "CalendarDays" },
    { id: "admin_transport", icon: "Bus" },
    { id: "admin_fees", icon: "Wallet" },
    { id: "admin_documents", icon: "Folder" },
    { id: "admin_clubs", icon: "Users" },
    { id: "admin_achievements", icon: "Award" },
    { id: "admin_calendar", icon: "CalendarDays" },
    { id: "admin_notices", icon: "Megaphone" },
    { id: "admin_analytics_workload", icon: "Briefcase" },
    { id: "admin_manage_departments", icon: "Layers" },
    { id: "admin_communication_center", icon: "Send" },
    { id: "admin_profile", icon: "User" },
    { id: "admin_school_settings", icon: "Settings" },
    { id: "logout", icon: "LogOut" },
  ],
};

/**
 * Structured sections for the Admin Portal sidebar.
 */
export const ADMIN_SECTIONS = [
  {
    title: "Dashboard",
    items: [{ id: "admin_home", icon: "LayoutDashboard" }],
  },
  {
    title: "User Management",
    items: [
      { id: "admin_students", icon: "Users" },
      { id: "admin_teachers", icon: "Briefcase" },
      { id: "admin_parents", icon: "User" },
      { id: "admin_admins", icon: "ShieldCheck" },
    ],
  },
  {
    title: "Academic Management",
    items: [
      { id: "admin_classes", icon: "Building2" },
      { id: "admin_timetable", icon: "Calendar" },
      { id: "admin_exams", icon: "GraduationCap" },
      { id: "admin_question_papers", icon: "FileText" },
      { id: "admin_academic_performance", icon: "BarChart2" },
    ],
  },
  {
    title: "Operations",
    items: [
      { id: "admin_attendance", icon: "CheckSquare" },
      { id: "admin_leaves", icon: "CalendarDays" },
      { id: "admin_transport", icon: "Bus" },
      { id: "admin_fees", icon: "Wallet" },
      { id: "admin_documents", icon: "Folder" },
    ],
  },
  {
    title: "Institutional Activities",
    items: [
      { id: "admin_clubs", icon: "Users" },
      { id: "admin_achievements", icon: "Award" },
      { id: "admin_calendar", icon: "CalendarDays" },
      { id: "admin_notices", icon: "Megaphone" },
    ],
  },
  {
    title: "Analytics",
    items: [{ id: "admin_analytics_workload", icon: "Briefcase" }],
  },
  {
    title: "Institutional",
    items: [
      { id: "admin_manage_departments", icon: "Layers" },
      { id: "admin_communication_center", icon: "Send" },
    ],
  },
  {
    title: "Settings",
    items: [
      { id: "admin_profile", icon: "User" },
      { id: "admin_access_control", icon: "ShieldCheck" },
      { id: "admin_school_settings", icon: "Settings" },
      { id: "logout", icon: "LogOut" },
    ],
  },
];
