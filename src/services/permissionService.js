import authUserService from "./authUserService";
import { getDataProvider } from "../data/providers/providerFactory";

export const ALWAYS_ALLOWED_MODULES = [
  "admin_home",
  "admin_profile",
  "logout"
];

/**
 * Service to resolve permissions and access rules for the Admin Portal.
 * This is the foundational service for Phase 3 (Sidebar Filtering) and Phase 4 (Route Guards).
 */
const permissionService = {
  /**
   * Evaluates if a module is accessible synchronously (for UI rendering).
   */
  canAccessModule: (user, moduleId) => {
    if (!user) return false;
    if (ALWAYS_ALLOWED_MODULES.includes(moduleId)) return true;
    if (user.isSuperAdmin) return true;
    
    // Phase 8: Purely evaluate the computed effective profile
    // No calculations or department lookups happen here.
    return user.effectiveModules && user.effectiveModules.includes(moduleId);
  },

  /**
   * Returns true if the current user has access to the specified module (Async version).
   */
  hasModuleAccess: async (authUserId, moduleId) => {
    const provider = getDataProvider();
    const user = await provider.getAuthUserById(authUserId);
    if (!user) return false;

    // Super Admins bypass module-level checks
    if (user.isSuperAdmin) {
      return true;
    }

    // Since this is an async check not tied to session payload, we might need to compute
    // effective modules dynamically if we don't have the session object.
    // However, permissionService.hasModuleAccess is mostly used during login checks or middleware.
    // Let's resolve the effective profile dynamically here just in case it's a backend-style check.
    const { default: effectiveAccessService } = await import("./effectiveAccessService");
    const profile = await effectiveAccessService.buildAccessProfile(user);
    return profile.effectiveModules.includes(moduleId);
  },

  /**
   * Returns the list of effective modules assigned to the user.
   */
  getAssignedModules: async (authUserId) => {
    const provider = getDataProvider();
    const user = await provider.getAuthUserById(authUserId);
    if (!user) return [];
    
    const { default: effectiveAccessService } = await import("./effectiveAccessService");
    const profile = await effectiveAccessService.buildAccessProfile(user);
    return profile.effectiveModules;
  },

  /**
   * Evaluates whether the user is a Super Admin.
   */
  isSuperAdmin: async (authUserId) => {
    const provider = getDataProvider();
    const user = await provider.getAuthUserById(authUserId);
    if (!user) return false;
    return !!user.isSuperAdmin;
  }
};

export default permissionService;
