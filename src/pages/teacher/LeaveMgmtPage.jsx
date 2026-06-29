import React, { useState, useEffect, useCallback } from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import MainCard from "../../components/MainCard";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { 
  getLeavesForTeacherApproval, 
  approveLeave, 
  rejectLeave 
} from "../../services/leaveService";
import { getTeacherWorkload } from "../../services/teacherService";
import { getItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, 
  Check, 
  X, 
  Search, 
  Calendar, 
  MessageSquare, 
  UserCheck, 
  Users, 
  Clock, 
  FileText,
  AlertCircle
} from "lucide-react";

const LeaveMgmtPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const teacherId = user?.linkedEntityId;
  
  // Data & UI State
  const [loading, setLoading] = useState(true);
  const [homeroomClass, setHomeroomClass] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Pending approvals comments maps
  const [comments, setComments] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  
  // History Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | APPROVED | REJECTED

  // Fetch Class & Leaves Data
  const loadData = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const workload = await getTeacherWorkload(teacherId);
      if (workload?.homeroomClass) {
        setHomeroomClass(workload.homeroomClass);
      }
      
      const allApprovalLeaves = await getLeavesForTeacherApproval(teacherId);
      setLeaves(allApprovalLeaves);

      const allStudents = getItem(STORAGE_KEYS.STUDENTS, []);
      setStudents(allStudents);
    } catch (err) {
      console.error("Failed to load leaves data for teacher:", err);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleApprove = async (id) => {
    const comment = comments[id] || "";
    setSubmittingId(id);
    try {
      await approveLeave(id, teacherId, comment);
      setComments(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadData();
    } catch (err) {
      alert(err.message || t("leaveMgmt.failedToApprove", { fallback: "Failed to approve leave." }));
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (id) => {
    const comment = comments[id] || "";
    if (!comment.trim()) {
      alert(t("leaveMgmt.rejectCommentRequired", { fallback: "Please provide a feedback comment before rejecting leave requests." }));
      return;
    }
    setSubmittingId(id);
    try {
      await rejectLeave(id, teacherId, comment);
      setComments(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadData();
    } catch (err) {
      alert(err.message || t("leaveMgmt.failedToReject", { fallback: "Failed to reject leave." }));
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCommentChange = (id, text) => {
    setComments(prev => ({ ...prev, [id]: text }));
  };

  // Helper date conversions
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e - s;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days === 1 ? t("leaveMgmt.oneDay", { fallback: "1 Day" }) : `${days} ${t("leaveMgmt.days", { fallback: "Days" })}`;
  };

  // Resolve Student Info from database synchronously
  const getStudent = (studentId) => {
    return students.find(s => s.id === studentId) || { name: t("leaveMgmt.unknownStudent", { fallback: "Unknown Student" }), admissionNo: t("leaveMgmt.na", { fallback: "N/A" }) };
  };

  // 1. Pending Queue
  const pendingLeaves = leaves.filter(l => l.status === "PENDING");

  // 2. Active Leave Roster (On approved leave today)
  const todayStr = new Date().toISOString().split("T")[0];
  const activeRoster = leaves.filter(l => 
    l.status === "APPROVED" && 
    l.fromDate <= todayStr && 
    l.toDate >= todayStr
  );

  // 3. Searchable Log Archive
  const historicalLeaves = leaves.filter(l => l.status !== "PENDING");
  const filteredHistory = historicalLeaves.filter(l => {
    const student = getStudent(l.studentId);
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.leave_mgmt"
        descriptionKey="leaveMgmt.subtitle"
        helperContentEn="Class Leave Operations Center — Manage and Approve Absences"
        helperContentHi="वर्ग अवकाश संचालन केंद्र — छात्र छुट्टियों को प्रबंधित और अनुमोदित करें"
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Pending Approvals Queue (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <MainCard className="p-6">
              <h2 className="text-lg font-black text-[#03045e] mb-2 flex items-center gap-2">
                <Inbox size={20} className="text-[#0077b6]" />
                {t("leaveMgmt.pendingLeaveRequests", { fallback: "Pending Leave Requests" })}
              </h2>
              <p className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">
                {t("leaveMgmt.reviewAndApprove", { fallback: "Review and approve/reject leave requests for your homeroom students." })}
              </p>

              {pendingLeaves.length === 0 ? (
                <div className="p-8 text-center bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
                  <UserCheck size={36} className="text-[#00b4d8] mb-3 animate-pulse" />
                  <p className="text-xs font-black text-[#03045e]">{t("leaveMgmt.allCaughtUp", { fallback: "All caught up!" })}</p>
                  <p className="text-[10px] text-gray-400 font-bold max-w-xs mt-1 uppercase tracking-wider">
                    {t("leaveMgmt.noPendingLeaves", { fallback: "No pending leave applications require review right now." })}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingLeaves.map((leave) => {
                    const student = getStudent(leave.studentId);
                    return (
                      <motion.div
                        key={leave.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="p-5 bg-gradient-to-br from-white to-[#fbfefe] rounded-3xl border border-gray-150/70 shadow-sm space-y-4"
                      >
                        {/* Student Badge & Duration */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-black text-[#03045e]">{student.name}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{t("leaveMgmt.admNo", { fallback: "ADM NO:" })} {student.admissionNo}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2.5 py-0.5 inline-block bg-sky-50 border border-sky-100 text-[#0077b6] text-[9px] font-black uppercase tracking-wider rounded-full">
                              {calculateDays(leave.fromDate, leave.toDate)}
                            </span>
                            <p className="text-[10px] font-bold text-gray-500 mt-1">
                              {formatDate(leave.fromDate)} to {formatDate(leave.toDate)}
                            </p>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100/50">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t("leaveMgmt.reasonProvided", { fallback: "Reason Provided:" })}</span>
                          <p className="text-xs font-semibold text-[#03045e] mt-1 leading-relaxed">{leave.reason}</p>
                        </div>

                        {/* Actions & Comment Input */}
                        <div className="space-y-3 pt-1">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("leaveMgmt.teacherComments", { fallback: "Teacher Comments / Remarks" })}</span>
                          </div>
                          
                          <input
                            type="text"
                            placeholder={t("leaveMgmt.commentsPlaceholder", { fallback: "Add remarks or explanation (Required for Rejection)..." })}
                            value={comments[leave.id] || ""}
                            onChange={(e) => handleCommentChange(leave.id, e.target.value)}
                            className="w-full px-3 py-2 text-xs font-semibold text-[#03045e] bg-gray-50 border border-gray-100 focus:border-[#00b4d8] focus:bg-white rounded-xl outline-none transition-all"
                          />

                          <div className="flex items-center justify-end gap-3 pt-2">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleReject(leave.id)}
                              disabled={submittingId === leave.id}
                              className="px-4 py-2 rounded-xl text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                            >
                              <X size={14} />
                              {t("common.reject", { fallback: "Reject" })}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleApprove(leave.id)}
                              disabled={submittingId === leave.id}
                              className="px-4 py-2 rounded-xl text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                            >
                              <Check size={14} />
                              {t("common.approve", { fallback: "Approve" })}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </MainCard>
          </div>

          {/* Right Column: Active Roster & Searchable Log Archive (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Active Leave Roster */}
            <MainCard className="p-6">
              <h2 className="text-lg font-black text-[#03045e] mb-2 flex items-center gap-2">
                <Users size={20} className="text-[#0077b6]" />
                {t("leaveMgmt.onApprovedLeaveToday", { fallback: "On Approved Leave Today" })}
              </h2>
              <p className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                {t("leaveMgmt.studentsExcused", { fallback: "Students currently excused from class attendance today." })}
              </p>

              {activeRoster.length === 0 ? (
                <div className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {t("leaveMgmt.noStudentsOnLeave", { fallback: "No students on approved leave today." })}
                </div>
              ) : (
                <div className="space-y-2">
                  {activeRoster.map((leave) => {
                    const student = getStudent(leave.studentId);
                    return (
                      <div 
                        key={leave.id}
                        className="p-3 bg-sky-50/50 border border-sky-100/50 rounded-2xl flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-black text-[#03045e]">{student.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">{t("leaveMgmt.adm", { fallback: "ADM:" })} {student.admissionNo}</p>
                        </div>
                        <div className="text-right text-[10px] font-bold text-sky-700">
                          {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </MainCard>

            {/* Archive / Log Section */}
            <MainCard className="p-6 h-[480px] flex flex-col">
              <h2 className="text-lg font-black text-[#03045e] mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[#0077b6]" />
                {t("leaveMgmt.reviewLogHistory", { fallback: "Review Log History" })}
              </h2>

              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                {/* Filters */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder={t("leaveMgmt.searchStudentName", { fallback: "Search student name..." })}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-[#00b4d8] transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 p-1 bg-gray-50/80 rounded-xl border border-gray-100">
                    {["ALL", "APPROVED", "REJECTED"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`flex-1 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${
                          statusFilter === tab 
                            ? "bg-[#03045e] text-white shadow-sm" 
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {tab === "ALL" ? t("common.all", { fallback: "ALL" }) : tab === "APPROVED" ? t("common.approved", { fallback: "APPROVED" }) : t("common.rejected", { fallback: "REJECTED" })}
                      </button>
                    ))}
                  </div>
                </div>

                {/* History Log List */}
                {filteredHistory.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <Clock size={28} className="text-gray-300 mb-2" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      {t("leaveMgmt.noLogsMatch", { fallback: "No logs match filters" })}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                    {filteredHistory.map((leave) => {
                      const student = getStudent(leave.studentId);
                      return (
                        <div 
                          key={leave.id}
                          className="p-3 bg-white border border-gray-100 rounded-2xl text-left space-y-2 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-black text-[#03045e]">{student.name}</p>
                              <span className="text-[8px] font-extrabold text-gray-400 uppercase">
                                {t("leaveMgmt.adm", { fallback: "ADM:" })} {student.admissionNo}
                              </span>
                            </div>

                            {leave.status === "APPROVED" ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-wider border border-emerald-100">
                                {t("common.approved", { fallback: "Approved" })}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-wider border border-rose-100">
                                {t("common.rejected", { fallback: "Rejected" })}
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] font-bold text-[#03045e]/70">
                            {t("leaveMgmt.duration", { fallback: "Duration:" })} {formatDate(leave.fromDate)} to {formatDate(leave.toDate)} ({calculateDays(leave.fromDate, leave.toDate)})
                          </div>

                          {leave.teacherComment && (
                            <div className="p-2 bg-gray-50/50 rounded-xl border border-gray-100/50 text-[10px] font-bold text-gray-500 leading-normal flex gap-1.5 items-start">
                              <AlertCircle size={10} className="flex-shrink-0 mt-0.5 text-gray-450" />
                              <span>{leave.teacherComment}</span>
                            </div>
                          )}

                          <div className="text-[8px] font-bold text-gray-400 text-right uppercase tracking-widest pt-1 border-t border-gray-50">
                            {t("leaveMgmt.reviewedOn", { fallback: "Reviewed on:" })} {new Date(leave.reviewedAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </MainCard>
          </div>

        </div>
      )}
    </div>
  );
};

export default LeaveMgmtPage;
