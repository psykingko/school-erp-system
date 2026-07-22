import { ADMIN_SECTIONS } from "../auth/navigation";
import { getRouteForNavItem } from "../shared/utils/routeHelpers";
import { ROLES } from "../auth/roles";
import departmentService from "./departmentService";

/**
 * adminDashboardService
 * 
 * Prepares personalized dashboard data for the authenticated administrator.
 * Adheres to Phase 1 constraints: No UI modifications, strictly reuses Auth and Navigation architectures.
 */
export const adminDashboardService = {
  getAdminDashboardPayload: async (user) => {
    if (!user) return null;

    const profileData = user.profile || {};
    const employeeName = user.name || "Administrator";
    const designation = profileData.designation || "System Administrator";
    const departmentId = profileData.departmentId || null;

    let departmentName = "Administration";
    let departmentData = null;

    // Step 9: Department Information (Reuse without directly querying local storage)
    if (departmentId) {
      try {
        const departments = await departmentService.getDepartments();
        departmentData = departments.find(d => d.departmentId === departmentId || d.id === departmentId);
        if (departmentData) {
          departmentName = departmentData.departmentName || departmentId;
        } else {
          departmentName = departmentId;
        }
      } catch (e) {
        console.error("Failed to resolve department info", e);
      }
    }

    // Step 3: Prepare Welcome Information
    const welcome = {
      greeting: `Welcome back, ${employeeName.split(" ")[0]}`,
      name: employeeName,
      designation: designation,
      department: departmentName,
      role: user.role,
      avatarColor: user.avatarColor || "#7209b7",
      avatarInitials: user.avatarInitials || "AD",
    };

    // Step 4: Prepare Profile Summary
    const profile = {
      employeeId: user.employeeId || profileData.employeeId || "N/A",
      employeeName: employeeName,
      department: departmentName,
      designation: designation,
      role: user.role,
      isSuperAdmin: !!user.isSuperAdmin,
    };

    // Step 9: Structured Department Detail
    const department = {
      departmentId: departmentId || "N/A",
      departmentName: departmentName,
      departmentHead: departmentData ? departmentData.departmentHead : null,
      description: departmentData ? departmentData.description : null,
      ownedModules: departmentData ? (departmentData.ownedModules || []) : []
    };

    // Step 5 & 6: Active Modules via Existing Navigation Registry
    const allItems = ADMIN_SECTIONS.flatMap(section => section.items);
    
    const activeModules = [];
    const commonWorkspace = [];
    const quickAccess = [];

    // Step 7: Prepare Common Workspace (Dynamically derived from Navigation Registry)
    const personalWorkspaceSection = ADMIN_SECTIONS.find(sec => sec.title === "Personal Workspace" || sec.title === "Common Workspace");
    const commonWorkspaceIds = personalWorkspaceSection 
      ? personalWorkspaceSection.items.map(item => item.id) 
      : ["admin_profile", "admin_my_attendance", "admin_employee_leaves", "calendar", "support_center"];

    const effectiveModules = user.isSuperAdmin 
      ? allItems.map(item => item.id) 
      : (user.effectiveModules || []);

    const accessibleItems = allItems.filter(item => 
      effectiveModules.includes(item.id) || 
      commonWorkspaceIds.includes(item.id) || 
      item.id === "admin_home" || 
      item.id === "logout"
    );

    // Helper for generating rich descriptions for the Command Center
    const getWorkspaceDescription = (id, label) => {
      switch (id) {
        case "admin_profile": return "Manage your personal information and account settings";
        case "admin_my_attendance": return "View your daily attendance logs and metrics";
        case "admin_employee_leaves": return "Apply for and track your leave requests";
        case "calendar": return "View upcoming academic and institutional events";
        case "support_center": return "Raise queries and track support tickets";
        default: return `Access your ${label.toLowerCase()} details`;
      }
    };

    // Map to Dashboard Module Cards structure
    accessibleItems.forEach(item => {
      const moduleData = {
        id: item.id,
        label: item.label,
        icon: item.icon,
        path: getRouteForNavItem(item.id, ROLES.ADMIN)
      };

      if (commonWorkspaceIds.includes(item.id) && item.id !== "logout") {
        // Enrich common workspace for the Command Center layout
        moduleData.description = getWorkspaceDescription(item.id, item.label);
        moduleData.cta = "View Details";
        commonWorkspace.push(moduleData);
      } else if (item.id !== "admin_home" && item.id !== "logout") {
        activeModules.push(moduleData);
        
        // Step 8: Prepare Quick Access (First 6 active modules)
        if (quickAccess.length < 6) {
          quickAccess.push(moduleData);
        }
      }
    });

    // Step 10: Data Normalization
    return {
      welcome,
      profile,
      department,
      activeModules,
      commonWorkspace,
      quickAccess
    };
  }
};

export default adminDashboardService;
