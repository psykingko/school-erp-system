import { useState, useEffect } from "react";
import {
  getNotices,
  updateNotice,
  deleteNotice,
  NOTICE_STATUS,
  NOTICE_PRIORITIES,
  NOTICE_CATEGORIES,
  AUDIENCE_TYPES,
} from "../../services/noticeService";
import { getDataProvider } from "../../data";
import { Bell, Filter, Archive, Copy, X, Send, Calendar, Eye, CheckCircle, AlertCircle } from "lucide-react";
import PermissionGate from "../../components/admin/PermissionGate";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";

const NoticeManagementPage = () => {
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

  // Statistics
  const [stats, setStats] = useState({
    published: 0,
    draft: 0,
    scheduled: 0,
    archived: 0,
    unreadPercentage: 0,
  });

  useEffect(() => {
    loadNotices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notices, filterStatus, filterCategory, filterPriority, filterModule, dateRange]);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const allNotices = await getNotices();
      setNotices(allNotices);
      calculateStats(allNotices);
    } catch (error) {
      console.error("Failed to load notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (noticeList) => {
    const published = noticeList.filter((n) => n.status === NOTICE_STATUS.PUBLISHED).length;
    const draft = noticeList.filter((n) => n.status === "draft").length;
    const scheduled = noticeList.filter((n) => n.status === "scheduled").length;
    const archived = noticeList.filter((n) => n.status === "archived").length;

    // Calculate unread percentage
    const totalReceipts = noticeList.reduce((sum, n) => sum + (n.readReceipts?.length || 0), 0);
    const totalPossible = noticeList.length * 100; // Simplified calculation
    const unreadPercentage = totalPossible > 0 ? ((totalPossible - totalReceipts) / totalPossible) * 100 : 0;

    setStats({
      published,
      draft,
      scheduled,
      archived,
      unreadPercentage: Math.round(unreadPercentage),
    });
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
      filtered = filtered.filter((n) => new Date(n.createdAt) >= new Date(dateRange.start));
    }

    if (dateRange.end) {
      filtered = filtered.filter((n) => new Date(n.createdAt) <= new Date(dateRange.end));
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
          case "archive":
            await updateNotice(noticeId, { status: "archived" });
            break;
          case "duplicate":
            const duplicated = {
              ...notice,
              id: undefined,
              title: `${notice.title} (Copy)`,
              status: "draft",
              readReceipts: [],
              createdAt: new Date().toISOString(),
            };
            await updateNotice(undefined, duplicated);
            break;
          case "cancel":
            await updateNotice(noticeId, { status: "cancelled" });
            break;
          case "publish":
            await updateNotice(noticeId, {
              status: NOTICE_STATUS.PUBLISHED,
              publishedAt: new Date().toISOString(),
            });
            break;
          case "schedule":
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
      await loadNotices();
      setSelectedNotices([]);
    } catch (error) {
      console.error(`Failed to ${action} notices:`, error);
    }
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
    return totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0;
  };

  const estimateRecipients = (notice) => {
    // Simplified estimation - in production, this would use actual audience resolution
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Management</h1>
          <p className="text-gray-600 mt-1">Manage institutional communication</p>
        </div>
        <PermissionGate moduleId="admin_notices" permission="create" mode="hidden">
          <button
            onClick={() => {/* TODO: Open create notice modal */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Bell size={20} />
            Create Notice
          </button>
        </PermissionGate>
      </div>
      <PageAuthorityBanner moduleId="admin_notices" moduleName="Notice Management" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard label="Published" value={stats.published} color="green" />
        <StatCard label="Draft" value={stats.draft} color="gray" />
        <StatCard label="Scheduled" value={stats.scheduled} color="purple" />
        <StatCard label="Archived" value={stats.archived} color="slate" />
        <StatCard label="Unread %" value={`${stats.unreadPercentage}%`} color="orange" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <Filter size={20} />
            Filters
          </button>
          {selectedNotices.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedNotices.length} selected
              </span>
              <PermissionGate moduleId="admin_notices" permission="edit" mode="hidden">
                <div className="flex items-center gap-2">
                  <BulkActionButton
                    action="archive"
                    onClick={() => handleBulkAction("archive")}
                    icon={Archive}
                  />
                  <BulkActionButton
                    action="duplicate"
                    onClick={() => handleBulkAction("duplicate")}
                    icon={Copy}
                  />
                  <BulkActionButton
                    action="cancel"
                    onClick={() => handleBulkAction("cancel")}
                    icon={X}
                  />
                  <BulkActionButton
                    action="publish"
                    onClick={() => handleBulkAction("publish")}
                    icon={Send}
                  />
                  <BulkActionButton
                    action="schedule"
                    onClick={() => handleBulkAction("schedule")}
                    icon={Calendar}
                  />
                </div>
              </PermissionGate>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg"
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
              className="px-3 py-2 border rounded-lg"
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
              className="px-3 py-2 border rounded-lg"
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
              className="px-3 py-2 border rounded-lg"
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
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notices Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto w-full">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedNotices.length === filteredNotices.length}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Priority</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Read %</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredNotices.map((notice) => (
              <tr key={notice.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedNotices.includes(notice.id)}
                    onChange={() => handleSelectNotice(notice.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{notice.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {notice.message}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {notice.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notice.priority)}`}>
                    {notice.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(notice.status)}`}>
                    {notice.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${calculateReadPercentage(notice)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {calculateReadPercentage(notice)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {/* TODO: View analytics */}}
                      className="p-1 text-gray-600 hover:text-gray-900"
                      title="View Analytics"
                    >
                      <Eye size={18} />
                    </button>
                    <PermissionGate moduleId="admin_notices" permission="edit" mode="hidden">
                      <button
                        onClick={() => {/* TODO: Edit notice */}}
                        className="p-1 text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </PermissionGate>
                    <PermissionGate moduleId="admin_notices" permission="delete" mode="hidden">
                      <button
                        onClick={() => {/* TODO: Delete notice */}}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <AlertCircle size={18} />
                      </button>
                    </PermissionGate>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredNotices.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No notices found matching the current filters
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => {
  const colorClasses = {
    green: "bg-green-50 border-green-200",
    gray: "bg-gray-50 border-gray-200",
    purple: "bg-purple-50 border-purple-200",
    slate: "bg-slate-50 border-slate-200",
    orange: "bg-orange-50 border-orange-200",
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color] || colorClasses.gray}`}>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
};

const BulkActionButton = ({ action, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
    title={action.charAt(0).toUpperCase() + action.slice(1)}
  >
    <Icon size={18} />
  </button>
);

export default NoticeManagementPage;
