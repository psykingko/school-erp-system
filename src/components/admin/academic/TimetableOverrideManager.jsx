import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  Clock,
  User,
  MapPin,
  Trash2,
  Edit,
  X,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { timetableOverrideService } from "../../../services/timetable";
import PropTypes from "prop-types";

const OVERRIDE_TYPES = [
  { value: "holiday", label: "Holiday", icon: Calendar, color: "red" },
  { value: "half_day", label: "Half Day", icon: Clock, color: "amber" },
  { value: "exam_day", label: "Exam Day", icon: ShieldCheck, color: "blue" },
  {
    value: "special_event",
    label: "Special Event",
    icon: Calendar,
    color: "purple",
  },
  {
    value: "teacher_substitution",
    label: "Teacher Substitution",
    icon: User,
    color: "orange",
  },
  {
    value: "custom_override",
    label: "Custom Schedule",
    icon: MapPin,
    color: "gray",
  },
];

const TARGET_SCOPES = [
  { value: "institution", label: "Entire Institution" },
  { value: "grade", label: "Specific Grade" },
  { value: "class", label: "Specific Class" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "gray" },
  { value: "active", label: "Active", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
  { value: "expired", label: "Expired", color: "gray" },
];

// ── Override Form Modal ────────────────────────────────────────────────────────

function OverrideFormModal({ override, classes, teachers, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: override?.id || `override-${Date.now()}`,
    type: override?.type || "holiday",
    targetScope: override?.targetScope || "institution",
    targetIds: override?.targetIds || [],
    effectiveRange: {
      start: override?.effectiveRange?.start || "",
      end: override?.effectiveRange?.end || "",
    },
    status: override?.status || "active",
    payload: override?.payload || {},
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await timetableOverrideService.saveOverride(formData);
      onSave("Override saved successfully", "success");
    } catch (error) {
      console.error("Save error:", error);
      onSave(error.message || "Failed to save override", "error");
    } finally {
      setLoading(false);
    }
  };

  const updatePayload = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      payload: { ...prev.payload, [key]: value },
    }));
  };

  const updateEffectiveRange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      effectiveRange: { ...prev.effectiveRange, [key]: value },
    }));
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case "holiday":
        return (
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Holiday Name
            </label>
            <input
              type="text"
              value={formData.payload.name || ""}
              onChange={(e) => updatePayload("name", e.target.value)}
              placeholder="e.g. Diwali, Independence Day"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors placeholder:font-normal placeholder:text-gray-300"
            />
          </div>
        );

      case "half_day":
        return (
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Max Period
            </label>
            <select
              value={formData.payload.maxPeriod || "P4"}
              onChange={(e) => updatePayload("maxPeriod", e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
            >
              <option value="P1">P1 (08:00–08:50)</option>
              <option value="P2">P2 (08:50–09:40)</option>
              <option value="P3">P3 (09:40–10:30)</option>
              <option value="P4">P4 (10:30–11:20)</option>
              <option value="P5">P5 (11:50–12:40)</option>
              <option value="P6">P6 (12:40–13:30)</option>
              <option value="P7">P7 (13:30–14:20)</option>
              <option value="P8">P8 (14:20–15:10)</option>
            </select>
          </div>
        );

      case "teacher_substitution":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Target Period
              </label>
              <select
                value={formData.payload.targetPeriod || "P1"}
                onChange={(e) => updatePayload("targetPeriod", e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
              >
                {["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Substitute Teacher
              </label>
              <select
                value={formData.payload.substitutedTeacherId || ""}
                onChange={(e) =>
                  updatePayload("substitutedTeacherId", e.target.value)
                }
                className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
              >
                <option value="">— Select Substitute —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Original Teacher (Optional)
              </label>
              <select
                value={formData.payload.originalTeacherId || ""}
                onChange={(e) =>
                  updatePayload("originalTeacherId", e.target.value)
                }
                className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
              >
                <option value="">— Any Teacher —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case "exam_day":
      case "special_event":
        return (
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Event Name
            </label>
            <input
              type="text"
              value={formData.payload.name || ""}
              onChange={(e) => updatePayload("name", e.target.value)}
              placeholder="e.g. Mid-Term Exam, Annual Sports Day"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors placeholder:font-normal placeholder:text-gray-300"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(3,4,94,0.35)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#03045e] px-6 py-5 flex items-start justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] font-black text-[#caf0f8]/70 uppercase tracking-widest">
              {override ? "Edit Override" : "New Override"}
            </p>
            <h3 className="text-base font-black text-white mt-1">
              {OVERRIDE_TYPES.find((t) => t.value === formData.type)?.label}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Override Type */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Override Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {OVERRIDE_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: type.value }))
                    }
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black transition-all ${
                      formData.type === type.value
                        ? `bg-${type.color}-100 border-2 border-${type.color}-500 text-${type.color}-700`
                        : "bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={14} />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Scope */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Target Scope
            </label>
            <select
              value={formData.targetScope}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  targetScope: e.target.value,
                  targetIds: [],
                }))
              }
              className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
            >
              {TARGET_SCOPES.map((scope) => (
                <option key={scope.value} value={scope.value}>
                  {scope.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target IDs (conditional) */}
          {formData.targetScope !== "institution" && (
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                {formData.targetScope === "grade"
                  ? "Select Grades"
                  : "Select Classes"}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-[#caf0f8] rounded-2xl bg-gray-50">
                {(formData.targetScope === "grade"
                  ? [...new Set(classes.map((c) => c.level || c.grade))]
                  : classes
                ).map((item) => (
                  <label
                    key={formData.targetScope === "grade" ? item : item.id}
                    className="flex items-center gap-2 text-xs font-bold text-[#03045e]"
                  >
                    <input
                      type="checkbox"
                      checked={formData.targetIds.includes(
                        formData.targetScope === "grade" ? item : item.id,
                      )}
                      onChange={(e) => {
                        const value =
                          formData.targetScope === "grade" ? item : item.id;
                        setFormData((prev) => ({
                          ...prev,
                          targetIds: e.target.checked
                            ? [...prev.targetIds, value]
                            : prev.targetIds.filter((id) => id !== value),
                        }));
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-[#0077b6] focus:ring-[#0077b6]"
                    />
                    {formData.targetScope === "grade"
                      ? `Class ${item}`
                      : item.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={formData.effectiveRange.start}
                onChange={(e) => updateEffectiveRange("start", e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.effectiveRange.end}
                onChange={(e) => updateEffectiveRange("end", e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type-Specific Fields */}
          {renderTypeSpecificFields()}
        </form>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center gap-2 flex-shrink-0">
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-2xl text-xs font-black transition-all bg-[#03045e] text-white hover:bg-[#0077b6] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "SAVE OVERRIDE"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-xs font-black border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            CANCEL
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

OverrideFormModal.propTypes = {
  override: PropTypes.object,
  classes: PropTypes.array.isRequired,
  teachers: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

// ── Override List Item ─────────────────────────────────────────────────────────

function OverrideItem({ override, onEdit, onDelete }) {
  const typeConfig =
    OVERRIDE_TYPES.find((t) => t.value === override.type) || OVERRIDE_TYPES[0];
  const statusConfig =
    STATUS_OPTIONS.find((s) => s.value === override.status) ||
    STATUS_OPTIONS[0];
  const Icon = typeConfig.icon;

  const getScopeLabel = () => {
    if (override.targetScope === "institution") return "Entire Institution";
    if (override.targetScope === "grade")
      return `Grade(s): ${override.targetIds.join(", ")}`;
    return `Class(es): ${override.targetIds.length} selected`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#caf0f8] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`p-2 rounded-xl bg-${typeConfig.color}-100 text-${typeConfig.color}-600`}
          >
            <Icon size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-xs font-black text-[#03045e]">
                {typeConfig.label}
              </h4>
              <span
                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-${statusConfig.color}-100 text-${statusConfig.color}-700`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-gray-500 mb-2">
              {getScopeLabel()}
            </p>
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {override.effectiveRange.start}
                {override.effectiveRange.end &&
                  ` → ${override.effectiveRange.end}`}
              </span>
              <span className="flex items-center gap-1">
                Priority: {override.priority}
              </span>
            </div>
            {override.payload?.name && (
              <p className="text-[10px] font-bold text-[#0077b6] mt-2">
                {override.payload.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(override)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#0077b6] transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(override.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

OverrideItem.propTypes = {
  override: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function TimetableOverrideManager({ classes, teachers }) {
  const [overrides, setOverrides] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOverride, setEditingOverride] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadOverrides = async () => {
    try {
      const data = await timetableOverrideService.getOverrides();
      setOverrides(data);
    } catch (error) {
      console.error("Failed to load overrides:", error);
    }
  };

  useEffect(() => {
    loadOverrides();
  }, []);

  const handleSave = async (message, type) => {
    setToast({ show: true, message, type });
    setShowForm(false);
    setEditingOverride(null);
    await loadOverrides();
  };

  const handleDelete = async (overrideId) => {
    try {
      await timetableOverrideService.deleteOverride(overrideId);
      setToast({
        show: true,
        message: "Override deleted successfully",
        type: "success",
      });
      await loadOverrides();
    } catch (error) {
      console.error("Delete error:", error);
      setToast({
        show: true,
        message: "Failed to delete override",
        type: "error",
      });
    }
  };

  const filteredOverrides = overrides.filter((o) => {
    if (filterType !== "all" && o.type !== filterType) return false;
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-[#03045e]">
            Operational Overrides
          </h3>
          <p className="text-[10px] font-semibold text-gray-500 mt-1">
            Manage holidays, half-days, substitutions, and special events
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOverride(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-[#0077b6] text-white hover:bg-[#03045e] transition-colors"
        >
          <Plus size={14} />
          NEW OVERRIDE
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-[10px] font-bold text-gray-600 bg-white hover:border-[#caf0f8] transition-colors"
        >
          <option value="all">All Types</option>
          {OVERRIDE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-[10px] font-bold text-gray-600 bg-white hover:border-[#caf0f8] transition-colors"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="text-[10px] font-bold text-gray-400 ml-auto">
          {filteredOverrides.length} override
          {filteredOverrides.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Override List */}
      <div className="space-y-3">
        {filteredOverrides.length === 0 ? (
          <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-xs font-bold text-gray-400">
              No overrides found
            </p>
            <p className="text-[10px] text-gray-300 mt-1">
              Create your first operational override
            </p>
          </div>
        ) : (
          filteredOverrides.map((override) => (
            <OverrideItem
              key={override.id}
              override={override}
              onEdit={(o) => {
                setEditingOverride(o);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <OverrideFormModal
            override={editingOverride}
            classes={classes}
            teachers={teachers}
            onClose={() => {
              setShowForm(false);
              setEditingOverride(null);
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border z-[100] ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div
              className={`p-2 rounded-xl ${
                toast.type === "success"
                  ? "bg-emerald-200/50 text-emerald-700"
                  : "bg-red-200/50 text-red-700"
              }`}
            >
              {toast.type === "success" ? (
                <ShieldCheck size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
            </div>
            <p className="text-xs font-black">{toast.message}</p>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="ml-2 p-1.5 rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition-all"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

TimetableOverrideManager.propTypes = {
  classes: PropTypes.array.isRequired,
  teachers: PropTypes.array.isRequired,
};
