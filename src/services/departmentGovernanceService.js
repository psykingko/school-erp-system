import departmentService from "./departmentService";
import departmentOwnershipService from "./departmentOwnershipService";
import employeeService from "./employeeService";
import authUserService from "./authUserService";
import effectiveAccessService from "./effectiveAccessService";
import { getTemplateModulesForDepartment } from "../constants/departmentModuleTemplates";

const departmentGovernanceService = {
  getDepartmentGovernanceMetrics: async () => {
    const departments = await departmentService.getDepartments();
    const coverage = await departmentOwnershipService.getOwnershipCoverage();
    
    return {
      totalDepartments: departments.length,
      headsAssigned: departments.filter(d => !!d.departmentHead).length,
      headsMissing: coverage.departmentsWithoutHead,
      modulesCovered: coverage.coveredModules,
      modulesUncovered: coverage.uncoveredModules,
      violations: coverage.violations,
    };
  },

  getDepartmentHealthLedger: async () => {
    const departments = await departmentService.getDepartments();
    const employees = await employeeService.getEmployees();
    // Assuming authUserService has a method to get all users. If not, we map employees.
    // Actually, we can just check employees who have linkedAuthUserId and belong to department.
    
    const ledger = [];
    
    for (const dept of departments) {
      const headEmp = employees.find(e => e.employeeId === dept.departmentHead);
      
      // Calculate Governance Risk Score
      let score = 100;
      if (!dept.departmentHead) score -= 50;
      if (!dept.ownedModules || dept.ownedModules.length === 0) score -= 50;
      
      let status = "Healthy";
      if (score === 50) status = "Warning";
      else if (score === 0) status = "Critical";

      const adminCount = employees.filter(e => e.departmentId === dept.departmentId && !!e.linkedAuthUserId).length;
      const memberCount = dept.memberIds ? dept.memberIds.length : 0;

      ledger.push({
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        headName: headEmp ? headEmp.employeeName : "Unassigned",
        headEmployeeId: dept.departmentHead,
        memberIds: dept.memberIds || [],
        memberCount,
        ownedModules: dept.ownedModules || [],
        adminCount,
        score,
        status,
        isActive: dept.status === "active"
      });
    }

    return ledger;
  },

  getDepartmentReadiness: async () => {
    const departments = await departmentService.getDepartments();
    
    return departments.map(dept => {
      const templateModules = getTemplateModulesForDepartment(dept.departmentId);
      const owned = dept.ownedModules || [];
      
      const unassigned = templateModules.filter(m => !owned.includes(m));
      
      let readiness = "Ready";
      if (owned.length === 0) readiness = "Needs Configuration";
      else if (unassigned.length > 0) readiness = "Partial";

      return {
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        assignedCount: owned.length,
        unassignedCount: unassigned.length,
        readiness
      };
    });
  },

  getEffectiveAccessDistribution: async (departmentId) => {
    const userIds = await departmentOwnershipService.getDepartmentUsers(departmentId);
    const employees = await employeeService.getEmployees();
    const deptAdmins = employees.filter(e => userIds.includes(e.employeeId) && !!e.linkedAuthUserId);
    
    const distribution = [];
    
    for (const emp of deptAdmins) {
      try {
        const authUser = await authUserService.getAuthUserByEmployeeId(emp.employeeId);
        if (authUser) {
          const profile = await effectiveAccessService.buildAccessProfile(authUser);
          distribution.push({
            employeeName: emp.employeeName,
            employeeId: emp.employeeId,
            isSuperAdmin: authUser.isSuperAdmin,
            departmentModules: profile.departmentModules,
            manualOverrides: profile.manualOverrides,
            effectiveModules: profile.effectiveModules,
          });
        }
      } catch (err) {
        // user not found or error
      }
    }
    
    return distribution;
  }
};

export default departmentGovernanceService;
