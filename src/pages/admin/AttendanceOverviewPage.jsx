import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BellRing, Send, Settings, TrendingDown, TrendingUp, AlertTriangle, 
  CheckCircle, Users, Activity, Target, Award, ArrowUpRight, ArrowDownRight,
  ShieldAlert, Save
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminDataTable from "../../components/admin/AdminDataTable";
import attendanceGovernanceService from "../../services/attendanceGovernanceService";
import PermissionGate from "../../components/admin/PermissionGate";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";

const AttendanceOverviewPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("interventions"); // interventions, settings
  const [successBanner, setSuccessBanner] = useState("");

  // Table selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [filterType, setFilterType] = useState("notification"); // "notification", "critical", "escalation", "appreciation"

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    notificationThreshold: 75,
    criticalThreshold: 50,
    escalationThreshold: 30,
    appreciationThreshold: 90
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
      await attendanceGovernanceService.saveGovernanceSettings(settingsForm);
      showBanner("Governance Intervention Rules updated successfully.");
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendNotification = () => {
    if (selectedStudentIds.length === 0) {
      alert("Please select at least one student to send a notification.");
      return;
    }
    
    // Determine campaign details based on filter type
    let campaignSubject = "";
    let priority = "normal";
    let messageBody = "";

    if (filterType === "appreciation") {
      campaignSubject = "Appreciation for Excellent Attendance";
      priority = "normal";
      messageBody = "Dear {ParentName},\n\nWe are delighted to inform you that {StudentName} has maintained excellent attendance, exceeding our appreciation threshold.\n\nThank you for your continuous support.\n\nRegards,\nSchool Administration";
    } else if (filterType === "escalation") {
      campaignSubject = "SEVERE WARNING: Critical Attendance Shortage";
      priority = "emergency";
      messageBody = "Dear {ParentName},\n\nThis is an URGENT notice. {StudentName}'s attendance has dropped below the severe escalation threshold ({AttendancePercent}%). Immediate action is required. Please meet the Principal.\n\nRegards,\nSchool Administration";
    } else if (filterType === "critical") {
      campaignSubject = "Urgent Attendance Warning";
      priority = "important";
      messageBody = "Dear {ParentName},\n\nWe are writing to inform you that {StudentName}'s attendance has dropped to a critical level ({AttendancePercent}%). Please ensure regular attendance.\n\nRegards,\nSchool Administration";
    } else {
      campaignSubject = "Attendance Reminder";
      priority = "normal";
      messageBody = "Dear {ParentName},\n\nThis is a gentle reminder that {StudentName}'s attendance is currently at {AttendancePercent}%, which is below our expected standard. We request your attention to this matter.\n\nRegards,\nSchool Administration";
    }

    // Navigate to communication center passing selected student IDs
    navigate("/admin/communication-center", {
      state: {
        audienceObj: {
          groups: [],
          classes: [],
          sections: [],
          streams: [],
          teacherTypes: [],
          subjects: [],
          studentIds: selectedStudentIds,
          employeeIds: []
        },
        campaignConfig: {
          subject: campaignSubject,
          priority: priority,
          messageBody: messageBody,
          deliveryChannels: ["email", "sms"]
        }
      }
    });
  };

  const handleSelectAll = (e, filteredList) => {
    if (e.target.checked) {
      setSelectedStudentIds(filteredList.map(item => item.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedStudentIds(prev => [...prev, id]);
    } else {
      setSelectedStudentIds(prev => prev.filter(i => i !== id));
    }
  };

  // Filter watchlist based on selected threshold dropdown
  const filteredWatchlist = useMemo(() => {
    if (!data) return [];
    
    if (filterType === "appreciation") {
      return data.recognitionList.students.map(s => ({
        ...s,
        riskLevel: "EXCELLENT",
      }));
    }
    
    let threshold = data.settings.notificationThreshold;
    if (filterType === "critical") threshold = data.settings.criticalThreshold;
    if (filterType === "escalation") threshold = data.settings.escalationThreshold;

    return data.watchlist.filter(item => item.attendancePercentage <= threshold);
  }, [data, filterType]);

  if (loading || !data) {
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

      {successBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-xs font-black shadow-sm flex items-center gap-2"
        >
          <CheckCircle size={16} className="text-emerald-500" />
          {successBanner}
        </motion.div>
      )}

      {/* Tabs Navigation */}
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
            <AdminSectionCard>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <Target className="text-[#03045e]" size={20} />
                  <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">Interventions & Watchlist</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <select 
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setSelectedStudentIds([]); // Clear selection when filter changes
                    }}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] outline-none cursor-pointer"
                  >
                    <option value="notification">&lt; {data.settings.notificationThreshold}% (All At Risk)</option>
                    <option value="critical">&lt; {data.settings.criticalThreshold}% (Critical Risk)</option>
                    <option value="escalation">&lt; {data.settings.escalationThreshold}% (Severe Escalation)</option>
                    <option value="appreciation">&gt;= {data.settings.appreciationThreshold}% (Appreciation Candidate)</option>
                  </select>

                  <PermissionGate moduleId="admin_attendance" permission="publish" mode="disabled">
                    <button
                      onClick={handleSendNotification}
                      disabled={selectedStudentIds.length === 0}
                      className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] disabled:bg-gray-300 text-white px-4 py-2 rounded-xl shadow-sm text-xs font-black transition-colors"
                    >
                      <Send size={14} />
                      <span>Send Notification ({selectedStudentIds.length})</span>
                    </button>
                  </PermissionGate>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 font-medium mb-6">
                Select students below to initiate parent communications. This will seamlessly transition you to the Communication Center with the audience pre-loaded.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#caf0f8]/20 border-y border-[#caf0f8]/40">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedStudentIds.length > 0 && selectedStudentIds.length === filteredWatchlist.length}
                          onChange={(e) => handleSelectAll(e, filteredWatchlist)}
                          className="w-4 h-4 rounded text-[#0077b6] cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Class</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance %</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Risk Level</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredWatchlist.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400 text-xs font-medium">No students match this threshold filter.</td>
                      </tr>
                    ) : (
                      filteredWatchlist.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors text-xs text-gray-700 font-bold">
                          <td className="px-4 py-3">
                            <input 
                              type="checkbox" 
                              checked={selectedStudentIds.includes(item.id)}
                              onChange={(e) => handleSelectOne(e, item.id)}
                              className="w-4 h-4 rounded text-[#0077b6] cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 text-[#03045e] font-black">{item.name}</td>
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
                              <span>{item.parentName}</span>
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
                  <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">Intervention Rules Configuration</h3>
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
                    <p className="text-[10px] text-amber-700 font-medium mb-4">Students falling below this percentage will be added to the High Risk watchlist.</p>
                    <input 
                      type="number" 
                      value={settingsForm.notificationThreshold}
                      onChange={(e) => setSettingsForm(prev => ({...prev, notificationThreshold: parseInt(e.target.value)}))}
                      className="w-full px-4 py-2 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-0 outline-none text-sm font-black text-amber-900 bg-white"
                    />
                  </div>

                  <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                    <label className="block text-xs font-black text-rose-900 uppercase tracking-wider mb-2">Critical Threshold (%)</label>
                    <p className="text-[10px] text-rose-700 font-medium mb-4">Students falling below this percentage require Urgent Warnings and immediate institutional intervention.</p>
                    <input 
                      type="number" 
                      value={settingsForm.criticalThreshold}
                      onChange={(e) => setSettingsForm(prev => ({...prev, criticalThreshold: parseInt(e.target.value)}))}
                      className="w-full px-4 py-2 rounded-xl border-2 border-rose-200 focus:border-rose-400 focus:ring-0 outline-none text-sm font-black text-rose-900 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                    <label className="block text-xs font-black text-red-900 uppercase tracking-wider mb-2">Escalation Threshold (%)</label>
                    <p className="text-[10px] text-red-700 font-medium mb-4">Students falling below this percentage require severe escalation (e.g., suspension warning, principal meeting).</p>
                    <input 
                      type="number" 
                      value={settingsForm.escalationThreshold}
                      onChange={(e) => setSettingsForm(prev => ({...prev, escalationThreshold: parseInt(e.target.value)}))}
                      className="w-full px-4 py-2 rounded-xl border-2 border-red-200 focus:border-red-400 focus:ring-0 outline-none text-sm font-black text-red-900 bg-white"
                    />
                  </div>

                  <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                    <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider mb-2">Appreciation Threshold (%)</label>
                    <p className="text-[10px] text-emerald-700 font-medium mb-4">Students and classes maintaining attendance above this percentage appear in the Recognition Center.</p>
                    <input 
                      type="number" 
                      value={settingsForm.appreciationThreshold}
                      onChange={(e) => setSettingsForm(prev => ({...prev, appreciationThreshold: parseInt(e.target.value)}))}
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
