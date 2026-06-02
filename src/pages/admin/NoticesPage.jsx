import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  getNotices,
  updateNotice,
  createNotice,
  deleteNotice,
} from "../../services/noticeService";
import {
  NOTICE_STATUS,
  NOTICE_PRIORITIES,
  NOTICE_CATEGORIES,
  AUDIENCE_TYPES,
} from "../../mockDB/seed/notices";
import {
  Bell,
  Filter,
  Archive,
  Copy,
  X,
  Send,
  Calendar,
  Eye,
  Trash,
  Edit,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AdminFilterBar from "../../components/admin/AdminFilterBar";
import MainCard from "../../components/MainCard";
import AdminEditForm from "../../components/admin/AdminEditForm";
import ConfirmationModal from "../../components/shared/ConfirmationModal";
import ToastNotification from "../../components/shared/ToastNotification";
import LoadingSkeleton from "../../components/shared/LoadingSkeleton";
import ChartWrapper from "../../components/shared/ChartWrapper";

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [selectedNotices, setSelectedNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // CRUD state
  const [addNoticeOpen, setAddNoticeOpen] = useState(false);
  const [editNotice, setEditNotice] = useState(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    noticeId: null,
    noticeTitle: "",
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    notices,
    filterStatus,
    filterCategory,
    filterPriority,
    filterModule,
    dateRange,
  ]);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const allNotices = await getNotices();
      setNotices(allNotices);
    } catch (error) {
      console.error("Failed to load notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notices];

    if (filterStatus !== "all") {
      filtered = filtered.filter((n) => n.status === filterStatus);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((n) => n.category === filterCategory);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((n) => n.priority === filterPriority);
    }

    if (filterModule !== "all") {
      filtered = filtered.filter((n) => n.sourceModule === filterModule);
    }

    if (dateRange.start) {
      filtered = filtered.filter(
        (n) => new Date(n.createdAt) >= new Date(dateRange.start),
      );
    }

    if (dateRange.end) {
      filtered = filtered.filter(
        (n) => new Date(n.createdAt) <= new Date(dateRange.end),
      );
    }

    setFilteredNotices(filtered);
  };

  const handleSelectNotice = (noticeId) => {
    setSelectedNotices((prev) =>
      prev.includes(noticeId)
        ? prev.filter((id) => id !== noticeId)
        : [...prev, noticeId],
    );
  };

  const handleSelectAll = () => {
    if (selectedNotices.length === filteredNotices.length) {
      setSelectedNotices([]);
    } else {
      setSelectedNotices(filteredNotices.map((n) => n.id));
    }
  };

  const handleBulkAction = async (action) => {
    try {
      for (const noticeId of selectedNotices) {
        const notice = notices.find((n) => n.id === noticeId);
        if (!notice) continue;

        switch (action) {
          case "archive": {
            await updateNotice(noticeId, { status: "archived" });
            break;
          }
          case "duplicate": {
            const duplicated = {
              ...notice,
              id: undefined,
              title: `${notice.title} (Copy)`,
              status: "draft",
              readReceipts: [],
              createdAt: new Date().toISOString(),
            };
            await createNotice(duplicated);
            break;
          }
          case "cancel": {
            await updateNotice(noticeId, { status: "cancelled" });
            break;
          }
          case "publish": {
            await updateNotice(noticeId, {
              status: NOTICE_STATUS.PUBLISHED,
              publishedAt: new Date().toISOString(),
            });
            break;
          }
          case "schedule": {
            const scheduledDate = prompt("Enter scheduled date (YYYY-MM-DD):");
            if (scheduledDate) {
              await updateNotice(noticeId, {
                status: "scheduled",
                publishedAt: new Date(scheduledDate).toISOString(),
              });
            }
            break;
          }
        }
      }
      await loadNotices();
      setSelectedNotices([]);
      setToast({
        show: true,
        message: "Bulk action completed",
        type: "success",
      });
    } catch (error) {
      console.error(`Failed to ${action} notices:`, error);
      setToast({
        show: true,
        message: `Failed to ${action} notices`,
        type: "error",
      });
    }
  };

  const handleAddNotice = async (formData) => {
    try {
      const newNotice = await createNotice(formData);
      // Optimistic update
      setNotices((prev) => [...prev, newNotice]);
      setAddNoticeOpen(false);
      setToast({
        show: true,
        message: "Notice created successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to create notice",
        type: "error",
      });
    }
  };

  const handleUpdateNotice = async (formData) => {
    if (!editNotice) return;
    try {
      const updated = await updateNotice(editNotice.id, formData);
      // Optimistic update
      setNotices((prev) =>
        prev.map((n) => (n.id === editNotice.id ? { ...n, ...updated } : n)),
      );
      setEditNotice(null);
      setToast({
        show: true,
        message: "Notice updated successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to update notice",
        type: "error",
      });
    }
  };

  const handleDeleteClick = (notice) => {
    setDeleteConfirm({
      isOpen: true,
      noticeId: notice.id,
      noticeTitle: notice.title,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteNotice(deleteConfirm.noticeId);
      // Optimistic update (hard delete)
      setNotices((prev) => prev.filter((n) => n.id !== deleteConfirm.noticeId));
      setDeleteConfirm({ isOpen: false, noticeId: null, noticeTitle: "" });
      setToast({
        show: true,
        message: "Notice deleted successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to delete notice",
        type: "error",
      });
    }
  };

  // Form defaults (in page, NOT separate utils file)
  const noticeFormDefaults = {
    title: "",
    content: "",
    category: NOTICE_CATEGORIES.GENERAL,
    priority: NOTICE_PRIORITIES.NORMAL,
    status: "draft",
    targetAudience: { type: AUDIENCE_TYPES.ALL },
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case NOTICE_PRIORITIES.CRITICAL:
        return "bg-red-100 text-red-800";
      case NOTICE_PRIORITIES.URGENT:
        return "bg-orange-100 text-orange-800";
      case NOTICE_PRIORITIES.IMPORTANT:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case NOTICE_STATUS.PUBLISHED:
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-purple-100 text-purple-800";
      case "archived":
        return "bg-slate-100 text-slate-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateReadPercentage = (notice) => {
    const totalRecipients = estimateRecipients(notice);
    const readCount = notice.readReceipts?.length || 0;
    return totalRecipients > 0
      ? Math.round((readCount / totalRecipients) * 100)
      : 0;
  };

  const estimateRecipients = (notice) => {
    if (notice.targetAudience?.type === AUDIENCE_TYPES.ALL) return 500;
    if (notice.targetAudience?.type === AUDIENCE_TYPES.CLASS) {
      return (notice.targetAudience.classIds?.length || 1) * 40;
    }
    if (notice.targetAudience?.type === AUDIENCE_TYPES.SPECIFIC) {
      return (
        (notice.targetAudience.studentIds?.length || 0) +
        (notice.targetAudience.parentIds?.length || 0) +
        (notice.targetAudience.teacherIds?.length || 0)
      );
    }
    return 50;
  };

  // Component-level analytics (no service, read-only derivation)
  const analytics = useMemo(() => {
    const published = notices.filter(
      (n) => n.status === NOTICE_STATUS.PUBLISHED,
    ).length;
    const draft = notices.filter((n) => n.status === "draft").length;
    const scheduled = notices.filter((n) => n.status === "scheduled").length;
    const archived = notices.filter((n) => n.status === "archived").length;

    // Priority distribution
    const priorityCounts = notices.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {});

    // Category distribution
    const categoryCounts = notices.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total: notices.length,
      published,
      draft,
      scheduled,
      archived,
      priorityCounts,
      categoryCounts,
    };
  }, [notices]);

  // Chart data (component-level, no service)
  const statusDistributionData = useMemo(
    () => [
      { name: "Published", value: analytics.published },
      { name: "Draft", value: analytics.draft },
      { name: "Scheduled", value: analytics.scheduled },
      { name: "Archived", value: analytics.archived },
    ],
    [
      analytics.published,
      analytics.draft,
      analytics.scheduled,
      analytics.archived,
    ],
  );

  const priorityDistributionData = useMemo(() => {
    return Object.entries(analytics.priorityCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [analytics.priorityCounts]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-12"
      >
        <AdminPageHeader
          title="Notice Management"
          description="Manage institutional communication and broadcast notices"
          breadcrumbs={["Admin", "Notices"]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <LoadingSkeleton variant="stat-card" />
          <LoadingSkeleton variant="stat-card" />
          <LoadingSkeleton variant="stat-card" />
        </div>
        <MainCard>
          <LoadingSkeleton variant="table-row" count={5} />
        </MainCard>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notice Management"
        description="Manage institutional communication and broadcast notices"
        breadcrumbs={["Admin", "Notices"]}
        actionButton={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAddNoticeOpen(true)}
            className="px-5 py-2.5 bg-[#0077b6] text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#03045e] transition-colors flex items-center gap-2 shadow-lg shadow-[#0077b6]/20"
          >
            <Bell size={16} />
            Create Notice
          </motion.button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatCard
          title="Published"
          value={analytics.published.toString()}
          icon={Bell}
          color="#10b981"
          bg="#d1fae5"
          badgeText="Active"
          badgeType="success"
        />
        <AdminStatCard
          title="Draft"
          value={analytics.draft.toString()}
          icon={Filter}
          color="#6b7280"
          bg="#f3f4f6"
          badgeText="Pending"
          badgeType="neutral"
        />
        <AdminStatCard
          title="Scheduled"
          value={analytics.scheduled.toString()}
          icon={Calendar}
          color="#8b5cf6"
          bg="#ede9fe"
          badgeText="Upcoming"
          badgeType="info"
        />
        <AdminStatCard
          title="Archived"
          value={analytics.archived.toString()}
          icon={Archive}
          color="#64748b"
          bg="#f1f5f9"
          badgeText="History"
          badgeType="neutral"
        />
      </div>



      <MainCard className="p-6">
        <AdminFilterBar
          searchTerm=""
          onSearchChange={() => {}}
          placeholder="Search notices..."
          filterButton={
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-2 ${
                showFilters
                  ? "bg-[#0077b6] text-white"
                  : "bg-[#caf0f8]/20 text-[#0077b6] border border-[#caf0f8]/50"
              }`}
            >
              <Filter size={16} />
              Filters
            </motion.button>
          }
          additionalControls={
            selectedNotices.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {selectedNotices.length} selected
                </span>
                {[
                  { action: "archive", icon: Archive },
                  { action: "duplicate", icon: Copy },
                  { action: "cancel", icon: X },
                  { action: "publish", icon: Send },
                  { action: "schedule", icon: Calendar },
                ].map(({ action, icon: Icon }) => (
                  <motion.button
                    key={action}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleBulkAction(action)}
                    className="p-2 rounded-xl bg-[#caf0f8]/20 text-[#0077b6] hover:bg-[#0077b6] hover:text-white transition-colors"
                    title={action.charAt(0).toUpperCase() + action.slice(1)}
                  >
                    <Icon size={16} />
                  </motion.button>
                ))}
              </div>
            )
          }
        />

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-[#caf0f8]/30"
          >
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] transition-colors"
            >
              <option value="all">All Status</option>
              <option value={NOTICE_STATUS.PUBLISHED}>Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] transition-colors"
            >
              <option value="all">All Categories</option>
              {Object.values(NOTICE_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] transition-colors"
            >
              <option value="all">All Priorities</option>
              {Object.values(NOTICE_PRIORITIES).map((pri) => (
                <option key={pri} value={pri}>
                  {pri}
                </option>
              ))}
            </select>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] transition-colors"
            >
              <option value="all">All Modules</option>
              <option value="examinations">Examinations</option>
              <option value="attendance">Attendance</option>
              <option value="finance">Finance</option>
              <option value="administrative">Administrative</option>
              <option value="transport">Transport</option>
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="px-4 py-2.5 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] transition-colors"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="px-4 py-2.5 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] transition-colors"
              />
            </div>
          </motion.div>
        )}
      </MainCard>

      <MainCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#caf0f8]/30">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedNotices.length === filteredNotices.length}
                    onChange={handleSelectAll}
                    className="rounded accent-[#0077b6]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Read %
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#caf0f8]/30">
              {filteredNotices.map((notice, index) => (
                <motion.tr
                  key={notice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-[#caf0f8]/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedNotices.includes(notice.id)}
                      onChange={() => handleSelectNotice(notice.id)}
                      className="rounded accent-[#0077b6]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-black text-[#03045e] text-sm">
                      {notice.title}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate max-w-xs font-semibold">
                      {notice.message}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-full bg-[#caf0f8]/30 text-[#0077b6]">
                      {notice.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${getPriorityColor(notice.priority)}`}
                    >
                      {notice.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${getStatusColor(notice.status)}`}
                    >
                      {notice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#caf0f8]/30 rounded-full h-1.5">
                        <div
                          className="bg-[#0077b6] h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${calculateReadPercentage(notice)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-[#0077b6]">
                        {calculateReadPercentage(notice)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-gray-500 font-semibold">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          /* TODO: View analytics */
                        }}
                        className="p-1.5 rounded-lg bg-[#caf0f8]/20 text-[#0077b6] hover:bg-[#0077b6] hover:text-white transition-colors"
                        title="View Analytics"
                      >
                        <Eye size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditNotice(notice)}
                        className="p-1.5 rounded-lg bg-[#caf0f8]/20 text-[#0077b6] hover:bg-[#0077b6] hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(notice)}
                        className="p-1.5 rounded-lg bg-[#fef3c7]/20 text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white transition-colors"
                        title="Delete"
                      >
                        <Trash size={14} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredNotices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Bell size={48} className="mx-auto text-[#caf0f8] mb-4" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              No notices found matching the current filters
            </p>
          </motion.div>
        )}
      </MainCard>

      {/* Add Notice Modal */}
      <AdminEditForm
        isOpen={addNoticeOpen}
        onClose={() => setAddNoticeOpen(false)}
        title="Create New Notice"
        data={noticeFormDefaults}
        fields={[
          {
            name: "title",
            label: "Notice Title",
            type: "text",
            required: true,
          },
          {
            name: "content",
            label: "Notice Content",
            type: "textarea",
            required: true,
          },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: Object.values(NOTICE_CATEGORIES),
            required: true,
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: Object.values(NOTICE_PRIORITIES),
            required: true,
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["draft", NOTICE_STATUS.PUBLISHED, "scheduled"],
            required: true,
          },
        ]}
        onSubmit={handleAddNotice}
      />

      {/* Edit Notice Modal */}
      <AdminEditForm
        isOpen={!!editNotice}
        onClose={() => setEditNotice(null)}
        title="Edit Notice"
        data={editNotice}
        fields={[
          {
            name: "title",
            label: "Notice Title",
            type: "text",
            required: true,
          },
          {
            name: "content",
            label: "Notice Content",
            type: "textarea",
            required: true,
          },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: Object.values(NOTICE_CATEGORIES),
            required: true,
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: Object.values(NOTICE_PRIORITIES),
            required: true,
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              "draft",
              NOTICE_STATUS.PUBLISHED,
              "scheduled",
              "archived",
              "cancelled",
            ],
            required: true,
          },
        ]}
        onSubmit={handleUpdateNotice}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Notice"
        message={`Are you sure you want to delete ${deleteConfirm.noticeTitle}? This action cannot be undone.`}
        warningText=""
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteConfirm({ isOpen: false, noticeId: null, noticeTitle: "" })
        }
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />

      {/* Toast Notification */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default NoticesPage;
