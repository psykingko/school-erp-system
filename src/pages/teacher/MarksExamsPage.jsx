import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getTeacherProfile,
  getStudentsInClass,
  getMarksForClass,
  submitMarks,
} from "../../services/teacherService";
import { getExams } from "../../services/examService";
import { getSubjects } from "../../services/academicsService";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import MainCard from "../../components/MainCard";
import TeacherDataTable from "../../components/teacher/TeacherDataTable";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Save, AlertCircle, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * MarksExamsPage
 *
 * Production-grade ERP marks entry system.
 * Implements a relational mutation loop for academic results.
 */
const MarksExamsPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Selection State
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  // Data State
  const [workload, setWorkload] = useState(null);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // { studentId: { marks: '', remarks: '' } }

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [publishedAt, setPublishedAt] = useState(null); // Persistent submission timestamp
  const [error, setError] = useState("");

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, examData, subjectData] = await Promise.all([
          getTeacherProfile(user.linkedEntityId),
          getExams(),
          getSubjects(),
        ]);
        setWorkload(profileData);
        setExams(examData);
        setSubjects(subjectData);

        // Auto-select first class/subject/exam if available
        const assigned = profileData?.assignedSubjects || [];
        if (assigned.length > 0) {
          setSelectedClass(assigned[0].classId);
          setSelectedSubject(assigned[0].subjectId);
        }
        if (examData.length > 0) {
          setSelectedExam(examData[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch teacher data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.linkedEntityId]);

  // Fetch students and existing marks when selection changes
  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedExam) return;

    const fetchStudentsAndMarks = async () => {
      setLoading(true);
      try {
        const [studentList, existingMarks] = await Promise.all([
          getStudentsInClass(selectedClass),
          getMarksForClass(selectedClass, selectedSubject, selectedExam),
        ]);

        setStudents(studentList);

        // Transform existing marks into our grid state
        const marksMap = {};
        studentList.forEach((s) => {
          const m = existingMarks.find((em) => em.studentId === s.id);
          marksMap[s.id] = {
            marks: m ? m.marksObtained : "",
            remarks: m ? m.remarks : "",
            isAbsent: m ? !!m.isAbsent : false,
            practicalMarks: m ? m.practicalMarks || "" : "",
          };
        });
        setMarks(marksMap);
      } catch (err) {
        console.error("Failed to fetch class data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndMarks();
  }, [selectedClass, selectedSubject, selectedExam]);

  // Update subject selection when class changes
  useEffect(() => {
    if (selectedClass && workload?.assignedSubjects) {
      const classSubjects = workload.assignedSubjects.filter(a => a.classId === selectedClass);
      if (classSubjects.length > 0 && !classSubjects.some(a => a.subjectId === selectedSubject)) {
        setSelectedSubject(classSubjects[0].subjectId);
      } else if (classSubjects.length === 0) {
        setSelectedSubject("");
      }
    }
  }, [selectedClass, workload]);

  const activeExamObj = useMemo(() => {
    return exams.find((e) => e.id === selectedExam);
  }, [exams, selectedExam]);

  const isEvaluationActive = useMemo(() => {
    return activeExamObj?.status === "evaluation" || activeExamObj?.status === "Completed";
  }, [activeExamObj]);

  // Reset published state when selection changes
  useEffect(() => {
    setPublishedAt(null);
  }, [selectedClass, selectedSubject, selectedExam]);

  // Handlers
  const handleMarkChange = (studentId, field, value) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const marksList = students.map((s) => ({
        studentId: s.id,
        marks: marks[s.id]?.isAbsent ? 0 : marks[s.id]?.marks,
        remarks: marks[s.id]?.remarks,
        maxMarks: 100,
        isAbsent: !!marks[s.id]?.isAbsent,
        practicalMarks: marks[s.id]?.isAbsent ? 0 : marks[s.id]?.practicalMarks || 0,
      }));

      await submitMarks(
        user.linkedEntityId,
        selectedClass,
        selectedSubject,
        selectedExam,
        marksList,
      );

      // Re-fetch marks from DB to confirm persistence
      const updatedMarks = await getMarksForClass(
        selectedClass,
        selectedSubject,
        selectedExam,
      );
      const marksMap = {};
      students.forEach((s) => {
        const m = updatedMarks.find((em) => em.studentId === s.id);
        marksMap[s.id] = {
          marks: m ? m.marksObtained : "",
          remarks: m ? m.remarks : "",
          isAbsent: m ? !!m.isAbsent : false,
          practicalMarks: m ? m.practicalMarks || "" : "",
        };
      });
      setMarks(marksMap);

      // Set persistent published timestamp
      setPublishedAt(new Date());
    } catch (err) {
      console.error("Failed to save marks:", err);
      setError(t("marksExams.publishFailed", { fallback: "Failed to publish marks. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: t("marksExams.admNo", { fallback: "Adm No." }),
      accessor: "admissionNo",
      className: "w-24",
    },
    {
      header: t("marksExams.studentName", { fallback: "Student Name" }),
      accessor: "name",
      className: "w-64",
    },
    {
      header: t("marksExams.theoryMarks", { fallback: "Theory Marks (100)" }),
      render: (row) => (
        <input
          type="number"
          min="0"
          max="100"
          disabled={!isEvaluationActive || marks[row.id]?.isAbsent}
          value={marks[row.id]?.isAbsent ? "" : marks[row.id]?.marks || ""}
          onChange={(e) => handleMarkChange(row.id, "marks", e.target.value)}
          placeholder={marks[row.id]?.isAbsent ? "ABS" : "0.00"}
          className="w-24 px-3 py-2 bg-[#f8fdff] border border-[#caf0f8] rounded-lg text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/20 transition-all disabled:bg-gray-100 disabled:text-gray-400"
        />
      ),
      className: "w-32",
    },
    {
      header: t("marksExams.practicalMarks", { fallback: "Practical Marks (30)" }),
      render: (row) => (
        <input
          type="number"
          min="0"
          max="30"
          disabled={!isEvaluationActive || marks[row.id]?.isAbsent}
          value={marks[row.id]?.isAbsent ? "" : marks[row.id]?.practicalMarks || ""}
          onChange={(e) => handleMarkChange(row.id, "practicalMarks", e.target.value)}
          placeholder={marks[row.id]?.isAbsent ? "ABS" : "0.00"}
          className="w-24 px-3 py-2 bg-[#f8fdff] border border-[#caf0f8] rounded-lg text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/20 transition-all disabled:bg-gray-100 disabled:text-gray-400"
        />
      ),
      className: "w-32",
    },
    {
      header: t("marksExams.markAbsent", { fallback: "Mark Absent" }),
      render: (row) => (
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            disabled={!isEvaluationActive}
            checked={!!marks[row.id]?.isAbsent}
            onChange={(e) => handleMarkChange(row.id, "isAbsent", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
          />
          <span className="text-[10px] uppercase font-black text-rose-500">{t("marksExams.absent", { fallback: "Absent" })}</span>
        </label>
      ),
      className: "w-28",
    },
    {
      header: t("marksExams.academicRemarks", { fallback: "Academic Remarks" }),
      render: (row) => (
        <input
          type="text"
          disabled={!isEvaluationActive}
          value={marks[row.id]?.remarks || ""}
          onChange={(e) => handleMarkChange(row.id, "remarks", e.target.value)}
          placeholder={t("marksExams.remarksPlaceholder", { fallback: "e.g. Excellent progress" })}
          className="w-full px-3 py-2 bg-[#f8fdff] border border-[#caf0f8] rounded-lg text-[#03045e] font-medium focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/20 transition-all placeholder:text-[#90e0ef] disabled:bg-gray-50 disabled:text-gray-400"
        />
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader
        titleKey="nav.marks_exams"
        descriptionKey="marksExams.moduleDesc"
        helperContentEn="Select your class and subject to enter examination marks. All data is saved to the central ERP repository in real-time."
        helperContentHi="परीक्षा के अंक दर्ज करने के लिए अपनी कक्षा और विषय चुनें। सभी डेटा वास्तविक समय में केंद्रीय ERP रिपॉजिटरी में सहेजा जाता है।"
      />

      {/* Filters */}
      <MainCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Class Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t("marksExams.targetClass", { fallback: "Target Class" })}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer"
            >
              <option value="">{t("marksExams.selectClass", { fallback: "Select Class" })}</option>
              {Array.from(new Map(workload?.assignedSubjects?.map(a => [a.classId, { id: a.classId, displayName: a.displayName }])).values()).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t("marksExams.subjectTerminal", { fallback: "Subject Terminal" })}
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer"
            >
              <option value="">{t("marksExams.selectSubject", { fallback: "Select Subject" })}</option>
              {workload?.assignedSubjects?.filter(a => a.classId === selectedClass).map((sub) => (
                <option key={sub.subjectId} value={sub.subjectId}>
                  {sub.subjectName || sub.subjectId}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t("marksExams.examType", { fallback: "Examination Type" })}
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer"
            >
              <option value="">{t("marksExams.selectExam", { fallback: "Select Examination" })}</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </MainCard>

      {/* Marks Entry Grid */}
      <AnimatePresence mode="wait">
        {selectedClass && selectedSubject && selectedExam && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-2">
              <div>
                <h3 className="text-xl font-black text-[#03045e]">
                  {t("marksExams.scoreboard", { fallback: "Academic Scoreboard" })}
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  {t("marksExams.entryTerminalFor", { fallback: "Entry terminal for" })} {students.length} {t("marksExams.students", { fallback: "students" })}
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={submitting || loading || !isEvaluationActive}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all shadow-lg ${
                  publishedAt
                    ? "bg-emerald-500 text-white"
                    : submitting || !isEvaluationActive
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#03045e] text-white hover:bg-[#023e8a] hover:-translate-y-1 active:translate-y-0"
                }`}
              >
                {submitting ? (
                  t("marksExams.publishing", { fallback: "Publishing..." })
                ) : publishedAt ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {t("marksExams.published", { fallback: "Published to ERP" })}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t("marksExams.publish", { fallback: "Publish to ERP" })}
                  </>
                )}
              </button>
            </div>

            {/* Locked Overlay Warning */}
            {!isEvaluationActive && selectedExam && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl flex items-center gap-3 font-bold text-sm bg-amber-50 text-amber-700 border border-amber-200"
              >
                <AlertCircle className="shrink-0 w-5 h-5 text-amber-500" />
                <span>
                  <strong>{t("marksExams.entryClosedTitle", { fallback: "Marks Entry Closed:" })}</strong> {t("marksExams.entryClosedMsg", { fallback: "Marks entry is locked because the selected exam cycle is not active." })}
                </span>
              </motion.div>
            )}

            {/* Persistent published banner */}
            {publishedAt && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl flex items-center gap-3 font-bold text-sm bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                <CheckCircle className="shrink-0 w-5 h-5" />
                <span>
                  {t("marksExams.publishedAt", { fallback: "Marks published to ERP at" })}{" "}
                  <strong>
                    {publishedAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                  {t("marksExams.publishedMsg", { fallback: ". Student portals will reflect these marks on next refresh." })}
                </span>
              </motion.div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl flex items-center gap-3 font-bold text-sm bg-rose-50 text-rose-700 border border-rose-200"
              >
                <AlertCircle className="shrink-0 w-5 h-5" />
                <span>{error}</span>
                <button
                  onClick={() => setError("")}
                  className="ml-auto text-rose-400 hover:text-rose-600"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}

            <TeacherDataTable
              columns={columns}
              data={students}
              loading={loading}
              emptyMessage={t("marksExams.emptyMessage", { fallback: "Select class criteria to load students." })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarksExamsPage;
