/**
 * Default Module Ownership Templates for Departments
 * 
 * Defines which modules are inherently owned by specific departments.
 * This ensures ownership is not entirely free-form and follows sensible institutional structures.
 */

export const DEPARTMENT_MODULE_TEMPLATES = {
  "dept-administration": [
    "admin_leave_management",
    "admin_support_management",
    "admin_documents",
    "admin_notices"
  ],
  "dept-transport": [
    "admin_transport"
  ],
  "dept-academics": [
    "admin_students",
    "admin_calendar"
  ],
  "dept-examination": [
    "admin_question_papers"
  ],
  "dept-finance": [
    "admin_fees"
  ],
  "dept-student-affairs": [
    "admin_club_management",
    "admin_achievements",
    "student_duty",
    "admin_attendance"
  ]
};

/**
 * Returns the default owned modules for a given department ID
 */
export const getTemplateModulesForDepartment = (departmentId) => {
  return DEPARTMENT_MODULE_TEMPLATES[departmentId] || [];
};
