import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import actionPermissionService from "../../services/actionPermissionService";

/**
 * Evaluates whether the current user is authorized to perform the requested action.
 * Enforces the rule: "Ownership Controls Actions, Visibility Controls Access."
 *
 * @param {string} moduleId - The module ID (e.g., "admin_leave_management")
 * @param {string} permission - "view" | "create" | "edit" | "delete" | "approve" | "publish" | "bulk"
 * @param {"hidden" | "disabled" | "readonly"} mode - How to handle unauthorized access.
 */
const PermissionGate = ({ moduleId, permission, mode = "hidden", children, fallback = null }) => {
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkPermission = async () => {
      setIsLoading(true);
      try {
        const hasAccess = await actionPermissionService.canPerformAction(user, moduleId, permission);
        if (isMounted) setIsAuthorized(hasAccess);
      } catch (e) {
        console.error("Permission check failed", e);
        if (isMounted) setIsAuthorized(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (user && moduleId && permission) {
      checkPermission();
    } else {
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [user, moduleId, permission]);

  if (isLoading) {
    // Optionally return a tiny loading skeleton, or just invisible wrapper
    return null; 
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  // Unauthorized handling
  switch (mode) {
    case "hidden":
      return fallback;
    case "disabled":
      // We clone the child to force disabled=true and a not-allowed cursor
      if (React.isValidElement(children)) {
        return React.cloneElement(children, {
          disabled: true,
          className: `${children.props.className || ""} opacity-50 cursor-not-allowed`,
          onClick: (e) => e.preventDefault(),
          title: "You do not have permission to perform this action."
        });
      }
      return fallback;
    case "readonly":
      // Render informational content without actionable controls
      return <div className="pointer-events-none opacity-80" title="Read Only Access">{children}</div>;
    default:
      return fallback;
  }
};

export default PermissionGate;
