import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  X,
  FileText
} from "lucide-react";
import MainCard from "../../components/MainCard";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getMySupportRequests, createSupportRequest } from "../../services/supportService";

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

const COMPLAINT_TARGETS = [
  "Student",
  "Teacher",
  "Employee",
  "Admin",
  "Department",
  "System"
];

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Open", "In Review", "Resolved", "Closed"];

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

const getRoleString = (role) => {
  if (role === "STUDENT") return "Student";
  if (role === "PARENT") return "Parent";
  if (role === "TEACHER") return "Teacher";
  if (role === "ADMIN") return "Employee"; // Admin employees are Employees in the system
  return "Unknown";
};

export default function SupportCenterPage() {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category: "Help Request",
    priority: "Medium",
    title: "",
    description: "",
    anonymous: false,
    complaintAgainstType: "System",
    complaintAgainstId: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const userId = user?.linkedEntityId || user?.authUserId || user?.id;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      if (userId) {
        const data = await getMySupportRequests(userId);
        // Sort by newest first
        setRequests(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error("Failed to fetch support requests", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchCategory = categoryFilter === "All" || r.category === categoryFilter;
      const matchPriority = priorityFilter === "All" || r.priority === priorityFilter;
      return matchStatus && matchCategory && matchPriority;
    });
  }, [requests, statusFilter, categoryFilter, priorityFilter]);

  const summary = useMemo(() => {
    return {
      total: requests.length,
      open: requests.filter(r => r.status === "Open").length,
      inReview: requests.filter(r => r.status === "In Review").length,
      resolved: requests.filter(r => r.status === "Resolved").length
    };
  }, [requests]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setSubmitting(true);
    try {
      const isComplaint = formData.category === "Complaint";
      const isFeedback = formData.category === "Feedback";

      const payload = {
        requesterType: getRoleString(role),
        requesterId: userId,
        category: formData.category,
        priority: formData.priority,
        title: formData.title,
        description: formData.description,
        anonymous: (isComplaint || isFeedback) ? formData.anonymous : false,
      };

      if (isComplaint) {
        payload.complaintAgainstType = formData.complaintAgainstType;
        payload.complaintAgainstId = formData.complaintAgainstId;
      }

      await createSupportRequest(payload);
      await fetchRequests();
      setIsCreateModalOpen(false);
      
      // Reset form
      setFormData({
        category: "Help Request",
        priority: "Medium",
        title: "",
        description: "",
        anonymous: false,
        complaintAgainstType: "System",
        complaintAgainstId: ""
      });
    } catch (error) {
      console.error("Failed to create request", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#03045e] flex items-center gap-3">
            <LifeBuoy className="text-[#0077b6]" size={28} />
            {t("support.title", { fallback: "Support Center" })}
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {t("support.subtitle", { fallback: "Manage your help requests, feedback, and complaints." })}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#0077b6] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          {t("support.createRequest", { fallback: "Create Request" })}
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4">
        <MainCard className="p-5 border-l-4 border-[#03045e]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("support.totalRequests", { fallback: "Total Requests" })}</p>
              <h3 className="text-2xl font-black text-[#03045e] mt-1">{summary.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#03045e]">
              <FileText size={20} />
            </div>
          </div>
        </MainCard>
        
        <MainCard className="p-5 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("support.open", { fallback: "Open" })}</p>
              <h3 className="text-2xl font-black text-blue-700 mt-1">{summary.open}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <AlertCircle size={20} />
            </div>
          </div>
        </MainCard>

        <MainCard className="p-5 border-l-4 border-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("support.inReview", { fallback: "In Review" })}</p>
              <h3 className="text-2xl font-black text-amber-700 mt-1">{summary.inReview}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Clock size={20} />
            </div>
          </div>
        </MainCard>

        <MainCard className="p-5 border-l-4 border-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("support.resolved", { fallback: "Resolved" })}</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">{summary.resolved}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </MainCard>
      </div>

      {/* Main Content */}
      <MainCard className="overflow-hidden flex flex-col min-h-[500px]">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-[#03045e] font-bold text-sm w-full md:w-auto">
            <Filter size={18} />
            <span>{t("common.filters", { fallback: "Filters:" })}</span>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 text-sm font-semibold rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            >
              <option value="All">{t("support.allStatuses", { fallback: "All Statuses" })}</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-200 text-sm font-semibold rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            >
              <option value="All">{t("support.allCategories", { fallback: "All Categories" })}</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-gray-200 text-sm font-semibold rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            >
              <option value="All">{t("support.allPriorities", { fallback: "All Priorities" })}</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
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
              <LifeBuoy size={48} className="mb-4 opacity-20" />
              <p className="font-bold text-lg text-gray-500">{t("support.noRequests", { fallback: "No requests found" })}</p>
              <p className="text-sm">{t("support.noRequestsSub", { fallback: "Try adjusting your filters or create a new request." })}</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">{t("support.requestId", { fallback: "Request ID" })}</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">{t("common.category", { fallback: "Category" })}</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">{t("common.title", { fallback: "Title" })}</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">{t("common.priority", { fallback: "Priority" })}</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">{t("common.created", { fallback: "Created" })}</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">{t("common.status", { fallback: "Status" })}</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">{t("common.actions", { fallback: "Actions" })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold font-mono text-gray-500">{req.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-[#03045e]">{req.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900 w-full flex-1 min-w-0 md:max-w-[250px] truncate">{req.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${getPriorityColor(req.priority)}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                          {req.status}
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

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsCreateModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full w-[95vw] md:w-[90vw] lg:max-w-xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                  <Plus className="text-[#0077b6]" size={20} />
                  {t("support.createTitle", { fallback: "Create Support Request" })}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("common.category", { fallback: "Category" })} <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#0077b6] outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("common.priority", { fallback: "Priority" })} <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#0077b6] outline-none"
                    >
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("common.title", { fallback: "Title" })} <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#0077b6] outline-none"
                  />
                </div>

                {formData.category === "Complaint" && (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 space-y-4">
                    <h4 className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle size={14} /> {t("support.complaintDetails", { fallback: "Complaint Details" })}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-rose-600">{t("support.complaintAgainstType", { fallback: "Complaint Against Type" })}</label>
                        <select
                          value={formData.complaintAgainstType}
                          onChange={(e) => setFormData({ ...formData, complaintAgainstType: e.target.value })}
                          className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                        >
                          {COMPLAINT_TARGETS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-rose-600">{t("support.againstDetails", { fallback: "Against ID / Name / Detail" })}</label>
                        <input
                          type="text"
                          required
                          value={formData.complaintAgainstId}
                          onChange={(e) => setFormData({ ...formData, complaintAgainstId: e.target.value })}
                          placeholder="e.g. TCH-004 or Room 102"
                          className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("support.description", { fallback: "Description" })} <span className="text-rose-500">*</span></label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide detailed information here..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0077b6] outline-none resize-none"
                  />
                </div>

                {(formData.category === "Complaint" || formData.category === "Feedback") && (
                  <label className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.anonymous}
                      onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                      className="w-4 h-4 text-[#0077b6] rounded border-gray-300 focus:ring-[#0077b6]"
                    />
                    <span className="text-sm font-bold text-gray-700">{t("support.submitAnonymous", { fallback: "Submit Anonymously" })}</span>
                  </label>
                )}

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {t("common.cancel", { fallback: "Cancel" })}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-colors ${
                      submitting ? "bg-blue-400 cursor-not-allowed shadow-none" : "bg-[#0077b6] hover:bg-[#023e8a] shadow-blue-500/20"
                    }`}
                  >
                    {submitting ? t("support.submitting", { fallback: "Submitting..." }) : t("support.submitRequest", { fallback: "Submit Request" })}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="relative bg-white w-full w-[95vw] md:w-[90vw] lg:max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <LifeBuoy size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#03045e]">{t("support.requestDetails", { fallback: "Request Details" })}</h3>
                    <p className="text-xs font-mono text-gray-500">{viewRequest.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewRequest(null)}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Meta Row */}
                <div className="flex flex-wrap gap-4">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getPriorityColor(viewRequest.priority)}`}>
                    Priority: {viewRequest.priority}
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(viewRequest.status)}`}>
                    Status: {viewRequest.status}
                  </div>
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                    Category: {viewRequest.category}
                  </div>
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                    Created: {new Date(viewRequest.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-black text-[#03045e] mb-2">{viewRequest.title}</h4>
                    <p className="text-sm font-medium text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100 whitespace-pre-wrap">
                      {viewRequest.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">{t("support.requester", { fallback: "Requester" })}</p>
                      {viewRequest.anonymous && (viewRequest.category === "Complaint" || viewRequest.category === "Feedback") ? (
                        <p className="font-bold text-[#03045e]">{t("support.anonymousSubmission", { fallback: "Anonymous Submission" })}</p>
                      ) : (
                        <div>
                          <p className="font-bold text-[#03045e]">{viewRequest.requesterName}</p>
                          <p className="text-xs font-medium text-blue-600">{viewRequest.requesterType}</p>
                        </div>
                      )}
                    </div>

                    {viewRequest.category === "Complaint" && viewRequest.complaintAgainstType && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                        <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">{t("support.complaintAgainst", { fallback: "Complaint Against" })}</p>
                        <p className="font-bold text-rose-900">{viewRequest.complaintAgainstId}</p>
                        <p className="text-xs font-medium text-rose-600">{viewRequest.complaintAgainstType}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
