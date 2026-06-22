# Access Control & Administrative Controls Analysis

## 1. System Administration Page Overview
The `src/pages/admin/SystemAdministrationPage.jsx` acts as the primary UI for managing administrative access. It contains three tabs:
- Employee Access Profiles
- Module Ownership & Approvals
- Activity Logs

## 2. Employee Access Profiles
- **Persistence:** Edits made to access levels are saved to `localStorage` via `employeeService.updateEmployee`.
- **UI:** The UI lists all employees and allows changing their `accessLevel` via a dropdown.
- **Values:** Dropdown values come from `ACCESS_LEVELS` (e.g., "Super Admin", "Standard Employee", etc.).
- **Missing Link:** While this updates the `accessLevel` on the Employee record, this does not actually impact what modules an admin can access or what they see on the sidebar. It is currently just a metadata field on the Employee.

## 3. Module Ownership & Approvals
- **Persistence:** Edits persist to `localStorage` via `moduleOwnershipService.updateModuleOwnershipSetting` under the `erp_approvalSettings` key.
- **UI:** Displays a list of hardcoded modules (e.g., "Leave Management", "Resource Booking") and allows assigning a "Primary Handler / Approving Authority" from the employee list.
- **Reality:** While the setting persists, the application doesn't heavily enforce this for routing or module visibility. It simply records who owns what.

## 4. Activity Logs
- **Implementation:** Entirely fake. The logs are hardcoded in a `ACTIVITY_LOGS_SEED` array at the top of the file. No actions are actually logged or persisted.

## 5. Employee Directory Access Flags
- In `EmployeeDirectoryPage.jsx`, creating/editing an employee has a toggle for `systemAccess` ("Grant Admin Portal Access") and an optional `linkedAuthUserId`.
- These are saved to the employee record but do not dynamically provision an auth account or enforce module-based access constraints.

## Conclusion
The Access Control features look fully featured on the UI but are mostly superficial. The persistence exists (saving fields on Employee records and saving Module Ownership), but the connection between an Employee's Access Level / Module Ownership and their actual navigational permissions is missing. The Activity Log is entirely static mock data.
