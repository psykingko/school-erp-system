# Local Storage Inventory

The system relies on `localStorage` wrapped by a centralized `storage.js` and strict keys defined in `src/persistence/storageKeys.js`. Below is the complete inventory of keys related to Admin delegation and access control:

## Authentication & User Keys
- `edudash_auth_state` (`AUTH_STATE`): Contains the active user session data, role, and authentication status.
- `erp_authUsers` (`AUTH_USERS`): Stores the mock authentication accounts containing usernames, passwords, and roles.

## Employee & HR Keys
- `erp_employees` (`EMPLOYEES`): The core registry of employees. Schema includes `employeeId`, `departmentId`, `roleId`, `designation`, `accessLevel`, `systemAccess`, and `linkedAuthUserId`.
- `erp_departments` (implied or embedded if not listed explicitly in keys, though `ManageDepartmentsPage.jsx` fetches it): Wait, there is no `DEPARTMENTS` key explicitly in the `STORAGE_KEYS` enum, but `departmentService` uses `localProvider.getDepartments()`. Actually, we need to ensure the department data is stored safely.

## Access & Module Keys
- `erp_approvalSettings` (`APPROVAL_SETTINGS`): Stores the mapping of Module Name to Approver/Handler Employee ID. (e.g., `Leave Management` -> `EMP-001`).
- `erp_institutionSettings` (`INSTITUTION_SETTINGS`): Broad school settings, potentially containing global overrides for admin access.

## Summary of Delegation State
Currently, delegation state is fragmented across:
1. The **Auth State** (`edudash_auth_state`), which knows the user is an `ADMIN`.
2. The **Employee Profile** (`erp_employees`), which knows an employee has `systemAccess` and an `accessLevel`.
3. The **Approval Settings** (`erp_approvalSettings`), which maps specific modules to an employee.

To implement module-based access, the `AUTH_STATE` needs to dynamically inherit or join against the `erp_approvalSettings` (or an explicit `assignedModules` array on the Auth User/Employee record) to determine the exact access list.
