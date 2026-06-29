import { getDataProvider } from "../data/providers/providerFactory";

export const getMySupportRequests = async (requesterId) => {
  const provider = getDataProvider();
  const requests = await provider.getSupportRequests();
  return requests.filter(r => r.requesterId === requesterId);
};

export const getSupportRequestById = async (id) => {
  const provider = getDataProvider();
  const requests = await provider.getSupportRequests();
  return requests.find(r => r.id === id) || null;
};

const resolveRequesterName = async (requesterType, requesterId) => {
  try {
    const provider = getDataProvider();
    switch (requesterType) {
      case "Student": {
        const student = await provider.getStudentById(requesterId);
        return student ? student.name : "Unknown Student";
      }
      case "Teacher": {
        const teacher = await provider.getTeacherById(requesterId);
        return teacher ? (teacher.name || teacher.teacherName) : "Unknown Teacher";
      }
      case "Parent": {
        const parent = await provider.getParentById(requesterId);
        return parent ? parent.name : "Unknown Parent";
      }
      case "Employee": {
        const employees = await provider.getEmployees();
        const employee = employees.find(e => e.employeeId === requesterId || e.id === requesterId);
        return employee ? (employee.employeeName || employee.name) : "Unknown Employee";
      }
      default:
        return "Unknown Requester";
    }
  } catch (error) {
    console.error("Error resolving requester name", error);
    return "Unknown Requester";
  }
};

export const createSupportRequest = async (data) => {
  const { requesterType, requesterId } = data;
  const requesterName = await resolveRequesterName(requesterType, requesterId);

  const payload = {
    ...data,
    requesterName
  };

  const provider = getDataProvider();
  return await provider.createSupportRequest(payload);
};

// === ADMIN METHODS ===
export const getAllSupportRequests = async () => {
  const provider = getDataProvider();
  return await provider.getSupportRequests();
};

export const updateSupportRequestStatus = async (id, status) => {
  const allowedStatuses = ["Open", "In Review", "Resolved", "Closed"];
  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status update");
  }
  const provider = getDataProvider();
  return await provider.updateSupportRequest(id, { status });
};

export const addSupportRemark = async (id, message, createdBy) => {
  const remark = {
    message,
    createdBy
  };
  const provider = getDataProvider();
  return await provider.addSupportRemark(id, remark);
};

export const getSupportHandler = async () => {
  const provider = getDataProvider();
  const settings = await provider.getSupportSettings();
  if (!settings || !settings.handlerEmployeeId) return null;
  
  const employees = await provider.getEmployees();
  const employee = employees.find(e => e.employeeId === settings.handlerEmployeeId);
  return employee ? { name: employee.employeeName || employee.name, designation: employee.designation } : null;
};

// === ANALYTICS METHODS ===
export const getSupportStats = (requests = []) => {
  return {
    total: requests.length,
    open: requests.filter(r => r.status === "Open").length,
    inReview: requests.filter(r => r.status === "In Review").length,
    resolved: requests.filter(r => r.status === "Resolved").length,
    closed: requests.filter(r => r.status === "Closed").length
  };
};

export const getSupportCategoryStats = (requests = []) => {
  return {
    complaints: requests.filter(r => r.category === "Complaint").length,
    feedback: requests.filter(r => r.category === "Feedback").length,
    suggestions: requests.filter(r => r.category === "Suggestion").length,
    technicalSupport: requests.filter(r => r.category === "Technical Support").length
  };
};
