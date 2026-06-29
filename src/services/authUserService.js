import { getDataProvider } from "../data/providers/providerFactory";
import { ROLES } from "../auth/roles";
import effectiveAccessService from "./effectiveAccessService";

/**
 * Service for managing Admin Delegation Auth Users.
 * Centralizes the schema enforcement for administrative login accounts.
 */
const authUserService = {
  getAuthUserByEmployeeId: async (employeeId) => {
    const provider = getDataProvider();
    return provider.getAuthUserByEmployeeId(employeeId);
  },

  getAllAdminUsers: async () => {
    const provider = getDataProvider();
    const users = await provider.getAuthUsers();
    return users.filter(u => u.role === ROLES.ADMIN);
  },

  createAdminUser: async (data) => {
    // Enforce strict schema for admin accounts
    const nowStr = new Date().toISOString();
    const authUserData = {
      username: data.username,
      password: data.password,
      role: ROLES.ADMIN,
      isSuperAdmin: !!data.isSuperAdmin,
      employeeId: data.employeeId,
      status: data.status || "ACTIVE",
      manualOverrides: data.manualOverrides || [],
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    const provider = getDataProvider();
    return provider.createAuthUser(authUserData);
  },

  updateAdminUser: async (authUserId, updates) => {
    // Ensure we don't accidentally overwrite strict fields with invalid data
    const safeUpdates = { ...updates };
    
    // If role is passed, it must be ADMIN
    if (safeUpdates.role) {
      safeUpdates.role = ROLES.ADMIN;
    }

    safeUpdates.updatedAt = new Date().toISOString();

    const provider = getDataProvider();
    return provider.updateAuthUser(authUserId, safeUpdates);
  },

  deleteAdminUser: async (authUserId) => {
    // Only exposed for complete teardowns (e.g., employee hard deletion)
    // For standard access revocation, use updateAdminUser and set status = 'INACTIVE'
    const provider = getDataProvider();
    return provider.deleteAuthUser(authUserId);
  },

  updateManualOverrides: async (authUserId, moduleIds) => {
    const provider = getDataProvider();
    const user = await provider.getAuthUserById(authUserId);
    if (!user) throw new Error("Auth user not found");
    const deptModules = await effectiveAccessService.getDepartmentModules(user.employeeId);
    
    // Ensure manual overrides do not duplicate department modules
    const cleanOverrides = moduleIds.filter(modId => !deptModules.includes(modId));
    // We write to manualOverrides
    return authUserService.updateAdminUser(authUserId, { manualOverrides: cleanOverrides });
  },

  grantOverride: async (authUserId, moduleId) => {
    const provider = getDataProvider();
    const user = await provider.getAuthUserById(authUserId);
    if (!user) throw new Error("Auth user not found");
    const deptModules = await effectiveAccessService.getDepartmentModules(user.employeeId);
    
    if (deptModules.includes(moduleId)) {
      return user; // Already granted by department, do not store as manual override
    }

    const modules = new Set(user.manualOverrides || []);
    modules.add(moduleId);
    return authUserService.updateAdminUser(authUserId, { manualOverrides: Array.from(modules) });
  },

  revokeOverride: async (authUserId, moduleId) => {
    const provider = getDataProvider();
    const user = await provider.getAuthUserById(authUserId);
    if (!user) throw new Error("Auth user not found");
    const modules = new Set(user.manualOverrides || []);
    modules.delete(moduleId);
    return authUserService.updateAdminUser(authUserId, { manualOverrides: Array.from(modules) });
  },

  getManualOverrides: async (authUserId) => {
    const provider = getDataProvider();
    const user = await provider.getAuthUserById(authUserId);
    if (!user) throw new Error("Auth user not found");
    return user.manualOverrides || [];
  },


};

export default authUserService;
