import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import permissionService from "../services/permissionService";

/**
 * AdminRouteGuard
 * 
 * Enforces route-level module authorization.
 * If a user manually accesses an unauthorized URL, they are blocked here.
 */
const AdminRouteGuard = ({ children, requiredModule }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  // 1. Fail Closed Architecture: If no module is specified, DENY access.
  if (!requiredModule) {
    return <UnauthorizedAccessBlock role={role} navigate={navigate} logout={logout} />;
  }

  // 2. Delegate to central permission service
  const isAllowed = permissionService.canAccessModule(user, requiredModule);

  if (!isAllowed) {
    return <UnauthorizedAccessBlock role={role} navigate={navigate} logout={logout} />;
  }

  // 3. Authorized
  return <>{children}</>;
};

// Extracted from ProtectedRoute for Phase 4A
const UnauthorizedAccessBlock = ({ role, navigate, logout }) => {
  const dashboardPath = `/${role?.toLowerCase() || 'admin'}/dashboard`;
  
  return (
    <div className="flex items-center justify-center min-h-[500px] w-full px-4 select-none">
      <div className="flex flex-col items-center justify-center text-center p-8 bg-[#f0faff]/80 backdrop-blur-sm rounded-[2.5rem] border border-[#caf0f8] shadow-lg max-w-lg w-full mx-auto my-8">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 border border-rose-100 shadow-sm animate-pulse">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m14.5 9-5 5"/><path d="m9.5 9 5 5"/></svg>
        </div>
        <h2 className="text-2xl font-black text-[#03045e] mb-3">Unauthorized Access</h2>
        <p className="text-gray-500 font-bold mb-2">
          Your account does not have permission to view this module.
        </p>
        <p className="text-gray-400 text-xs font-semibold mb-6 max-w-sm">
          Please contact your Super Administrator if you require access to this section. Use the escape actions below to continue.
        </p>
        
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => navigate(dashboardPath, { replace: true })}
            className="w-full px-6 py-3.5 rounded-2xl font-black text-sm text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            style={{ backgroundColor: "#00b4d8" }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={logout}
            className="w-full px-6 py-3.5 rounded-2xl font-black text-sm text-[#03045e] border border-[#caf0f8] bg-white hover:bg-[#caf0f8]/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            Logout & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRouteGuard;
