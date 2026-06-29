import { getDataProvider } from "../data/providers/providerFactory";
import employeeService from "./employeeService";

/**
 * Identity Provisioning Service (Phase 12.4)
 * Handles automated institutional account generation for staff.
 */
const identityProvisioningService = {
  /**
   * Generates a collision-safe username.
   */
  generateUsername: async (employee) => {
    const provider = getDataProvider();
    const authUsers = await provider.getAuthUsers();

    // Clean names
    const firstName = (employee.employeeName.split(" ")[0] || "staff").toLowerCase().replace(/[^a-z0-9]/g, "");
    const lastNameParts = employee.employeeName.split(" ").slice(1);
    const lastName = lastNameParts.length > 0 
      ? lastNameParts.join("").toLowerCase().replace(/[^a-z0-9]/g, "") 
      : employee.employeeId.toLowerCase().replace(/[^a-z0-9]/g, "");

    const baseUsername = `${firstName}.${lastName}`;
    
    // Check collision
    let username = baseUsername;
    let counter = 1;
    while (authUsers.some(u => u.username === username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  },

  /**
   * Generates a secure temporary password.
   */
  generateTemporaryPassword: () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure at least one number and one special char for safety (basic heuristic)
    password = password.slice(0, 6) + "9!"; 
    return password;
  },

  /**
   * Main orchestrator for identity provisioning.
   * Expected to be called AFTER employeeService.createEmployee succeeds.
   */
  provisionIdentity: async (employee) => {
    try {
      const username = await identityProvisioningService.generateUsername(employee);
      const tempPassword = identityProvisioningService.generateTemporaryPassword();

      // 1. Create the AuthUser
      const authUserPayload = {
        username: username,
        password: tempPassword,
        portalType: "ADMIN", // Only Admin portal types are provisioned in 12.4
        status: "PENDING_PASSWORD_RESET",
        employeeId: employee.employeeId,
        isSuperAdmin: false,
        manualOverrides: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      };

      const provider = getDataProvider();
      const authUser = await provider.createAuthUser(authUserPayload);

      // 2. Link back to Employee & update identity status
      try {
        await employeeService.updateEmployee(employee.employeeId, { 
          linkedAuthUserId: authUser.id,
          identityStatus: "PROVISIONED"
        });
      } catch (linkError) {
        // Rollback Strategy
        console.error("Failed to link AuthUser to Employee. Rolling back identity creation.", linkError);
        await provider.deleteAuthUser(authUser.id);
        
        // Ensure employee is marked as failed
        await employeeService.updateEmployee(employee.employeeId, { 
          identityStatus: "PROVISION_FAILED",
          linkedAuthUserId: ""
        });
        throw new Error("Identity provisioning failed during linkage. Rolled back AuthUser.");
      }

      // 3. Return the credentials to the engine for display
      return {
        authUser,
        credentials: {
          username: username,
          password: tempPassword
        }
      };

    } catch (error) {
      console.error("Identity Provisioning Failed:", error);
      throw error;
    }
  }
};

export default identityProvisioningService;
