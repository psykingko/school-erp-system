import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareWarning,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  X,
  FileText,
  Send,
  LifeBuoy
} from "lucide-react";
import MainCard from "../../components/MainCard";
import { useAuth } from "../../context/AuthContext";
import { getAllSupportRequests, updateSupportRequestStatus, addSupportRemark, getSupportStats, getSupportCategoryStats, getSupportHandler } from "../../services/supportService";
import PermissionGate from "../../components/admin/PermissionGate";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";

const CATEGORIES = [
  "Help Request",
  "Technical Support",
  "Feedback",
  "Suggestion",
  "Complaint",
  "Bug Report",
  "Academic Issue",
  "Transport Issue",
  "Fee Issue",
  "Other"
];

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Open", "In Review", "Resolved", "Closed"];
const REQUESTERS = ["Student", "Parent", "Teacher", "Employee"];

const getStatusColor = (status) => {
  switch (status) {
    case "Open": return "bg-blue-100 text-blue-700";
    case "In Review": return "bg-amber-100 text-amber-700";
    case "Resolved": return "bg-emerald-100 text-emerald-700";
    case "Closed": return "bg-gray-100 text-gray-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "High": return "bg-rose-100 text-rose-700 border-rose-200";
    case "Medium": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Low": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function SupportManagementPage() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [handler, setHandler] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [requesterFilter, setRequesterFilter] = useState("All");

  // Modals
  const [viewRequest, setViewRequest] = useState(null);

  // Remarks & Status form inside modal
  const [newRemark, setNewRemark] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllSupportRequests();
      setRequests(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      const handlerData = await getSupportHandler();
      setHandler(handlerData);
    } catch (error) {
      console.error("Failed to fetch support requests", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchCategory = categoryFilter === "All" || r.category === categoryFilter;
      const matchPriority = priorityFilter === "All" || r.priority === priorityFilter;
      const matchRequester = requesterFilter === "All" || r.requesterType === requesterFilter;
      return matchStatus && matchCategory && matchPriority && matchRequester;
    });
  }, [requests, statusFilter, categoryFilter, priorityFilter, requesterFilter]);

  const stats = useMemo(() => getSupportStats(requests), [requests]);
  const categoryStats = useMemo(() => getSupportCategoryStats(requests), [requests]);

  const handleUpdateStatus = async (newStatus) => {
    if (!viewRequest) return;
    setUpdating(true);
    try {
      const updated = await updateSupportRequestStatus(viewRequest.id, newStatus);
      setViewRequest(updated);
      await fetchRequests();
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim() || !viewRequest) return;
    setUpdating(true);
    try {
      const employeeId = user?.employeeId || user?.id || "Admin";
      const updated = await addSupportRemark(viewRequest.id, newRemark.trim(), employeeId);
      setViewRequest(updated);
      setNewRemark("");
      await fetchRequests();
    } catch (error) {
      console.error("Failed to add remark", error);
    } finally {
      setUpdating(false);
    }
  };

  const formatRequesterDisplay = (req) => {
    if (req.anonymous && (req.category === "Complaint" || req.category === "Feedback")) {
      return "Anonymous Submission";
    }
    return req.requesterName;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#03045e] flex items-center gap-3">
            <MessageSquareWarning className="text-[#0077b6]" size={28} />
            Support Management
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Centralized inbox to review, track, and manage all support requests.
          </p>
        </div>
        {handler && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#03045e] font-bold">
              {handler.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Handler</p>
              <p className="text-sm font-bold text-gray-800">{handler.name}</p>
              <p className="text-xs text-gray-500">{handler.designation}</p>
            </div>
          </div>
        )}
      </div>

      <PageAuthorityBanner moduleId="admin_support_management" moduleName="Support Center" />

      {/* Insights Section */}
      <div className="space-y-4">
        {/* Row 1: Workflow Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <MainCard className="p-4 border-l-4 border-[#03045e]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Requests</p>
                <h3 className="text-2xl font-black text-[#03045e] mt-0.5">{stats.total}</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#03045e]">
                <FileText size={16} />
              </div>
            </div>
          </MainCard>
          
          <MainCard className="p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Open</p>
                <h3 className="text-2xl font-black text-blue-700 mt-0.5">{stats.open}</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <AlertCircle size={16} />
              </div>
            </div>
          </MainCard>

          <MainCard className="p-4 border-l-4 border-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">In Review</p>
                <h3 className="text-2xl font-black text-amber-700 mt-0.5">{stats.inReview}</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <Clock size={16} />
              </div>
            </div>
          </MainCard>

          <MainCard className="p-4 border-l-4 border-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Resolved</p>
                <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{stats.resolved}</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={16} />
              </div>
            </div>
          </MainCard>
          
          <MainCard className="p-4 border-l-4 border-gray-400">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Closed</p>
                <h3 className="text-2xl font-black text-gray-700 mt-0.5">{stats.closed}</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                <CheckCircle2 size={16} />
              </div>
            </div>
          </MainCard>
        </div>

        {/* Row 2: Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <MainCard className="p-4 border border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Complaints</p>
                <h3 className="text-lg font-black text-rose-700 mt-0.5">{categoryStats.complaints}</h3>
              </div>
            </div>
          </MainCard>
          
          <MainCard className="p-4 border border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Feedback</p>
                <h3 className="text-lg font-black text-blue-700 mt-0.5">{categoryStats.feedback}</h3>
              </div>
            </div>
          </MainCard>

          <MainCard className="p-4 border border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suggestions</p>
                <h3 className="text-lg font-black text-indigo-700 mt-0.5">{categoryStats.suggestions}</h3>
              </div>
            </div>
          </MainCard>
          
          <MainCard className="p-4 border border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Technical Support</p>
                <h3 className="text-lg font-black text-orange-700 mt-0.5">{categoryStats.technicalSupport}</h3>
              </div>
            </div>
          </MainCard>
        </div>
        
        <p className="text-[10px] font-medium text-gray-400 text-right italic">
          More analytics coming soon.
        </p>
      </div>

      {/* Main Content */}
      <MainCard className="overflow-hidden flex flex-col min-h-[500px]">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-[#03045e] font-bold text-sm w-full lg:w-auto">
            <Filter size={18} />
            <span>Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none shadow-sm flex-1 md:flex-none"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none shadow-sm flex-1 md:flex-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none shadow-sm flex-1 md:flex-none"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            
            <select
              value={requesterFilter}
              onChange={(e) => setRequesterFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none shadow-sm flex-1 md:flex-none"
            >
              <option value="All">All Requesters</option>
              {REQUESTERS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <MessageSquareWarning size={48} className="mb-4 opacity-20" />
              <p className="font-bold text-lg text-gray-500">No requests found</p>
              <p className="text-sm">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold font-mono text-gray-500">{req.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{formatRequesterDisplay(req)}</span>
                          {formatRequesterDisplay(req) !== "Anonymous Submission" && (
                            <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">{req.requesterType}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-[#03045e]">{req.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900 w-full flex-1 min-w-0 md:max-w-[200px] truncate">{req.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${getPriorityColor(req.priority)}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setViewRequest(req)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-[#0077b6] flex items-center justify-center ml-auto hover:bg-[#0077b6] hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </MainCard>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setViewRequest(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full w-[95vw] md:w-[90vw] lg:max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <LifeBuoy size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#03045e]">Request Details</h3>
                    <p className="text-xs font-mono text-gray-500">{viewRequest.id}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Status Dropdown */}
                  <PermissionGate moduleId="admin_support_management" permission="edit" mode="disabled">
                    <select
                      value={viewRequest.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      disabled={updating}
                      className={`text-sm font-bold rounded-xl px-4 py-2 border outline-none ${getStatusColor(viewRequest.status)} ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </PermissionGate>

                  <button
                    onClick={() => setViewRequest(null)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Column: Request Info */}
                <div className="md:col-span-2 space-y-6">
                  {/* Request Header */}
                  <div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${getPriorityColor(viewRequest.priority)}`}>
                        {viewRequest.priority} Priority
                      </span>
                      <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                        {viewRequest.category}
                      </span>
                      <span className="text-xs font-medium text-gray-400 ml-auto">
                        {new Date(viewRequest.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-[#03045e] mb-3">{viewRequest.title}</h4>
                    <div className="text-sm font-medium text-gray-700 bg-gray-50 p-5 rounded-2xl border border-gray-100 whitespace-pre-wrap leading-relaxed">
                      {viewRequest.description}
                    </div>
                  </div>

                  {/* Complaint Specific Info */}
                  {viewRequest.category === "Complaint" && viewRequest.complaintAgainstType && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-rose-500" />
                        <h5 className="text-xs font-black text-rose-700 uppercase tracking-wider">Complaint Information</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-[10px] font-bold text-rose-400 uppercase">Against Type</p>
                          <p className="font-bold text-rose-900">{viewRequest.complaintAgainstType}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-rose-400 uppercase">Against ID / Name</p>
                          <p className="font-bold text-rose-900">{viewRequest.complaintAgainstId}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remarks Section */}
                  <div className="pt-4 border-t border-gray-100">
                    <h5 className="text-sm font-black text-[#03045e] mb-4 flex items-center gap-2">
                      <MessageSquare size={16} className="text-[#0077b6]" />
                      Remarks Timeline
                    </h5>
                    
                    <div className="space-y-4">
                      {(!viewRequest.remarks || viewRequest.remarks.length === 0) ? (
                        <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                          No remarks added yet.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {/* Remarks displayed newest first */}
                          {[...viewRequest.remarks].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(rmk => (
                            <div key={rmk.id} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">
                                  By {rmk.createdBy}
                                </span>
                                <span className="text-[10px] font-medium text-gray-400">
                                  {new Date(rmk.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap">
                                {rmk.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Requester & Add Remark */}
                <div className="space-y-6">
                  {/* Requester Info */}
                  <div className="p-5 rounded-2xl bg-[#caf0f8]/30 border border-[#90e0ef]/30">
                    <p className="text-[10px] font-black text-[#0077b6] uppercase tracking-wider mb-3">Requester Profile</p>
                    {formatRequesterDisplay(viewRequest) === "Anonymous Submission" ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <Eye size={20} className="opacity-50" />
                        </div>
                        <div>
                          <p className="font-black text-gray-700">Anonymous</p>
                          <p className="text-xs font-medium text-gray-500">Identity Hidden</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#0077b6] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                          {viewRequest.requesterName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-black text-[#03045e]">{viewRequest.requesterName}</p>
                          <p className="text-xs font-bold text-[#0077b6] mt-0.5 uppercase tracking-wider">{viewRequest.requesterType}</p>
                          <p className="text-xs font-medium text-gray-500 font-mono mt-0.5">{viewRequest.requesterId}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add Remark Form */}
                  <PermissionGate moduleId="admin_support_management" permission="edit" mode="hidden">
                    <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">Add Note</p>
                      <textarea
                        rows={4}
                        placeholder="Type a remark..."
                        value={newRemark}
                        onChange={(e) => setNewRemark(e.target.value)}
                        disabled={updating}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0077b6] outline-none resize-none mb-3 disabled:opacity-50"
                      />
                      <motion.button
                        whileHover={newRemark.trim() && !updating ? { scale: 1.02 } : {}}
                        whileTap={newRemark.trim() && !updating ? { scale: 0.98 } : {}}
                        onClick={handleAddRemark}
                        disabled={!newRemark.trim() || updating}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                          newRemark.trim() && !updating
                            ? "bg-[#0077b6] text-white shadow-lg shadow-blue-500/20 hover:bg-[#023e8a]"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Send size={16} />
                        {updating ? "Saving..." : "Add Remark"}
                      </motion.button>
                    </div>
                  </PermissionGate>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
