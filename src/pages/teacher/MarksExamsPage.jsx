import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getTeacherProfile,
  getStudentsInClass,
  getMarksForClass,
} from "../../services/teacherService";
import { getExams, getExamPapers, submitMarks, getTargetClasses, getAcademicSubjects, getVisibleExamCycles } from "../../services/examService";
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
const MarksExamsPage = ({ isEmbedded = false }) => {
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
  const [initialMarks, setInitialMarks] = useState({}); // To track modifications for overrides

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [publishedAt, setPublishedAt] = useState(null); // Persistent submission timestamp
  const [error, setError] = useState("");
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState(null);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, examData, subjectData, papersData] = await Promise.all([
          getTeacherProfile(user.linkedEntityId),
          getExams(),
          getSubjects(),
          getExamPapers(),
        ]);
        setWorkload(profileData);
        setExams(getVisibleExamCycles(user.linkedEntityId, examData, papersData, profileData.assignedSubjects));
        setSubjects(getAcademicSubjects(subjectData));


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
        const initMarksMap = {};
        studentList.forEach((s) => {
          const m = existingMarks.find((em) => em.studentId === s.id);
          const data = {
            marks: m ? m.marksObtained : "",
            remarks: m ? m.remarks : "",
            isAbsent: m ? !!m.isAbsent : false,
            practicalMarks: m ? m.practicalMarks || "" : "",
            isSubmitted: m ? !!m.isSubmitted : false,
            marksHistory: m ? m.marksHistory || [] : []
          };
          marksMap[s.id] = { ...data };
          initMarksMap[s.id] = { ...data };
        });
        setMarks(marksMap);
        setInitialMarks(initMarksMap);
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
    if (selectedClass && workload?.assignedSubjects && subjects.length > 0) {
      const academicSubjectIds = new Set(subjects.map(s => s.id));
      const classSubjects = workload.assignedSubjects.filter(a => a.classId === selectedClass && academicSubjectIds.has(a.subjectId));
      if (classSubjects.length > 0 && !classSubjects.some(a => a.subjectId === selectedSubject)) {
        setSelectedSubject(classSubjects[0].subjectId);
      } else if (classSubjects.length === 0) {
        setSelectedSubject("");
      }
    }
  }, [selectedClass, workload, subjects]);

  const academicSubjectIds = useMemo(() => new Set(subjects.map(s => s.id)), [subjects]);

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

  // Derived submission status
  const isClassSubmitted = useMemo(() => {
    return students.length > 0 && students.every(s => marks[s.id]?.isSubmitted);
  }, [students, marks]);

  // Handlers
  const handleMarkChange = (studentId, field, value) => {
    if (isClassSubmitted || !isEvaluationActive) return;
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Autosave Effect
  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedExam || students.length === 0 || isClassSubmitted || !isEvaluationActive) return;

    const timer = setTimeout(async () => {
      const marksList = students.map((s) => {
        const current = marks[s.id];
        return {
          studentId: s.id,
          marks: current?.isAbsent ? 0 : current?.marks,
          remarks: current?.remarks,
          maxMarks: 100,
          isAbsent: !!current?.isAbsent,
          practicalMarks: current?.isAbsent ? 0 : current?.practicalMarks || 0,
        };
      });

      try {
        await submitMarks(
          user.linkedEntityId,
          "Teacher",
          selectedClass,
          selectedSubject,
          selectedExam,
          marksList,
          false
        );
      } catch (err) {
        console.error("Autosave failed", err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [marks, selectedClass, selectedSubject, selectedExam, students, isClassSubmitted, isEvaluationActive, user.linkedEntityId]);

  const handleSubmit = async () => {
    // Validate 100% completion
    let hasValidationError = false;
    const marksList = students.map((s) => {
      const current = marks[s.id];
      if (!current || (current.marks === "" && !current.isAbsent)) {
        hasValidationError = true;
      }

      return {
        studentId: s.id,
        marks: current?.isAbsent ? 0 : current?.marks,
        remarks: current?.remarks,
        maxMarks: 100,
        isAbsent: !!current?.isAbsent,
        practicalMarks: current?.isAbsent ? 0 : current?.practicalMarks || 0,
      };
    });

    if (hasValidationError) {
      setError(t("marksExams.incompleteEvaluation", { fallback: "All students must have marks or be marked absent before submitting." }));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await submitMarks(
        user.linkedEntityId,
        "Teacher",
        selectedClass,
        selectedSubject,
        selectedExam,
        marksList,
        true // isSubmitAction
      );

      // Re-fetch marks from DB to confirm persistence
      const updatedMarks = await getMarksForClass(
        selectedClass,
        selectedSubject,
        selectedExam,
      );
      const marksMap = {};
      const initMarksMap = {};
      students.forEach((s) => {
        const m = updatedMarks.find((em) => em.studentId === s.id);
        const data = {
          marks: m ? m.marksObtained : "",
          remarks: m ? m.remarks : "",
          isAbsent: m ? !!m.isAbsent : false,
          practicalMarks: m ? m.practicalMarks || "" : "",
          isSubmitted: m ? !!m.isSubmitted : false,
          marksHistory: m ? m.marksHistory || [] : []
        };
        marksMap[s.id] = { ...data };
        initMarksMap[s.id] = { ...data };
      });
      setMarks(marksMap);
      setInitialMarks(initMarksMap);

      // Set persistent published timestamp
      setPublishedAt(new Date());
    } catch (err) {
      console.error("Failed to submit marks:", err);
      setError(t("marksExams.publishFailed", { fallback: "Failed to submit marks. Please try again." }));
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
          disabled={!isEvaluationActive || marks[row.id]?.isAbsent || isClassSubmitted}
          value={marks[row.id]?.isAbsent ? "" : marks[row.id]?.marks || ""}
          onChange={(e) => handleMarkChange(row.id, "marks", e.target.value)}
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
            disabled={!isEvaluationActive || isClassSubmitted}
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
          disabled={!isEvaluationActive || isClassSubmitted}
          value={marks[row.id]?.remarks || ""}
          onChange={(e) => handleMarkChange(row.id, "remarks", e.target.value)}
          placeholder={t("marksExams.remarksPlaceholder", { fallback: "e.g. Good performance" })}
          className="w-full px-3 py-2 bg-[#f8fdff] border border-[#caf0f8] rounded-lg text-[#03045e] font-medium focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/20 transition-all placeholder:text-[#90e0ef] disabled:bg-gray-50 disabled:text-gray-400"
        />
      ),
    },

    {
      header: "",
      render: (row) => {
        const historyCount = marks[row.id]?.marksHistory?.length || 0;
        if (historyCount === 0) return null;
        return (
          <button
            onClick={() => {
              setSelectedHistoryStudent(row);
              setHistoryDrawerOpen(true);
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
          >
            History ({historyCount})
          </button>
        );
      },
      className: "w-24 text-right",
    }
  ];

  return (
    <div className={`space-y-8 ${!isEmbedded ? 'pb-12' : ''}`}>
      {!isEmbedded && (
        <TeacherModuleHeader
          titleKey="nav.marks_exams"
          descriptionKey="marksExams.moduleDesc"
          helperContentEn="Select your class and subject to enter examination marks. All data is saved to the central ERP repository in real-time."
          helperContentHi="परीक्षा के अंक दर्ज करने के लिए अपनी कक्षा और विषय चुनें। सभी डेटा वास्तविक समय में केंद्रीय ERP रिपॉजिटरी में सहेजा जाता है।"
        />
      )}

      {/* Filters */}
      <MainCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Exam Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t("marksExams.examType", { fallback: "Examination Type" })}
            </label>
            <select
              value={selectedExam}
              onChange={(e) => {
                setSelectedExam(e.target.value);
                setSelectedClass("");
                setSelectedSubject("");
                setStudents([]);
                setMarks({});
                setInitialMarks({});
              }}
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

          {/* Class Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t("marksExams.targetClass", { fallback: "Target Class" })}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSubject("");
                setStudents([]);
                setMarks({});
                setInitialMarks({});
              }}
              disabled={!selectedExam}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{t("marksExams.selectClass", { fallback: "Select Class" })}</option>
              {Array.from(new Map(workload?.assignedSubjects?.map(a => [a.classId, { id: a.classId, displayName: a.displayName }])).values())
                .filter(c => {
                   if (!activeExamObj) return false;
                   const targetClassIds = getTargetClasses(activeExamObj);
                   return targetClassIds.includes(c.id);
                })
                .map((c) => (
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
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setStudents([]);
                setMarks({});
                setInitialMarks({});
              }}
              disabled={!selectedClass}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{t("marksExams.selectSubject", { fallback: "Select Subject" })}</option>
              {workload?.assignedSubjects?.filter(a => a.classId === selectedClass && academicSubjectIds.has(a.subjectId)).map((sub) => (
                <option key={sub.subjectId} value={sub.subjectId}>
                  {sub.subjectName || sub.subjectId}
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
                onClick={handleSubmit}
                disabled={submitting || loading || !isEvaluationActive || isClassSubmitted}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all shadow-lg ${
                  isClassSubmitted
                    ? "bg-emerald-500 text-white cursor-not-allowed"
                    : submitting || !isEvaluationActive
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#03045e] text-white hover:bg-[#023e8a] hover:-translate-y-1 active:translate-y-0"
                }`}
              >
                {submitting ? (
                  t("marksExams.submitting", { fallback: "Submitting..." })
                ) : isClassSubmitted ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {t("marksExams.submitted", { fallback: "Submitted for Review" })}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t("marksExams.submit", { fallback: "Submit for Review" })}
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
            {isClassSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl flex items-center gap-3 font-bold text-sm bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                <CheckCircle className="shrink-0 w-5 h-5" />
                <span>
                  {t("marksExams.submittedAt", { fallback: "Marks have been submitted for admin review." })}{" "}
                  {t("marksExams.submittedMsg", { fallback: "Further edits are disabled." })}
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

      {/* History Drawer */}
      <AnimatePresence>
        {historyDrawerOpen && selectedHistoryStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setHistoryDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-black text-[#03045e]">Marks History</h3>
                  <p className="text-sm font-bold text-gray-400 mt-1">{selectedHistoryStudent.name} ({selectedHistoryStudent.admissionNo})</p>
                </div>
                <button
                  onClick={() => setHistoryDrawerOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-[#f8fdff]">
                <div className="mb-6 flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Current Marks</span>
                  <span className="text-2xl font-black text-[#00b4d8]">{marks[selectedHistoryStudent.id]?.marks}</span>
                </div>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {marks[selectedHistoryStudent.id]?.marksHistory?.map((h, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#caf0f8] text-[#00b4d8] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
                        <span className="text-xs font-black">{i + 1}</span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-md ${h.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {h.role}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-500">Marks:</span>
                          {h.previousMarks !== null && (
                            <>
                              <span className="text-sm font-medium text-gray-400 line-through">{h.previousMarks}</span>
                              <span className="text-gray-300">→</span>
                            </>
                          )}
                          <span className="text-lg font-black text-[#03045e]">{h.newMarks}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-bold text-gray-500 block mb-0.5">Reason:</span>
                          <p className="text-gray-700 font-medium">{h.overrideReason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarksExamsPage;
