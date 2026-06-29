import departmentService from "./departmentService";
import adminModuleCatalog from "./adminModuleCatalog";

const ALL_MODULES = adminModuleCatalog.getAllModules().map(m => m.id);

const departmentOwnershipService = {
  /**
   * Returns the employeeId of the department head
   */
  getDepartmentOwner: async (departmentId) => {
    const departments = await departmentService.getDepartments();
    const dept = departments.find(d => d.departmentId === departmentId);
    return dept ? dept.departmentHead : null;
  },

  /**
   * Alias for getDepartmentOwner
   */
  getDepartmentHead: async (departmentId) => {
    return departmentOwnershipService.getDepartmentOwner(departmentId);
  },

  /**
   * Returns the array of member employee IDs
   */
  getDepartmentMembers: async (departmentId) => {
    const departments = await departmentService.getDepartments();
    const dept = departments.find(d => d.departmentId === departmentId);
    return dept?.memberIds || [];
  },

  /**
   * Checks if an employee is the head of the specified department
   */
  isDepartmentHead: async (employeeId, departmentId) => {
    const head = await departmentOwnershipService.getDepartmentHead(departmentId);
    return head === employeeId;
  },

  /**
   * Checks if an employee is a member of the specified department
   */
  isDepartmentMember: async (employeeId, departmentId) => {
    const members = await departmentOwnershipService.getDepartmentMembers(departmentId);
    return members.includes(employeeId);
  },

  /**
   * Returns the Head + Members combined array
   */
  getDepartmentUsers: async (departmentId) => {
    const head = await departmentOwnershipService.getDepartmentHead(departmentId);
    const members = await departmentOwnershipService.getDepartmentMembers(departmentId);
    const users = new Set(members);
    if (head) users.add(head);
    return Array.from(users);
  },

  /**
   * Automatically strips an employee from all other departments.
   * Ensures an admin can only belong to ONE department system-wide.
   */
  removeUserFromOtherDepartments: async (employeeId, targetDepartmentIdToKeep = null) => {
    const departments = await departmentService.getDepartments();
    for (const dept of departments) {
      if (dept.departmentId === targetDepartmentIdToKeep) continue;

      let changed = false;
      const updates = {};

      if (dept.departmentHead === employeeId) {
        updates.departmentHead = null;
        changed = true;
      }

      if (dept.memberIds && dept.memberIds.includes(employeeId)) {
        updates.memberIds = dept.memberIds.filter(id => id !== employeeId);
        changed = true;
      }

      if (changed) {
        await departmentService.updateDepartment(dept.departmentId, updates);
      }
    }
  },

  /**
   * Returns the array of module IDs owned by the department
   */
  getOwnedModules: async (departmentId) => {
    const departments = await departmentService.getDepartments();
    const dept = departments.find(d => d.departmentId === departmentId);
    return dept?.ownedModules || [];
  },

  /**
   * Scans departments to find which one owns the specific module
   */
  getDepartmentByModule: async (moduleId) => {
    const departments = await departmentService.getDepartments();
    return departments.find(d => d.ownedModules && d.ownedModules.includes(moduleId)) || null;
  },

  /**
   * Derives the active owner by combining getDepartmentByModule and getDepartmentOwner
   */
  getModuleOwner: async (moduleId) => {
    const dept = await departmentOwnershipService.getDepartmentByModule(moduleId);
    if (!dept) return null;
    return dept.departmentHead || null;
  },

  /**
   * Calculates overall ownership health across the system
   */
  getOwnershipCoverage: async () => {
    const departments = await departmentService.getDepartments();
    
    let coveredModulesCount = 0;
    let departmentsWithoutHead = 0;
    const violations = [];
    
    departments.forEach(dept => {
      const hasHead = !!dept.departmentHead;
      const modules = dept.ownedModules || [];
      
      if (!hasHead) {
        departmentsWithoutHead++;
        if (modules.length > 0) {
          violations.push({
            type: "Missing Head",
            departmentName: dept.departmentName,
            message: `Department owns ${modules.length} module(s) but has no Department Head assigned.`
          });
        }
      }

      if (modules.length === 0) {
        violations.push({
          type: "Department Has No Modules",
          departmentName: dept.departmentName,
          message: "This department has no software modules assigned to it."
        });
      }

      modules.forEach(modId => {
        if (!ALL_MODULES.includes(modId)) {
          violations.push({
            type: "Invalid Module",
            departmentName: dept.departmentName,
            message: `Department claims ownership of unknown module ID: ${modId}`
          });
        } else {
          if (hasHead) coveredModulesCount++;
        }
      });
    });

    // Check for missing departments (modules that no department claims)
    const claimedModules = new Set();
    departments.forEach(d => (d.ownedModules || []).forEach(m => claimedModules.add(m)));
    
    ALL_MODULES.forEach(modId => {
      if (!claimedModules.has(modId)) {
        const catalogEntry = adminModuleCatalog.getModuleById(modId);
        violations.push({
          type: "Missing Department",
          departmentName: "Unassigned",
          message: `Module "${catalogEntry?.label || modId}" is not owned by any department.`
        });
      }
    });

    return {
      totalModules: ALL_MODULES.length,
      coveredModules: coveredModulesCount,
      uncoveredModules: ALL_MODULES.length - coveredModulesCount,
      departmentsWithoutHead,
      violations
    };
  }
};

export default departmentOwnershipService;
