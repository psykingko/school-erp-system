import departmentOwnershipService from "./departmentOwnershipService";
import departmentService from "./departmentService";

/**
 * Effective Access Engine
 * Calculates the final active permissions for an admin by combining
 * Department-derived Ownership with Manual Overrides.
 */
const effectiveAccessService = {
  /**
   * Retrieves all modules owned by departments where the employee is the head.
   */
  getDepartmentHeadModules: async (employeeId) => {
    if (!employeeId) return [];
    const departments = await departmentService.getDepartments();
    const ownedModules = new Set();
    
    departments.forEach(dept => {
      if (dept.departmentHead === employeeId && dept.ownedModules) {
        dept.ownedModules.forEach(modId => ownedModules.add(modId));
      }
    });
    
    return Array.from(ownedModules);
  },

  /**
   * Retrieves all modules owned by departments where the employee is a member.
   */
  getDepartmentMemberModules: async (employeeId) => {
    if (!employeeId) return [];
    const departments = await departmentService.getDepartments();
    const ownedModules = new Set();
    
    departments.forEach(dept => {
      if (dept.memberIds && dept.memberIds.includes(employeeId) && dept.ownedModules) {
        dept.ownedModules.forEach(modId => ownedModules.add(modId));
      }
    });
    
    return Array.from(ownedModules);
  },

  /**
   * Retrieves ALL modules owned by departments where the user is either Head or Member.
   * This preserves backwards compatibility for consumers expecting a single list of structural modules.
   */
  getDepartmentModules: async (employeeId) => {
    if (!employeeId) return [];
    const headModules = await effectiveAccessService.getDepartmentHeadModules(employeeId);
    const memberModules = await effectiveAccessService.getDepartmentMemberModules(employeeId);
    return Array.from(new Set([...headModules, ...memberModules]));
  },

  /**
   * Builds the complete access profile for an admin user.
   * This is the single source of truth for access calculations.
   */
  buildAccessProfile: async (authUser) => {
    if (!authUser) {
      return { departmentModules: [], manualOverrides: [], effectiveModules: [] };
    }

    // Super Admins don't need calculations, but we'll return an empty profile
    // as their access is completely bypassed at the permissionService level.
    if (authUser.isSuperAdmin) {
      return { 
        departmentModules: [], 
        manualOverrides: [], 
        effectiveModules: [] // permissionService bypasses this anyway
      };
    }

    const departmentModules = await effectiveAccessService.getDepartmentModules(authUser.employeeId);
    
    // In Phase 7, manualOverrides acts as the list of manual overrides
    const rawOverrides = authUser.manualOverrides || [];
    
    // Ensure manual overrides do not contain modules already granted by departments
    const manualOverrides = rawOverrides.filter(modId => !departmentModules.includes(modId));

    // Combine and deduplicate
    const effectiveModules = Array.from(new Set([...departmentModules, ...manualOverrides]));

    return {
      departmentModules,
      manualOverrides,
      effectiveModules
    };
  },

  /**
   * Calculates structural access violations to surface in the governance dashboard.
   */
  getAccessViolations: async () => {
    const departments = await departmentService.getDepartments();
    const violations = [];
    
    const moduleClaims = {};

    departments.forEach(dept => {
      const hasHead = !!dept.departmentHead;
      const modules = dept.ownedModules || [];

      if (!hasHead && modules.length > 0) {
        violations.push({
          type: "Missing Head",
          departmentName: dept.departmentName,
          message: `Department owns ${modules.length} module(s) but has no Department Head.`
        });
      }

      if (modules.length === 0) {
        violations.push({
          type: "Department Has No Modules",
          departmentName: dept.departmentName,
          message: "Department is active but owns no software modules."
        });
      }

      modules.forEach(modId => {
        if (!moduleClaims[modId]) {
          moduleClaims[modId] = [];
        }
        moduleClaims[modId].push(dept.departmentName);
      });
    });

    // Detect duplicate ownership
    Object.keys(moduleClaims).forEach(modId => {
      if (moduleClaims[modId].length > 1) {
        violations.push({
          type: "Duplicate Ownership",
          departmentName: "Multiple Departments",
          message: `Module ID '${modId}' is claimed by: ${moduleClaims[modId].join(', ')}`
        });
      }
    });

    return violations;
  }
};

export default effectiveAccessService;
