import { getDataProvider } from "../data";
import employeeService from "./employeeService";
import { getAllTeachers } from "./teacherService";
import staffAttendanceService from "./staffAttendanceService";

const DEFAULT_SETTINGS = {
  notificationThreshold: 85, // Staff often have higher expected attendance
  criticalThreshold: 75,
  escalationThreshold: 60,
  appreciationThreshold: 95
};

export const getGovernanceSettings = async () => {
  const provider = getDataProvider();
  if (provider.getInstitutionSettings) {
    const settings = await provider.getInstitutionSettings();
    return settings?.staffAttendance || DEFAULT_SETTINGS;
  }
  return DEFAULT_SETTINGS;
};

export const saveGovernanceSettings = async (attendanceSettings) => {
  const provider = getDataProvider();
  if (provider.getInstitutionSettings) {
    const settings = await provider.getInstitutionSettings();
    await provider.updateInstitutionSettings({
      ...settings,
      staffAttendance: { ...DEFAULT_SETTINGS, ...attendanceSettings }
    });
  }
};

export const getDashboardData = async () => {
  // Fetch staff attendance
  const staffAttendance = await staffAttendanceService.getAllStaffAttendance();
  const [employees, teachers] = await Promise.all([
    employeeService.getEmployees(),
    getAllTeachers()
  ]);

  const formattedEmployees = employees.map(e => ({
    id: e.employeeId || e.id,
    name: e.name || e.employeeName,
    type: (e.accessLevel === "Admin" || e.accessLevel === "Super Admin") ? "Admin" : "Staff",
    department: e.department || e.departmentId || "General",
    email: e.email || "",
    phone: e.phone || e.contactNumber || "N/A"
  }));

  const formattedTeachers = teachers.map(t => ({
    id: t.teacherId || t.id,
    name: t.name || t.employeeName || t.teacherName,
    type: "Teacher",
    department: t.department || "Academics",
    email: t.email || "",
    phone: t.phone || t.contactNumber || "N/A"
  }));

  const combinedStaff = [...formattedEmployees, ...formattedTeachers];
  const uniqueStaff = Array.from(new Map(combinedStaff.map(item => [item.id, item])).values());
  const staffMap = {};
  uniqueStaff.forEach(s => { staffMap[s.id] = s; });

  const settings = await getGovernanceSettings();
  
  const staffStats = {};
  uniqueStaff.forEach(s => {
    staffStats[s.id] = { 
      present: 0, absent: 0, late: 0, leave: 0, total: 0, percentage: 100,
      lastAbsent: null
    };
  });

  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];
  let presentToday = 0;
  let absentToday = 0;
  let lateToday = 0;
  let leaveToday = 0;

  staffAttendance.forEach(record => {
    if (!staffStats[record.employeeId]) return;
    const stats = staffStats[record.employeeId];
    
    // Total calculation ignores ON_LEAVE
    if (record.attendanceStatus !== "ON_LEAVE") {
      stats.total += 1;
    }

    if (record.attendanceStatus === "PRESENT" || record.attendanceStatus === "HALF_DAY") {
      stats.present += 1;
    } else if (record.attendanceStatus === "LATE") {
      stats.late += 1;
      stats.present += 1; // Late is usually present for percentage but tracked separately
    } else if (record.attendanceStatus === "ABSENT") {
      stats.absent += 1;
      if (!stats.lastAbsent || new Date(stats.lastAbsent) < new Date(record.attendanceDate)) {
        stats.lastAbsent = record.attendanceDate;
      }
    } else if (record.attendanceStatus === "ON_LEAVE") {
      stats.leave += 1;
    }

    if (record.attendanceDate === todayDate) {
      if (record.attendanceStatus === "PRESENT") presentToday++;
      if (record.attendanceStatus === "ABSENT") absentToday++;
      if (record.attendanceStatus === "LATE") lateToday++;
      if (record.attendanceStatus === "ON_LEAVE") leaveToday++;
      if (record.attendanceStatus === "HALF_DAY") presentToday++;
    }
  });

  // Calculate percentages
  Object.values(staffStats).forEach(stats => {
    stats.percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
  });

  // Watchlist & KPI
  let totalPresent = 0;
  let totalRecords = 0;
  let belowThreshold = 0;
  let chronicAbsentees = 0;

  const watchlist = [];
  const allRecords = [];
  const riskCategories = {
    critical: [],
    highRisk: [],
    healthy: [],
    excellent: []
  };

  const notificationQueue = [];
  const recognitionList = { students: [], classes: [], staff: [] }; // Keep same structure as student for UI compatibility
  const classStats = []; // dummy for UI compatibility

  uniqueStaff.forEach(s => {
    const stats = staffStats[s.id];
    
    totalPresent += stats.present;
    totalRecords += stats.total;
    
    const enrichedStaff = {
      ...s,
      className: s.department, // Map department to className for UI compatibility
      attendancePercentage: stats.percentage,
      lastAbsent: stats.lastAbsent,
      riskLevel: stats.percentage <= settings.criticalThreshold ? "CRITICAL"
                : stats.percentage <= settings.escalationThreshold ? "ESCALATION"
                : stats.percentage <= settings.notificationThreshold ? "HIGH_RISK"
                : stats.percentage >= settings.appreciationThreshold ? "EXCELLENT"
                : "HEALTHY"
    };

    allRecords.push(enrichedStaff);

    if (stats.percentage < 75) belowThreshold++;
    if (stats.percentage < 60 && stats.absent > 5) chronicAbsentees++;

    if (stats.percentage <= settings.notificationThreshold) {
      watchlist.push({
        ...enrichedStaff,
        parentName: "N/A (Staff)", // for UI compatibility
        parentPhone: s.phone,
      });

      notificationQueue.push({
        ...enrichedStaff,
        reason: stats.percentage <= settings.criticalThreshold ? "Urgent Warning" : "Attendance Reminder",
        thresholdCrossed: stats.percentage <= settings.criticalThreshold ? settings.criticalThreshold : settings.notificationThreshold,
        parentName: "N/A (Staff)",
        parentPhone: s.phone
      });
    }

    if (stats.percentage < settings.criticalThreshold) riskCategories.critical.push(enrichedStaff);
    else if (stats.percentage < settings.notificationThreshold) riskCategories.highRisk.push(enrichedStaff);
    else if (stats.percentage < settings.appreciationThreshold) riskCategories.healthy.push(enrichedStaff);
    else {
      riskCategories.excellent.push(enrichedStaff);
      recognitionList.staff.push(enrichedStaff);
    }

    allRecords.push({
      ...enrichedStaff,
      parentName: "N/A (Staff)",
      parentPhone: s.phone
    });
  });

  const overallPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 100;

  return {
    kpis: {
      overallPercentage,
      trend: 0,
      below75: belowThreshold,
      below50: riskCategories.critical.length,
      perfect: recognitionList.staff.length,
      chronicAbsentees,
      // Custom staff KPIs mapped into the structure
      presentToday,
      absentToday,
      lateToday,
      leaveToday
    },
    riskCategories,
    notificationQueue,
    recognitionList,
    watchlist,
    allRecords,
    classStats,
    settings
  };
};

export default {
  getGovernanceSettings,
  saveGovernanceSettings,
  getDashboardData
};
