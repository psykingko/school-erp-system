import localProvider from "../data/providers/localProvider";
import { normalizeGender } from "../utils/genderUtils";

const employeeService = {
  getEmployees: () => localProvider.getEmployees(),
  createEmployee: (data) => {
    if (data.gender) data.gender = normalizeGender(data.gender);
    return localProvider.createEmployee(data);
  },
  updateEmployee: (id, data) => {
    if (data.gender !== undefined) data.gender = normalizeGender(data.gender);
    return localProvider.updateEmployee(id, data);
  },
  deleteEmployee: (id) => localProvider.deleteEmployee(id),
};

export const getDepartmentCapacityMetrics = async () => {
  const departments = await localProvider.getDepartments();
  const employees = await localProvider.getEmployees();

  return departments.map(dept => {
    const requiredStaff = dept.requiredStaff || 0;
    const currentStaff = employees.filter(emp => emp.departmentId === dept.departmentId).length;
    const vacantPositions = Math.max(0, requiredStaff - currentStaff);
    const occupancyPercent = requiredStaff > 0 ? Math.round((currentStaff / requiredStaff) * 100) : 100;

    return {
      departmentId: dept.departmentId,
      departmentName: dept.departmentName,
      requiredStaff,
      currentStaff,
      vacantPositions,
      occupancyPercent
    };
  });
};

export default employeeService;
