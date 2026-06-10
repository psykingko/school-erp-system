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
  AlertCircle
} from "lucide-react";
import MainCard from "../../components/MainCard";
import { useAuth } from "../../context/AuthContext";
import {
  getTeacherLeaveRequests,
  createTeacherLeaveRequest,
  cancelTeacherLeaveRequest
} from "../../services/leaveService";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";

const TeacherLeavePage = () => {
  const { user } = useAuth(); // Has teacher id etc.
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [viewLeave, setViewLeave] = useState(null);

  // Apply Form State
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Success Notification
  const [successMsg, setSuccessMsg] = useState("");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await getTeacherLeaveRequests(user?.linkedEntityId);
      // Sort by descending createdAt
      setLeaves(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user?.linkedEntityId]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createTeacherLeaveRequest({
        teacherId: user?.linkedEntityId,
        fromDate,
        toDate,
        reason,
        leaveType
      });
      
      setSuccessMsg("Leave application submitted successfully!");
      setIsApplyModalOpen(false);
      setFromDate("");
      setToDate("");
      setReason("");
      setLeaveType("Casual Leave");
      fetchLeaves();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setFormError(err.message || "Failed to submit leave.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await cancelTeacherLeaveRequest(leaveId, user?.linkedEntityId);
      setSuccessMsg("Leave request cancelled.");
      fetchLeaves();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper resolvers
  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e - s;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days === 1 ? "1 Day" : `${days} Days`;
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
            <Clock size={10} /> Pending
          </span>
        );
      case "Approved":
        return (
          <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <CheckCircle2 size={10} /> Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <XCircle size={10} /> Rejected
          </span>
        );
      case "Cancelled":
        return (
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <X size={10} /> Cancelled
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
        title="My Leaves"
        description="Manage your leave requests, check application status, and view leave history."
        icon={CalendarDays}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black text-[#03045e]">Leave Dashboard</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#03045e] to-[#023e8a] hover:from-[#023e8a] hover:to-[#0077b6] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Apply Leave
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <OperationsStatCard
          title="Total"
          value={leaves.length.toString()}
          description="All time requests"
          icon={FileText}
          bg="#f8fafc"
          color="#475569"
        />
        <OperationsStatCard
          title="Pending"
          value={leaves.filter(l => l.status === "Pending").length.toString()}
          description="Awaiting review"
          icon={Clock}
          bg="#fffbeb"
          color="#d97706"
        />
        <OperationsStatCard
          title="Approved"
          value={leaves.filter(l => l.status === "Approved").length.toString()}
          description="Leave granted"
          icon={CheckCircle2}
          bg="#ecfdf5"
          color="#059669"
        />
        <OperationsStatCard
          title="Rejected"
          value={leaves.filter(l => l.status === "Rejected").length.toString()}
          description="Leave denied"
          icon={XCircle}
          bg="#fff1f2"
          color="#e11d48"
        />
        <OperationsStatCard
          title="Cancelled"
          value={leaves.filter(l => l.status === "Cancelled").length.toString()}
          description="Self-cancelled"
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
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Days</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Applied On</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-xs font-bold text-gray-400">Loading leaves...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-xs font-bold text-gray-400">No leave requests found.</td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-black text-[#03045e]">{leave.leaveType}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">
                      {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                      {calculateDays(leave.fromDate, leave.toDate)}
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
                          <Eye size={14} /> View
                        </button>
                        {leave.status === "Pending" && (
                          <button
                            onClick={() => handleCancelLeave(leave.id)}
                            className="text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                          >
                            <Trash2 size={14} /> Cancel
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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                  <PlusCircle size={20} className="text-[#0077b6]" />
                  Apply Leave
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
                    <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none transition-all"
                    >
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Personal Leave">Personal Leave</option>
                      <option value="Emergency Leave">Emergency Leave</option>
                      <option value="Official Duty">Official Duty</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">From Date</label>
                      <input
                        type="date"
                        required
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">To Date</label>
                      <input
                        type="date"
                        required
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">Reason</label>
                    <textarea
                      required
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Brief description for your leave..."
                      className="w-full px-4 py-2.5 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none resize-none transition-all"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="px-5 py-2.5 text-xs font-black text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#03045e] to-[#023e8a] hover:from-[#023e8a] hover:to-[#0077b6] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Leave"}
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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                  <FileText size={20} className="text-[#0077b6]" />
                  Leave Details
                </h3>
                <button
                  onClick={() => setViewLeave(null)}
                  className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-black text-[#03045e]">{viewLeave.applicantName}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                      Applied By: {viewLeave.applicantId} &bull; {viewLeave.department}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(viewLeave.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Leave Type</span>
                    <p className="text-xs font-bold text-[#03045e] mt-1">{viewLeave.leaveType}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Duration</span>
                    <p className="text-xs font-bold text-[#03045e] mt-1">
                      {formatDate(viewLeave.fromDate)} - {formatDate(viewLeave.toDate)}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Reason</span>
                  <div className="mt-1 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                    <p className="text-xs font-semibold text-[#03045e] leading-relaxed">
                      {viewLeave.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-[10px] font-bold text-gray-400">
                  <span>Applied: {new Date(viewLeave.createdAt).toLocaleString()}</span>
                  <span>Updated: {new Date(viewLeave.updatedAt).toLocaleString()}</span>
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
