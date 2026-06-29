import { getItem, setItem } from "../persistence/storage";
import { STORAGE_KEYS } from "../persistence/storageKeys";

export const DEFAULT_ACADEMIC_DEPARTMENT = "dept-academics";

export const runTeacherMigrationIfNeeded = () => {
  const isMigrated = getItem("teacherProfileMigrationCompleted");
  if (isMigrated) {
    return;
  }

  console.log("[MigrationEngine] Starting Phase 12.5 Teacher Profile Migration...");

  let teachers = getItem(STORAGE_KEYS.TEACHERS) || [];
  let employees = getItem(STORAGE_KEYS.EMPLOYEES) || [];

  // Backup data
  setItem("erp_teachers_backup", teachers);
  setItem("erp_employees_backup", employees);
  console.log("[MigrationEngine] Backed up teachers and employees.");

  let migrationOccurred = false;

  teachers = teachers.map((teacher) => {
    if (!teacher.employeeId) {
      migrationOccurred = true;

      // 1. Generate Employee ID using the same strategy as Phase 12.3
      const newEmployeeId = `EMP-${String(employees.length + 1).padStart(3, "0")}`;

      // 2. Create the new Employee record
      const newEmployee = {
        employeeId: newEmployeeId,
        employeeName: teacher.teacherName || teacher.name || "Unknown Teacher",
        gender: teacher.gender || "Not Specified",
        departmentId: DEFAULT_ACADEMIC_DEPARTMENT,
        accessLevel: "Teacher",
        designation: teacher.designation || "Teacher",
        phone: teacher.phone || teacher.phoneNumber || "+91 00000 00000",
        email: teacher.email || `${(teacher.teacherName || "teacher").toLowerCase().replace(/[^a-z]/g, "")}@school.edu`,
        joiningDate: teacher.joiningDate || "2023-04-01",
        status: teacher.isActive === false ? "inactive" : "active",
        portalAccess: true,
      };

      employees.push(newEmployee);

      // 3. Link the Teacher to the Employee
      // We retain the old fields on the teacher object for safety, marking them deprecated
      return {
        ...teacher,
        employeeId: newEmployeeId,
        _deprecatedHR: true // Meta flag indicating this record still holds HR fields
      };
    }
    return teacher;
  });

  if (migrationOccurred) {
    setItem(STORAGE_KEYS.TEACHERS, teachers);
    setItem(STORAGE_KEYS.EMPLOYEES, employees);
    console.log(`[MigrationEngine] Successfully migrated Teachers to unified Staff Registry.`);
  }

  // Set the flag so it doesn't run again
  setItem("teacherProfileMigrationCompleted", true);
};
