import { getDataProvider } from "../data";

const DEFAULT_SETTINGS = {
  notificationThreshold: 75,
  criticalThreshold: 50,
  escalationThreshold: 30,
  appreciationThreshold: 90
};

export const getGovernanceSettings = async () => {
  const provider = getDataProvider();
  if (provider.getInstitutionSettings) {
    const settings = await provider.getInstitutionSettings();
    return settings?.attendance || DEFAULT_SETTINGS;
  }
  return DEFAULT_SETTINGS;
};

export const saveGovernanceSettings = async (attendanceSettings) => {
  const provider = getDataProvider();
  if (provider.getInstitutionSettings) {
    const settings = await provider.getInstitutionSettings();
    await provider.updateInstitutionSettings({
      ...settings,
      attendance: { ...DEFAULT_SETTINGS, ...attendanceSettings }
    });
  }
};

export const getDashboardData = async () => {
  const provider = getDataProvider();
  
  // Try to use provider methods safely
  const dailyAttendance = provider.getDailyAttendance ? await provider.getDailyAttendance() : [];
  const students = provider.getStudents ? await provider.getStudents() : [];
  const classes = provider.getClasses ? await provider.getClasses() : [];
  const parents = provider.getParents ? await provider.getParents() : [];
  
  const settings = await getGovernanceSettings();
  
  // 1. Calculate base student stats
  const studentStats = {};
  
  // Separate into current month and previous month for trend analysis
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Basic aggregation
  dailyAttendance.forEach(record => {
    if (record.status === "UNMARKED") return;
    
    if (!studentStats[record.studentId]) {
      studentStats[record.studentId] = { 
        present: 0, absent: 0, total: 0, percentage: 100,
        currentMonth: { present: 0, total: 0, percentage: 100 },
        prevMonth: { present: 0, total: 0, percentage: 100 },
        lastAbsent: null
      };
    }
    
    const stats = studentStats[record.studentId];
    stats.total += 1;
    
    const recordDate = new Date(record.date);
    const rMonth = recordDate.getMonth();
    const rYear = recordDate.getFullYear();
    
    const isCurrent = rMonth === currentMonth && rYear === currentYear;
    const isPrev = rMonth === prevMonth && rYear === prevYear;

    if (record.status === "PRESENT") {
      stats.present += 1;
      if (isCurrent) stats.currentMonth.present += 1;
      if (isPrev) stats.prevMonth.present += 1;
    }
    if (record.status === "ABSENT") {
      stats.absent += 1;
      if (!stats.lastAbsent || new Date(stats.lastAbsent) < recordDate) {
        stats.lastAbsent = record.date;
      }
    }
    
    if (isCurrent) stats.currentMonth.total += 1;
    if (isPrev) stats.prevMonth.total += 1;
  });

  // Calculate percentages
  Object.values(studentStats).forEach(stats => {
    stats.percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
    stats.currentMonth.percentage = stats.currentMonth.total > 0 ? Math.round((stats.currentMonth.present / stats.currentMonth.total) * 100) : 100;
    stats.prevMonth.percentage = stats.prevMonth.total > 0 ? Math.round((stats.prevMonth.present / stats.prevMonth.total) * 100) : 100;
  });
  
  // Fill missing students
  students.forEach(s => {
    if (!studentStats[s.id]) {
      studentStats[s.id] = { 
        present: 0, absent: 0, total: 0, percentage: 100,
        currentMonth: { present: 0, total: 0, percentage: 100 },
        prevMonth: { present: 0, total: 0, percentage: 100 },
        lastAbsent: null
      };
    }
  });

  // 2. Class Level Stats
  const classStats = {};
  classes.forEach(c => {
    classStats[c.id] = { className: c.className || `${c.level}-${c.section}`, level: c.level, section: c.section, students: 0, totalPercentage: 0, currentMonth: { total: 0 }, prevMonth: { total: 0 } };
  });

  students.forEach(s => {
    if (classStats[s.classId]) {
      classStats[s.classId].students += 1;
      classStats[s.classId].totalPercentage += studentStats[s.id].percentage;
      classStats[s.classId].currentMonth.total += studentStats[s.id].currentMonth.percentage;
      classStats[s.classId].prevMonth.total += studentStats[s.id].prevMonth.percentage;
    }
  });
  
  Object.values(classStats).forEach(c => {
    c.percentage = c.students > 0 ? Math.round(c.totalPercentage / c.students) : 100;
    c.currentMonth.percentage = c.students > 0 ? Math.round(c.currentMonth.total / c.students) : 100;
    c.prevMonth.percentage = c.students > 0 ? Math.round(c.prevMonth.total / c.students) : 100;
    c.trend = c.currentMonth.percentage - c.prevMonth.percentage;
  });

  // 3. Build Governance Lists
  let totalPresent = 0;
  let totalRecords = 0;
  let below75 = 0;
  let below50 = 0;
  let perfect = 0;
  let chronicAbsentees = 0; // arbitrarily defined as < 60% with > 5 absences

  const riskCategories = {
    critical: [],
    highRisk: [],
    healthy: [],
    excellent: []
  };

  const notificationQueue = [];
  const recognitionList = { students: [], classes: [] };
  const watchlist = [];
  const allRecords = [];

  students.forEach(s => {
    const stats = studentStats[s.id];
    const c = classStats[s.classId];
    
    totalPresent += stats.present;
    totalRecords += stats.total;
    
    const enrichedStudent = {
      ...s,
      className: c ? c.className : "Unknown",
      attendancePercentage: stats.percentage,
      lastAbsent: stats.lastAbsent
    };

    if (stats.percentage < 75) below75++;
    if (stats.percentage < 50) below50++;
    if (stats.percentage === 100) perfect++;
    if (stats.percentage < 60 && stats.absent > 5) chronicAbsentees++;

    // Watchlist mapping
    if (stats.percentage <= settings.notificationThreshold) {
      // Find parent
      const parent = parents.find(p => p.childIds?.includes(s.id));
      
      watchlist.push({
        ...enrichedStudent,
        riskLevel: stats.percentage <= settings.escalationThreshold ? "ESCALATION" :
                   stats.percentage <= settings.criticalThreshold ? "CRITICAL" : "HIGH_RISK",
        parentName: parent?.name || "Unknown Parent",
        parentPhone: parent?.phoneNumber || "N/A",
      });

      // Notification Queue (students requiring intervention)
      notificationQueue.push({
        ...enrichedStudent,
        reason: stats.percentage <= settings.criticalThreshold ? "Urgent Warning" : "Parent Reminder",
        thresholdCrossed: stats.percentage <= settings.criticalThreshold ? settings.criticalThreshold : settings.notificationThreshold,
        parentName: parent?.name || "Unknown Parent",
        parentPhone: parent?.phoneNumber || "N/A"
      });
    }

    // Risk Categories
    if (stats.percentage < settings.criticalThreshold) riskCategories.critical.push(enrichedStudent);
    else if (stats.percentage < settings.notificationThreshold) riskCategories.highRisk.push(enrichedStudent);
    else if (stats.percentage < settings.appreciationThreshold) riskCategories.healthy.push(enrichedStudent);
    else riskCategories.excellent.push(enrichedStudent);

    // Recognition
    if (stats.percentage >= settings.appreciationThreshold) {
      recognitionList.students.push(enrichedStudent);
    }

    // Determine parent explicitly for allRecords
    const parent = parents.find(p => p.childIds?.includes(s.id));
    allRecords.push({
      ...enrichedStudent,
      parentName: parent?.name || "Unknown Parent",
      parentPhone: parent?.phoneNumber || "N/A"
    });
  });

  // Class Recognition
  Object.values(classStats).forEach(c => {
    if (c.percentage >= settings.appreciationThreshold) {
      recognitionList.classes.push(c);
    }
  });

  // Sort lists
  watchlist.sort((a, b) => a.attendancePercentage - b.attendancePercentage);
  notificationQueue.sort((a, b) => a.attendancePercentage - b.attendancePercentage);
  recognitionList.students.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
  recognitionList.classes.sort((a, b) => b.percentage - a.percentage);
  const trendAlerts = Object.values(classStats).sort((a, b) => a.trend - b.trend); // Show negative trends first

  const overallPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 100;

  return {
    kpis: {
      overallPercentage,
      below75,
      below50,
      chronicAbsentees,
      perfect,
      pendingNotifications: notificationQueue.length
    },
    riskCategories,
    notificationQueue,
    recognitionList,
    watchlist,
    allRecords,
    trendAlerts,
    settings
  };
};

export default {
  getGovernanceSettings,
  saveGovernanceSettings,
  getDashboardData
};
