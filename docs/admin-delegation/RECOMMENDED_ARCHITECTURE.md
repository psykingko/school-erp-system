# Recommended Architecture for Admin Delegation

Based on the audit of the current state, the following architecture is recommended to support Module-Based Access.

## 1. Unified Authentication Data Structure
Instead of managing disparate fields (`accessLevel`, `roleId`, `systemAccess`), the `authUsers` record for an admin should have a standardized schema:
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
If `assignedModules` is `["*"]` or if an `isSuperAdmin` flag is true, they get full access.

## 2. Dynamic Sidebar Generation
Modify `src/components/admin/AdminSidebar.jsx`. Currently, it maps over the static `ADMIN_SECTIONS` imported from `src/auth/navigation.js`.
- During render, filter `ADMIN_SECTIONS.items` by checking if `item.id` exists in the current user's `assignedModules` array.
- Empty sections should be hidden automatically.

## 3. Dynamic Route Protection
Modify `src/routes/ProtectedRoute.jsx` or create an `AdminProtectedRoute.jsx`.
- When an admin attempts to hit an admin route (e.g., `/admin/fees`), check if the associated module ID (e.g., `admin_fees`) is present in their `assignedModules`.
- If missing, render the existing Unauthorized Access block.

## 4. Admin Management UI Upgrades
The `SystemAdministrationPage.jsx` tab for "Access Profiles" should be repurposed.
- Instead of setting string titles like "Standard Employee", it should open a modal with checkboxes representing every available module in `ADMIN_SECTIONS`.
- Selecting these checkboxes updates the `assignedModules` array for that employee's linked `authUser` record.

## 5. Module Ownership Sync
The existing "Module Ownership & Approvals" can be kept as a metadata tag for "who receives the notification for approval", but should be synchronized. If an employee is set as the "Approving Authority" for Leave Management, they must automatically have `admin_leave_approval` added to their `assignedModules`.
