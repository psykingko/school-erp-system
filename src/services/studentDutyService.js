import { getDataProvider } from "../data/providers/providerFactory";

const validateDutyRequest = (data) => {
  if (!data.title || data.title.trim() === "") {
    throw new Error("Title is required.");
  }
  if (!data.dutyDate) {
    throw new Error("Date is required.");
  }
  if (!data.targetStudents || data.targetStudents.length === 0) {
    throw new Error("At least 1 student is required.");
  }
  if (data.startTime && data.endTime) {
    if (data.startTime >= data.endTime) {
      throw new Error("Start time must be before end time.");
    }
  }
};

export const studentDutyService = {
  getTeacherDutyRequests: async (teacherId) => {
    const provider = getDataProvider();
    const allRequests = await provider.getStudentDutyRequests();
    return allRequests.filter(
      (r) => r.requestedByTeacherId === teacherId
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getActiveDutyBoard: async () => {
    const provider = getDataProvider();
    const allRequests = await provider.getStudentDutyRequests();
    return allRequests
      .filter((r) => r.status === "Active")
      .sort((a, b) => {
        // Sort by date (ascending)
        if (a.dutyDate !== b.dutyDate) {
          return new Date(a.dutyDate) - new Date(b.dutyDate);
        }
        // Then by start time (ascending)
        if (a.startTime && b.startTime && a.startTime !== b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return 0;
      });
  },

  getStudentDutyRecords: async (studentId) => {
    const provider = getDataProvider();
    const allRequests = await provider.getStudentDutyRequests();
    return allRequests
      .filter((r) => r.targetStudents?.some((s) => s.studentId === studentId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getParentDutyRecords: async (studentIds) => {
    const provider = getDataProvider();
    const allRequests = await provider.getStudentDutyRequests();
    return allRequests
      .filter((r) => r.targetStudents?.some((s) => studentIds.includes(s.studentId)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getDutyRequestById: async (id) => {
    const provider = getDataProvider();
    return await provider.getStudentDutyRequestById(id);
  },

  getAllDutyRequests: async () => {
    const provider = getDataProvider();
    return await provider.getStudentDutyRequests();
  },

  getDutyDashboardStats: async () => {
    const provider = getDataProvider();
    const allRequests = await provider.getStudentDutyRequests();
    
    const active = allRequests.filter(r => r.status === "Active").length;
    const completed = allRequests.filter(r => r.status === "Completed").length;
    const cancelled = allRequests.filter(r => r.status === "Cancelled").length;
    
    const studentsAssigned = allRequests.reduce((sum, req) => sum + (req.targetStudents?.length || 0), 0);
    const teachersRequesting = new Set(allRequests.map(r => r.requestedByTeacherId)).size;
    
    return {
      total: allRequests.length,
      active,
      completed,
      cancelled,
      studentsAssigned,
      teachersRequesting
    };
  },

  createDutyRequest: async (data) => {
    validateDutyRequest(data);
    const provider = getDataProvider();
    return await provider.createStudentDutyRequest(data);
  },

  updateDutyRequest: async (id, data) => {
    validateDutyRequest(data);
    const provider = getDataProvider();
    return await provider.updateStudentDutyRequest(id, data);
  },

  cancelDutyRequest: async (id) => {
    const provider = getDataProvider();
    return await provider.cancelStudentDutyRequest(id);
  },

  completeDutyRequest: async (id) => {
    const provider = getDataProvider();
    return await provider.completeStudentDutyRequest(id);
  },
};

export default studentDutyService;
