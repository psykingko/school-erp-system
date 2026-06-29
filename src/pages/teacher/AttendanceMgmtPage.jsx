import React, { useState, useEffect, useCallback } from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import TeacherDataTable from "../../components/teacher/TeacherDataTable";
import MainCard from "../../components/MainCard";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  getTeacherWorkload,
  getStudentsInClass,
  getAttendanceForClass,
  submitAttendance,
} from "../../services/teacherService";
import {
  Check,
  X,
  Clock,
  Save,
  RotateCcw,
  CheckCircle2,
  Sunset,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AttendanceMgmtPage
 *
 * First full ERP mutation workflow.
 * Allows teachers to mark attendance for their assigned classes.
 */
const AttendanceMgmtPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Class Teacher-based state — teacher marks attendance ONLY for their assigned section
  const [homeroomClass, setHomeroomClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Data State
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [studentLeaves, setStudentLeaves] = useState({});
  const [session, setSession] = useState(null);

  // 1. Fetch Teacher's Homeroom Class
  useEffect(() => {
    const loadWorkload = async () => {
      const data = await getTeacherWorkload(user?.linkedEntityId);
      if (data?.homeroomClass) {
        setHomeroomClass(data.homeroomClass);
      }
    };
    loadWorkload();
  }, [user]);

  // 2. Fetch Homeroom Students & Existing Attendance
  const loadClassData = useCallback(async () => {
    if (!homeroomClass) return;
    setLoading(true);

    const { getAttendanceSessionForClass } =
      await import("../../services/teacherService");
    const { isStudentOnApprovedLeave } =
      await import("../../services/leaveService");

    const [studentList, existingAttendance, sessionData] = await Promise.all([
      getStudentsInClass(homeroomClass.id),
      getAttendanceForClass(homeroomClass.id, selectedDate),
      getAttendanceSessionForClass(homeroomClass.id, selectedDate),
    ]);

    // Check if any student is on approved leave
    const leaveChecks = await Promise.all(
      studentList.map((s) => isStudentOnApprovedLeave(s.id, selectedDate)),
    );

    const leavesMap = {};
    studentList.forEach((s, idx) => {
      leavesMap[s.id] = leaveChecks[idx];
    });
    setStudentLeaves(leavesMap);

    setStudents(studentList);
    setSession(sessionData);

    const map = {};
    studentList.forEach((s) => {
      const leave = leavesMap[s.id];
      if (leave) {
        map[s.id] = "on_leave"; // Default to on_leave if approved leave exists
      } else {
        map[s.id] = "unmarked";
      }
    });
    existingAttendance.forEach((a) => {
      if (a.status && a.status !== "unmarked") map[a.studentId] = a.status;
    });
    setAttendanceMap(map);
    setLoading(false);
  }, [homeroomClass, selectedDate]);

  useEffect(() => {
    loadClassData();
  }, [loadClassData]);

  // 3. Status Toggles
  const toggleStatus = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? "unmarked" : status,
    }));
  };

  const markAllPresent = () => {
    const map = {};
    students.forEach((s) => (map[s.id] = "present"));
    setAttendanceMap(map);
  };

  // 4. Submission
  const handleSubmit = async () => {
    const list = Object.entries(attendanceMap).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    if (list.filter((l) => l.status !== "unmarked").length < students.length) {
      setShowConfirm(true);
      return;
    }

    await submitAttendanceList(list);
  };

  const submitAttendanceList = async (list) => {
    setSubmitting(true);
    setError("");
    try {
      await submitAttendance(
        user.linkedEntityId,
        homeroomClass.id,
        list,
        selectedDate,
      );
      setSuccess(true);
      await loadClassData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(t("attendanceMgmt.failedToSubmit", { fallback: "Failed to submit attendance. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: t("attendanceMgmt.studentName", { fallback: "Student Name" }),
      render: (row) => {
        const leave = studentLeaves[row.id];
        return (
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-black text-[#03045e]">{row.name}</span>
              {leave && (
                <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[9px] font-black uppercase tracking-wider border border-sky-100">
                  {t("attendanceMgmt.onApprovedLeave", { fallback: "On Approved Leave" })}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              {t("attendanceMgmt.adm", { fallback: "Adm:" })} {row.admissionNo}
            </span>
          </div>
        );
      },
    },
    {
      header: t("attendanceMgmt.attendanceStatus", { fallback: "Attendance Status" }),
      className: "text-right",
      render: (row) => {
        const status = attendanceMap[row.id] || "unmarked";
        return (
          <div className="flex items-center justify-end gap-2">
            <StatusButton
              t={t}
              active={status === "present"}
              type="present"
              onClick={() => toggleStatus(row.id, "present")}
            />
            <StatusButton
              t={t}
              active={status === "absent"}
              type="absent"
              onClick={() => toggleStatus(row.id, "absent")}
            />
            <StatusButton
              t={t}
              active={status === "on_leave"}
              type="on_leave"
              onClick={() => toggleStatus(row.id, "on_leave")}
            />
            <StatusButton
              t={t}
              active={status === "unmarked"}
              type="unmarked"
              onClick={() => toggleStatus(row.id, "unmarked")}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader
        titleKey="nav.attendance_mgmt"
        descriptionKey="attendanceMgmt.subtitle"
        helperContentEn="Select a class and date to mark attendance. You can also review and modify previously marked attendance."
        helperContentHi="उपस्थिति दर्ज करने के लिए कक्षा और तिथि चुनें। आप पहले से दर्ज उपस्थिति की समीक्षा और संशोधन भी कर सकते हैं।"
      />

      {/* Toolbar — Homeroom + Date */}
      <MainCard className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Class Teacher Section Badge — read-only, attendance authority */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
              {t("attendanceMgmt.yourClass", { fallback: "Your Class" })}
            </label>
            <div className="flex items-center gap-2 bg-[#03045e]/5 border border-[#03045e]/10 rounded-xl px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-[#00b4d8]" />
              <span className="text-sm font-black text-[#03045e]">
                {homeroomClass
                  ? homeroomClass.displayName ||
                    `${homeroomClass.name} — ${t("common.section", { fallback: "Section" })} ${homeroomClass.section}`
                  : t("common.loading", { fallback: "Loading..." })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
              {t("attendanceMgmt.date", { fallback: "Date" })}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#caf0f8]/30 border-none rounded-xl px-4 py-2 text-sm font-bold text-[#03045e] focus:ring-2 focus:ring-[#00b4d8] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllPresent}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-100 transition-colors"
          >
            <Check size={14} /> {t("attendanceMgmt.markAllPresent", { fallback: "MARK ALL PRESENT" })}
          </button>
          <button
            onClick={loadClassData}
            className="p-2 text-gray-400 hover:text-[#03045e] transition-colors"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </MainCard>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 px-4 py-3 bg-gray-50/50 rounded-2xl border border-gray-100 mt-[-1rem]">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("attendanceMgmt.legend", { fallback: "Legend:" })}</span>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
          <div className="w-6 h-6 rounded-lg border-2 border-[#10b981] flex items-center justify-center"><Check size={12} className="text-[#10b981]" /></div> {t("attendanceMgmt.present", { fallback: "Present" })}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
          <div className="w-6 h-6 rounded-lg border-2 border-[#ef4444] flex items-center justify-center"><X size={12} className="text-[#ef4444]" /></div> {t("attendanceMgmt.absent", { fallback: "Absent" })}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
          <div className="w-6 h-6 rounded-lg border-2 border-[#0ea5e9] flex items-center justify-center"><Sunset size={12} className="text-[#0ea5e9]" /></div> {t("attendanceMgmt.onLeave", { fallback: "On Leave" })}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
          <div className="w-6 h-6 rounded-lg border-2 border-[#f59e0b] flex items-center justify-center"><Clock size={12} className="text-[#f59e0b]" /></div> {t("attendanceMgmt.unmarked", { fallback: "Unmarked" })}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="relative">
        <TeacherDataTable
          columns={columns}
          data={students}
          loading={loading}
          emptyMessage={t("attendanceMgmt.noStudentsFound", { fallback: "No students found in this class." })}
        />

        {/* Floating Submit Bar */}
        <AnimatePresence>
          {students.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
            >
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex items-center gap-3 px-8 py-4 rounded-3xl shadow-2xl transition-all font-black text-sm tracking-tight ${
                  success
                    ? "bg-emerald-500 text-white"
                    : "bg-[#03045e] text-white hover:bg-[#0077b6] active:scale-95"
                } disabled:opacity-50 disabled:scale-100`}
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : success ? (
                  <>
                    <CheckCircle2 size={20} />
                    {t("attendanceMgmt.attendanceSaved", { fallback: "ATTENDANCE SAVED" })}
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {session ? t("attendanceMgmt.updateAttendance", { fallback: "UPDATE ATTENDANCE" }) : t("attendanceMgmt.submitAttendance", { fallback: "SUBMIT ATTENDANCE" })}
                  </>
                )}
              </button>

              {session && !success && !submitting && (
                <div className="mt-3 px-4 py-1.5 bg-white shadow-lg rounded-full border border-[#caf0f8] flex items-center gap-2 text-xs font-bold text-gray-500">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>
                    {t("attendanceMgmt.submittedAt", { fallback: "Submitted at" })}{" "}
                    {new Date(session.submittedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-24 right-8 z-50 bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3"
          >
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-2 text-rose-400 hover:text-rose-600"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
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
                  {t("attendanceMgmt.unmarkedStudents", { fallback: "Unmarked Students" })}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {t("attendanceMgmt.unmarkedConfirmMsg", { fallback: "Some students are still unmarked. Do you want to continue submitting attendance?" })}
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-6 py-3 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {t("common.cancel", { fallback: "Cancel" })}
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirm(false);
                      const list = Object.entries(attendanceMap).map(
                        ([studentId, status]) => ({ studentId, status }),
                      );
                      submitAttendanceList(list);
                    }}
                    className="px-6 py-3 rounded-xl text-sm font-black bg-[#03045e] text-white hover:bg-[#0077b6] transition-colors"
                  >
                    {t("common.continue", { fallback: "Continue" })}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatusButton = ({ t, active, type, onClick }) => {
  const configs = {
    present: { color: "#10b981", icon: Check, label: t("attendanceMgmt.present", { fallback: "Present" }) },
    absent: { color: "#ef4444", icon: X, label: t("attendanceMgmt.absent", { fallback: "Absent" }) },
    on_leave: { color: "#0ea5e9", icon: Sunset, label: t("attendanceMgmt.onLeave", { fallback: "On Leave" }) },
    unmarked: { color: "#f59e0b", icon: Clock, label: t("attendanceMgmt.unmarked", { fallback: "Unmarked" }) },
  };
  const config = configs[type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      title={config.label}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
        active
          ? `bg-white border-transparent shadow-md scale-110`
          : `bg-transparent border-[#caf0f8] text-gray-300 hover:border-[#00b4d8]/30`
      }`}
      style={active ? { color: config.color, borderColor: config.color } : {}}
    >
      <Icon size={18} />
    </button>
  );
};

export default AttendanceMgmtPage;
