import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Eye,
  Trash2,
  AlertCircle,
  Paperclip
} from "lucide-react";
import MainCard from "../../components/MainCard";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  getTeacherLeaveRequests,
  createTeacherLeaveRequest,
  cancelTeacherLeaveRequest
} from "../../services/leaveService";
import { getLeaveTypes } from "../../services/leavePortfolioService";
import { getBalanceByUser } from "../../services/leaveBalanceService";
import { calculateLeaveDays } from "../../shared/utils/leaveCalculations";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import LeavePortfolioDashboard from "../../components/leave/LeavePortfolioDashboard";

const TeacherLeavePage = () => {
  const { user } = useAuth(); // Has teacher id etc.
  const { t } = useLanguage();
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [viewLeave, setViewLeave] = useState(null);

  // Apply Form State
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mockFile, setMockFile] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMockFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMockFile({
        file: e.target.files[0],
        name: e.target.files[0].name,
        size: (e.target.files[0].size / 1024).toFixed(1) + " KB"
      });
    }
  };

  // Success Notification
  const [successMsg, setSuccessMsg] = useState("");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await getTeacherLeaveRequests(user?.linkedEntityId);
      // Sort by descending createdAt
      setLeaves(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      const types = await getLeaveTypes();
      const balances = await getBalanceByUser(user?.linkedEntityId, "teacher");

      const isFemale = user?.profile?.gender === "Female";
      const isMale = user?.profile?.gender === "Male";

      const filteredTypes = types.filter(t => {
        if (!t.isActive) return false;
        if (!t.applicableTo.includes("teacher")) return false;
        if (t.leaveTypeName.toLowerCase().includes("maternity") && !isFemale) return false;
        if (t.leaveTypeName.toLowerCase().includes("paternity") && !isMale) return false;
        return true;
      });

      setLeaveTypes(filteredTypes);
      setLeaveBalances(balances);

      if (filteredTypes.length > 0 && !leaveTypeId) {
        setLeaveTypeId(filteredTypes[0].leaveTypeId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    fetchLeaves();
  }, [user?.linkedEntityId]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const selectedPortfolio = leaveTypes.find(t => t.leaveTypeId === leaveTypeId);

    try {
      let attachmentUrl = null;
      if (mockFile && mockFile.file) {
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(mockFile.file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });

        const uploadRes = await fetch('/api/upload-leave-proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: mockFile.name,
            fileData
          })
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error(t("teacherLeave.failedToUpload", { fallback: "Failed to upload attachment: " }) + uploadData.error);
        }
        attachmentUrl = uploadData.filePath;
      }

      await createTeacherLeaveRequest({
        teacherId: user?.linkedEntityId,
        fromDate,
        toDate,
        reason,
        leaveTypeId,
        leaveTypeNameSnapshot: selectedPortfolio?.leaveTypeName,
        attachmentUrl
      });
      
      setSuccessMsg(t("teacherLeave.leaveSubmitted", { fallback: "Leave application submitted successfully!" }));
      setIsApplyModalOpen(false);
      setFromDate("");
      setToDate("");
      setReason("");
      setMockFile(null);
      fetchLeaves();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setFormError(err.message || t("teacherLeave.failedToSubmit", { fallback: "Failed to submit leave." }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm(t("teacherLeave.cancelConfirm", { fallback: "Are you sure you want to cancel this leave request?" }))) return;
    try {
      await cancelTeacherLeaveRequest(leaveId, user?.linkedEntityId);
      setSuccessMsg(t("teacherLeave.leaveCancelled", { fallback: "Leave request cancelled." }));
      fetchLeaves();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <Clock size={10} /> {t("common.pending", { fallback: "Pending" })}
          </span>
        );
      case "Approved":
        return (
          <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <CheckCircle2 size={10} /> {t("common.approved", { fallback: "Approved" })}
          </span>
        );
      case "Rejected":
        return (
          <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <XCircle size={10} /> {t("common.rejected", { fallback: "Rejected" })}
          </span>
        );
      case "Cancelled":
        return (
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <X size={10} /> {t("common.cancelled", { fallback: "Cancelled" })}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <TeacherModuleHeader
        title={t("teacherLeave.myLeaves", { fallback: "My Leaves" })}
        description={t("teacherLeave.myLeavesDesc", { fallback: "Manage your leave requests, check application status, and view leave history." })}
        icon={CalendarDays}
      />

      <LeavePortfolioDashboard userId={user?.linkedEntityId} userType="teacher" gender={user?.profile?.gender} refreshTrigger={refreshTrigger} />

      <div className="flex justify-between items-center mt-8">
        <h2 className="text-lg font-black text-[#03045e]">{t("teacherLeave.dashboard", { fallback: "Leave Dashboard" })}</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#03045e] to-[#023e8a] hover:from-[#023e8a] hover:to-[#0077b6] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <PlusCircle size={16} />
          {t("teacherLeave.applyLeave", { fallback: "Apply Leave" })}
        </motion.button>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-600 font-bold"
          >
            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <OperationsStatCard
          title={t("common.total", { fallback: "Total" })}
          value={leaves.length.toString()}
          description={t("teacherLeave.allTime", { fallback: "All time requests" })}
          icon={FileText}
          bg="#f8fafc"
          color="#475569"
        />
        <OperationsStatCard
          title={t("common.pending", { fallback: "Pending" })}
          value={leaves.filter(l => l.status === "Pending").length.toString()}
          description={t("teacherLeave.awaitingReview", { fallback: "Awaiting review" })}
          icon={Clock}
          bg="#fffbeb"
          color="#d97706"
        />
        <OperationsStatCard
          title={t("common.approved", { fallback: "Approved" })}
          value={leaves.filter(l => l.status === "Approved").length.toString()}
          description={t("teacherLeave.leaveGranted", { fallback: "Leave granted" })}
          icon={CheckCircle2}
          bg="#ecfdf5"
          color="#059669"
        />
        <OperationsStatCard
          title={t("common.rejected", { fallback: "Rejected" })}
          value={leaves.filter(l => l.status === "Rejected").length.toString()}
          description={t("teacherLeave.leaveDenied", { fallback: "Leave denied" })}
          icon={XCircle}
          bg="#fff1f2"
          color="#e11d48"
        />
        <OperationsStatCard
          title={t("common.cancelled", { fallback: "Cancelled" })}
          value={leaves.filter(l => l.status === "Cancelled").length.toString()}
          description={t("teacherLeave.selfCancelled", { fallback: "Self-cancelled" })}
          icon={X}
          bg="#f1f5f9"
          color="#64748b"
        />
      </div>

      {/* Leave Table */}
      <MainCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("teacherLeave.leaveType", { fallback: "Leave Type" })}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("teacherLeave.duration", { fallback: "Duration" })}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("teacherLeave.days", { fallback: "Days" })}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("teacherLeave.status", { fallback: "Status" })}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("teacherLeave.appliedOn", { fallback: "Applied On" })}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("common.actions", { fallback: "Actions" })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-xs font-bold text-gray-400">{t("teacherLeave.loading", { fallback: "Loading leaves..." })}</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-xs font-bold text-gray-400">{t("teacherLeave.noLeavesFound", { fallback: "No leave requests found." })}</td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-black text-[#03045e]">{leave.leaveType}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">
                      {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                      {leave.requestedDays || calculateLeaveDays(leave.fromDate, leave.toDate)} {t("teacherLeave.days", { fallback: "Days" })}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">
                      {formatDate(leave.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setViewLeave(leave)}
                          className="text-[#0077b6] hover:text-[#03045e] transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                        >
                          <Eye size={14} /> {t("common.view", { fallback: "View" })}
                        </button>
                        {leave.status === "Pending" && (
                          <button
                            onClick={() => handleCancelLeave(leave.id)}
                            className="text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                          >
                            <Trash2 size={14} /> {t("common.cancel", { fallback: "Cancel" })}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </MainCard>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsApplyModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full w-[95vw] md:w-[90vw] lg:max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                  <PlusCircle size={20} className="text-[#0077b6]" />
                  {t("teacherLeave.applyLeave", { fallback: "Apply Leave" })}
                </h3>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {formError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 font-bold">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}
                
                <form onSubmit={handleApplyLeave} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">{t("teacherLeave.leaveType", { fallback: "Leave Type" })}</label>
                    <select
                      value={leaveTypeId}
                      onChange={(e) => setLeaveTypeId(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none transition-all"
                    >
                      {leaveTypes.map(t => (
                        <option key={t.leaveTypeId} value={t.leaveTypeId}>{t.leaveTypeName}</option>
                      ))}
                    </select>
                    {leaveTypeId && (
                      <div className="mt-1">
                        {(() => {
                          const b = leaveBalances.find(x => x.leaveTypeId === leaveTypeId);
                          if (!b) return <span className="text-[10px] font-bold text-rose-500">{t("teacherLeave.noAllocation", { fallback: "No Leave Allocation Assigned. Contact Administration." })}</span>;
                          return <span className="text-[10px] font-bold text-[#0077b6]">{t("teacherLeave.remainingBalance", { fallback: "Remaining Balance:" })} {b.remaining} {t("teacherLeave.days", { fallback: "Days" })}</span>;
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">{t("teacherLeave.fromDate", { fallback: "From Date" })}</label>
                      <input
                        type="date"
                        required
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">{t("teacherLeave.toDate", { fallback: "To Date" })}</label>
                      <input
                        type="date"
                        required
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  {fromDate && toDate && (
                    <div className="text-[10px] font-bold text-[#0077b6]">
                      {t("teacherLeave.requestedDays", { fallback: "Requested Days:" })} {calculateLeaveDays(fromDate, toDate)} {t("teacherLeave.days", { fallback: "Days" })}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">{t("teacherLeave.reason", { fallback: "Reason" })}</label>
                    <textarea
                      required
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t("teacherLeave.reasonPlaceholder", { fallback: "Brief description for your leave..." })}
                      className="w-full px-4 py-2.5 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none resize-none transition-all"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors relative cursor-pointer group">
                      <input
                        type="file"
                        onChange={handleMockFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Paperclip size={18} className="text-gray-400 group-hover:text-[#00b4d8] transition-colors" />
                      <span className="text-[10px] font-extrabold text-gray-400 group-hover:text-gray-500 uppercase tracking-wider">
                        {mockFile ? mockFile.name : t("teacherLeave.attachDocs", { fallback: "Attach Supporting Documents (Optional)" })}
                      </span>
                      {mockFile && (
                        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
                          {t("teacherLeave.uploaded", { fallback: "Uploaded" })} ({mockFile.size})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="px-5 py-2.5 text-xs font-black text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors uppercase tracking-wider"
                    >
                      {t("common.cancel", { fallback: "Cancel" })}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#03045e] to-[#023e8a] hover:from-[#023e8a] hover:to-[#0077b6] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {submitting ? t("teacherLeave.submitting", { fallback: "Submitting..." }) : t("teacherLeave.submitLeave", { fallback: "Submit Leave" })}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Leave Modal */}
      <AnimatePresence>
        {viewLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setViewLeave(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full w-[95vw] md:w-[90vw] lg:max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                  <FileText size={20} className="text-[#0077b6]" />
                  {t("teacherLeave.leaveDetails", { fallback: "Leave Details" })}
                </h3>
                <button
                  onClick={() => setViewLeave(null)}
                  className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-[#03045e]">
                      {viewLeave.applicantName === "undefined undefined" ? t("teacherLeave.unknownApplicant", { fallback: "Unknown Applicant" }) : viewLeave.applicantName}
                    </h4>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                      {t("teacherLeave.appliedBy", { fallback: "Applied By:" })} {viewLeave.applicantId} • {viewLeave.department}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(viewLeave.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t("teacherLeave.leaveType", { fallback: "Leave Type" })}</span>
                    <p className="text-xs font-bold text-[#03045e] mt-1">{viewLeave.leaveType}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t("teacherLeave.duration", { fallback: "Duration" })}</span>
                    <p className="text-xs font-bold text-[#03045e] mt-1">
                      {formatDate(viewLeave.fromDate)} - {formatDate(viewLeave.toDate)}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 mt-1">
                      {viewLeave.requestedDays || calculateLeaveDays(viewLeave.fromDate, viewLeave.toDate)} {t("teacherLeave.days", { fallback: "Days" })}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t("teacherLeave.reason", { fallback: "Reason" })}</span>
                  <div className="mt-1 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                    <p className="text-xs font-semibold text-[#03045e] leading-relaxed">
                      {viewLeave.reason}
                    </p>
                  </div>
                </div>

                {viewLeave.attachmentUrl && (
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t("teacherLeave.attachment", { fallback: "Attachment" })}</span>
                    <div className="mt-1">
                      <a 
                        href={viewLeave.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#caf0f8] text-[#03045e] hover:bg-[#00b4d8] hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                      >
                        <Paperclip size={12} /> {t("teacherLeave.viewDoc", { fallback: "View Document" })}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-[10px] font-bold text-gray-400">
                  <span>{t("teacherLeave.appliedOnDate", { fallback: "Applied:" })} {new Date(viewLeave.createdAt).toLocaleString()}</span>
                  <span>{t("teacherLeave.updatedOnDate", { fallback: "Updated:" })} {new Date(viewLeave.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default TeacherLeavePage;
