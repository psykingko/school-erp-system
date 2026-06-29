import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Eye,
  Check,
  Filter,
  ArrowUpDown
} from "lucide-react";
import MainCard from "../../components/MainCard";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import { getAllLeaveRequests, updateLeaveStatus, getLeaveApproverInfo } from "../../services/leaveService";

const LeaveApprovalPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Approver Info
  const [approverInfo, setApproverInfo] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest First");

  // Modals
  const [viewLeave, setViewLeave] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Leaves
      const data = await getAllLeaveRequests();
      setLeaves(data);

      // 2. Fetch Approver Info
      const approver = await getLeaveApproverInfo();
      if (approver) {
        setApproverInfo(approver);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load leave data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (leaveId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this request as ${newStatus}?`)) return;
    try {
      setErrorMsg("");
      await updateLeaveStatus(leaveId, newStatus, approverInfo?.id || "EMP-001");
      setSuccessMsg(`Leave request marked as ${newStatus}.`);
      fetchData();
      setViewLeave(null); // Close modal if open
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setErrorMsg(err.message || "Action failed.");
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  // Filter & Sort Logic
  const processedLeaves = useMemo(() => {
    let filtered = leaves.filter((l) => {
      const matchStatus = statusFilter === "All" || l.status === statusFilter;
      const matchType = typeFilter === "All" || l.applicantType === (typeFilter.endsWith('s') ? typeFilter.slice(0, -1) : typeFilter); 
      // Plural matching: Students -> Student
      return matchStatus && matchType;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "Newest First" ? dateB - dateA : dateA - dateB;
    });
  }, [leaves, statusFilter, typeFilter, sortOrder]);

  // Helper Formats
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

  const getTypeBadge = (type) => {
    const colors = {
      "Student": "bg-blue-50 text-blue-600 border-blue-100",
      "Teacher": "bg-indigo-50 text-indigo-600 border-indigo-100",
      "Employee": "bg-purple-50 text-purple-600 border-purple-100",
      "Parent": "bg-pink-50 text-pink-600 border-pink-100",
    };
    const c = colors[type] || "bg-gray-50 text-gray-600 border-gray-100";
    return <span className={`px-2 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${c}`}>{type}</span>;
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
      <AdminPageHeader
        title="Leave Approval Center"
        description="Centralized dashboard for reviewing and updating leave requests across the institution."
        breadcrumbs={["Administration", "User Management", "Leave Approval Center"]}
        actionButton={
          approverInfo ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Approver</span>
              <span className="text-sm font-bold text-[#03045e]">{approverInfo.id} ({approverInfo.name})</span>
              <span className="text-xs font-semibold text-gray-500">{approverInfo.designation}</span>
            </div>
          ) : null
        }
      />

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
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 font-bold"
          >
            <XCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-5 gap-4">
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

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-[#03045e] font-black uppercase tracking-wider text-[10px]">
          <Filter size={14} /> Filters
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none transition-all"
          >
            <option value="All">All Applicant Types</option>
            <option value="Students">Students</option>
            <option value="Teachers">Teachers</option>
            <option value="Employees">Employees</option>
          </select>
        </div>

        <div className="md:ml-auto flex items-center gap-2 text-[#03045e] font-black uppercase tracking-wider text-[10px]">
          <ArrowUpDown size={14} /> Sort By
        </div>
        
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-[#00b4d8] focus:bg-white outline-none transition-all"
        >
          <option value="Newest First">Newest First</option>
          <option value="Oldest First">Oldest First</option>
        </select>
      </div>

      {/* Leave Table */}
      <MainCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Leave Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-xs font-bold text-gray-400">Loading leave requests...</td>
                </tr>
              ) : processedLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-xs font-bold text-gray-400">No leave requests match your criteria.</td>
                </tr>
              ) : (
                processedLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-[#03045e]">{leave.applicantName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-gray-400">{leave.applicantId}</span>
                        {getTypeBadge(leave.applicantType)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">
                      {leave.department || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-[#03045e]">{leave.leaveType}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Applied: {formatDate(leave.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-gray-600">
                        {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                        {calculateDays(leave.fromDate, leave.toDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setViewLeave(leave)}
                          className="text-[#0077b6] hover:text-[#03045e] transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-blue-50 px-2 py-1 rounded border border-blue-100"
                        >
                          <Eye size={12} /> View
                        </button>
                        {leave.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(leave.id, "Approved")}
                              className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded border border-emerald-100"
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(leave.id, "Rejected")}
                              className="text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-rose-50 px-2 py-1 rounded border border-rose-100"
                            >
                              <X size={12} /> Reject
                            </button>
                          </>
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

      {/* View Leave Modal (Read-Only) */}
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
              className="relative w-full w-[95vw] md:w-[90vw] lg:max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                  <FileText size={20} className="text-[#0077b6]" />
                  Leave Request Details
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
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-black text-[#03045e]">{viewLeave.applicantName}</h4>
                      {getTypeBadge(viewLeave.applicantType)}
                    </div>
                    <p className="text-xs font-bold text-gray-400 mt-1">
                      ID: {viewLeave.applicantId} &bull; Dept: {viewLeave.department || "N/A"}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(viewLeave.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Leave Type</span>
                    <p className="text-xs font-bold text-[#03045e] mt-1">{viewLeave.leaveType}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Source</span>
                    <p className="text-xs font-bold text-[#03045e] mt-1">{viewLeave.source}</p>
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
                  <div className="mt-1 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl min-h-[80px]">
                    <p className="text-xs font-semibold text-[#03045e] leading-relaxed">
                      {viewLeave.reason}
                    </p>
                  </div>
                </div>

                {viewLeave.approvedBy && (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Processed By</span>
                      <p className="text-xs font-bold text-emerald-800 mt-0.5">{viewLeave.approvedBy}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Processed On</span>
                      <p className="text-xs font-bold text-emerald-800 mt-0.5">
                        {new Date(viewLeave.approvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Inline Action Buttons for Pending */}
                {viewLeave.status === "Pending" && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleStatusUpdate(viewLeave.id, "Rejected")}
                      className="px-6 py-2 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-2"
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(viewLeave.id, "Approved")}
                      className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Check size={14} /> Approve
                    </button>
                  </div>
                )}
                
                {viewLeave.status !== "Pending" && (
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-[10px] font-bold text-gray-400">
                    <span>Applied: {new Date(viewLeave.createdAt).toLocaleString()}</span>
                    <span>Last Updated: {new Date(viewLeave.updatedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default LeaveApprovalPage;
