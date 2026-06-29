import departmentOwnershipService from "./departmentOwnershipService";

const actionPermissionService = {
  /**
   * Checks if the user has structural or manual operational access (Create/Edit).
   */
  canOperateModule: async (user, moduleId) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    
    // Check ownership/membership
    const dept = await departmentOwnershipService.getDepartmentByModule(moduleId);
    if (dept) {
      if (dept.departmentHead === user.employeeId) return true;
      if (dept.memberIds && dept.memberIds.includes(user.employeeId)) return true;
    }
    
    // Check manual override
    if (user.manualOverrides && user.manualOverrides.includes(moduleId)) return true;
    
    return false;
  },

  /**
   * Checks if the user is the explicit Head (Owner) of the module.
   */
  isModuleOwner: async (user, moduleId) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    const ownerId = await departmentOwnershipService.getModuleOwner(moduleId);
    return ownerId === user.employeeId;
  },

  canApproveModule: async (user, moduleId) => actionPermissionService.isModuleOwner(user, moduleId),
  canPublishModule: async (user, moduleId) => actionPermissionService.isModuleOwner(user, moduleId),
  canDeleteModule: async (user, moduleId) => actionPermissionService.isModuleOwner(user, moduleId),

  /**
   * Translates visibility (effective access) and ownership into operational authority.
   * @param {Object} user - The authenticated user profile (from context)
   * @param {string} moduleId - The module ID (e.g. "admin_leave_management")
   * @param {string} permission - The requested action (view, create, edit, delete, approve, publish, bulk)
   * @returns {Promise<boolean>}
   */
  canPerformAction: async (user, moduleId, permission) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;

    // Visibility Controls Access: Any admin with effective access can VIEW the module.
    const hasVisibility = user.effectiveModules && user.effectiveModules.includes(moduleId);
    
    if (permission === "view") {
      return hasVisibility;
    }

    // Edge Cases explicitly defined in the matrix
    if (moduleId === "admin_support_management" && permission === "create") {
      // All admins can create support tickets if they can see the module
      return hasVisibility;
    }

    // Operations (Create/Edit)
    if (permission === "create" || permission === "edit") {
      return actionPermissionService.canOperateModule(user, moduleId);
    }

    // Critical Actions (Delete, Approve, Publish, Bulk)
    return actionPermissionService.isModuleOwner(user, moduleId);
  },

  /**
   * Helper to check exactly what level of access a user has to a module for the UI Banner.
   * @returns {Promise<"Super Admin" | "Owner" | "Operator" | "View Only" | "None">}
   */
  getAccessLevel: async (user, moduleId) => {
    if (!user) return "None";
    if (user.isSuperAdmin) return "Super Admin";

    const isOwner = await actionPermissionService.isModuleOwner(user, moduleId);
    if (isOwner) return "Owner";

    const isOperator = await actionPermissionService.canOperateModule(user, moduleId);
    if (isOperator) return "Operator";

    const hasVisibility = user.effectiveModules && user.effectiveModules.includes(moduleId);
    if (hasVisibility) return "View Only";

    return "None";
  }
};

export default actionPermissionService;
