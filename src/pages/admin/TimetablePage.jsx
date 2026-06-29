import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  X,
  AlertTriangle,
  Trash2,
  ShieldCheck,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import TimetableGrid from "../../components/admin/academic/TimetableGrid";
import TimetableOverrideManager from "../../components/admin/academic/TimetableOverrideManager";
import MainCard from "../../components/MainCard";
import {
  adminTimetableService,
  teacherTimetableService,
} from "../../services/timetable";

const {
  initializeTimetables,
  resetTimetables,
  getClassTimetableFlat,
  saveTimetableSlot,
  clearTimetableSlot,
  publishTimetables,
  SUBJECT_DEFAULT_ROOMS,
  getTimetableDependencies,
} = adminTimetableService;

// ── Period labels for the edit modal ────────────────────────────────────────

const PERIOD_LABELS = {
  P1: "Period 1  (08:00–08:50)",
  P2: "Period 2  (08:50–09:40)",
  P3: "Period 3  (09:40–10:30)",
  P4: "Period 4  (10:30–11:20)",
  P5: "Period 5  (11:50–12:40)",
  P6: "Period 6  (12:40–13:30)",
  P7: "Period 7  (13:30–14:20)",
  P8: "Period 8  (14:20–15:10)",
  P9: "Period 9  (15:10–16:00)",
};

// ── Edit Slot Modal ──────────────────────────────────────────────────────────

function EditSlotModal({
  cell,
  classId,
  className,
  classOptions,
  classNamesMap,
  onClose,
  onSaved,
}) {
  const [subjectId, setSubjectId] = useState(
    cell.existingSlot?.subjectId || "",
  );
  const [room, setRoom] = useState(cell.existingSlot?.room || "");
  const [conflict, setConflict] = useState(null);
  const [saving, setSaving] = useState(false);

  const resolvedOption =
    classOptions.find((o) => o.subjectId === subjectId) || null;

  const isSharedSubject = subjectId && !!SUBJECT_DEFAULT_ROOMS[subjectId];

  // Auto-fill room when subject changes
  const handleSubjectChange = (id) => {
    setSubjectId(id);
    setConflict(null);
    if (SUBJECT_DEFAULT_ROOMS[id]) {
      setRoom(SUBJECT_DEFAULT_ROOMS[id]);
    } else {
      setRoom("");
    }
  };

  const handleSave = async () => {
    if (!resolvedOption) return;
    setSaving(true);

    try {
      const result = await saveTimetableSlot(
        classId,
        cell.day,
        cell.period,
        {
          subjectId: resolvedOption.subjectId,
          teacherId: resolvedOption.teacherId,
          subject: resolvedOption.subjectName,
          teacher: resolvedOption.teacherName,
          room: isSharedSubject ? room : null, // Send null for normal subjects so it inherits
        },
        classNamesMap,
      );

      if (result.warning) {
        setConflict(
          `${resolvedOption.teacherName} is already assigned to ${result.warning.className} at this period.`,
        );
      } else {
        onSaved("Slot saved successfully", "success");
      }
    } catch (error) {
      console.error("Save error:", error);
      onSaved(error.message || "Failed to save slot", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleForceSave = async () => {
    if (!resolvedOption) return;
    setSaving(true);

    try {
      await saveTimetableSlot(
        classId,
        cell.day,
        cell.period,
        {
          subjectId: resolvedOption.subjectId,
          teacherId: resolvedOption.teacherId,
          subject: resolvedOption.subjectName,
          teacher: resolvedOption.teacherName,
          room: room || "Room 101",
        },
        classNamesMap,
        true,
      );
      onSaved("Slot saved successfully (forced)", "success");
    } catch (error) {
      console.error("Force save error:", error);
      onSaved(error.message || "Failed to save slot", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearTimetableSlot(classId, cell.day, cell.period);
      onSaved("Slot cleared successfully", "success");
    } catch (error) {
      console.error("Clear error:", error);
      onSaved(error.message || "Failed to clear slot", "error");
    }
  };

  const isValid = !!resolvedOption;

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
        className="max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl w-full w-[95vw] md:w-[90vw] lg:max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#03045e] px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-[#caf0f8]/70 uppercase tracking-widest">
              {className} · {cell.day}
            </p>
            <h3 className="text-base font-black text-white mt-1">
              {PERIOD_LABELS[cell.period]}
            </h3>
            {cell.existingSlot && (
              <p className="text-[10px] text-[#caf0f8]/60 mt-1">
                Currently: {cell.existingSlot.subject} ·{" "}
                {cell.existingSlot.teacher}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Subject <span className="text-red-400">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
            >
              <option value="">— Select Subject —</option>
              {classOptions.map((o) => (
                <option key={o.subjectId} value={o.subjectId}>
                  {o.subjectName}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher — auto-resolved from Subject Allocation */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Teacher
              <span className="ml-2 text-[9px] font-bold text-emerald-500 normal-case tracking-normal">
                auto-resolved
              </span>
            </label>
            <div className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] bg-gray-50 text-xs font-bold text-[#03045e] min-h-[38px] flex items-center">
              {resolvedOption ? (
                resolvedOption.teacherName
              ) : (
                <span className="text-gray-300 font-normal">
                  Select a subject first
                </span>
              )}
            </div>
          </div>

          {/* Room - Only for Shared Subjects */}
          <AnimatePresence>
            {isSharedSubject && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                    Room / Venue
                    <span className="ml-2 text-[9px] font-bold text-emerald-500 normal-case tracking-normal">
                      shared facility override
                    </span>
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Physics Lab 1"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors placeholder:font-normal placeholder:text-gray-300"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conflict Warning */}
          <AnimatePresence>
            {conflict && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-200"
              >
                <AlertTriangle
                  size={15}
                  className="text-amber-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-[10px] font-black text-amber-700">
                    Draft Warning: Teacher Conflict Detected
                  </p>
                  <p className="text-[10px] font-semibold text-amber-600 mt-0.5 leading-relaxed">
                    {conflict}
                  </p>
                  <button
                    onClick={handleForceSave}
                    className="mt-2 text-[10px] font-black text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors"
                  >
                    Save as Draft Anyway →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center gap-2">
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="flex-1 py-2.5 rounded-2xl text-xs font-black transition-all bg-[#03045e] text-white hover:bg-[#0077b6] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "SAVE PERIOD"}
          </button>

          {/* Clear (only if slot is filled) */}
          {cell.existingSlot && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
              CLEAR
            </button>
          )}

          {/* Cancel */}
          <button
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

// ── Components ─────────────────────────────────────────────────────────────

const Toast = ({ message, type = "success", onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${
      type === "success"
        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
        : "bg-red-50 border-red-200 text-red-800"
    } z-[100]`}
  >
    <div
      className={`p-2 rounded-xl ${type === "success" ? "bg-emerald-200/50 text-emerald-700" : "bg-red-200/50 text-red-700"}`}
    >
      {type === "success" ? (
        <ShieldCheck size={18} />
      ) : (
        <AlertTriangle size={18} />
      )}
    </div>
    <p className="text-xs font-black">{message}</p>
    <button
      onClick={onClose}
      className="ml-2 p-1.5 rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition-all"
    >
      <X size={14} />
    </button>
  </motion.div>
);

// ── Main Page ────────────────────────────────────────────────────────────────

const TimetablePage = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dbTsAssignments, setDbTsAssignments] = useState([]);

  const [viewerType, setViewerType] = useState("class");
  const [selectedClassLevel, setSelectedClassLevel] = useState("11");
  const [selectedSection, setSelectedSection] = useState("A");

  const selectedClassId = useMemo(() => {
    const cls = classes.find((c) => {
      const level = c.level || c.classLevel || c.name?.split('-')[0];
      const section = c.section || c.name?.split('-')[1];
      return level === selectedClassLevel && section === selectedSection;
    });
    return cls ? cls.id : "";
  }, [classes, selectedClassLevel, selectedSection]);

  const classLevels = useMemo(() => {
    const levels = new Set();
    classes.forEach(c => {
      const level = c.level || c.classLevel || c.name?.split('-')[0];
      if (level) levels.add(level);
    });
    return Array.from(levels).sort((a,b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
    });
  }, [classes]);

  const availableSections = useMemo(() => {
    if (!selectedClassLevel) return [];
    const sections = new Set();
    classes.forEach(c => {
      const level = c.level || c.classLevel || c.name?.split('-')[0];
      if (level === selectedClassLevel) {
        const sec = c.section || c.name?.split('-')[1];
        if (sec) sections.add(sec);
      }
    });
    return Array.from(sections).sort();
  }, [classes, selectedClassLevel]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("teach-001");
  const [currentSchedule, setCurrentSchedule] = useState([]);
  const [activeTab, setActiveTab] = useState("timetable");

  const [editMode, setEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState(null); // { day, period, existingSlot }
  const [publishErrors, setPublishErrors] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const [initialized, setInitialized] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // ── Initial data load (one-time) ──────────────────────────────────────────

  useEffect(() => {
    const bootstrap = async () => {
      const deps = await getTimetableDependencies();

      setClasses(deps.classes || []);
      setTeachers(deps.teachers || []);
      setSubjects(deps.subjects || []);
      setDbTsAssignments(deps.tsAssignments || []);

      // Auto-initialize the timetable layout map if it is empty in storage
      await initializeTimetables();

      setInitialized(true);
    };
    bootstrap();
  }, []);

  // ── Load schedule from localStorage whenever selection changes ────────────

  const refreshSchedule = useCallback(async () => {
    if (!initialized) return;

    // Helper to resolve names
    const resolveNames = (s) => {
      const sub = subjects.find((x) => x.id === s.subjectId || x.subjectId === s.subjectId);
      const teach = teachers.find((x) => x.id === s.teacherId || x.teacherId === s.teacherId);

      let resolvedSubject = sub ? (sub.subjectName || sub.name) : s.subject;
      if (s.subjectId === "sub-homeroom") {
        resolvedSubject = "Homeroom / Class Teacher Period";
      }

      let resolvedTeacher = teach ? (teach.metadata?.name || teach.teacherName || teach.name) : s.teacher;

      return {
        ...s,
        subject: resolvedSubject,
        teacher: resolvedTeacher || s.teacher || "",
      };
    };

    if (viewerType === "teacher") {
      const schedule =
        await teacherTimetableService.getTeacherSchedule(selectedTeacherId);
      const flat = [];
      Object.entries(schedule).forEach(([day, daySchedule]) => {
        const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
        daySchedule.forEach((s) => {
          flat.push(
            resolveNames({
              ...s,
              day: capitalizedDay,
              period: s.periodNumber,
              teacherId: selectedTeacherId,
              room: s.room || s.roomId,
            }),
          );
        });
      });
      setCurrentSchedule(flat);
    } else {
      const targetClass = classes.find((c) => c.id === selectedClassId);
      const defaultRoom =
        targetClass?.roomNumber || targetClass?.fixedRoomId || "";

      const schedule = await getClassTimetableFlat(selectedClassId);
      const flat = schedule.map((s) =>
        resolveNames({
          ...s,
          classId: selectedClassId,
          room: s.room || s.roomId || defaultRoom,
        }),
      );
      setCurrentSchedule(flat);
    }
  }, [
    initialized,
    viewerType,
    selectedClassId,
    selectedTeacherId,
    subjects,
    teachers,
  ]);

  useEffect(() => {
    refreshSchedule();
  }, [refreshSchedule]);

  // ── Edit handlers ─────────────────────────────────────────────────────────

  const handleCellClick = (day, period, existingSlot) => {
    if (!editMode || viewerType !== "class") return;
    if (period === "P1") {
      alert(
        "Period 1 is locked for Class Teacher homeroom and cannot be manually edited.",
      );
      return;
    }
    setEditingCell({ day, period, existingSlot });
  };

  const handleModalSaved = () => {
    setEditingCell(null);
    refreshSchedule();
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const handleReset = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    setShowResetConfirm(false);
    await resetTimetables();
    refreshSchedule();
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const classOptions = useMemo(() => {
    const seen = new Set();
    const options = [];

    // 1. Try to get from TS assignments
    dbTsAssignments
      .filter((a) => a.classId === selectedClassId)
      .forEach((a) => {
        if (!seen.has(a.subjectId)) {
          seen.add(a.subjectId);
          const sub = subjects.find((s) => s.id === a.subjectId || s.subjectId === a.subjectId);
          const teach = teachers.find((t) => t.id === a.teacherId);
          if (sub && teach) {
            options.push({
              subjectId: a.subjectId,
              subjectName: sub.subjectName || sub.name,
              teacherId: a.teacherId,
              teacherName: teach.metadata?.name || teach.teacherName || teach.name,
            });
          }
        }
      });

    // 2. If empty, extract from current schedule
    if (options.length === 0 && currentSchedule.length > 0) {
      currentSchedule.forEach((slot) => {
        if (slot.subjectId && slot.subjectId !== "break" && !seen.has(slot.subjectId)) {
          seen.add(slot.subjectId);
          const sub = subjects.find((s) => s.id === slot.subjectId || s.subjectId === slot.subjectId);
          const teach = teachers.find((t) => t.id === slot.teacherId || t.teacherId === slot.teacherId);
          
          options.push({
            subjectId: slot.subjectId,
            subjectName: sub ? (sub.subjectName || sub.name) : slot.subject,
            teacherId: slot.teacherId,
            teacherName: teach ? (teach.metadata?.name || teach.teacherName || teach.name) : slot.teacher,
          });
        }
      });
    }

    // 3. If STILL empty, use subjects applicable to this class level
    if (options.length === 0 && selectedClass) {
      const classLevel = selectedClass.grade || selectedClass.level || selectedClass.classLevel;
      subjects.forEach(sub => {
        if (sub.applicableClasses?.includes(classLevel) && !seen.has(sub.subjectId || sub.id)) {
          seen.add(sub.subjectId || sub.id);
          options.push({
            subjectId: sub.subjectId || sub.id,
            subjectName: sub.subjectName || sub.name,
            teacherId: "teach-001",
            teacherName: "Assigned Teacher",
          });
        }
      });
    }

    return options;
  }, [selectedClassId, dbTsAssignments, subjects, teachers, currentSchedule, selectedClass]);

  const classNamesMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));

  const handlePublish = async () => {
    setIsPublishing(true);
    // Development mode bypasses completeness validation for testing
    const result = await adminTimetableService.publishClassTimetable(
      selectedClassId,
      { enforceCompleteness: false },
    );
    setIsPublishing(false);
    if (!result.success) {
      setPublishErrors(result.errors);
    } else {
      setPublishErrors([]);
      triggerToast(
        `Timetable for ${selectedClass?.name || selectedClassId} Published Successfully!`,
        "success",
      );
      refreshSchedule();
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
        title="Institutional Timetable"
        description="Set, edit, and inspect the weekly class schedule. Teacher assignments are owned by Subject Allocation — timetable only schedules when."
        breadcrumbs={["Admin Portal", "Academic", "Timetable"]}
        actionButton={
          <div className="flex items-center gap-2">
            {viewerType === "class" && (
              <>
                {/* Edit Toggle */}
                <button
                  onClick={() => {
                    setEditMode((m) => !m);
                    setEditingCell(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                    editMode
                      ? "bg-[#03045e] text-white shadow-lg shadow-[#03045e]/20"
                      : "border border-[#0077b6] text-[#0077b6] bg-white hover:bg-[#caf0f8]/20"
                  }`}
                >
                  <Pencil size={13} />
                  {editMode ? "EXIT EDIT" : "EDIT TIMETABLE"}
                </button>

                {/* Reset to default */}
                {editMode && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-black border border-red-200 text-red-500 bg-white hover:bg-red-50 transition-colors"
                    title="Reset to seeded defaults"
                  >
                    <RotateCcw size={13} />
                    RESET
                  </button>
                )}

                {/* Publish Class Timetable */}
                <button
                  disabled={isPublishing}
                  onClick={handlePublish}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-lg ${
                    isPublishing
                      ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                      : "bg-[#0077b6] text-white hover:bg-[#03045e] shadow-[#0077b6]/20"
                  }`}
                >
                  {isPublishing ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  {isPublishing
                    ? "PUBLISHING..."
                    : `PUBLISH ${selectedClass?.name || selectedClassId} TIMETABLE`}
                </button>
              </>
            )}

            {/* Refresh */}
            <button
              onClick={refreshSchedule}
              className="flex items-center gap-2 border border-gray-200 text-gray-500 px-4 py-2.5 rounded-2xl text-xs font-black bg-white hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={13} />
              REFRESH
            </button>
          </div>
        }
      />

      {/* Status Banner */}
      {editMode ? (
        <div className="flex items-start gap-4 p-4 rounded-3xl bg-blue-50 border border-blue-200 text-blue-700">
          <Pencil size={22} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">
              Edit Mode Active
            </h4>
            <p className="text-[11px] font-bold mt-1 text-blue-600/90 leading-relaxed">
              Click any period cell to schedule a subject for this period.
              Teacher is auto-resolved from Subject Allocation. Only room can be
              overridden.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4 p-4 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-700">
          <ShieldCheck
            size={22}
            className="text-emerald-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">
              Schedule Active — All Conflicts Clear
            </h4>
            <p className="text-[11px] font-bold mt-1 text-emerald-600/90 leading-relaxed">
              Viewing live timetable from institutional schedule. Switch to{" "}
              <strong>Edit Timetable</strong> to modify period assignments.
            </p>
          </div>
        </div>
      )}

      {/* View Selection + Target */}
      <MainCard className="p-4 border border-[#caf0f8]/60 bg-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tab Toggle */}
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab("timetable")}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === "timetable"
                  ? "bg-[#03045e] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              MASTER TIMETABLE
            </button>
            <button
              onClick={() => setActiveTab("overrides")}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === "overrides"
                  ? "bg-[#03045e] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              OPERATIONAL OVERRIDES
            </button>
          </div>

          {/* View Toggle (only for timetable tab) */}
          {activeTab === "timetable" && (
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl">
              <button
                onClick={() => {
                  setViewerType("class");
                  setEditMode(false);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                  viewerType === "class"
                    ? "bg-[#03045e] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                CLASS VIEW
              </button>
              <button
                onClick={() => {
                  setViewerType("teacher");
                  setEditMode(false);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                  viewerType === "teacher"
                    ? "bg-[#03045e] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                TEACHER VIEW
              </button>
            </div>
          )}

          {/* Selector (only for timetable tab) */}
          {activeTab === "timetable" && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider flex-shrink-0">
                {viewerType === "class" ? "Select Class:" : "Select Teacher:"}
              </span>
              {viewerType === "class" ? (
                <>
                  <select
                    value={selectedClassLevel}
                    onChange={(e) => {
                      setSelectedClassLevel(e.target.value);
                      setSelectedSection("");
                    }}
                    className="w-full md:w-32 px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none bg-white hover:border-[#0077b6] transition-colors cursor-pointer"
                  >
                    <option value="">Class Level</option>
                    {classLevels.map((l) => (
                      <option key={l} value={l}>
                        Class {l}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={!selectedClassLevel}
                    className="w-full md:w-32 px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none bg-white hover:border-[#0077b6] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Section</option>
                    {availableSections.map((s) => (
                      <option key={s} value={s}>
                        Section {s}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full md:w-52 px-4 py-2.5 rounded-2xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none bg-white hover:border-[#0077b6] transition-colors cursor-pointer"
                >
                  {teachers.map((t) => (
                    <option key={t.id || t.teacherId} value={t.id || t.teacherId}>
                      {t.teacherName || t.name || "Unknown Teacher"}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </MainCard>

      {/* Tab Content */}
      {activeTab === "timetable" ? (
        <>
          {/* Timetable Grid */}
          <TimetableGrid
            schedule={currentSchedule}
            type={viewerType}
            editMode={editMode && viewerType === "class"}
            onCellClick={handleCellClick}
          />
        </>
      ) : (
        <TimetableOverrideManager classes={classes} teachers={teachers} />
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingCell && (
          <EditSlotModal
            key="edit-modal"
            cell={editingCell}
            classId={selectedClassId}
            classOptions={classOptions}
            classNamesMap={classNamesMap}
            onClose={() => setEditingCell(null)}
            onSaved={(msg, type) => {
              setEditingCell(null);
              if (msg) triggerToast(msg, type);
              refreshSchedule();
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          />
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-[95vw] md:w-[90vw] lg:max-w-md shadow-2xl"
            >
              <h3 className="text-lg font-black text-[#03045e] mb-3">
                Reset Timetable
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Reset this timetable to default? All manual changes will be
                lost.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-6 py-3 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowResetConfirm(false);
                    try {
                      await resetTimetables();
                      triggerToast("Timetables reset successfully", "success");
                      refreshSchedule();
                    } catch (error) {
                      triggerToast("Failed to reset timetables", "error");
                    }
                  }}
                  className="px-6 py-3 rounded-xl text-sm font-black bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Publish Errors Modal */}
      <AnimatePresence>
        {publishErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-[95vw] md:w-[90vw] lg:max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#03045e]">
                      Publish Failed
                    </h3>
                    <p className="text-xs font-bold text-gray-500 mt-1">
                      {publishErrors.length} validation errors found
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPublishErrors([])}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {publishErrors.map((err, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-red-50 border border-red-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-widest px-2 py-0.5 bg-white rounded-md shadow-sm">
                        {err.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                        {err.classId} · {err.day} · {err.period}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-red-800 mt-2 leading-relaxed">
                      {err.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setPublishErrors([])}
                  className="px-6 py-3 rounded-xl text-xs font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Close & Edit Draft
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimetablePage;
