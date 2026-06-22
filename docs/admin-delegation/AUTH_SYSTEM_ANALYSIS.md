# Authentication System Analysis

## 1. Authentication Flow
- Handled by `src/context/AuthContext.jsx` and `src/services/authService.js`.
- The `AuthContext` provides a simulated authentication flow by maintaining `user`, `role`, and `isAuthenticated` states.
- The `login` method calls `authService.authenticate(role, username, password)` and stores the returned session.
- State is synchronized with `localStorage` under `STORAGE_KEYS.AUTH_STATE` (`edudash_auth_state`).
- `logout` clears the memory state, removes the `AUTH_STATE` key from `localStorage`, clears `sessionStorage`, and navigates back to `/login`.

## 2. Role Resolution and Storage
- Roles are exported from `src/auth/roles.js` (`STUDENT`, `PARENT`, `TEACHER`, `ADMIN`).
- Upon login, the context sets boolean flags: `isStudent`, `isParent`, `isTeacher`, `isAdmin` based on the user role.
- Roles are stored as part of the JSON object in `edudash_auth_state`.

## 3. Current User Resolution
- The `AuthContext` makes `user`, `role`, and `isAuthenticated` available via the `useAuth()` hook.
- `ProtectedRoute.jsx` wraps routes and validates authentication:
  - Checks if `!isAuthenticated` or `!role`.
  - Checks if the user's role is in the `allowedRoles` array.
  - If unauthorized, it displays a stylized "Unauthorized Access" block with "escape actions".

## 4. Admin Identity Persistence
- Identity persists as long as `edudash_auth_state` remains in `localStorage`.
- Admin users log in with the `ADMIN` role. 

## 5. Multiple Admin Accounts
- Currently, `authService.js` (and the `authUsers` mock DB) likely contains multiple mock admin credentials.
- `EmployeeDirectoryPage.jsx` has fields for `systemAccess` and `linkedAuthUserId`, hinting that employee records can be linked to authentication accounts, but this linkage is mostly a UI mockup and not fully integrated into the login system yet.

## Conclusion
The authentication system is functional for mocked roles but currently handles Admin as a single monolithic role (`ADMIN`). It lacks the nuance of delegating specific modules to specific Admin users through the auth context itself.
