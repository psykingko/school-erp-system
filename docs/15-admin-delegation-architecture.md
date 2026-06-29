# 15. Admin Delegation & Access Control Architecture

## Executive Summary
EduDash features a robust Module-Based Access Control system for Administrators. The system tightly integrates administrative UI configurations, employee directories, and module ownership directly with the Role-Based Access Control (RBAC) authentication and routing layers.

## Authentication Data Structure
The `authUsers` record for an admin features a standardized schema that supports modular access delegation.
```json
{
  "id": "auth-admin-002",
  "username": "hr_admin",
  "role": "ADMIN",
  "employeeId": "EMP-004",
  "assignedModules": [
    "admin_employee_leaves",
    "admin_employees",
    "admin_manage_departments"
  ]
}
```
If `assignedModules` is `["*"]` or if an `isSuperAdmin` flag is true, the administrator gets full, unrestricted access to the entire portal.

## Authentication & Authorization Flow
- **Flow**: Handled by `src/context/AuthContext.jsx` and `src/services/authService.js`.
- **State**: The `AuthContext` provides authentication flow by maintaining `user`, `role`, and `isAuthenticated` states, synchronized with `localStorage` under `STORAGE_KEYS.AUTH_STATE` (`edudash_auth_state`).
- **Route Protection**: `ProtectedRoute.jsx` wraps routes and validates authentication. It verifies that the user's role is in the `allowedRoles` array. For admins, the system dynamically checks if the requested URL or module is present in their `assignedModules`. If unauthorized, it displays a stylized "Unauthorized Access" block.

## Dynamic Navigation (Admin Sidebar)
The `src/components/admin/AdminSidebar.jsx` maps over the `ADMIN_SECTIONS` imported from `src/auth/navigation.js`.
- During render, it dynamically filters `ADMIN_SECTIONS.items` by checking if `item.id` exists in the current user's `assignedModules` array.
- Empty sections are automatically hidden from the navigation pane, ensuring administrators only see what they are authorized to manage.

## Administrative Controls UI (System Administration)
The `src/pages/admin/SystemAdministrationPage.jsx` acts as the primary UI for managing administrative access.
- **Employee Access Profiles**: Edits made to access levels are saved to `localStorage`. Instead of just metadata tags, the UI allows super administrators to delegate specific modules to individual employees.
- **System Access Flags**: Toggling "Grant Admin Portal Access" in the Employee Directory establishes a link between an employee record and an authentication account.
- **Module Ownership & Approvals**: Edits persist to `localStorage` under `erp_approvalSettings`. Designating an employee as an "Approving Authority" (e.g., for Leave Management) designates them as the recipient for notifications and approvals within that module workflow.

## Future Recommendations & Technical Debt
- **Activity Logs**: Ensure Activity Logs in `SystemAdministrationPage.jsx` are wired to actual backend audit trails rather than static mock data.
- **Module Ownership Synchronization**: Ensure that setting an employee as the "Approving Authority" for a module automatically grants them the requisite module access ID in their `assignedModules` array to prevent access control gaps.
- **Mock Overlap**: Consolidate `MOCK_ROLES` in `EmployeeDirectoryPage.jsx` with the actual system roles to prevent terminology overlap.
