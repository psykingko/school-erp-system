# Technical Debt & Refactoring Report

## 1. Fake vs. Persisted UI Elements
- **Activity Logs**: `src/pages/admin/SystemAdministrationPage.jsx` has a completely hardcoded `ACTIVITY_LOGS_SEED` array. There is no underlying system dispatching or recording activity logs. **Action:** DEPRECATE or REFACTOR to use a real event bus.
- **Department Head Assignments**: Persists via `departmentService.js` but relies on the `employeeId` foreign key. If an employee is deleted, the department head reference may dangle.
- **Access Profiles UI**: The dropdown for Access Levels on `SystemAdministrationPage.jsx` updates `employee.accessLevel`, but this string has no functional impact on the application's auth or routing layers.

## 2. Redundant / Overlapping Concepts
- **Roles vs. Access Levels**: There are MOCK_ROLES (e.g., "Vice Principal", "HR Manager") used in `EmployeeDirectoryPage.jsx`, global ROLES (`ADMIN`, `TEACHER`, etc.) used in the `AuthContext`, and `ACCESS_LEVELS` ("Super Admin", "Standard Employee") used in `SystemAdministrationPage.jsx`. These three layers of terminology overlap confusingly.
- **System Access Flag**: Employees have a `systemAccess` boolean and an optional `linkedAuthUserId`. However, auth is handled in `authService.js` and `AuthContext` independently. There is no automatic syncing between creating an employee with `systemAccess = true` and provisioning an `authUsers` record.

## 3. Storage Key Omissions
- While `storageKeys.js` is intended to be the single source of truth, there are implicit keys or missing constants for entities like Departments (though it may be wrapped under `INSTITUTION_SETTINGS` or missing from the enum entirely).

## Recommendation
- **REMOVE** the hardcoded Activity Logs until a real logging service is built.
- **REFACTOR** the Employee Access Profiles and Module Ownership to directly inform the `AuthContext` at login.
- **CONSOLIDATE** the concept of "Access Level" into the new module-based architecture where an Admin simply has an array of `assignedModules`.
