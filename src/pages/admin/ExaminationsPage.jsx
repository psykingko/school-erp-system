import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  Clock,
  Award,
  Users,
  CheckCircle,
  Save,
  AlertCircle,
  X,
  ShieldAlert,
  Edit,
  Trash2,
  Play,
  Printer,
  Sparkles,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Shuffle,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import MainCard from "../../components/MainCard";
import { getDataProvider } from "../../data";
import { getStageFromLevel } from "../../data/academicStages";
import { getStudentSubjects } from "../../data/subjectArchitecture";
import { normalizeClassLevel } from "../../utils/classIdentity";
import OngoingOperationsDashboard from "../../components/admin/academic/examinations/OngoingOperationsDashboard";
import EvaluationDashboard from "../../components/admin/academic/examinations/evaluation/EvaluationDashboard";
import PublicationDashboard from "../../components/admin/academic/examinations/publication/PublicationDashboard";
import {
  getExams,
  createExamSession,
  updateExamSession,
  deleteExamSession,
  getExamPapers,
  getExamPapersBySession,
  createExamPaper,
  updateExamPaper,
  deleteExamPaper,
  validateExamPaperConflicts,
  validateSessionForRelease,
  transitionToEvaluation,
  getEvaluationProgress,
} from "../../services/examService";

const ExaminationsPage = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState("sessions");

  // Domain Database States
  const [sessions, setSessions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // UI Operational States
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  // Compliance Diagnostics States
  const [diagnosticsModalOpen, setDiagnosticsModalOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState({ errors: [], warnings: [] });
  const [activeTransitionExamId, setActiveTransitionExamId] = useState(null);

  // Modals & Forms State
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [schedulePaperOpen, setSchedulePaperOpen] = useState(false);
  const [evaluationOverrideOpen, setEvaluationOverrideOpen] = useState(false);
  const [reportCardPreviewOpen, setReportCardPreviewOpen] = useState(false);

  // Focus Items for Modals
  const [sessionForm, setSessionForm] = useState({
    name: "",
    type: "UNIT", // "UNIT" vs "TERM"
    academicYear: "2025-26",
    applicableStages: ["primary", "middle", "secondary", "senior_secondary"],
    startDate: "",
    endDate: "",
    instructions: "",
    targetClasses: {}, // { classId: { selected: boolean, sections: string[] } }
  });

  const [paperForm, setPaperForm] = useState({
    id: null,
    subjectId: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    duration: 60,
    maxMarks: 40,
    passingMarks: 13,
    theoryMarks: 40,
    practicalMarks: 0,
    roomId: "",
    invigilatorTeacherIds: [],
    examMode: "written",
    status: "scheduled",
  });

  const [activeOverrideClassId, setActiveOverrideClassId] = useState("");
  const [activeOverrideSubjectId, setActiveOverrideSubjectId] = useState("");
  const [overrideStudentMarks, setOverrideStudentMarks] = useState([]); // Array of { studentId, name, marksObtained, remarks }

  const [reportCardStudentId, setReportCardStudentId] = useState("");
  const [clashWarnings, setClashWarnings] = useState([]);

  const activeSessionObj = useMemo(() => {
    return sessions.find((s) => s.status === "ongoing");
  }, [sessions]);

  const workflowTabs = useMemo(() => {
    const baseTabs = [
      { id: "sessions", label: "Examination Sessions" },
      { id: "dateSheets", label: "Per-Class Date Sheets" },
      { id: "evaluation", label: "Marks & Evaluation" },
      { id: "publish", label: "Publish Results" },
    ];
    if (activeSessionObj) {
      baseTabs.splice(2, 0, {
        id: "ongoing",
        label: "Ongoing Operations Console",
      });
    }
    return baseTabs;
  }, [activeSessionObj]);

  // Fetch initial institutional datasets
  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      setLoading(true);
      const provider = getDataProvider();
      const [
        allSessions,
        allPapers,
        allClasses,
        allSubjects,
        allTeachers,
        allRooms,
        allResults,
        allStudents,
        allAssignments,
      ] = await Promise.all([
        getExams(),
        getExamPapers(),
        provider.getClasses(),
        provider.getSubjects(),
        provider.getTeachers(),
        provider.getRooms(),
        provider.getResults(),
        provider.getStudents(),
        provider.getTeacherSubjectAssignments(),
      ]);

      setSessions(allSessions || []);
      setPapers(allPapers || []);
      setClasses(allClasses || []);
      setSubjects(allSubjects || []);
      setTeachers(allTeachers || []);
      setRooms(allRooms || []);
      setResults(allResults || []);
      setStudents(allStudents || []);
      setAssignments(allAssignments || []);

      if (allSessions?.length > 0) {
        setSelectedSessionId((prev) => {
          if (prev && allSessions.some((s) => s.id === prev)) return prev;
          return allSessions[0].id;
        });
      }
      if (allClasses?.length > 0) {
        setSelectedClassId((prev) => {
          if (prev && allClasses.some((c) => c.id === prev)) return prev;
          return allClasses[0].id;
        });
      }
    } catch (err) {
      console.error("Failed to load examinations database:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Tab 1: Sessions Logic ──
  const handleSessionTypeChange = (type) => {
    // Dynamic Template Defaults based on type
    const defaultInstructions =
      type === "UNIT"
        ? [
            "Candidates must report to the examination center at least 15 minutes before the scheduled time.",
            "Only blue or black ballpoint pens are allowed.",
          ]
        : [
            "Candidates must carry a physical copy of their Admit Card to the examination hall.",
            "Banned items include mobile phones, calculators, smartwatches, and loose paper sheets.",
            "Candidates must report to the examination center at least 30 minutes before the scheduled time.",
            "Grace period of 15 minutes is allowed, post which no entry is permitted.",
          ];

    setSessionForm((prev) => ({
      ...prev,
      type,
      instructions: defaultInstructions.join("\n"),
    }));
  };

  // Helper functions for class/section selection
  const handleClassToggle = (classId) => {
    setSessionForm((prev) => {
      const current = prev.targetClasses[classId] || {
        selected: false,
        sections: [],
      };
      return {
        ...prev,
        targetClasses: {
          ...prev.targetClasses,
          [classId]: { ...current, selected: !current.selected },
        },
      };
    });
  };

  const handleSectionToggle = (classId, section) => {
    setSessionForm((prev) => {
      const current = prev.targetClasses[classId] || {
        selected: false,
        sections: [],
      };
      const newSections = current.sections.includes(section)
        ? current.sections.filter((s) => s !== section)
        : [...current.sections, section];
      return {
        ...prev,
        targetClasses: {
          ...prev.targetClasses,
          [classId]: { ...current, sections: newSections },
        },
      };
    });
  };

  const handleSelectAllSections = (classId, allSections) => {
    setSessionForm((prev) => {
      const current = prev.targetClasses[classId] || {
        selected: false,
        sections: [],
      };
      const newSections =
        current.sections.length === allSections.length ? [] : allSections;
      return {
        ...prev,
        targetClasses: {
          ...prev.targetClasses,
          [classId]: { ...current, sections: newSections },
        },
      };
    });
  };

  // Group classes by their level label (e.g. "Nursery", "1", "11") — NOT by cls.name
  // cls.name includes the section suffix ("Nursery-A") and would create one row per section.
  // cls.level is the canonical field added to the seed for exactly this purpose.
  const classesByLevel = useMemo(() => {
    const grouped = {};
    classes.forEach((cls) => {
      const key = cls.level || cls.name.split("-")[0]; // fallback: strip section from name
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(cls);
    });
    // Preserve school order: Nursery, LKG, UKG, 1-10, 11, 12
    const ORDER = [
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
    return Object.fromEntries(
      ORDER.filter((k) => grouped[k]).map((k) => [k, grouped[k]]),
    );
  }, [classes]);

  const handleCreateSession = async () => {
    if (!sessionForm.name || !sessionForm.startDate || !sessionForm.endDate) {
      alert("Please complete all required fields.");
      return;
    }

    // Validate at least one class is selected
    const selectedClasses = Object.entries(sessionForm.targetClasses).filter(
      ([_, data]) => data.selected && data.sections.length > 0,
    );
    if (selectedClasses.length === 0) {
      alert("Please select at least one class and section.");
      return;
    }

    try {
      const parsedInstructions = sessionForm.instructions
        ? sessionForm.instructions.split("\n").filter(Boolean)
        : [];

      const newSession = {
        name: sessionForm.name,
        type: sessionForm.type,
        academicYear: sessionForm.academicYear,
        applicableStages: sessionForm.applicableStages,
        status: "draft",
        startDate: sessionForm.startDate,
        endDate: sessionForm.endDate,
        instructions: parsedInstructions,
        targetClasses: sessionForm.targetClasses,
      };

      const createdSession = await createExamSession(newSession);

      // Send tentative date sheet notifications using dynamic rules-based resolution (Fix #1)
      const dateStr = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const formatDateToInstitutional = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        const day = String(date.getDate()).padStart(2, "0");
        const months = [
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
        ];
        // Safe mapping
        const dateObj = new Date(dateStr);
        const monthsArray = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return `${day} ${monthsArray[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
      };

      const formattedStart = formatDateToInstitutional(sessionForm.startDate);
      const formattedEnd = formatDateToInstitutional(sessionForm.endDate);
      const dateRangeStr = `${formattedStart} – ${formattedEnd}`;
      const selectedClassIds = selectedClasses.map(([classId]) => classId);

      console.log(
        "[Exam Cycle] Creating tentative exam notices for classes:",
        selectedClassIds,
      );

      // 1. STUDENT/PARENT NOTICE (Fix #2, Fix #5, Fix #6)
      const studentNotice = await getDataProvider().createNotice({
        title: "Tentative Examination Window Announced",
        titleEn: "Tentative Examination Window Announced",
        content: `${sessionForm.name} is tentatively planned between ${dateRangeStr}.\n\nPlease begin academic preparation.\nDetailed subject-wise datesheet will be released soon.`,
        contentEn: `${sessionForm.name} is tentatively planned between ${dateRangeStr}.\n\nPlease begin academic preparation.\nDetailed subject-wise datesheet will be released soon.`,
        date: dateStr,
        isPinned: true,
        status: "Published",
        category: "examination",
        priority: "important",
        icon: "Calendar",
        allowedRoles: ["student", "parent"],
        sourceModule: "examinations",
        sourceEntityId: createdSession.id,
        sourceEntityType: "exam_cycle",
        targetAudience: {
          type: "CLASS",
          classIds: selectedClassIds,
          includeStudents: true,
          includeParents: true,
        },
      });
      console.log(
        "[Exam Cycle] Student/Parent notice created:",
        studentNotice?.id,
      );

      // 2. TEACHER NOTICE (Fix #2, Fix #4, Fix #5, Fix #6)
      const teacherNotice = await getDataProvider().createNotice({
        title: "Tentative Exam Cycle Created",
        titleEn: "Tentative Exam Cycle Created",
        content: `You are academically mapped to classes included in:\n${sessionForm.name}.\n\nTentative examination window:\n${dateRangeStr}.\n\nDetailed scheduling and invigilation assignments\nwill be shared after official datesheet release.`,
        contentEn: `You are academically mapped to classes included in:\n${sessionForm.name}.\n\nTentative examination window:\n${dateRangeStr}.\n\nDetailed scheduling and invigilation assignments\nwill be shared after official datesheet release.`,
        date: dateStr,
        isPinned: true,
        status: "Published",
        category: "examination",
        priority: "important",
        icon: "Calendar",
        allowedRoles: ["teacher"],
        sourceModule: "examinations",
        sourceEntityId: createdSession.id,
        sourceEntityType: "exam_cycle",
        targetAudience: {
          type: "CLASS",
          classIds: selectedClassIds,
          includeClassTeachers: true,
          includeSubjectTeachers: true,
        },
        metadata: {
          teacherNoticeRole: "subject_teacher",
          teacherContext: {
            roles: ["class_teacher", "subject_teacher"],
          },
        },
      });
      console.log("[Exam Cycle] Teacher notice created:", teacherNotice?.id);

      // Invalidate student dashboard cache so new notices appear immediately
      const { clearDeferredCache } =
        await import("../../services/studentService");
      // Clear cache for all students in target classes
      const provider = getDataProvider();
      const allStudents = await provider.getStudents();
      const targetStudents = allStudents.filter((s) =>
        selectedClassIds.includes(s.classId),
      );
      targetStudents.forEach((student) => {
        clearDeferredCache(student.id, false); // student mode
        clearDeferredCache(student.id, true); // parent mode
      });

      await fetchBaseData();
      setCreateSessionOpen(false);
      // Reset form
      setSessionForm({
        name: "",
        type: "UNIT",
        academicYear: "2025-26",
        applicableStages: [
          "primary",
          "middle",
          "secondary",
          "senior_secondary",
        ],
        startDate: "",
        endDate: "",
        instructions: "",
        targetClasses: {},
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Validation Helpers for Status Transitions ──
  const areAllTargetClassesScheduled = (session) => {
    if (
      !session?.targetClasses ||
      Object.keys(session.targetClasses).length === 0
    ) {
      // Legacy session without targetClasses - check if any papers exist
      return papers.some((p) => p.examSessionId === session.id);
    }
    const targetClassIds = Object.entries(session.targetClasses)
      .filter(([, data]) => data.selected && data.sections.length > 0)
      .map(([id]) => id);
    if (targetClassIds.length === 0) return false;
    // Check if each target class has at least one paper scheduled
    return targetClassIds.every((classId) =>
      papers.some(
        (p) => p.examSessionId === session.id && p.classId === classId,
      ),
    );
  };

  const areAllExamsComplete = (session) => {
    const sessionPapers = papers.filter((p) => p.examSessionId === session.id);
    if (sessionPapers.length === 0) return false;
    // Check if all papers have results entered
    return sessionPapers.every((p) => results.some((r) => r.examId === p.id));
  };

  const proceedWithRelease = async (sessionId) => {
    try {
      await updateExamSession(sessionId, { status: "scheduled" });

      const sess = sessions.find((s) => s.id === sessionId);
      const dateStr = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      // Get target class IDs
      const targetClassIds = Object.entries(sess.targetClasses || {})
        .filter(([, data]) => data.selected && data.sections.length > 0)
        .map(([id]) => id);

      // Get all invigilators
      const sessionPapers = papers.filter((p) => p.examSessionId === sessionId);
      const invigilatorIds = new Set();
      sessionPapers.forEach((p) => {
        if (p.invigilatorTeacherIds && p.invigilatorTeacherIds.length > 0) {
          p.invigilatorTeacherIds.forEach((id) => invigilatorIds.add(id));
        }
      });
      const uniqueInvigilators = Array.from(invigilatorIds);

      // 1. STUDENT/PARENT NOTICE
      await getDataProvider().createNotice({
        title: "Official Examination Datesheet Published",
        titleEn: "Official Examination Datesheet Published",
        content: `The official datesheet for ${sess.name} has been released. Please check your examination schedule, subject timings, and reporting instructions.`,
        contentEn: `The official datesheet for ${sess.name} has been released. Please check your examination schedule, subject timings, and reporting instructions.`,
        date: dateStr,
        isPinned: true,
        status: "Published",
        category: "examination",
        priority: "urgent",
        icon: "ClipboardList",
        allowedRoles: ["student", "parent"],
        sourceModule: "examinations",
        sourceEntityId: sess.id,
        sourceEntityType: "exam_cycle",
        targetAudience: {
          type: "CLASS",
          classIds: targetClassIds,
          includeStudents: true,
          includeParents: true,
        },
      });

      // 2. CLASS TEACHER NOTICE
      await getDataProvider().createNotice({
        title: "Class Examination Schedule Released",
        titleEn: "Class Examination Schedule Released",
        content: `The official datesheet for your assigned class has been published. Please coordinate student readiness, attendance compliance, and communication.`,
        contentEn: `The official datesheet for your assigned class has been published. Please coordinate student readiness, attendance compliance, and communication.`,
        date: dateStr,
        isPinned: true,
        status: "Published",
        category: "examination",
        priority: "important",
        icon: "ClipboardList",
        allowedRoles: ["teacher"],
        sourceModule: "examinations",
        sourceEntityId: sess.id,
        sourceEntityType: "exam_cycle",
        targetAudience: {
          type: "CLASS",
          classIds: targetClassIds,
          includeClassTeachers: true,
        },
      });

      // 3. SUBJECT TEACHER NOTICE
      await getDataProvider().createNotice({
        title: "Subject Examination Confirmed",
        titleEn: "Subject Examination Confirmed",
        content: `Your subject examinations have been officially scheduled. Please review exam dates, prepare question papers, and align syllabus coverage.`,
        contentEn: `Your subject examinations have been officially scheduled. Please review exam dates, prepare question papers, and align syllabus coverage.`,
        date: dateStr,
        isPinned: true,
        status: "Published",
        category: "examination",
        priority: "important",
        icon: "ClipboardList",
        allowedRoles: ["teacher"],
        sourceModule: "examinations",
        sourceEntityId: sess.id,
        sourceEntityType: "exam_cycle",
        targetAudience: {
          type: "CLASS",
          classIds: targetClassIds,
          includeSubjectTeachers: true,
        },
      });

      // 4. INVIGILATOR NOTICE
      if (uniqueInvigilators.length > 0) {
        await getDataProvider().createNotice({
          title: "Invigilator Assignment Confirmed",
          titleEn: "Invigilator Assignment Confirmed",
          content: `You have been assigned as an invigilator for ${sess.name}. Please check your schedule, room assignments, and reporting details.`,
          contentEn: `You have been assigned as an invigilator for ${sess.name}. Please check your schedule, room assignments, and reporting details.`,
          date: dateStr,
          isPinned: true,
          status: "Published",
          category: "examination",
          priority: "important",
          icon: "ClipboardList",
          allowedRoles: ["teacher"],
          sourceModule: "examinations",
          sourceEntityId: sess.id,
          sourceEntityType: "exam_cycle",
          targetAudience: {
            type: "SPECIFIC",
            teacherIds: uniqueInvigilators,
          },
        });
      }

      await fetchBaseData();
      setDiagnosticsModalOpen(false);
      setActiveTransitionExamId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to complete transition: " + err.message);
    }
  };

  const handleSendEmergencyBroadcast = async (broadcastData) => {
    if (!activeSessionObj) return;

    try {
      const dateStr = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const targetClassIds = Object.entries(
        activeSessionObj.targetClasses || {},
      )
        .filter(([, data]) => data.selected && data.sections.length > 0)
        .map(([id]) => id);

      await getDataProvider().createNotice({
        title: broadcastData.title,
        titleEn: broadcastData.title,
        content: broadcastData.content,
        contentEn: broadcastData.content,
        date: dateStr,
        isPinned: true,
        status: "Published",
        category: "emergency",
        priority: "urgent",
        icon: "Megaphone",
        allowedRoles: ["student", "parent", "teacher"],
        sourceModule: "examinations",
        sourceEntityId: activeSessionObj.id,
        sourceEntityType: "exam_cycle",
        targetAudience: {
          type: "CLASS",
          classIds: targetClassIds,
          includeStudents: true,
          includeParents: true,
          includeClassTeachers: true,
          includeSubjectTeachers: true,
        },
        metadata: {
          operationalState: "ongoing",
        },
      });

      alert(
        "📢 Emergency Broadcast circular successfully issued to notice board!",
      );
    } catch (err) {
      console.error("Emergency broadcast failed:", err);
      alert("Failed to broadcast emergency circular: " + err.message);
    }
  };

  const handleTransitionStatus = async (sessionId, currentStatus) => {
    let nextStatus = "draft";
    if (currentStatus === "draft") nextStatus = "scheduled";
    else if (currentStatus === "scheduled") nextStatus = "ongoing";
    else if (currentStatus === "ongoing") nextStatus = "evaluation";
    else if (currentStatus === "evaluation") nextStatus = "published";
    else return;

    const sess = sessions.find((s) => s.id === sessionId);

    // Compliance Validation Block for Release (Transition #2: draft -> scheduled)
    if (nextStatus === "scheduled") {
      try {
        const results = await validateSessionForRelease(sessionId);
        if (results.errors.length === 0 && results.warnings.length === 0) {
          // Proceed with automatic transition if completely clean!
          await proceedWithRelease(sessionId);
        } else {
          // Open the Diagnostics Modal
          setDiagnostics(results);
          setActiveTransitionExamId(sessionId);
          setDiagnosticsModalOpen(true);
        }
        return;
      } catch (err) {
        console.error("Compliance validation failed:", err);
        alert("Compliance validation failed: " + err.message);
        return;
      }
    }

    if (nextStatus === "ongoing" && !areAllTargetClassesScheduled(sess)) {
      alert(
        "Cannot start exams. Please ensure all target classes have scheduled exams.",
      );
      return;
    }
    if (nextStatus === "evaluation") {
      if (
        !confirm(
          "⚠️ Confirm Transition Preconditions:\n✓ All papers completed\n✓ Attendance finalized\n✓ Malpractice reports reviewed/acknowledged\n✓ No active room operations pending\n\nProceed to shift this cycle to Evaluation phase?",
        )
      ) {
        return;
      }
    }
    if (nextStatus === "published" && !areAllExamsComplete(sess)) {
      alert(
        "Cannot publish results. Please ensure all evaluations are complete.",
      );
      return;
    }

    try {
      if (nextStatus === "evaluation") {
        await transitionToEvaluation(sessionId, "admin-001");
      } else {
        await updateExamSession(sessionId, { status: nextStatus });
      }

      // Relational Automation: Automatically dispatch notice board circulars on status transitions
      const dateStr = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      if (nextStatus === "ongoing") {
        // Resolve target class IDs
        const targetClassIds = Object.entries(sess.targetClasses || {})
          .filter(([, data]) => data.selected && data.sections.length > 0)
          .map(([id]) => id);

        // 1. STUDENT/PARENT NOTICE
        await getDataProvider().createNotice({
          title: "Examinations Have Started",
          titleEn: "Examinations Have Started",
          content: `${sess.name} examinations are now in progress.\n\nPlease ensure punctual reporting, required stationery, and attendance compliance.`,
          contentEn: `${sess.name} examinations are now in progress.\n\nPlease ensure punctual reporting, required stationery, and attendance compliance.`,
          date: dateStr,
          isPinned: true,
          status: "Published",
          category: "examination",
          priority: "urgent",
          icon: "Play",
          allowedRoles: ["student", "parent"],
          sourceModule: "examinations",
          sourceEntityId: sess.id,
          sourceEntityType: "exam_cycle",
          targetAudience: {
            type: "CLASS",
            classIds: targetClassIds,
            includeStudents: true,
            includeParents: true,
          },
          metadata: {
            operationalState: "ongoing",
          },
        });

        // 2. TEACHER NOTICE
        await getDataProvider().createNotice({
          title: "Examination Operations Active",
          titleEn: "Examination Operations Active",
          content: `Examination execution has officially started.\n\nPlease maintain:\n- invigilation discipline\n- attendance records\n- malpractice reporting\n- schedule adherence`,
          contentEn: `Examination execution has officially started.\n\nPlease maintain:\n- invigilation discipline\n- attendance records\n- malpractice reporting\n- schedule adherence`,
          date: dateStr,
          isPinned: true,
          status: "Published",
          category: "examination",
          priority: "important",
          icon: "Play",
          allowedRoles: ["teacher"],
          sourceModule: "examinations",
          sourceEntityId: sess.id,
          sourceEntityType: "exam_cycle",
          targetAudience: {
            type: "CLASS",
            classIds: targetClassIds,
            includeClassTeachers: true,
            includeSubjectTeachers: true,
          },
          metadata: {
            operationalState: "ongoing",
          },
        });
      } else if (nextStatus === "evaluation") {
        // Resolve target class IDs
        const targetClassIds = Object.entries(sess.targetClasses || {})
          .filter(([, data]) => data.selected && data.sections.length > 0)
          .map(([id]) => id);

        // 1. SUBJECT TEACHER NOTICE
        await getDataProvider().createNotice({
          title: "Marks Entry Window Activated",
          titleEn: "Marks Entry Window Activated",
          content: `Evaluation and marks submission\nhas started for your assigned subjects.\n\nPlease complete:\n- answer sheet evaluation\n- marks entry\n- grade verification\nbefore deadline.`,
          contentEn: `Evaluation and marks submission\nhas started for your assigned subjects.\n\nPlease complete:\n- answer sheet evaluation\n- marks entry\n- grade verification\nbefore deadline.`,
          date: dateStr,
          isPinned: true,
          status: "Published",
          category: "examination",
          priority: "important",
          icon: "BookOpen",
          allowedRoles: ["teacher"],
          sourceModule: "examinations",
          sourceEntityId: sess.id,
          sourceEntityType: "exam_cycle",
          targetAudience: {
            type: "CLASS",
            classIds: targetClassIds,
            includeSubjectTeachers: true,
          },
          metadata: {
            operationalState: "evaluation",
            teacherNoticeRole: "subject_teacher",
            sourceEntityId: sess.id,
            sourceEntityType: "exam_cycle",
          },
          requiresAction: true,
          actionType: "submit_marks",
        });

        // 2. CLASS TEACHER NOTICE
        await getDataProvider().createNotice({
          title: "Evaluation Monitoring Started",
          titleEn: "Evaluation Monitoring Started",
          content: `Evaluation is currently in progress\nfor your assigned class.\n\nPlease monitor pending evaluations\nand coordinate result readiness.`,
          contentEn: `Evaluation is currently in progress\nfor your assigned class.\n\nPlease monitor pending evaluations\nand coordinate result readiness.`,
          date: dateStr,
          isPinned: true,
          status: "Published",
          category: "examination",
          priority: "important",
          icon: "BookOpen",
          allowedRoles: ["teacher"],
          sourceModule: "examinations",
          sourceEntityId: sess.id,
          sourceEntityType: "exam_cycle",
          targetAudience: {
            type: "CLASS",
            classIds: targetClassIds,
            includeClassTeachers: true,
          },
          metadata: {
            operationalState: "evaluation",
            teacherNoticeRole: "class_teacher",
            sourceEntityId: sess.id,
            sourceEntityType: "exam_cycle",
          },
        });
      } else if (nextStatus === "published") {
        await getDataProvider().createNotice({
          title: `Report Cards & Results Published: ${sess?.name || "Examinations"}`,
          titleEn: `Report Cards & Results Published: ${sess?.name || "Examinations"}`,
          content: `Great news! The official performance scores and report card sheets for "${sess?.name || "the exam term"}" are now live. Students and parents can preview and download printable report cards directly from their dashboards.`,
          contentEn: `Great news! The official performance scores and report card sheets for "${sess?.name || "the exam term"}" are now live. Students and parents can preview and download printable report cards directly from their dashboards.`,
          date: dateStr,
          audience: "ALL",
          isPinned: true,
          status: "Published",
          category: "examination",
          priority: "high",
          icon: "Trophy",
          targetClasses: sess?.targetClasses || {},
        });
      }

      await fetchBaseData();
    } catch (err) {
      console.error("Transition status or notice creation failed:", err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (
      !confirm(
        "Are you sure you want to delete this exam session? All associated class schedules will be permanently deleted!",
      )
    )
      return;
    try {
      await deleteExamSession(sessionId);
      await fetchBaseData();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Tab 2: Date Sheets / Scheduling Logic ──
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedSessionId) || null;
  }, [sessions, selectedSessionId]);

  // Filter classes to only those targeted by the selected exam session
  const eligibleClassesForSession = useMemo(() => {
    if (
      !activeSession?.targetClasses ||
      Object.keys(activeSession.targetClasses).length === 0
    ) {
      return classes; // Fallback to all classes if no targetClasses (legacy sessions)
    }
    return classes.filter((c) => {
      const target = activeSession.targetClasses[c.id];
      return target?.selected && target.sections?.length > 0;
    });
  }, [activeSession, classes]);

  // Auto-select first eligible class when session changes (fixes empty selectedClassId bug)
  useEffect(() => {
    if (eligibleClassesForSession.length > 0) {
      setSelectedClassId((prev) => {
        const stillValid = eligibleClassesForSession.some((c) => c.id === prev);
        return stillValid ? prev : eligibleClassesForSession[0].id;
      });
    }
  }, [eligibleClassesForSession]);

  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Derive canonical subjects for the selected class using subjectArchitecture
  // (same source as compliance validator — avoids streamApplicability seed bug)
  const classSubjects = useMemo(() => {
    if (!selectedClassId || !activeClass) return [];
    let level = normalizeClassLevel(activeClass.level || "");
    const canonical = getStudentSubjects(level, activeClass.streamId || null);
    if (canonical.length > 0) {
      return canonical
        .map((cs) => subjects.find((s) => s.id === cs.id))
        .filter(Boolean);
    }
    // Fallback: derive from teacher-subject assignments
    const classAsgns = assignments.filter((a) => a.classId === selectedClassId);
    const assignedSubIds = [...new Set(classAsgns.map((a) => a.subjectId))];
    return subjects.filter(
      (s) => assignedSubIds.includes(s.id) && !s.id.startsWith("act-"),
    );
  }, [subjects, selectedClassId, activeClass, assignments]);

  const classPapersMap = useMemo(() => {
    const papersInSession = papers.filter(
      (p) =>
        p.examSessionId === selectedSessionId && p.classId === selectedClassId,
    );
    const map = {};
    papersInSession.forEach((p) => {
      map[p.subjectId] = p;
    });
    return map;
  }, [papers, selectedSessionId, selectedClassId]);

  const handleOpenSchedulePaper = (subjectId, existingPaper = null) => {
    const isTerm = activeSession?.type === "TERM";
    const sub = subjects.find((s) => s.id === subjectId);

    // Core Science check for Theory/Practical splits
    const isScienceCore =
      sub?.id === "sub-phy" ||
      sub?.id === "sub-chem" ||
      sub?.id === "sub-bio" ||
      sub?.id === "sub-cs";

    if (existingPaper) {
      setPaperForm({
        ...existingPaper,
      });
    } else {
      // Default to Template assisted values
      setPaperForm({
        id: null,
        examSessionId: selectedSessionId,
        classId: selectedClassId,
        subjectId: subjectId,
        date: "",
        startTime: "09:00",
        endTime: isTerm ? "12:00" : "10:00",
        duration: isTerm ? 180 : 60,
        maxMarks: isTerm ? 100 : 40,
        passingMarks: isTerm ? 33 : 13,
        theoryMarks: isTerm ? (isScienceCore ? 70 : 100) : 40,
        practicalMarks: isTerm ? (isScienceCore ? 30 : 0) : 0,
        roomId: rooms[0]?.id || "",
        invigilatorTeacherIds: [],
        examMode: isScienceCore && isTerm ? "practical" : "written",
        status: "scheduled",
      });
    }
    setClashWarnings([]);
    setSchedulePaperOpen(true);
  };

  // Run live validation on form fields change
  const handlePaperFormChange = async (fields) => {
    const updatedForm = { ...paperForm, ...fields };
    setPaperForm(updatedForm);

    // Conflict calculations
    if (updatedForm.date && updatedForm.startTime && updatedForm.endTime) {
      const conflicts = await validateExamPaperConflicts(
        updatedForm,
        updatedForm.id,
      );
      setClashWarnings(conflicts);
    }
  };

  const handleSavePaper = async () => {
    // If danger clashes exist, warn admin
    const hasDanger = clashWarnings.some((w) => w.type === "danger");
    if (hasDanger) {
      if (
        !confirm(
          "⚠️ Danger conflict warning! Overlapping resource bookings detected. Do you want to OVERRIDE and save this slot?",
        )
      ) {
        return;
      }
    }

    try {
      if (paperForm.id) {
        // Update
        await updateExamPaper(paperForm.id, paperForm);
      } else {
        // Create
        await createExamPaper(paperForm);
      }
      await fetchBaseData();
      setSchedulePaperOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePaper = async (paperId) => {
    if (!confirm("Are you sure you want to cancel this scheduled exam slot?"))
      return;
    try {
      await deleteExamPaper(paperId);
      await fetchBaseData();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Tab 2: Date Sheets Bulk Smart Actions ──
  const handleBulkAutoSpace = async () => {
    if (!selectedSessionId || !selectedClassId) return;
    const classPapers = papers.filter(
      (p) =>
        p.examSessionId === selectedSessionId && p.classId === selectedClassId,
    );
    if (classPapers.length === 0) {
      alert(
        "⚠️ No papers scheduled yet! Apply a template or schedule a slot first.",
      );
      return;
    }

    if (
      !confirm(
        "This will re-space all existing scheduled exam papers for this class with 1 gap day starting from the session's start date, avoiding Sundays automatically. Proceed?",
      )
    )
      return;

    try {
      const activeSess = sessions.find((s) => s.id === selectedSessionId);
      const startBase = activeSess?.startDate
        ? new Date(activeSess.startDate)
        : new Date();

      // Sort existing papers by subject or existing date
      const sortedPapers = [...classPapers].sort((a, b) =>
        a.date.localeCompare(b.date),
      );

      let currentOffset = 0;
      for (const p of sortedPapers) {
        let examDate = new Date(startBase);
        examDate.setDate(examDate.getDate() + currentOffset);
        while (examDate.getDay() === 0) {
          // Sunday
          currentOffset += 1;
          examDate = new Date(startBase);
          examDate.setDate(examDate.getDate() + currentOffset);
        }

        const dateStr = examDate.toISOString().split("T")[0];
        await updateExamPaper(p.id, { ...p, date: dateStr });
        currentOffset += 2; // Spaced with 1 gap day (every 2 days)
      }

      await fetchBaseData();
      alert("✅ Exams successfully auto-spaced with Sunday protection!");
    } catch (err) {
      console.error("Bulk auto-spacing failed:", err);
    }
  };

  const handleBulkShiftPlusOne = async () => {
    if (!selectedSessionId || !selectedClassId) return;
    const classPapers = papers.filter(
      (p) =>
        p.examSessionId === selectedSessionId && p.classId === selectedClassId,
    );
    if (classPapers.length === 0) {
      alert("⚠️ No papers scheduled yet!");
      return;
    }

    try {
      for (const p of classPapers) {
        const currDate = new Date(p.date);
        currDate.setDate(currDate.getDate() + 1);
        if (currDate.getDay() === 0) {
          // Sunday, shift to Monday
          currDate.setDate(currDate.getDate() + 1);
        }
        const dateStr = currDate.toISOString().split("T")[0];
        await updateExamPaper(p.id, { ...p, date: dateStr });
      }
      await fetchBaseData();
    } catch (err) {
      console.error("Bulk shifting failed:", err);
    }
  };

  const handleBulkAvoidSundays = async () => {
    if (!selectedSessionId || !selectedClassId) return;
    const classPapers = papers.filter(
      (p) =>
        p.examSessionId === selectedSessionId && p.classId === selectedClassId,
    );
    if (classPapers.length === 0) return;

    try {
      let shiftCount = 0;
      for (const p of classPapers) {
        const currDate = new Date(p.date);
        if (currDate.getDay() === 0) {
          // Sunday, shift to Monday
          currDate.setDate(currDate.getDate() + 1);
          const dateStr = currDate.toISOString().split("T")[0];
          await updateExamPaper(p.id, { ...p, date: dateStr });
          shiftCount += 1;
        }
      }
      await fetchBaseData();
      if (shiftCount > 0) {
        alert(`✅ Shifted ${shiftCount} papers away from Sundays to Monday!`);
      } else {
        alert("ℹ️ No Sunday exams detected. Everything is already protected!");
      }
    } catch (err) {
      console.error("Bulk Sunday avoidance failed:", err);
    }
  };

  const handleBulkAutoSchedule = async () => {
    if (!selectedSessionId || !selectedClassId || !activeSession) return;
    if (classSubjects.length === 0) {
      alert("⚠️ No subjects found for this class.");
      return;
    }
    const start = activeSession.startDate
      ? new Date(activeSession.startDate)
      : null;
    const end = activeSession.endDate ? new Date(activeSession.endDate) : null;
    if (!start || !end || isNaN(start) || isNaN(end)) {
      alert(
        "⚠️ This exam cycle has no valid date range. Please set Start & End dates first.",
      );
      return;
    }

    // Build pool of all valid dates (skip Sundays)
    const validDates = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      if (cursor.getDay() !== 0) {
        validDates.push(cursor.toISOString().split("T")[0]);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (validDates.length < classSubjects.length) {
      alert(
        `⚠️ Not enough weekdays (${validDates.length}) in the date range to schedule all ${classSubjects.length} subjects. Please widen the date range.`,
      );
      return;
    }

    // Pick unique random dates spread across the range
    const shuffled = [...validDates].sort(() => Math.random() - 0.5);
    const pickedDates = shuffled.slice(0, classSubjects.length).sort();

    try {
      for (let i = 0; i < classSubjects.length; i++) {
        const sub = classSubjects[i];
        const existing = papers.find(
          (p) =>
            p.examSessionId === selectedSessionId &&
            p.classId === selectedClassId &&
            p.subjectId === sub.id,
        );
        const paperData = {
          examSessionId: selectedSessionId,
          classId: selectedClassId,
          subjectId: sub.id,
          date: pickedDates[i],
          startTime: "09:00",
          endTime: "10:00",
          duration: 60,
          maxMarks: 40,
          passingMarks: 13,
          theoryMarks: 40,
          practicalMarks: 0,
          examMode: "written",
          status: "scheduled",
          invigilatorTeacherIds: [],
          roomId: "",
        };
        if (existing) {
          await updateExamPaper(existing.id, {
            ...existing,
            date: pickedDates[i],
          });
        } else {
          await createExamPaper(paperData);
        }
      }
      await fetchBaseData();
      alert(
        `✅ Auto-scheduled ${classSubjects.length} subjects across ${pickedDates[0]} to ${pickedDates[pickedDates.length - 1]}!`,
      );
    } catch (err) {
      console.error("Auto-schedule failed:", err);
      alert("❌ Auto-schedule failed: " + err.message);
    }
  };

  // ── Tab 3: Marks Progression Logic ──
  const classProgressStats = useMemo(() => {
    if (!selectedSessionId) return [];

    return classes.map((cls) => {
      // Find papers scheduled for this class
      const classScheds = papers.filter(
        (p) => p.examSessionId === selectedSessionId && p.classId === cls.id,
      );

      const subjectStats = classScheds.map((paper) => {
        const sub = subjects.find((s) => s.id === paper.subjectId);

        // Count results entered
        const paperResults = results.filter(
          (r) =>
            r.examId === selectedSessionId &&
            r.classId === cls.id &&
            r.subjectId === paper.subjectId,
        );
        const classStudents = students.filter((s) => s.classId === cls.id);
        const totalCount = classStudents.length || 1;
        const enteredCount = paperResults.length;
        const percent = Math.min(
          100,
          Math.round((enteredCount / totalCount) * 100),
        );

        let color = "bg-gray-100 text-gray-500";
        if (percent === 100)
          color = "bg-emerald-50 text-emerald-700 border-emerald-100";
        else if (percent > 0)
          color = "bg-amber-50 text-amber-700 border-amber-100";

        return {
          paperId: paper.id,
          subjectId: paper.subjectId,
          subjectName: sub?.name || paper.subjectId,
          enteredCount,
          totalCount,
          percent,
          color,
        };
      });

      return {
        classId: cls.id,
        className: cls.displayName || `${cls.name}-${cls.section}`,
        subjects: subjectStats,
      };
    });
  }, [classes, papers, selectedSessionId, results, students, subjects]);

  const handleOpenMarksOverride = async (classId, subjectId) => {
    setActiveOverrideClassId(classId);
    setActiveOverrideSubjectId(subjectId);

    // Find all students in class
    const classStudents = students.filter((s) => s.classId === classId);

    // Find entered marks
    const classResults = results.filter(
      (r) =>
        r.examId === selectedSessionId &&
        r.classId === classId &&
        r.subjectId === subjectId,
    );

    const overrideList = classStudents.map((stud) => {
      const m = classResults.find((r) => r.studentId === stud.id);
      return {
        studentId: stud.id,
        name: stud.name,
        admissionNo: stud.admissionNo,
        marksObtained: m ? m.marksObtained.toString() : "",
        remarks: m ? m.remarks : "",
      };
    });

    setOverrideStudentMarks(overrideList);
    setEvaluationOverrideOpen(true);
  };

  const handleSaveMarksOverride = async () => {
    try {
      const provider = getDataProvider();
      const currentResults = await provider.getResults();

      for (const override of overrideStudentMarks) {
        if (override.marksObtained === "") continue; // Skip blank inputs

        const record = {
          studentId: override.studentId,
          classId: activeOverrideClassId,
          subjectId: activeOverrideSubjectId,
          examId: selectedSessionId,
          marksObtained: parseFloat(override.marksObtained),
          maxMarks: activeSession?.type === "TERM" ? 100 : 40,
          remarks: override.remarks || "Satisfactory progress",
          grade:
            override.marksObtained !== ""
              ? parseFloat(override.marksObtained) >= 90
                ? "A+"
                : parseFloat(override.marksObtained) >= 80
                  ? "A"
                  : "B"
              : "B",
          teacherId: "teach-001", // Admin override signature
        };

        const existingIdx = currentResults.findIndex(
          (r) =>
            r.studentId === record.studentId &&
            r.examId === record.examId &&
            r.subjectId === record.subjectId,
        );

        if (existingIdx !== -1) {
          await provider.updateResult(currentResults[existingIdx].id, record);
        } else {
          await provider.createResult(record);
        }
      }

      await fetchBaseData();
      setEvaluationOverrideOpen(false);
    } catch (err) {
      console.error("Override marks failed:", err);
    }
  };

  // ── Tab 4: Results & Publications Logic ──
  const analyticsData = useMemo(() => {
    if (!selectedSessionId || results.length === 0) return null;

    // Filter results for this exam session
    const sessionResults = results.filter(
      (r) => r.examId === selectedSessionId,
    );
    if (sessionResults.length === 0) return null;

    const totalResults = sessionResults.length;
    // Passing threshold: 33%
    const passedCount = sessionResults.filter(
      (r) => r.marksObtained / r.maxMarks >= 0.33,
    ).length;
    const passPercentage = Math.round((passedCount / totalResults) * 100);

    // Overall topper calculation
    // Match totals for students with 3+ subjects
    const studentTotals = {};
    sessionResults.forEach((r) => {
      if (!studentTotals[r.studentId]) {
        studentTotals[r.studentId] = {
          totalObtained: 0,
          totalMax: 0,
          count: 0,
        };
      }
      studentTotals[r.studentId].totalObtained += r.marksObtained;
      studentTotals[r.studentId].totalMax += r.maxMarks;
      studentTotals[r.studentId].count += 1;
    });

    let topperId = null;
    let highestPercentage = 0;
    Object.entries(studentTotals).forEach(([studId, data]) => {
      const percent = (data.totalObtained / data.totalMax) * 100;
      if (percent > highestPercentage) {
        highestPercentage = percent;
        topperId = studId;
      }
    });

    const topperStud = students.find((s) => s.id === topperId);

    return {
      passPercentage,
      totalGradesAwarded: totalResults,
      topperName: topperStud ? topperStud.name : "N/A",
      topperScore: highestPercentage
        ? `${highestPercentage.toFixed(1)}%`
        : "N/A",
    };
  }, [results, selectedSessionId, students]);

  const handleOpenReportCardPreview = (studentId) => {
    setReportCardStudentId(studentId);
    setReportCardPreviewOpen(true);
  };

  const reportCardData = useMemo(() => {
    if (!reportCardStudentId || !selectedSessionId) return null;

    const stud = students.find((s) => s.id === reportCardStudentId);
    const cls = classes.find((c) => c.id === stud?.classId);
    const studResults = results.filter(
      (r) =>
        r.studentId === reportCardStudentId && r.examId === selectedSessionId,
    );

    const scoredRows = studResults.map((r) => {
      const sub = subjects.find((s) => s.id === r.subjectId);

      return {
        subjectName: sub?.name || r.subjectId,
        marksObtained: r.marksObtained,
        maxMarks: r.maxMarks,
        grade: r.grade,
        remarks: r.remarks,
      };
    });

    const totalMax = scoredRows.reduce((sum, r) => sum + r.maxMarks, 0);
    const totalObtained = scoredRows.reduce(
      (sum, r) => sum + r.marksObtained,
      0,
    );
    const overallPercentage =
      totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "0.0";

    return {
      studentName: stud?.name,
      admissionNo: stud?.admissionNo,
      className: cls?.displayName || cls?.name,
      rows: scoredRows,
      totalMax,
      totalObtained,
      overallPercentage,
    };
  }, [
    reportCardStudentId,
    selectedSessionId,
    students,
    classes,
    results,
    subjects,
  ]);

  // Simple HSL helper for progress colored borders
  const getProgressColor = (percent) => {
    if (percent === 100) return "#10b981"; // Emerald
    if (percent > 0) return "#f59e0b"; // Amber
    return "#9ca3af"; // Gray
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Examination Management"
        description="Administer academic terms, auto-generate relational timetables, handle conflict checking, and manage scorecards."
        breadcrumbs={["Admin Portal", "Academic", "Examination Management"]}
        actionButton={
          <button
            onClick={() => setCreateSessionOpen(true)}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-all"
          >
            <Plus size={15} />
            <span>CREATE NEW SESSION</span>
          </button>
        }
      />

      {/* Top operational metric stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AdminStatCard
          title="Total Exam Cycles"
          value={sessions.length.toString()}
          badgeText="Baseline Cycles"
          badgeType="success"
          icon={Calendar}
        />
        <AdminStatCard
          title="Total Scheduled Papers"
          value={papers.length.toString()}
          badgeText="Relationally Structured"
          badgeType="info"
          icon={BookOpen}
          color="#0096c7"
          bg="#ade8f4"
        />
        <AdminStatCard
          title="Evaluations Logged"
          value={results.length.toString()}
          badgeText="Aggregated Scores"
          badgeType="success"
          icon={Award}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* Primary Workflow Tabs */}
      <div className="flex gap-1.5 border-b border-[#caf0f8]/50 pb-px">
        {workflowTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
            }}
            className={`px-5 py-3 rounded-t-2xl text-xs font-black tracking-wider uppercase transition-colors relative ${
              activeTab === tab.id
                ? "bg-white border border-[#caf0f8] border-b-transparent text-[#0077b6]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0077b6]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── TAB 1: SESSIONS ── */}
            {activeTab === "sessions" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.map((sess) => (
                    <MainCard
                      key={sess.id}
                      className="p-5 hover:shadow-md transition-shadow relative overflow-hidden bg-white border border-[#caf0f8]/50 flex flex-col justify-between"
                    >
                      <div className="absolute top-4 right-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            sess.status === "published"
                              ? "bg-emerald-50 border border-emerald-100 text-emerald-600"
                              : sess.status === "ongoing"
                                ? "bg-sky-50 border border-sky-100 text-sky-600 animate-pulse"
                                : sess.status === "scheduled"
                                  ? "bg-indigo-50 border border-indigo-100 text-indigo-600"
                                  : sess.status === "evaluation"
                                    ? "bg-amber-50 border border-amber-100 text-amber-600"
                                    : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          {sess.status}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block">
                            Academic Year: {sess.academicYear}
                          </span>
                          <h3 className="text-sm font-black text-[#03045e] tracking-tight mt-1 truncate pr-16">
                            {sess.name}
                          </h3>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                            <Calendar size={13} className="text-[#00b4d8]" />
                            <span>
                              {sess.startDate} to {sess.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <Users size={13} className="text-[#00b4d8]" />
                            <span>
                              Target:{" "}
                              <strong className="text-[#0077b6]">
                                {sess.targetClasses &&
                                Object.keys(sess.targetClasses).length > 0
                                  ? Object.entries(sess.targetClasses)
                                      .filter(
                                        ([, data]) =>
                                          data.selected &&
                                          data.sections.length > 0,
                                      )
                                      .map(([classId, data]) => {
                                        const cls = classes.find(
                                          (c) => c.id === classId,
                                        );
                                        if (!cls) return classId;
                                        const levelLabel =
                                          cls.level ||
                                          cls.name?.split("-")[0] ||
                                          classId;
                                        return `${levelLabel} (${data.sections.join(", ")})`;
                                      })
                                      .join(", ")
                                  : "All Classes"}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 border-t border-[#caf0f8]/50 pt-4 flex items-center justify-between gap-3">
                        {sess.status !== "published" && (
                          <button
                            onClick={() =>
                              handleTransitionStatus(sess.id, sess.status)
                            }
                            className="flex items-center gap-1 bg-[#ade8f4] hover:bg-[#ade8f4]/80 text-[#03045e] px-3.5 py-1.5 rounded-xl text-[9px] font-black transition-colors"
                          >
                            <Play size={10} />
                            <span>
                              {sess.status === "draft"
                                ? "RELEASE DATESHEET"
                                : sess.status === "scheduled"
                                  ? "START EXAMS"
                                  : sess.status === "ongoing"
                                    ? "START EVALUATION"
                                    : "PUBLISH RESULTS"}
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteSession(sess.id)}
                          className="ml-auto p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                          aria-label="Delete Session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </MainCard>
                  ))}
                </div>

                {/* Relational Lifecycle Stages Explainer Legend */}
                <MainCard className="p-6 bg-gradient-to-r from-slate-50 to-[#caf0f8]/10 border border-[#caf0f8]/40">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                        Examination Session Lifecycle Explainer
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                        Understanding the 5 operational progression stages of
                        academic exam cycles
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
                      <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-400">
                              <Edit size={12} />
                            </span>
                            <strong className="text-[11px] font-black text-gray-600 uppercase tracking-wide">
                              1. Draft
                            </strong>
                          </div>
                          <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-2">
                            Internal planning only. Students and parents see
                            &quot;Tentative examination window announced&quot;.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-500">
                              <Calendar size={12} />
                            </span>
                            <strong className="text-[11px] font-black text-indigo-600 uppercase tracking-wide">
                              2. Scheduled
                            </strong>
                          </div>
                          <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-2">
                            Official datesheet released. Notifications are
                            dispatched, admit cards are enabled, and portal
                            visibility is active.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-sky-50 border border-sky-100 text-sky-500">
                              <Clock size={12} />
                            </span>
                            <strong className="text-[11px] font-black text-sky-600 uppercase tracking-wide">
                              3. Ongoing
                            </strong>
                          </div>
                          <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-2">
                            Exam execution phase. Attendance locks, malpractice
                            logs, and emergency notices are active.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-500">
                              <CheckCircle size={12} />
                            </span>
                            <strong className="text-[11px] font-black text-amber-600 uppercase tracking-wide">
                              4. Evaluation
                            </strong>
                          </div>
                          <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-2">
                            Secure marks entry phase. Subject teachers are
                            granted secure write access to log scores.
                            Progression bars track grading completion.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-500">
                              <Award size={12} />
                            </span>
                            <strong className="text-[11px] font-black text-emerald-600 uppercase tracking-wide">
                              5. Published
                            </strong>
                          </div>
                          <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-2">
                            Results declared school-wide and visible to
                            students/parents. Relational report cards are fully
                            downloadable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </MainCard>
              </div>
            )}

            {/* ── TAB 2: DATE SHEETS ── */}
            {activeTab === "dateSheets" && (
              <div className="space-y-6">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-8 bg-white border border-[#caf0f8]/50 rounded-3xl shadow-sm animate-fade-in">
                    <div className="w-16 h-16 bg-[#ade8f4]/30 rounded-2xl flex items-center justify-center text-[#0077b6] mb-5">
                      <AlertCircle size={32} />
                    </div>
                    <h3 className="text-base font-black text-[#03045e] uppercase tracking-wider">
                      No Exam Cycles Configured
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">
                      You must create an academic session before scheduling
                      datesheets
                    </p>
                    <p className="text-xs text-gray-500 font-semibold max-w-sm mt-3 leading-relaxed">
                      Head over to the <strong>Examination Sessions</strong> tab
                      to schedule your first End-of-Term or Unit Test academic
                      cycle.
                    </p>
                    <button
                      onClick={() => setActiveTab("sessions")}
                      className="mt-6 bg-[#0077b6] hover:bg-[#0096c7] text-white text-xs font-black px-6 py-3 rounded-2xl transition-all shadow-md hover:-translate-y-0.5"
                    >
                      GOTO SESSIONS TAB
                    </button>
                  </div>
                ) : (
                  <>
                    <MainCard className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Active Exam Cycle
                          </label>
                          <select
                            value={selectedSessionId}
                            onChange={(e) => {
                              setSelectedSessionId(e.target.value);
                              setSelectedClassId(""); // Reset class selection when session changes
                            }}
                            className="w-full p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold outline-none cursor-pointer"
                          >
                            {sessions.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.status.toUpperCase()})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Administrative Target Class
                          </label>
                          <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold outline-none cursor-pointer"
                          >
                            {eligibleClassesForSession.length === 0 ? (
                              <option value="">
                                No classes targeted for this session
                              </option>
                            ) : (
                              eligibleClassesForSession.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.displayName || `${c.name}-${c.section}`}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>
                    </MainCard>

                    {activeSession?.status === "draft" && (
                      <MainCard className="p-5 border-l-4 border-l-blue-500 bg-blue-50/15 border border-blue-100 flex gap-4 items-start shadow-sm">
                        <div className="p-2.5 bg-blue-100/80 text-blue-600 rounded-xl flex-shrink-0">
                          <AlertTriangle size={18} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wide">
                            Draft Phase Active (Planning Stage)
                          </h4>
                          <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                            This examination cycle is currently in{" "}
                            <strong>Draft</strong> status. Schedule exam papers
                            for each subject below. Once all papers are
                            scheduled, click <strong>RELEASE DATESHEET</strong>{" "}
                            to publish the datesheet to students, parents, and
                            teachers.
                          </p>
                        </div>
                      </MainCard>
                    )}

                    {/* Date Sheet Bulk Smart Actions */}
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/60 space-y-3.5">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 px-1">
                        <div>
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider leading-none">
                            Date Sheet Bulk Smart Actions
                          </h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-none">
                            Perform administrative scheduling micro-tasks in
                            bulk for this class
                          </p>
                        </div>
                        <span className="self-start sm:self-auto text-[9px] font-black text-[#0077b6] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 uppercase tracking-widest leading-none">
                          Active: {activeClass?.displayName || "Select Class"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <button
                          onClick={handleBulkAutoSpace}
                          className="p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-[#0077b6]/30 active:scale-[0.98] group"
                        >
                          <span className="p-2 rounded-xl bg-sky-50 text-sky-500 group-hover:bg-sky-100 transition-colors">
                            <Clock size={14} />
                          </span>
                          <div className="space-y-0.5">
                            <strong className="text-[10px] font-black text-slate-700 block uppercase tracking-wide leading-none">
                              Auto-Space Exams
                            </strong>
                            <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none mt-1">
                              Gap days & Sundays
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={handleBulkShiftPlusOne}
                          className="p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-rose-200 active:scale-[0.98] group"
                        >
                          <span className="p-2 rounded-xl bg-rose-50 text-rose-500 group-hover:bg-rose-100 transition-colors">
                            <Plus size={14} />
                          </span>
                          <div className="space-y-0.5">
                            <strong className="text-[10px] font-black text-slate-700 block uppercase tracking-wide leading-none">
                              Shift All +1 Day
                            </strong>
                            <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none mt-1">
                              Push dates sheet
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={handleBulkAvoidSundays}
                          className="p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-200 active:scale-[0.98] group"
                        >
                          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100 transition-colors">
                            <CheckCircle size={14} />
                          </span>
                          <div className="space-y-0.5">
                            <strong className="text-[10px] font-black text-slate-700 block uppercase tracking-wide leading-none">
                              Avoid Sundays
                            </strong>
                            <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none mt-1">
                              Auto-shift to Monday
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={handleBulkAutoSchedule}
                          className="p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-violet-200 active:scale-[0.98] group"
                        >
                          <span className="p-2 rounded-xl bg-violet-50 text-violet-500 group-hover:bg-violet-100 transition-colors">
                            <Shuffle size={14} />
                          </span>
                          <div className="space-y-0.5">
                            <strong className="text-[10px] font-black text-slate-700 block uppercase tracking-wide leading-none">
                              Auto Schedule
                            </strong>
                            <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none mt-1">
                              Fill all subjects randomly
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Assisted Matrix Board */}
                    <div className="space-y-4">
                      <div className="px-2">
                        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
                          Schedule Matrix for Class:{" "}
                          <span className="text-[#0077b6]">
                            {activeClass?.displayName ||
                              activeClass?.name ||
                              "N/A"}
                          </span>
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                          Relationally derived subjects requiring schedule slots
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {classSubjects.map((sub) => {
                          const paper = classPapersMap[sub.id];

                          return (
                            <div
                              key={sub.id}
                              className="bg-white p-4.5 rounded-2xl border border-[#caf0f8]/50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow"
                            >
                              <div>
                                <span className="text-[9px] font-black px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 uppercase">
                                  {sub.id}
                                </span>
                                <h4 className="text-sm font-black text-[#03045e] mt-1">
                                  {sub.name}
                                </h4>
                              </div>

                              {paper ? (
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                  <div className="grid grid-cols-2 md:flex items-center gap-4">
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] uppercase font-bold text-gray-400">
                                        Date
                                      </span>
                                      <p className="text-xs font-black text-[#03045e]">
                                        {paper.date}
                                      </p>
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] uppercase font-bold text-gray-400">
                                        Room
                                      </span>
                                      <p className="text-xs font-black text-[#03045e]">
                                        {(() => {
                                          const rObj = rooms.find(
                                            (rm) =>
                                              (rm.roomId || rm.id) ===
                                              paper.roomId,
                                          );
                                          return rObj
                                            ? rObj.roomNumber || rObj.name
                                            : paper.roomId || "Main Hall";
                                        })()}
                                      </p>
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] uppercase font-bold text-gray-400">
                                        Timing
                                      </span>
                                      <p className="text-xs font-black text-[#03045e]">
                                        {paper.startTime} - {paper.endTime}
                                      </p>
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] uppercase font-bold text-gray-400">
                                        Invigilator
                                      </span>
                                      <p className="text-xs font-black text-indigo-600">
                                        {teachers.find(
                                          (t) =>
                                            t.id ===
                                            paper.invigilatorTeacherIds?.[0],
                                        )?.name || "Unassigned"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 ml-auto">
                                    <button
                                      onClick={() =>
                                        handleOpenSchedulePaper(sub.id, paper)
                                      }
                                      className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors"
                                      aria-label="Edit Paper"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeletePaper(paper.id)
                                      }
                                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                                      aria-label="Cancel Slot"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-4 ml-auto">
                                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                                    Slot Unscheduled
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleOpenSchedulePaper(sub.id)
                                    }
                                    className="flex items-center gap-1.5 bg-[#0077b6] hover:bg-[#0096c7] text-white text-[10px] font-black px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                                  >
                                    <Plus size={11} />
                                    <span>SCHEDULE SLOT</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── TAB: ONGOING OPERATIONS ── */}
            {activeTab === "ongoing" && activeSessionObj && (
              <OngoingOperationsDashboard
                activeExamCycle={activeSessionObj}
                papers={papers.filter(
                  (p) => p.examSessionId === activeSessionObj.id,
                )}
                subjects={subjects}
                classes={classes}
                students={students}
                teachers={teachers}
                rooms={rooms}
                onSendEmergencyBroadcast={handleSendEmergencyBroadcast}
              />
            )}

            {/* ── TAB 3: EVALUATION PROGRESS ── */}
            {activeTab === "evaluation" && (
              <div className="space-y-6">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-8 bg-white border border-[#caf0f8]/50 rounded-3xl shadow-sm animate-fade-in">
                    <div className="w-16 h-16 bg-[#ade8f4]/30 rounded-2xl flex items-center justify-center text-[#0077b6] mb-5">
                      <AlertCircle size={32} />
                    </div>
                    <h3 className="text-base font-black text-[#03045e] uppercase tracking-wider">
                      No Exam Cycles Configured
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">
                      You must create an academic session before managing marks
                    </p>
                    <p className="text-xs text-gray-500 font-semibold max-w-sm mt-3 leading-relaxed">
                      Head over to the <strong>Examination Sessions</strong> tab
                      to schedule your first End-of-Term or Unit Test academic
                      cycle.
                    </p>
                    <button
                      onClick={() => setActiveTab("sessions")}
                      className="mt-6 bg-[#0077b6] hover:bg-[#0096c7] text-white text-xs font-black px-6 py-3 rounded-2xl transition-all shadow-md hover:-translate-y-0.5"
                    >
                      GOTO SESSIONS TAB
                    </button>
                  </div>
                ) : (
                  <>
                    <MainCard className="p-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Active Exam Cycle
                        </label>
                        <select
                          value={selectedSessionId}
                          onChange={(e) => setSelectedSessionId(e.target.value)}
                          className="w-full md:w-1/2 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold outline-none cursor-pointer"
                        >
                          {sessions.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.status.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>
                    </MainCard>

                    {/* If selected session is in evaluation phase, unlock advanced dashboard */}
                    {sessions.find((s) => s.id === selectedSessionId)
                      ?.status === "evaluation" ? (
                      <EvaluationDashboard
                        examCycle={sessions.find(
                          (s) => s.id === selectedSessionId,
                        )}
                        papers={papers}
                        classes={classes}
                        subjects={subjects}
                        teachers={teachers}
                        rooms={rooms}
                        students={students}
                        results={results}
                        onRefresh={fetchBaseData}
                      />
                    ) : (
                      /* Progress Grid */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {classProgressStats.map((clsStat) => (
                          <MainCard
                            key={clsStat.classId}
                            className="p-5 flex flex-col gap-4"
                          >
                            <div>
                              <h4 className="text-sm font-black text-[#03045e] tracking-tight">
                                Class: {clsStat.className}
                              </h4>
                              <span className="text-[9px] uppercase font-bold text-gray-400 block mt-0.5">
                                Evaluated status of scheduled papers
                              </span>
                            </div>

                            <div className="space-y-3.5">
                              {clsStat.subjects.map((subStat) => (
                                <div
                                  key={subStat.subjectId}
                                  className="space-y-2"
                                >
                                  <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-[#03045e]">
                                      {subStat.subjectName}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-400 font-medium">
                                        {subStat.enteredCount}/
                                        {subStat.totalCount} graded
                                      </span>
                                      <span
                                        className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${subStat.color}`}
                                      >
                                        {subStat.percent === 100
                                          ? "Complete"
                                          : subStat.percent > 0
                                            ? "Partial"
                                            : "Pending"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* visual grading horizontal bar */}
                                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${subStat.percent}%` }}
                                      transition={{
                                        duration: 0.5,
                                        ease: "easeOut",
                                      }}
                                      className="h-full rounded-full"
                                      style={{
                                        backgroundColor: getProgressColor(
                                          subStat.percent,
                                        ),
                                      }}
                                    />
                                  </div>

                                  {/* override scorecard triggers */}
                                  <div className="flex justify-end pt-1">
                                    <button
                                      onClick={() =>
                                        handleOpenMarksOverride(
                                          clsStat.classId,
                                          subStat.subjectId,
                                        )
                                      }
                                      className="text-[9px] font-black text-[#0077b6] hover:underline uppercase tracking-wide flex items-center gap-1"
                                    >
                                      <Edit size={9} />
                                      <span>ADMIN OVERRIDE SCORECARD</span>
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {clsStat.subjects.length === 0 && (
                                <div className="text-center py-6 text-gray-400 text-xs font-bold uppercase">
                                  No scheduled papers for this class
                                </div>
                              )}
                            </div>
                          </MainCard>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── TAB 4: PUBLISH & REPORT CARDS ── */}
            {activeTab === "publish" && (
              <div className="space-y-6">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-8 bg-white border border-[#caf0f8]/50 rounded-3xl shadow-sm animate-fade-in">
                    <div className="w-16 h-16 bg-[#ade8f4]/30 rounded-2xl flex items-center justify-center text-[#0077b6] mb-5">
                      <AlertCircle size={32} />
                    </div>
                    <h3 className="text-base font-black text-[#03045e] uppercase tracking-wider">
                      No Exam Cycles Configured
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">
                      You must create an academic session before publishing
                      results
                    </p>
                    <p className="text-xs text-gray-500 font-semibold max-w-sm mt-3 leading-relaxed">
                      Head over to the <strong>Examination Sessions</strong> tab
                      to schedule your first End-of-Term or Unit Test academic
                      cycle.
                    </p>
                    <button
                      onClick={() => setActiveTab("sessions")}
                      className="mt-6 bg-[#0077b6] hover:bg-[#0096c7] text-white text-xs font-black px-6 py-3 rounded-2xl transition-all shadow-md hover:-translate-y-0.5"
                    >
                      GOTO SESSIONS TAB
                    </button>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const cycle = sessions.find(
                        (s) => s.id === selectedSessionId,
                      );
                      if (
                        cycle?.status === "published" ||
                        cycle?.status === "evaluation"
                      ) {
                        return (
                          <PublicationDashboard
                            examCycle={cycle}
                            papers={papers}
                            classes={classes}
                            subjects={subjects}
                            teachers={teachers}
                            students={students}
                            results={results}
                            onRefresh={fetchBaseData}
                          />
                        );
                      }

                      return (
                        <>
                          <MainCard className="p-6 bg-gradient-to-r from-[#03045e] to-[#023e8a] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#ade8f4]">
                                Publication Console
                              </span>
                              <h3 className="text-lg font-black tracking-tight leading-none">
                                {activeSession?.name || "Term Exam"}
                              </h3>
                              <p className="text-xs text-white/70 font-semibold max-w-lg leading-relaxed">
                                Toggle student and parent dashboard visibility.
                                When published, report cards are dynamically
                                rendered using relational marks.
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              {activeSession?.status === "published" ? (
                                <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 text-emerald-300 font-black text-xs rounded-xl border border-emerald-400/30 uppercase tracking-widest shadow-sm">
                                  <CheckCircle2 size={15} />
                                  <span>PUBLISHED TO PORTALS</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleTransitionStatus(
                                      selectedSessionId,
                                      "completed",
                                    )
                                  }
                                  className="flex items-center gap-1.5 bg-[#0077b6] hover:bg-[#0096c7] text-white text-xs font-black px-6 py-3 rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                >
                                  <Play size={13} />
                                  <span>PUBLISH RESULTS NOW</span>
                                </button>
                              )}
                            </div>
                          </MainCard>

                          {/* Session-wide Metrics */}
                          {analyticsData ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              <AdminStatCard
                                title="Average Pass Rate"
                                value={`${analyticsData.passPercentage}%`}
                                badgeText="Theory & Practicals"
                                badgeType="success"
                                icon={Award}
                              />
                              <AdminStatCard
                                title="Topper Score"
                                value={analyticsData.topperScore}
                                badgeText={`Student Topper: ${analyticsData.topperName}`}
                                badgeType="info"
                                icon={Sparkles}
                                color="#0096c7"
                                bg="#ade8f4"
                              />
                              <AdminStatCard
                                title="Total Papers Evaluated"
                                value={analyticsData.totalGradesAwarded.toString()}
                                badgeText="Results Aggregated"
                                badgeType="success"
                                icon={CheckCircle}
                                color="#03045e"
                                bg="#e0f2fe"
                              />
                            </div>
                          ) : (
                            <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold uppercase tracking-wider text-xs">
                              No results logged yet under this exam cycle
                            </div>
                          )}

                          {/* Print/Preview Grid */}
                          <div className="space-y-4">
                            <div className="px-2">
                              <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
                                Student Report Card Previews
                              </h3>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">
                                Inspect generated metrics and preview printable
                                institutional report card sheets
                              </p>
                            </div>

                            <MainCard className="p-0 overflow-hidden">
                              <table className="w-full border-collapse text-left text-xs font-bold text-gray-700">
                                <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-wider border-b border-gray-100">
                                  <tr>
                                    <th className="p-4 w-28">Admission No</th>
                                    <th className="p-4 w-64">Student Name</th>
                                    <th className="p-4">Class</th>
                                    <th className="p-4 text-right w-44">
                                      Report Card Sheet
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {students.slice(0, 10).map((stud) => {
                                    const cls = classes.find(
                                      (c) => c.id === stud.classId,
                                    );
                                    return (
                                      <tr
                                        key={stud.id}
                                        className="hover:bg-gray-50/20 transition-colors"
                                      >
                                        <td className="p-4 text-gray-500 font-medium">
                                          {stud.admissionNo}
                                        </td>
                                        <td className="p-4 text-[#03045e] font-black">
                                          {stud.name}
                                        </td>
                                        <td className="p-4 text-[#0077b6]">
                                          {cls?.displayName || cls?.name}
                                        </td>
                                        <td className="p-4 text-right">
                                          <button
                                            onClick={() =>
                                              handleOpenReportCardPreview(
                                                stud.id,
                                              )
                                            }
                                            className="inline-flex items-center gap-1 text-[#0077b6] hover:underline"
                                          >
                                            <Printer size={13} />
                                            <span>PREVIEW REPORT CARD</span>
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </MainCard>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL 1: CREATE SESSION ── */}
      <AnimatePresence>
        {createSessionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-xl w-full rounded-3xl shadow-2xl overflow-hidden border border-[#caf0f8]/30"
            >
              <div className="p-6 bg-gradient-to-r from-[#03045e] to-[#023e8a] text-white flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black tracking-tight uppercase tracking-wider">
                    Schedule New Exam Cycle
                  </h3>
                  <p className="text-[10px] text-[#ade8f4] font-bold uppercase mt-0.5">
                    Configure institutional sessions with dynamic templates
                  </p>
                </div>
                <button
                  onClick={() => setCreateSessionOpen(false)}
                  className="p-1 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                    Cycle Title Name
                  </label>
                  <input
                    type="text"
                    value={sessionForm.name}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Unit Test 2 / Half-Yearly Exam"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs focus:ring-2 focus:ring-[#00b4d8]/20 transition-all text-[#03045e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                      Cycle Template
                    </label>
                    <select
                      value={sessionForm.type}
                      onChange={(e) => handleSessionTypeChange(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs focus:ring-2 focus:ring-[#00b4d8]/20 transition-all text-[#03045e] cursor-pointer"
                    >
                      <option value="UNIT">
                        Unit Test (Assisted defaults)
                      </option>
                      <option value="TERM">
                        Term Exam (Full syllabus defaults)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={sessionForm.academicYear}
                      onChange={(e) =>
                        setSessionForm((prev) => ({
                          ...prev,
                          academicYear: e.target.value,
                        }))
                      }
                      placeholder="e.g. 2025-26"
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs focus:ring-2 focus:ring-[#00b4d8]/20 transition-all text-[#03045e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={sessionForm.startDate}
                      onChange={(e) =>
                        setSessionForm((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs focus:ring-2 focus:ring-[#00b4d8]/20 transition-all text-[#03045e] cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={sessionForm.endDate}
                      onChange={(e) =>
                        setSessionForm((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs focus:ring-2 focus:ring-[#00b4d8]/20 transition-all text-[#03045e] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                    Session-Wide Guidelines (One per line)
                  </label>
                  <textarea
                    value={sessionForm.instructions}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="e.g. Bring admit card&#10;No mobile phones"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#00b4d8]/20 transition-all text-[#03045e] placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                    Target Classes & Sections
                  </label>

                  {/* Quick Targeting Presets */}
                  <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
                    {[
                      {
                        label: "All Foundation",
                        stage: "foundation",
                        color:
                          "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
                      },
                      {
                        label: "All Primary",
                        stage: "primary",
                        color:
                          "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
                      },
                      {
                        label: "All Middle",
                        stage: "middle",
                        color:
                          "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
                      },
                      {
                        label: "All Secondary",
                        stage: "secondary",
                        color:
                          "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
                      },
                      {
                        label: "All Senior Sec",
                        stage: "senior_secondary",
                        color:
                          "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
                      },
                      {
                        label: "Whole School",
                        stage: "all",
                        color:
                          "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                      },
                    ].map((preset) => (
                      <button
                        key={preset.stage}
                        onClick={() => {
                          const newTargetClasses = {
                            ...sessionForm.targetClasses,
                          };
                          classes.forEach((cls) => {
                            const stage =
                              cls.stage || getStageFromLevel(cls.name);
                            const shouldInclude =
                              preset.stage === "all" || stage === preset.stage;
                            if (!newTargetClasses[cls.id]) {
                              newTargetClasses[cls.id] = {
                                selected: false,
                                sections: [],
                              };
                            }
                            newTargetClasses[cls.id].selected = shouldInclude;
                            newTargetClasses[cls.id].sections = shouldInclude
                              ? [cls.section]
                              : [];
                          });
                          setSessionForm((prev) => ({
                            ...prev,
                            targetClasses: newTargetClasses,
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${preset.color}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setSessionForm((prev) => ({
                          ...prev,
                          targetClasses: {},
                        }))
                      }
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold border bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Compact Class Selection - Single Row Per Class */}
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {Object.entries(classesByLevel).map(
                      ([className, classList]) => {
                        const isSelected = classList.some(
                          (cls) => sessionForm.targetClasses[cls.id]?.selected,
                        );
                        const selectedCount = classList.filter(
                          (cls) => sessionForm.targetClasses[cls.id]?.selected,
                        ).length;

                        return (
                          <div
                            key={className}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-[#0077b6]/5 border-[#0077b6]/20"
                                : "bg-gray-50 border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`class-${className}`}
                              checked={isSelected}
                              onChange={() => {
                                const allSelected = classList.every(
                                  (cls) =>
                                    sessionForm.targetClasses[cls.id]?.selected,
                                );
                                const newTargetClasses = {
                                  ...sessionForm.targetClasses,
                                };
                                classList.forEach((cls) => {
                                  if (!newTargetClasses[cls.id]) {
                                    newTargetClasses[cls.id] = {
                                      selected: false,
                                      sections: [],
                                    };
                                  }
                                  newTargetClasses[cls.id].selected =
                                    !allSelected;
                                  newTargetClasses[cls.id].sections =
                                    !allSelected ? [cls.section] : [];
                                });
                                setSessionForm((prev) => ({
                                  ...prev,
                                  targetClasses: newTargetClasses,
                                }));
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-[#0077b6] focus:ring-[#00b4d8] cursor-pointer shrink-0"
                            />
                            <label
                              htmlFor={`class-${className}`}
                              className="text-xs font-bold text-[#03045e] cursor-pointer shrink-0 w-20"
                            >
                              {["Nursery", "LKG", "UKG"].includes(className)
                                ? className
                                : `Class ${className}`}
                            </label>

                            {/* Section Pills - Inline */}
                            <div className="flex items-center gap-1.5 flex-wrap flex-1">
                              {classList.map((cls) => {
                                const isSectionSelected =
                                  sessionForm.targetClasses[cls.id]?.selected &&
                                  sessionForm.targetClasses[
                                    cls.id
                                  ]?.sections.includes(cls.section);
                                return (
                                  <button
                                    key={cls.id}
                                    onClick={() => {
                                      const newTargetClasses = {
                                        ...sessionForm.targetClasses,
                                      };
                                      if (!newTargetClasses[cls.id]) {
                                        newTargetClasses[cls.id] = {
                                          selected: false,
                                          sections: [],
                                        };
                                      }
                                      const currentlySelected =
                                        newTargetClasses[cls.id].selected &&
                                        newTargetClasses[
                                          cls.id
                                        ].sections.includes(cls.section);
                                      newTargetClasses[cls.id].selected =
                                        !currentlySelected;
                                      newTargetClasses[cls.id].sections =
                                        !currentlySelected ? [cls.section] : [];
                                      setSessionForm((prev) => ({
                                        ...prev,
                                        targetClasses: newTargetClasses,
                                      }));
                                    }}
                                    className={`min-w-[28px] px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                      isSectionSelected
                                        ? "bg-[#0077b6] text-white shadow-sm"
                                        : "bg-white text-gray-400 border border-gray-200 hover:border-gray-300"
                                    }`}
                                  >
                                    {cls.section}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Selection Count */}
                            {isSelected && (
                              <span className="text-[9px] font-bold text-[#0077b6] bg-[#0077b6]/10 px-2 py-0.5 rounded shrink-0">
                                {selectedCount}/{classList.length}
                              </span>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>

                  {/* Notification Audience Preview */}
                  {(() => {
                    const selectedClassIds = Object.entries(
                      sessionForm.targetClasses,
                    )
                      .filter(
                        ([_, data]) =>
                          data.selected && data.sections.length > 0,
                      )
                      .map(([id]) => id);

                    const studentCount = selectedClassIds.reduce(
                      (sum, classId) => {
                        return (
                          sum +
                          students.filter((s) => s.classId === classId).length
                        );
                      },
                      0,
                    );

                    const teacherCount = new Set(
                      assignments
                        .filter((a) => selectedClassIds.includes(a.classId))
                        .map((a) => a.teacherId),
                    ).size;

                    return selectedClassIds.length > 0 ? (
                      <div className="mt-3 p-3 bg-gradient-to-r from-[#03045e]/5 to-[#0077b6]/5 rounded-xl border border-[#0077b6]/10">
                        <p className="text-[10px] font-black text-[#03045e] uppercase tracking-wider mb-2">
                          Will Notify
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[#0077b6]">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                              {studentCount} Students
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                              {studentCount} Parents
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                              {teacherCount} Teachers
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setCreateSessionOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-100 transition-colors text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  className="px-6 py-2.5 rounded-xl bg-[#03045e] hover:bg-[#023e8a] text-white font-black text-xs uppercase shadow-sm"
                >
                  Create Cycle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: SCHEDULE PAPER (SLOT EDITOR) ── */}
      <AnimatePresence>
        {schedulePaperOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-[#caf0f8]/30 flex flex-col md:flex-row"
            >
              {/* Left Column: Form Entry */}
              <div className="flex-1 flex flex-col">
                <div className="p-6 bg-gradient-to-r from-[#03045e] to-[#023e8a] text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider">
                      Schedule Exam Slot
                    </h3>
                    <p className="text-[10px] text-[#ade8f4] font-bold uppercase mt-0.5">
                      Class: {activeClass?.displayName || activeClass?.name} |
                      Subject:{" "}
                      {subjects.find((s) => s.id === paperForm.subjectId)?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setSchedulePaperOpen(false)}
                    className="md:hidden p-1 rounded-xl hover:bg-white/10 text-white/80"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto max-h-[450px]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                        Exam Mode
                      </label>
                      <select
                        value={paperForm.examMode}
                        onChange={(e) =>
                          handlePaperFormChange({ examMode: e.target.value })
                        }
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs focus:ring-2 focus:ring-[#00b4d8]/20 transition-all text-[#03045e] cursor-pointer"
                      >
                        <option value="written">Written Theory Paper</option>
                        <option value="practical">Practical / Viva Exam</option>
                        <option value="oral">Oral Assessment</option>
                        <option value="activity">Co-curricular Activity</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        value={paperForm.date}
                        min={activeSession?.startDate || ""}
                        max={activeSession?.endDate || ""}
                        onChange={(e) =>
                          handlePaperFormChange({ date: e.target.value })
                        }
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs focus:ring-2 focus:ring-[#00b4d8]/20 transition-all text-[#03045e] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                        Start (24h)
                      </label>
                      <input
                        type="text"
                        value={paperForm.startTime}
                        onChange={(e) =>
                          handlePaperFormChange({ startTime: e.target.value })
                        }
                        placeholder="09:00"
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs text-center text-[#03045e]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                        End (24h)
                      </label>
                      <input
                        type="text"
                        value={paperForm.endTime}
                        onChange={(e) =>
                          handlePaperFormChange({ endTime: e.target.value })
                        }
                        placeholder="12:00"
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs text-center text-[#03045e]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                        Duration (Min)
                      </label>
                      <input
                        type="number"
                        value={paperForm.duration}
                        onChange={(e) =>
                          handlePaperFormChange({
                            duration: parseInt(e.target.value, 10),
                          })
                        }
                        placeholder="180"
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs text-center text-[#03045e]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                        Target Room
                      </label>
                      <select
                        value={paperForm.roomId}
                        onChange={(e) =>
                          handlePaperFormChange({ roomId: e.target.value })
                        }
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs text-[#03045e] cursor-pointer"
                      >
                        <option key="room-placeholder" value="">
                          Select Room
                        </option>
                        {rooms.map((r) => (
                          <option
                            key={r.roomId || r.id}
                            value={r.roomId || r.id}
                          >
                            {r.roomNumber || r.name} ({r.capacity} Cap)
                          </option>
                        ))}
                        {/* Fallback institutional slots */}
                        <option key="fallback-hall-a" value="Exam Hall A">
                          Exam Hall A
                        </option>
                        <option key="fallback-comp-lab" value="Computer Lab A">
                          Computer Lab A
                        </option>
                        <option key="fallback-sci-lab" value="Science Lab 1">
                          Science Lab 1
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                        Invigilator Staff
                      </label>
                      <select
                        value={paperForm.invigilatorTeacherIds?.[0] || ""}
                        onChange={(e) =>
                          handlePaperFormChange({
                            invigilatorTeacherIds: [e.target.value],
                          })
                        }
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs text-[#03045e] cursor-pointer"
                      >
                        <option key="staff-placeholder" value="">
                          Select Staff
                        </option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Marks structure splits */}
                  <div className="bg-[#caf0f8]/20 p-4.5 rounded-2xl border border-[#caf0f8]/40 space-y-3">
                    <span className="text-[10px] uppercase font-black text-[#0077b6] tracking-wider block">
                      Marks Structure Splitting Config
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase font-bold text-gray-400">
                          Total
                        </span>
                        <input
                          type="number"
                          value={paperForm.maxMarks}
                          onChange={(e) =>
                            handlePaperFormChange({
                              maxMarks: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full p-2 bg-white border border-gray-100 rounded-lg text-center text-xs font-black text-[#03045e]"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase font-bold text-gray-400">
                          Passing
                        </span>
                        <input
                          type="number"
                          value={paperForm.passingMarks}
                          onChange={(e) =>
                            handlePaperFormChange({
                              passingMarks: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full p-2 bg-white border border-gray-100 rounded-lg text-center text-xs font-black text-[#03045e]"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase font-bold text-gray-400">
                          Theory Split
                        </span>
                        <input
                          type="number"
                          value={paperForm.theoryMarks}
                          onChange={(e) =>
                            handlePaperFormChange({
                              theoryMarks: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full p-2 bg-white border border-gray-100 rounded-lg text-center text-xs font-black text-[#03045e]"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase font-bold text-gray-400">
                          Practical Split
                        </span>
                        <input
                          type="number"
                          value={paperForm.practicalMarks}
                          onChange={(e) =>
                            handlePaperFormChange({
                              practicalMarks: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full p-2 bg-white border border-gray-100 rounded-lg text-center text-xs font-black text-[#03045e]"
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400 font-bold block pt-1">
                      💡 TIPS: Core sciences (Physics, Chem, Bio, CS) follow
                      70/30 split. Units default to 40 max marks.
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    onClick={() => setSchedulePaperOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-100 transition-colors text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePaper}
                    className="px-6 py-2.5 rounded-xl bg-[#03045e] hover:bg-[#023e8a] text-white font-black text-xs uppercase shadow-sm"
                  >
                    Save Slot
                  </button>
                </div>
              </div>

              {/* Right Column: Live Warnings Sidebar */}
              <div className="w-full md:w-56 bg-amber-50/50 border-t md:border-t-0 md:border-l border-amber-100 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 text-[#d97706]">
                    <ShieldAlert size={18} />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Conflict Inspector
                    </span>
                  </div>

                  {clashWarnings.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 text-center py-6 text-emerald-600">
                      <CheckCircle size={28} />
                      <p className="text-[10px] font-black uppercase tracking-wider">
                        No Clashes Detected
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold leading-normal">
                        Rooms, invigilators, classes, and calendar schedules are
                        clear!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clashWarnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-start gap-2 text-[10px] font-bold leading-relaxed ${
                            warning.type === "danger"
                              ? "bg-rose-50 border-rose-100 text-rose-700"
                              : "bg-amber-50 border-amber-100 text-amber-700"
                          }`}
                        >
                          <AlertTriangle
                            size={12}
                            className="shrink-0 mt-0.5"
                          />
                          <span>{warning.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden md:block pt-4 border-t border-amber-200/20 text-[9px] text-gray-400 font-medium leading-relaxed">
                  Inspector scans all scheduled slots on this date to verify
                  resource constraints.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: EVALUATION / MARKS OVERRIDE GRID ── */}
      <AnimatePresence>
        {evaluationOverrideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden border border-[#caf0f8]/30"
            >
              <div className="p-6 bg-gradient-to-r from-[#03045e] to-[#023e8a] text-white flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider">
                    Scorecard Admin Override
                  </h3>
                  <p className="text-[10px] text-[#ade8f4] font-bold uppercase mt-0.5">
                    Class:{" "}
                    {
                      classes.find((c) => c.id === activeOverrideClassId)
                        ?.displayName
                    }{" "}
                    | Subject:{" "}
                    {
                      subjects.find((s) => s.id === activeOverrideSubjectId)
                        ?.name
                    }
                  </p>
                </div>
                <button
                  onClick={() => setEvaluationOverrideOpen(false)}
                  className="p-1 rounded-xl hover:bg-white/10 text-white/80"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Students marks grid */}
              <div className="p-6 overflow-y-auto max-h-[380px] space-y-3">
                {overrideStudentMarks.map((override, index) => (
                  <div
                    key={override.studentId}
                    className="flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-2xl border border-gray-100 hover:bg-gray-50/20 gap-3"
                  >
                    <div className="w-48 shrink-0">
                      <span className="text-[9px] font-bold text-gray-400 block uppercase">
                        Adm No: {override.admissionNo}
                      </span>
                      <h4 className="text-xs font-black text-[#03045e] mt-0.5">
                        {override.name}
                      </h4>
                    </div>

                    <div className="flex-1 flex gap-3">
                      <div className="w-32 shrink-0">
                        <input
                          type="number"
                          value={override.marksObtained}
                          onChange={(e) => {
                            const updated = [...overrideStudentMarks];
                            updated[index].marksObtained = e.target.value;
                            setOverrideStudentMarks(updated);
                          }}
                          placeholder={`Max ${activeSession?.type === "TERM" ? 100 : 40}`}
                          className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-center text-xs font-black text-[#03045e] outline-none focus:ring-2 focus:ring-[#00b4d8]/20"
                        />
                      </div>

                      <input
                        type="text"
                        value={override.remarks}
                        onChange={(e) => {
                          const updated = [...overrideStudentMarks];
                          updated[index].remarks = e.target.value;
                          setOverrideStudentMarks(updated);
                        }}
                        placeholder="Remarks (e.g. Excellent progress)"
                        className="flex-1 p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-[#03045e] outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setEvaluationOverrideOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-100 transition-colors text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMarksOverride}
                  className="px-6 py-2.5 rounded-xl bg-[#03045e] hover:bg-[#023e8a] text-white font-black text-xs uppercase shadow-sm"
                >
                  Save Scorecard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: REPORT CARD INST PREVIEW ── */}
      <AnimatePresence>
        {reportCardPreviewOpen && reportCardData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-[#caf0f8]/30 flex flex-col"
            >
              <div className="p-6 bg-[#03045e] text-white flex justify-between items-center border-b border-white/10">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Institutional Report Card Preview
                  </h3>
                  <p className="text-[10px] text-[#ade8f4] font-bold uppercase mt-0.5">
                    Printable Sheet Generation | Academic Term Exam Cycle
                  </p>
                </div>
                <button
                  onClick={() => setReportCardPreviewOpen(false)}
                  className="p-1 rounded-xl hover:bg-white/10 text-white/80"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Printable sheet container */}
              <div className="p-8 space-y-6 overflow-y-auto max-h-[420px] bg-neutral-50/50">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 font-serif text-[#03045e]">
                  {/* Institutional Header */}
                  <div className="text-center space-y-1 pb-4 border-b border-double border-gray-300">
                    <h2 className="text-base font-black uppercase tracking-widest font-sans">
                      SPRINGDALE SENIOR SECONDARY SCHOOL
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans">
                      Affiliated with CBSE, New Delhi | Institutional Campus
                    </p>
                    <h3 className="text-xs font-black uppercase tracking-widest underline pt-2 text-[#0077b6] font-sans">
                      REPORT SHEET: {activeSession?.name?.toUpperCase()}
                    </h3>
                  </div>

                  {/* Student Specs */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold font-sans">
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium">Student Name:</p>
                      <p className="text-sm font-black text-[#03045e]">
                        {reportCardData.studentName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium">
                        Admission Number:
                      </p>
                      <p className="text-sm font-black text-[#03045e]">
                        {reportCardData.admissionNo}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium">
                        Academic Class:
                      </p>
                      <p className="text-sm font-black text-[#03045e]">
                        {reportCardData.className}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium">
                        Academic Year:
                      </p>
                      <p className="text-sm font-black text-[#03045e]">
                        2025-26
                      </p>
                    </div>
                  </div>

                  {/* Grades board */}
                  <table className="w-full border-collapse text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase font-black tracking-wider text-gray-400 border-b border-gray-200">
                        <th className="p-3">Subject</th>
                        <th className="p-3 text-center">Marks Obtained</th>
                        <th className="p-3 text-center">Max Marks</th>
                        <th className="p-3 text-center">Grade</th>
                        <th className="p-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-bold">
                      {reportCardData.rows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-3 text-[#03045e]">
                            {row.subjectName}
                          </td>
                          <td className="p-3 text-center text-sm font-black">
                            {row.marksObtained}
                          </td>
                          <td className="p-3 text-center text-gray-500">
                            {row.maxMarks}
                          </td>
                          <td className="p-3 text-center text-[#0077b6]">
                            {row.grade}
                          </td>
                          <td className="p-3 text-gray-400 font-medium italic">
                            &quot;{row.remarks}&quot;
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary calculations */}
                  <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center text-xs font-sans font-black">
                    <div>
                      <span>GRAND TOTAL: </span>
                      <strong className="text-sm text-[#0077b6]">
                        {reportCardData.totalObtained} /{" "}
                        {reportCardData.totalMax}
                      </strong>
                    </div>
                    <div>
                      <span>OVERALL PERCENTAGE: </span>
                      <strong className="text-sm text-emerald-600">
                        {reportCardData.overallPercentage}%
                      </strong>
                    </div>
                  </div>

                  {/* Signature Blocks */}
                  <div className="pt-10 grid grid-cols-2 gap-8 text-center text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest">
                    <div className="border-t border-gray-200 pt-3">
                      CLASS TEACHER SIGNATURE
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      PRINCIPAL COUNTER SIGNATURE
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setReportCardPreviewOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-100 transition-colors text-xs uppercase"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#0096c7] text-white font-black text-xs uppercase shadow-sm flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  <span>PRINT REPORT CARD</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: DIAGNOSTICS & RELEASE OVERRIDE ── */}
      <AnimatePresence>
        {diagnosticsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-[#caf0f8]/30 flex flex-col max-h-[90vh]"
            >
              <div
                className={`p-6 text-white flex justify-between items-center ${diagnostics.errors.length > 0 ? "bg-rose-600" : "bg-amber-500"}`}
              >
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    {diagnostics.errors.length > 0 ? (
                      <ShieldAlert size={18} />
                    ) : (
                      <AlertTriangle size={18} />
                    )}
                    <span>Date Sheet Compliance Diagnostics</span>
                  </h3>
                  <p className="text-[10px] text-white/80 font-bold uppercase mt-0.5">
                    {diagnostics.errors.length > 0
                      ? "Critical compliance blocks detected. Release disabled."
                      : "Pedagogical warnings detected. Override permitted."}
                  </p>
                </div>
                <button
                  onClick={() => setDiagnosticsModalOpen(false)}
                  className="p-1 rounded-xl hover:bg-white/10 text-white/80"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Warnings and errors lists */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* 1. Critical Errors Section */}
                {diagnostics.errors.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-rose-600">
                      <ShieldAlert size={16} />
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        Critical Errors (Must Resolve)
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {diagnostics.errors.map((err, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl flex gap-3 text-rose-800"
                        >
                          <AlertCircle
                            size={15}
                            className="shrink-0 mt-0.5 text-rose-500"
                          />
                          <div className="text-xs font-semibold leading-relaxed">
                            {err.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Warnings Section */}
                {diagnostics.warnings.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle size={16} />
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        Pedagogical Warnings (Override Allowed)
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {diagnostics.warnings.map((warn, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800"
                        >
                          <AlertTriangle
                            size={15}
                            className="shrink-0 mt-0.5 text-amber-500"
                          />
                          <div className="text-xs font-semibold leading-relaxed">
                            {warn.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clean State */}
                {diagnostics.errors.length === 0 &&
                  diagnostics.warnings.length === 0 && (
                    <div className="text-center py-10 space-y-3">
                      <CheckCircle2
                        size={48}
                        className="text-emerald-500 mx-auto"
                      />
                      <h3 className="text-sm font-black text-emerald-800 uppercase tracking-wider">
                        Datesheet Fully Compliant
                      </h3>
                      <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                        All classes are scheduled correctly with no duplicate
                        papers, room clashes, teacher overloads, or Sunday
                        collisions.
                      </p>
                    </div>
                  )}
              </div>

              {/* Modal Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setDiagnosticsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-100 transition-colors text-xs uppercase"
                >
                  {diagnostics.errors.length > 0 ? "Close & Fix" : "Cancel"}
                </button>
                {diagnostics.errors.length === 0 ? (
                  <button
                    onClick={() => proceedWithRelease(activeTransitionExamId)}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    <span>OVERRIDE & RELEASE</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-400 font-black text-xs uppercase cursor-not-allowed flex items-center gap-1.5"
                  >
                    <ShieldAlert size={13} />
                    <span>RELEASE BLOCKED</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExaminationsPage;
