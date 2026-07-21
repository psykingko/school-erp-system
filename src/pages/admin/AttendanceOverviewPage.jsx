import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Settings, Target, CheckCircle, Save, Users, GraduationCap
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import KPIWidget from "../../components/admin/analytics/KPIWidget";
import attendanceGovernanceService from "../../services/attendanceGovernanceService";
import staffAttendanceGovernanceService from "../../services/staffAttendanceGovernanceService";
import PermissionGate from "../../components/admin/PermissionGate";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";

const AttendanceOverviewPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeMainTab, setActiveMainTab] = useState("student"); // student, staff
  const [activeTab, setActiveTab] = useState("interventions"); // interventions, settings
  const [successBanner, setSuccessBanner] = useState("");

  // Table selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterType, setFilterType] = useState("notification"); // "notification", "critical", "escalation", "appreciation"
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    notificationThreshold: 75,
    criticalThreshold: 50,
    escalationThreshold: 30,
    appreciationThreshold: 90
  });

  const [staffSettingsForm, setStaffSettingsForm] = useState({
    notificationThreshold: 85,
    criticalThreshold: 75,
    escalationThreshold: 60,
    appreciationThreshold: 95
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dashboardData = await attendanceGovernanceService.getDashboardData();
      setData(dashboardData);
      setSettingsForm(dashboardData.settings);

      const sData = await staffAttendanceGovernanceService.getDashboardData();
      setStaffData(sData);
      setStaffSettingsForm(sData.settings);
    } catch (e) {
      console.error("Failed to fetch attendance governance data", e);
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(""), 4500);
  };

  const handleSaveSettings = async () => {
    try {
      if (activeMainTab === "student") {
        await attendanceGovernanceService.saveGovernanceSettings(settingsForm);
      } else {
        await staffAttendanceGovernanceService.saveGovernanceSettings(staffSettingsForm);
      }
      showBanner(`${activeMainTab === "student" ? "Student" : "Staff"} Governance Rules updated successfully.`);
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendNotification = () => {
    if (selectedIds.length === 0) {
      alert(`Please select at least one ${activeMainTab === "student" ? "student" : "staff member"} to send a notification.`);
      return;
    }
    
    // Determine campaign details based on filter type
    let campaignSubject = "";
    let priority = "normal";
    let messageBody = "";

    const namePlaceholder = activeMainTab === "student" ? "{StudentName}" : "{EmployeeName}";
    const parentPlaceholder = activeMainTab === "student" ? "Dear {ParentName}," : "Dear {EmployeeName},";

    if (filterType === "appreciation") {
      campaignSubject = "Appreciation for Excellent Attendance";
      priority = "normal";
      messageBody = `${parentPlaceholder}\n\nWe are delighted to inform you that ${namePlaceholder} has maintained excellent attendance, exceeding our appreciation threshold.\n\nThank you for your continuous support.\n\nRegards,\nSchool Administration`;
    } else if (filterType === "escalation") {
      campaignSubject = "SEVERE WARNING: Critical Attendance Shortage";
      priority = "emergency";
      messageBody = `${parentPlaceholder}\n\nThis is an URGENT notice. ${namePlaceholder}'s attendance has dropped below the severe escalation threshold ({AttendancePercent}%). Immediate action is required.\n\nRegards,\nSchool Administration`;
    } else if (filterType === "critical") {
      campaignSubject = "Urgent Attendance Warning";
      priority = "important";
      messageBody = `${parentPlaceholder}\n\nWe are writing to inform you that ${namePlaceholder}'s attendance has dropped to a critical level ({AttendancePercent}%). Please ensure regular attendance.\n\nRegards,\nSchool Administration`;
    } else {
      campaignSubject = "Attendance Reminder";
      priority = "normal";
      messageBody = `${parentPlaceholder}\n\nThis is a gentle reminder that ${namePlaceholder}'s attendance is currently at {AttendancePercent}%, which is below our expected standard. We request your attention to this matter.\n\nRegards,\nSchool Administration`;
    }

    // Navigate to communication center passing selected IDs
    navigate("/admin/communication-center", {
      state: {
        audienceObj: {
          groups: [],
          classes: [],
          sections: [],
          users: activeMainTab === "student" ? selectedIds : [],
          employees: activeMainTab === "staff" ? selectedIds : [],
          customRecipients: []
        },
        prefillSubject: campaignSubject,
        prefillMessage: messageBody,
        prefillPriority: priority
      }
    });
  };

  const currentData = activeMainTab === "student" ? data : staffData;
  const currentSettings = activeMainTab === "student" ? settingsForm : staffSettingsForm;
  const setCurrentSettings = activeMainTab === "student" ? setSettingsForm : setStaffSettingsForm;

  const handleSelectAll = (e, list) => {
    if (e.target.checked) setSelectedIds(list.map(i => i.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const filteredWatchlist = useMemo(() => {
    if (!currentData) return [];
    
    let baseList = [];
    if (filterType === "all") baseList = currentData.allRecords || currentData.watchlist || [];
    else if (filterType === "notification") baseList = currentData.watchlist;
    if (selectedClass) {
      baseList = baseList.filter(item => {
        const cls = item.classLevel || (item.className && item.className.split('-')[0]) || "";
        return cls === selectedClass;
      });
    }

    // Apply section filter
    if (selectedClass && selectedSection) {
      baseList = baseList.filter(item => {
        const sec = item.section || (item.className && item.className.split('-')[1]) || "";
        return sec === selectedSection;
      });
    }

    return baseList;
  }, [currentData, filterType, selectedClass, selectedSection]);

  const availableClasses = useMemo(() => {
    if (!currentData) return [];
    const sourceList = filterType === "appreciation" ? (currentData.recognitionList.students || currentData.recognitionList.staff || []) : currentData.watchlist;
    const classes = new Set();
    sourceList.forEach(item => {
      const cls = item.classLevel || (item.className && item.className.split('-')[0]);
      if (cls) classes.add(cls);
    });
    return Array.from(classes).sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b));
  }, [currentData, filterType]);

  const availableSections = useMemo(() => {
    if (!currentData || !selectedClass || activeMainTab === "staff") return [];
    const sourceList = filterType === "appreciation" ? currentData.recognitionList.students : currentData.watchlist;
    const sections = new Set();
    sourceList.forEach(item => {
      const cls = item.classLevel || (item.className && item.className.split('-')[0]);
      if (cls === selectedClass) {
        const sec = item.section || (item.className && item.className.split('-')[1]);
        if (sec) sections.add(sec);
      }
    });
    return Array.from(sections).sort();
  }, [currentData, filterType, selectedClass, activeMainTab]);

  if (loading || !data || !staffData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077b6]"></div>
      </div>
    );
  }

  const tabs = [
    { id: "interventions", label: "Interventions & Watchlist", icon: Target },
    { id: "settings", label: "Governance Rules", icon: Settings },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Attendance Overview"
        description="Institutional attendance health, risk monitoring, and automated intervention workflows."
        breadcrumbs={["Admin Portal", "Operations", "Attendance Overview"]}
      />

      <PageAuthorityBanner moduleId="admin_attendance" moduleName="Attendance Governance" />

      {/* Main Top-Level Tabs for Student/Staff */}
      <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 w-fit">
        <button
          onClick={() => { setActiveMainTab("student"); setSelectedIds([]); setSelectedClass(""); setSelectedSection(""); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
            activeMainTab === "student" ? "bg-[#0077b6] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <GraduationCap size={18} />
          Student Attendance
        </button>
        <button
          onClick={() => { setActiveMainTab("staff"); setSelectedIds([]); setSelectedClass(""); setSelectedSection(""); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
            activeMainTab === "staff" ? "bg-[#0077b6] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Users size={18} />
          Staff Attendance
        </button>
      </div>

      {successBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-xs font-black shadow-sm flex items-center gap-2"
        >
          <CheckCircle size={16} className="text-emerald-500" />
          {successBanner}
        </motion.div>
      )}

      {/* Tabs Navigation (Sub tabs) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#03045e] text-white shadow-md shadow-[#03045e]/20"
                  : "bg-white text-gray-500 hover:bg-gray-50 hover:text-[#03045e] border border-gray-100"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "interventions" && (
          <motion.div key="interventions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {activeMainTab === "staff" && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPIWidget title="Present Today" value={currentData.kpis.presentToday} icon={CheckCircle} color="#10b981" bg="#d1fae5" />
                <KPIWidget title="Late Today" value={currentData.kpis.lateToday} icon={Users} color="#f59e0b" bg="#fef3c7" />
                <KPIWidget title="Absent Today" value={currentData.kpis.absentToday} icon={Target} color="#ef4444" bg="#fee2e2" />
                <KPIWidget title="On Leave" value={currentData.kpis.leaveToday} icon={Save} color="#8b5cf6" bg="#ede9fe" />
                <KPIWidget title="Attendance %" value={`${currentData.kpis.overallPercentage}%`} icon={CheckCircle} color="#3b82f6" bg="#dbeafe" />
                <KPIWidget title="Depts w/ Issues" value={availableClasses.length} icon={Target} color="#f97316" bg="#ffedd5" />
              </div>
            )}

            <AdminSectionCard>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <Target className="text-[#03045e]" size={20} />
                  <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">Interventions & Watchlist</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setSelectedIds([]); // Clear selection when filter changes
                    }}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] outline-none cursor-pointer"
                  >
                    {activeMainTab === "student" ? (
                      <>
                        <option value="all">All Records</option>
                        <option value="notification">&lt; {currentData.settings.notificationThreshold}% (All At Risk)</option>
                        <option value="critical">&lt; {currentData.settings.criticalThreshold}% (Critical Risk)</option>
                        <option value="escalation">&lt; {currentData.settings.escalationThreshold}% (Severe Escalation)</option>
                        <option value="appreciation">&gt;= {currentData.settings.appreciationThreshold}% (Appreciation Candidate)</option>
                      </>
                    ) : (
                      <>
                        <option value="all">All Records</option>
                        <option value="notification">&lt; {currentData.settings.notificationThreshold}% (All At Risk)</option>
                        <option value="escalation">&lt; {currentData.settings.escalationThreshold}% (Escalation)</option>
                        <option value="critical">&lt; {currentData.settings.criticalThreshold}% (Critical Action)</option>
                        <option value="appreciation">&gt;= {currentData.settings.appreciationThreshold}% (Appreciation Candidate)</option>
                      </>
                    )}
                  </select>

                  <select 
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedSection(""); // Reset section
                      setSelectedIds([]); // Clear selection
                    }}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] outline-none cursor-pointer min-w-[100px]"
                  >
                    <option value="">{activeMainTab === "student" ? "All Classes" : "All Departments"}</option>
                    {availableClasses.map(c => <option key={c} value={c}>{activeMainTab === "student" ? "Class " : ""}{c}</option>)}
                  </select>

                  {activeMainTab === "student" && (
                    <select 
                      value={selectedSection}
                      onChange={(e) => {
                        setSelectedSection(e.target.value);
                        setSelectedIds([]); // Clear selection
                      }}
                      disabled={!selectedClass}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] outline-none cursor-pointer min-w-[110px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">All Sections</option>
                      {availableSections.map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                  )}

                  <PermissionGate moduleId="admin_attendance" permission="publish" mode="disabled">
                    <button
                      onClick={handleSendNotification}
                      disabled={selectedIds.length === 0}
                      className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] disabled:bg-gray-300 text-white px-4 py-2 rounded-xl shadow-sm text-xs font-black transition-colors"
                    >
                      <Send size={14} />
                      <span>Send Notification ({selectedIds.length})</span>
                    </button>
                  </PermissionGate>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 font-medium mb-6">
                Select {activeMainTab === "student" ? "students" : "staff"} below to initiate communications. This will seamlessly transition you to the Communication Center with the audience pre-loaded.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#caf0f8]/20 border-y border-[#caf0f8]/40">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.length > 0 && selectedIds.length === filteredWatchlist.length}
                          onChange={(e) => handleSelectAll(e, filteredWatchlist)}
                          className="w-4 h-4 rounded text-[#0077b6] cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeMainTab === "student" ? "Student" : "Employee"}</th>
                      {activeMainTab === "staff" && (
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role (Admin/Teacher)</th>
                      )}
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeMainTab === "student" ? "Class" : "Department"}</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance %</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Risk Level</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredWatchlist.length === 0 ? (
                      <tr>
                        <td colSpan={activeMainTab === "staff" ? 7 : 6} className="py-8 text-center text-gray-400 text-xs font-medium">No records match this threshold filter.</td>
                      </tr>
                    ) : (
                      filteredWatchlist.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors text-xs text-gray-700 font-bold">
                          <td className="px-4 py-3">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.includes(item.id)}
                              onChange={(e) => handleSelectOne(e, item.id)}
                              className="w-4 h-4 rounded text-[#0077b6] cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 text-[#03045e] font-black">{item.name}</td>
                          {activeMainTab === "staff" && (
                            <td className="px-4 py-3 font-semibold">{item.type}</td>
                          )}
                          <td className="px-4 py-3">{item.className}</td>
                          <td className="px-4 py-3 text-rose-600 font-black">{item.attendancePercentage}%</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                              item.riskLevel === "EXCELLENT" ? "bg-emerald-100 text-emerald-700" :
                              item.riskLevel === "ESCALATION" ? "bg-red-100 text-red-700" :
                              item.riskLevel === "CRITICAL" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {item.riskLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span>{activeMainTab === "student" ? item.parentName : item.email}</span>
                              <span className="text-[10px] text-gray-400 font-medium">{item.parentPhone}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </AdminSectionCard>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminSectionCard>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="text-[#03045e]" size={20} />
                  <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">{activeMainTab === "student" ? "Student" : "Staff"} Intervention Rules</h3>
                </div>
                <PermissionGate moduleId="admin_attendance" permission="edit" mode="disabled">
                  <button
                    onClick={handleSaveSettings}
                    className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-4 py-2 rounded-xl shadow-sm text-xs font-black transition-colors"
                  >
                    <Save size={14} />
                    <span>Save Rules</span>
                  </button>
                </PermissionGate>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                <div className="space-y-6">
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                    <label className="block text-xs font-black text-amber-900 uppercase tracking-wider mb-2">Notification Threshold (%)</label>
                    <p className="text-[10px] text-amber-700 font-medium mb-4">{activeMainTab === "student" ? "Students" : "Staff"} falling below this percentage will be added to the High Risk watchlist.</p>
                    <input 
                      type="number" 
                      value={currentSettings.notificationThreshold}
                      onChange={(e) => setCurrentSettings(prev => ({...prev, notificationThreshold: parseInt(e.target.value)}))}
                      className="w-full px-4 py-2 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-0 outline-none text-sm font-black text-amber-900 bg-white"
                    />
                  </div>

                  <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                    <label className="block text-xs font-black text-rose-900 uppercase tracking-wider mb-2">Critical Threshold (%)</label>
                    <p className="text-[10px] text-rose-700 font-medium mb-4">{activeMainTab === "student" ? "Students" : "Staff"} falling below this percentage require Urgent Warnings and immediate institutional intervention.</p>
                    <input 
                      type="number" 
                      value={currentSettings.criticalThreshold}
                      onChange={(e) => setCurrentSettings(prev => ({...prev, criticalThreshold: parseInt(e.target.value)}))}
                      className="w-full px-4 py-2 rounded-xl border-2 border-rose-200 focus:border-rose-400 focus:ring-0 outline-none text-sm font-black text-rose-900 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                    <label className="block text-xs font-black text-red-900 uppercase tracking-wider mb-2">Escalation Threshold (%)</label>
                    <p className="text-[10px] text-red-700 font-medium mb-4">{activeMainTab === "student" ? "Students" : "Staff"} falling below this percentage require severe escalation.</p>
                    <input 
                      type="number" 
                      value={currentSettings.escalationThreshold}
                      onChange={(e) => setCurrentSettings(prev => ({...prev, escalationThreshold: parseInt(e.target.value)}))}
                      className="w-full px-4 py-2 rounded-xl border-2 border-red-200 focus:border-red-400 focus:ring-0 outline-none text-sm font-black text-red-900 bg-white"
                    />
                  </div>

                  <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                    <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider mb-2">Appreciation Threshold (%)</label>
                    <p className="text-[10px] text-emerald-700 font-medium mb-4">{activeMainTab === "student" ? "Students and classes" : "Staff members"} maintaining attendance above this percentage appear in the Recognition Center.</p>
                    <input 
                      type="number" 
                      value={currentSettings.appreciationThreshold}
                      onChange={(e) => setCurrentSettings(prev => ({...prev, appreciationThreshold: parseInt(e.target.value)}))}
                      className="w-full px-4 py-2 rounded-xl border-2 border-emerald-200 focus:border-emerald-400 focus:ring-0 outline-none text-sm font-black text-emerald-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </AdminSectionCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AttendanceOverviewPage;
