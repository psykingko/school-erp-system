import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Plus,
  Users,
  GraduationCap,
  MapPin,
  BookOpen,
  UserCheck,
  ClipboardList,
  Phone,
  UserCircle,
  X,
  AlertCircle,
  Check,
  ArrowRightLeft,
  Trash,
  Eye,
  EyeOff,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AdminDataTable from "../../components/admin/AdminDataTable";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminEditForm from "../../components/admin/AdminEditForm";
import AdminSubjectMappingTable from "../../components/admin/academic/AdminSubjectMappingTable";
import TimetableGrid from "../../components/admin/academic/TimetableGrid";
import ConfirmationModal from "../../shared/components/ConfirmationModal";
import ToastNotification from "../../shared/components/ToastNotification";
import LoadingSkeleton from "../../shared/components/LoadingSkeleton";
import ChartWrapper from "../../shared/components/ChartWrapper";
import ActivityFeed from "../../shared/components/ActivityFeed";
import { getDataProvider } from "../../data";
import {
  changeClassTeacher,
  getEligibleClassTeachers,
} from "../../services/teacherService";
import {
  addClass,
  softDeleteClass,
  getClassDependencies,
} from "../../services/academicsService";

// Institutional class levels
const CLASS_LEVELS = [
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

// Derive display level from class name (e.g., "11-A" -> "11", "Nursery-A" -> "Nursery")
const getLevelFromName = (name) => {
  const prefix = name.split("-")[0];
  if (prefix === "XI") return "11";
  if (prefix === "XII") return "12";
  return prefix;
};

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [timetables, setTimetables] = useState([]);

  // Navigation selectors
  const location = useLocation();
  const [selectedClassLevel, setSelectedClassLevel] = useState(location.state?.selectedClassLevel || "");
  const [selectedSection, setSelectedSection] = useState(location.state?.selectedSection || "");

  // Edit state
  const [editClass, setEditClass] = useState(null);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    classId: null,
    className: "",
    warning: "",
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Change Class Teacher modal state
  const [ctModalOpen, setCtModalOpen] = useState(false);
  const [ctCandidates, setCtCandidates] = useState([]);
  const [selectedCtId, setSelectedCtId] = useState("");
  const [ctLoading, setCtLoading] = useState(false);
  const [ctError, setCtError] = useState("");
  const [ctSuccess, setCtSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Manual activity feed (no auto-sync, human language only)
  const [activities] = useState([
    {
      type: "other",
      description: "New section created for Class 8-C",
      timestamp: Date.now() - 1000 * 60 * 20,
      user: "Admin",
    },
    {
      type: "teacher",
      description: "Class teacher changed for Class 11-A",
      timestamp: Date.now() - 1000 * 60 * 150,
      user: "Admin",
    },
    {
      type: "other",
      description: "Class section deactivated for Nursery-B",
      timestamp: Date.now() - 1000 * 60 * 270,
      user: "Admin",
    },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const provider = getDataProvider();
    try {
      const [
        allClasses,
        allTeachers,
        allStudents,
        allStreams,
        allSubjects,
        allAssignments,
        allAttendance,
        allExams,
        allResults,
        allTimetables,
      ] = await Promise.all([
        provider.getClasses(),
        provider.getTeachers(),
        provider.getStudents(),
        provider.getStreams(),
        provider.getSubjects(),
        provider.getTeacherSubjectAssignments(),
        provider.getDailyAttendance(),
        provider.getExams(),
        provider.getResults(),
        provider.getTimetables(),
      ]);

      setClasses(allClasses || []);
      setTeachers(allTeachers || []);
      setStudents(allStudents || []);
      setStreams(allStreams || []);
      setSubjects(allSubjects || []);
      setAssignments(allAssignments || []);
      setDailyAttendance(allAttendance || []);
      setExams(allExams || []);
      setResults(allResults || []);
      setTimetables(allTimetables || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClass = async (formData) => {
    if (!editClass) return;
    try {
      const classId = editClass.id;
      const provider = getDataProvider();
      await provider.updateClass(classId, formData);
      const updatedClasses = await provider.getClasses();
      setClasses(updatedClasses || []);
      setToast({
        show: true,
        message: "Class updated successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to update class",
        type: "error",
      });
    }
  };

  const handleAddClass = async (formData) => {
    try {
      const newClass = await addClass(formData);
      // Optimistic update
      setClasses((prev) => [...prev, newClass]);
      setAddClassOpen(false);
      setToast({
        show: true,
        message: "Class created successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to create class",
        type: "error",
      });
    }
  };

  const handleDeleteClick = async (cls) => {
    const dependencies = await getClassDependencies(cls.id);
    const warnings = [];
    if (dependencies.hasStudents)
      warnings.push("This class has enrolled students.");
    if (dependencies.hasTimetable)
      warnings.push("This class has timetable entries.");

    setDeleteConfirm({
      isOpen: true,
      classId: cls.id,
      className: cls.name,
      warning: warnings.length > 0 ? warnings.join(" ") : "",
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await softDeleteClass(deleteConfirm.classId);
      // Optimistic update
      setClasses((prev) =>
        prev.map((c) =>
          c.id === deleteConfirm.classId ? { ...c, isActive: false } : c,
        ),
      );
      setDeleteConfirm({
        isOpen: false,
        classId: null,
        className: "",
        warning: "",
      });
      setToast({
        show: true,
        message: "Class deactivated successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to deactivate class",
        type: "error",
      });
    }
  };

  // Form defaults (in page, NOT separate utils file)
  const classFormDefaults = {
    level: "1",
    section: "A",
    room: "Room 101",
    stream: "",
  };

  // ── Change Class Teacher handlers ──────────────────────────────────────────

  const openCtModal = async () => {
    if (!selectedClass) return;
    setCtModalOpen(true);
    setCtLoading(true);
    setCtError("");
    setCtSuccess("");
    setSelectedCtId("");
    try {
      const candidates = await getEligibleClassTeachers(selectedClass.id);
      // Exclude current CT from candidates
      const filtered = candidates.filter(
        (t) => t.id !== selectedClass.classTeacherId,
      );
      setCtCandidates(filtered);
    } catch (e) {
      setCtError("Failed to load eligible teachers.");
    } finally {
      setCtLoading(false);
    }
  };

  const closeCtModal = () => {
    setCtModalOpen(false);
    setCtCandidates([]);
    setSelectedCtId("");
    setCtError("");
    setCtSuccess("");
  };

  const handleChangeClassTeacher = async () => {
    if (!selectedClass || !selectedCtId) return;
    setCtLoading(true);
    setCtError("");
    setCtSuccess("");
    try {
      const result = await changeClassTeacher(selectedClass.id, selectedCtId);
      if (result.success) {
        setCtSuccess(
          result.timetableSwapped
            ? `Class teacher changed. Timetable updated (${result.swapCount} day swaps).`
            : "Class teacher changed successfully.",
        );
        // Refresh local class data
        const updatedClasses = await getDataProvider().getClasses();
        setClasses(updatedClasses || []);
        setSelectedCtId("");
        setTimeout(() => closeCtModal(), 1200);
      } else {
        setCtError(result.error || "Change failed.");
      }
    } catch (e) {
      setCtError(e.message || "An unexpected error occurred.");
    } finally {
      setCtLoading(false);
    }
  };

  // ── Derived class navigation ───────────────────────────────────────────────

  const classLevels = useMemo(() => {
    // Exclude inactive by default unless showInactive is true
    const activeClasses = showInactive
      ? classes
      : classes.filter((c) => c.isActive !== false);
    const levels = new Set(activeClasses.map((c) => getLevelFromName(c.name)));
    return CLASS_LEVELS.filter((l) => levels.has(l));
  }, [classes, showInactive]);

  const availableSections = useMemo(() => {
    if (!selectedClassLevel) return [];
    return classes
      .filter((c) => getLevelFromName(c.name) === selectedClassLevel)
      .map((c) => c.section)
      .filter(Boolean)
      .sort();
  }, [classes, selectedClassLevel]);

  const selectedClass = useMemo(() => {
    if (!selectedClassLevel || !selectedSection) return null;
    return (
      classes.find(
        (c) =>
          getLevelFromName(c.name) === selectedClassLevel &&
          c.section === selectedSection,
      ) || null
    );
  }, [classes, selectedClassLevel, selectedSection]);

  // ── Helper resolvers ───────────────────────────────────────────────────────

  const getTeacher = useCallback(
    (tId) => teachers.find((t) => t.id === tId) || null,
    [teachers],
  );

  const getStream = useCallback(
    (sId) => streams.find((s) => s.id === sId) || null,
    [streams],
  );

  const getSubject = useCallback(
    (subId) => subjects.find((s) => s.id === subId) || null,
    [subjects],
  );

  const getClassStudents = useCallback(
    (cId) => students.filter((s) => s.classId === cId),
    [students],
  );

  const getClassTeacher = useCallback(
    (cId) => {
      const cls = classes.find((c) => c.id === cId);
      return cls?.classTeacherId ? getTeacher(cls.classTeacherId) : null;
    },
    [classes, getTeacher],
  );

  // Build timetable schedule for selected class
  const getClassSchedule = useCallback(
    (cId) => {
      const tt = timetables.find(t => t.classId === cId);
      if (!tt || !tt.weeklySchedule) return [];
      
      const flat = [];
      Object.entries(tt.weeklySchedule).forEach(([day, slots]) => {
         slots.forEach(slot => {
            if (slot.periodType === 'break' || slot.subjectId === 'break') return;
            const sub = getSubject(slot.subjectId);
            const t = getTeacher(slot.teacherId);
            flat.push({
               day: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
               period: `P${String(slot.periodNumber).replace('P', '')}`,
               subject: sub?.name || slot.subject || "",
               teacher: t?.name || t?.metadata?.name || slot.teacher || "",
               room: slot.room || "",
            });
         });
      });
      return flat;
    },
    [timetables, getSubject, getTeacher],
  );

  // Attendance snapshot for selected class
  const getClassAttendanceStats = useCallback(
    (cId) => {
      const classStudents = getClassStudents(cId);
      if (classStudents.length === 0)
        return { present: 0, absent: 0, percentage: 0 };
      const studentIds = new Set(classStudents.map((s) => s.id));
      // Use most recent date
      const dates = [...new Set(dailyAttendance.map((a) => a.date))].sort();
      const latestDate = dates[dates.length - 1];
      if (!latestDate) return { present: 0, absent: 0, percentage: 0 };
      const todayRecords = dailyAttendance.filter(
        (a) => a.date === latestDate && studentIds.has(a.studentId),
      );
      const present = todayRecords.filter((r) => r.status === "present").length;
      const absent = todayRecords.filter((r) => r.status === "absent").length;
      const total = todayRecords.length;
      return {
        present,
        absent,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      };
    },
    [dailyAttendance, getClassStudents],
  );

  // Examination summary for selected class
  const getClassExamSummary = useCallback(
    (cId) => {
      const classStudentIds = new Set(getClassStudents(cId).map((s) => s.id));
      const classResults = results.filter((r) =>
        classStudentIds.has(r.studentId),
      );
      const activeExams = exams.filter((e) => {
        const examResults = classResults.filter((r) => r.examId === e.id);
        return examResults.length > 0;
      });
      return activeExams.slice(0, 3).map((e) => {
        const examResults = classResults.filter((r) => r.examId === e.id);
        const avg =
          examResults.length > 0
            ? Math.round(
                examResults.reduce((s, r) => s + (r.marksObtained || 0), 0) /
                  examResults.length,
              )
            : 0;
        return { ...e, avgMarks: avg, count: examResults.length };
      });
    },
    [exams, results, getClassStudents],
  );

  const classFields = [
    {
      name: "name",
      label: "Class / Section Name",
      type: "text",
      required: true,
    },
    {
      name: "room",
      label: "Location Room Number",
      type: "text",
      required: true,
    },
    {
      name: "classTeacherId",
      label: "Class Teacher Allocation",
      type: "select",
      options: teachers.map((t) => t.id),
    },
  ];

  const classStudents = selectedClass ? getClassStudents(selectedClass.id) : [];
  const classTeacher = selectedClass
    ? getClassTeacher(selectedClass.id)
    : null;
  const schedule = selectedClass
    ? getClassSchedule(selectedClass.id)
    : [];
  const attendanceStats = selectedClass
    ? getClassAttendanceStats(selectedClass.id)
    : { present: 0, absent: 0, percentage: 0 };
  const examSummary = selectedClass
    ? getClassExamSummary(selectedClass.id)
    : [];
  const stream = selectedClass ? getStream(selectedClass.stream) : null;

  // Component-level analytics (no service, read-only derivation)
  const analytics = useMemo(() => {
    const activeClasses = classes.filter((c) => c.isActive !== false);
    const inactiveClasses = classes.filter((c) => c.isActive === false);
    const classesWithCT = activeClasses.filter((c) => c.classTeacherId);
    const classesWithoutCT = activeClasses.filter((c) => !c.classTeacherId);

    // Class level distribution
    const levelCounts = activeClasses.reduce((acc, c) => {
      const level = getLevelFromName(c.name);
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    // Section distribution
    const sectionCounts = activeClasses.reduce((acc, c) => {
      acc[c.section] = (acc[c.section] || 0) + 1;
      return acc;
    }, {});

    // Stream distribution (for classes 11-12)
    const streamCounts = activeClasses.reduce((acc, c) => {
      if (c.stream) {
        acc[c.stream] = (acc[c.stream] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      total: activeClasses.length,
      inactive: inactiveClasses.length,
      withCT: classesWithCT.length,
      withoutCT: classesWithoutCT.length,
      levelCounts,
      sectionCounts,
      streamCounts,
    };
  }, [classes]);

  // Chart data (component-level, no service)
  const levelDistributionData = useMemo(() => {
    return Object.entries(analytics.levelCounts).map(([name, value]) => ({
      name: name === "11" ? "Class 11" : name === "12" ? "Class 12" : name,
      value,
    }));
  }, [analytics.levelCounts]);

  const sectionDistributionData = useMemo(() => {
    return Object.entries(analytics.sectionCounts).map(([name, value]) => ({
      name: `Section ${name}`,
      value,
    }));
  }, [analytics.sectionCounts]);

  const streamDistributionData = useMemo(() => {
    return Object.entries(analytics.streamCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [analytics.streamCounts]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-12"
      >
        <AdminPageHeader
          title="Classes & Sections"
          description="Navigate academic hierarchy, view class dashboards, and manage institutional sections."
          breadcrumbs={["Admin Portal", "Academic", "Classes"]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <LoadingSkeleton variant="stat-card" />
          <LoadingSkeleton variant="stat-card" />
          <LoadingSkeleton variant="stat-card" />
        </div>
        <AdminSectionCard>
          <LoadingSkeleton variant="table-row" count={5} />
        </AdminSectionCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Classes & Sections"
        description="Navigate academic hierarchy, view class dashboards, and manage institutional sections."
        breadcrumbs={["Admin Portal", "Academic", "Classes"]}
        actionButton={
          <button
            onClick={() => setAddClassOpen(true)}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors"
          >
            <Plus size={16} />
            <span>CREATE NEW SECTION</span>
          </button>
        }
      />

      {/* Institutional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AdminStatCard
          title="Active Sections"
          value={analytics.total.toString()}
          badgeText="Term Balanced"
          badgeType="success"
          icon={Building2}
        />
        <AdminStatCard
          title="With Class Teacher"
          value={analytics.withCT.toString()}
          badgeText="Assigned"
          badgeType="success"
          icon={GraduationCap}
          color="#0096c7"
          bg="#ade8f4"
        />
        <AdminStatCard
          title="Inactive Sections"
          value={analytics.inactive.toString()}
          badgeText="Deactivated"
          badgeType="warning"
          icon={EyeOff}
          color="#f59e0b"
          bg="#fef3c7"
        />
      </div>



      {/* ── Academic Navigation Bar ── */}
      <AdminSectionCard>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-[#0077b6]" />
            <span className="text-xs font-black text-[#03045e] uppercase tracking-wider">
              Academic Selector
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Class Selector */}
            <select
              value={selectedClassLevel}
              onChange={(e) => {
                setSelectedClassLevel(e.target.value);
                setSelectedSection("");
              }}
              className="border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none cursor-pointer min-w-[140px]"
            >
              <option value="">Select Class</option>
              {classLevels.map((level) => (
                <option key={level} value={level}>
                  Class {level}
                </option>
              ))}
            </select>



            {/* Section Selector */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClassLevel}
              className="border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none cursor-pointer min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Section</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>

            {selectedClass && (
              <>
                <button
                  onClick={() => setEditClass(selectedClass)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#03045e] text-white text-xs font-black hover:bg-[#0077b6] transition-colors"
                >
                  <Building2 size={14} />
                  EDIT CLASS
                </button>
              </>
            )}
          </div>
        </div>
      </AdminSectionCard>

      {/* ── Dashboard or Empty State ── */}
      {!selectedClass ? (
        <AdminSectionCard>
          <div className="text-center py-12">
            <Building2 size={40} className="mx-auto text-[#caf0f8] mb-4" />
            <h3 className="text-sm font-black text-[#03045e] mb-1">
              Select a Class & Section
            </h3>
            <p className="text-xs text-gray-400 font-semibold max-w-sm mx-auto">
              Choose a class level and section to view the academic dashboard,
              enrolled students, teachers, timetable, and attendance.
            </p>
          </div>
        </AdminSectionCard>
      ) : (
        <div className="space-y-6">
        <div className="space-y-6">
          {/* ── Class Overview Card ── */}
          <div className="bg-white rounded-3xl border border-[#caf0f8]/60 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[#03045e] text-white">
                    <GraduationCap size={20} />
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-[#03045e]">
                      {selectedClass.displayName || selectedClass.name}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      {stream?.name || "General Stream"} · {selectedClass.room}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                    <UserCheck size={12} />
                    {classStudents.length} Students
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#caf0f8]/40 border border-[#caf0f8] text-[#0077b6] text-[10px] font-black uppercase tracking-wider">
                    <MapPin size={12} />
                    {selectedClass.room}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Class Teacher */}
                <div className="p-4 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/40">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      Class Teacher
                    </p>
                    <button
                      onClick={openCtModal}
                      className="text-[9px] font-black text-[#0077b6] hover:text-[#03045e] bg-white px-2 py-0.5 rounded-lg border border-[#caf0f8] transition-colors"
                    >
                      Change
                    </button>
                  </div>
                  {classTeacher ? (
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-[#03045e]">
                        {classTeacher.metadata?.name || classTeacher.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-semibold">
                        {classTeacher.metadata?.designation ||
                          classTeacher.designation}
                      </p>
                      <p className="text-[10px] text-[#0077b6] font-bold">
                        {(() => {
                          const ctAssign = assignments.find(
                            (a) =>
                              a.teacherId === classTeacher.id &&
                              a.classId === selectedClass.id,
                          );
                          const ctSub = ctAssign
                            ? subjects.find((s) => s.id === ctAssign.subjectId)
                            : null;
                          return ctSub ? ctSub.name : "Class Teacher";
                        })()}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Phone size={10} />
                        <span>
                          {classTeacher.metadata?.phoneNumber ||
                            classTeacher.phoneNumber}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-gray-400">
                      Unassigned
                    </p>
                  )}
                </div>

                {/* Attendance Snapshot */}
                <div className="p-4 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/40">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Today&apos;s Attendance
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-[#03045e]">
                      {attendanceStats.percentage}%
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 mb-1">
                      {attendanceStats.present} Present ·{" "}
                      {attendanceStats.absent} Absent
                    </span>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-4 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/40">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Academic Stream
                  </p>
                  <p className="text-xs font-extrabold text-[#03045e]">
                    {stream?.name || "General"}
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold mt-1">
                    {assignments.filter(a => a.classId === selectedClass.id).length} Subjects Allocated
                  </p>
                </div>
              </div>
              </div>
            </div>

          {/* ── Subject - Teacher Mapping ── */}
          <AdminSubjectMappingTable
            selectedClass={selectedClass}
            subjects={subjects}
            teachers={teachers}
            refreshData={fetchData}
          />

          {/* ── Enrolled Students ── */}
          <AdminSectionCard>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-[#0077b6]" />
              <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                Enrolled Students
              </h3>
              <span className="ml-auto text-[10px] font-black text-[#00b4d8] bg-[#caf0f8]/40 px-2 py-0.5 rounded-lg">
                {classStudents.length} Total
              </span>
            </div>
            <AdminDataTable
              headers={[
                "Adm No.",
                "Student Name",
                "Roll",
                "Parent Contact",
                "Status",
              ]}
              items={classStudents}
              isEmpty={classStudents.length === 0}
              emptyTitle={`No students enrolled in ${selectedClass.name}`}
              renderRow={(stu) => (
                <tr
                  key={stu.id}
                  className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold"
                >
                  <td className="py-3 px-3 text-[#03045e] font-black first:pl-2">
                    {stu.admissionNo}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#caf0f8] text-[#03045e]">
                        <UserCircle size={12} />
                      </span>
                      <span className="font-extrabold">{stu.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-500">
                    {stu.rollNumber || "—"}
                  </td>
                  <td className="py-3 px-3 text-[10px] text-gray-400">
                    {stu.phoneNumber || stu.fatherPhone || "—"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
                      Active
                    </span>
                  </td>
                </tr>
              )}
            />
          </AdminSectionCard>

          {/* ── Timetable ── */}
          {schedule.length > 0 && (
            <TimetableGrid schedule={schedule} type="class" />
          )}

          {/* ── Examination Summary ── */}
          {examSummary.length > 0 && (
            <AdminSectionCard>
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList size={16} className="text-[#0077b6]" />
                <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                  Examination Summary
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {examSummary.map((e) => (
                  <div
                    key={e.id}
                    className="p-4 rounded-2xl bg-white border border-[#caf0f8]/60"
                  >
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {e.type}
                    </p>
                    <p className="text-xs font-extrabold text-[#03045e] mt-1">
                      {e.name}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] font-black text-[#0077b6] bg-[#caf0f8]/30 px-2 py-0.5 rounded-lg">
                        Avg: {e.avgMarks}%
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {e.count} Results
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </AdminSectionCard>
          )}
        </div>
      )}

      {/* Edit Form Modal */}
      <AdminEditForm
        isOpen={!!editClass}
        onClose={() => setEditClass(null)}
        title="Edit Section Details"
        data={editClass}
        fields={classFields}
        onSubmit={handleUpdateClass}
      />

      {/* Change Class Teacher Modal */}
      {ctModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-xl w-full w-[95vw] md:w-[90vw] lg:max-w-md mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#caf0f8]/60">
              <div>
                <h3 className="text-sm font-black text-[#03045e]">
                  Change Class Teacher
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  {selectedClass.name} — Select from teachers already assigned
                  to this section
                </p>
              </div>
              <button
                onClick={closeCtModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 max-h-[360px] overflow-y-auto">
              {ctLoading && (
                <p className="text-xs text-gray-400 font-semibold text-center py-6">
                  Loading candidates...
                </p>
              )}

              {ctError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 mb-3">
                  <AlertCircle size={14} className="text-rose-500" />
                  <p className="text-[10px] font-bold text-rose-600">
                    {ctError}
                  </p>
                </div>
              )}

              {ctSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-3">
                  <Check size={14} className="text-emerald-500" />
                  <p className="text-[10px] font-bold text-emerald-600">
                    {ctSuccess}
                  </p>
                </div>
              )}

              {!ctLoading && ctCandidates.length === 0 && (
                <p className="text-xs text-gray-400 font-semibold text-center py-6">
                  No eligible teachers found for this section.
                </p>
              )}

              {!ctLoading &&
                ctCandidates.map((t) => {
                  // Find what subject this teacher teaches in this class
                  const tAssign = assignments.find(
                    (a) =>
                      a.teacherId === t.id && a.classId === selectedClass.id,
                  );
                  const sub = tAssign
                    ? subjects.find((s) => s.id === tAssign.subjectId)
                    : null;
                  const isSelected = selectedCtId === t.id;

                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedCtId(t.id)}
                      className={`w-full text-left p-3 rounded-xl border mb-2 transition-all ${
                        isSelected
                          ? "bg-[#03045e] border-[#03045e] text-white"
                          : "bg-white border-[#caf0f8] hover:border-[#0077b6]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-xs font-extrabold ${
                              isSelected ? "text-white" : "text-[#03045e]"
                            }`}
                          >
                            {t.metadata?.name || t.name}
                          </p>
                          <p
                            className={`text-[10px] font-semibold mt-0.5 ${
                              isSelected ? "text-white/80" : "text-gray-500"
                            }`}
                          >
                            {t.metadata?.designation || t.designation}
                            {sub && ` · ${sub.name}`}
                          </p>
                        </div>
                        {isSelected && (
                          <Check size={16} className="text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#caf0f8]/60 bg-gray-50/50">
              <button
                onClick={closeCtModal}
                className="px-4 py-2 rounded-xl text-[10px] font-black text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeClassTeacher}
                disabled={!selectedCtId || ctLoading || ctSuccess}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#03045e] text-white text-[10px] font-black hover:bg-[#0077b6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRightLeft size={12} />
                Confirm Change
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Class Modal */}
      <AdminEditForm
        isOpen={addClassOpen}
        onClose={() => setAddClassOpen(false)}
        title="Create New Class Section"
        data={classFormDefaults}
        fields={[
          {
            name: "level",
            label: "Class Level",
            type: "select",
            options: CLASS_LEVELS,
            required: true,
          },
          {
            name: "section",
            label: "Section",
            type: "select",
            options: ["A", "B", "C", "D"],
            required: true,
          },
          {
            name: "room",
            label: "Room Number",
            type: "text",
            required: true,
          },
          {
            name: "stream",
            label: "Stream (Classes 11 & 12 only)",
            type: "select",
            options: [
              "",
              "Science Non-Medical",
              "Science Medical",
              "Commerce",
              "Humanities",
            ],
          },
        ]}
        onSubmit={handleAddClass}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Deactivate Class"
        message={`Are you sure you want to deactivate ${deleteConfirm.className}? This will hide the class from active listings.`}
        warningText={deleteConfirm.warning}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteConfirm({
            isOpen: false,
            classId: null,
            className: "",
            warning: "",
          })
        }
        confirmButtonText="Deactivate"
        cancelButtonText="Cancel"
      />

      {/* Toast Notification */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </motion.div>
  );
};

export default ClassesPage;
