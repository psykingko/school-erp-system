import { getDataProvider } from "../data/providers/providerFactory";

const departmentService = {
  getDepartments: () => getDataProvider().getDepartments(),
  createDepartment: (data) => getDataProvider().createDepartment(data),
  updateDepartment: (id, data) => getDataProvider().updateDepartment(id, data),
  deleteDepartment: (id) => getDataProvider().deleteDepartment(id),
};

export default departmentService;
