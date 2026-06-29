import React, { useState, useEffect, useCallback } from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import MentorshipSummaryCards from "../../components/mentorship/MentorshipSummaryCards";
import StudentMentorshipTable from "../../components/mentorship/StudentMentorshipTable";
import MentorshipTimeline from "../../components/mentorship/MentorshipTimeline";
import AddRemarkModal from "../../components/mentorship/AddRemarkModal";
import { 
  getMentorStudents, 
  getStudentMentorshipHistory, 
  getMentorshipSummary, 
  getStudentWellbeingFlags,
  updateMentorRemark
} from "../../services/mentorshipService";
import { getStudentPerformanceSummary } from "../../services/studentPerformanceService";
import { useAuth } from "../../context/AuthContext";
import { useService } from "../../hooks/useService";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, ClipboardCheck, MessageSquare, AlertTriangle, Plus, ChevronLeft, Calendar } from "lucide-react";

export default function MentorSupportPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const teacherId = user?.linkedEntityId || "teach-001";

  // State Management
  const [summary, setSummary] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load overall metrics & student roster
  const fetchWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      const sum = await getMentorshipSummary(teacherId);
      setSummary(sum);

      const roster = await getMentorStudents(teacherId);
      
      // Resolve comprehensive attendance, warnings, and flags for all roster students
      const enrichedStudents = await Promise.all(
        roster.map(async (student) => {
          const perfSummary = await getStudentPerformanceSummary(student.id);
          const wellbeingFlags = await getStudentWellbeingFlags(student.id);
          
          // Count unresolved follow-up tasks
          const historyList = await getStudentMentorshipHistory(student.id, teacherId);
          const pendingFollowUpsCount = historyList.filter(r => r.followUpRequired && !r.followUpResolved).length;

          return {
            ...student,
            performanceSummary: perfSummary,
            wellbeingFlags,
            pendingFollowUpsCount
          };
        })
      );

      setStudentsData(enrichedStudents);

      // If a student was previously selected, refresh their history too
      if (selectedStudent) {
        const matched = enrichedStudents.find(s => s.id === selectedStudent.id);
        if (matched) {
          setSelectedStudent(matched);
          const hist = await getStudentMentorshipHistory(selectedStudent.id, teacherId);
          setHistory(hist);
        }
      }
    } catch (err) {
      console.error("Failed to load mentorship workspace details:", err);
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedStudent?.id]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [teacherId]);

  // Handle selected student detail display
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const hist = await getStudentMentorshipHistory(student.id, teacherId);
      setHistory(hist);
    } catch (err) {
      console.error("Failed to load student guidance history:", err);
    }
  };

  // Toggle follow-up status resolved / pending
  const handleToggleFollowUp = async (remarkId) => {
    try {
      const targetRemark = history.find(r => r.id === remarkId);
      if (!targetRemark) return;

      const newResolvedState = !targetRemark.followUpResolved;
      await updateMentorRemark(remarkId, { followUpResolved: newResolvedState }, teacherId);
      
      // Refresh the timeline state and the general metrics
      await fetchWorkspaceData();
      if (selectedStudent) {
        const hist = await getStudentMentorshipHistory(selectedStudent.id, teacherId);
        setHistory(hist);
      }
    } catch (err) {
      console.error("Failed to resolve follow-up indicator status:", err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader
        titleKey="nav.mentorSupport"
        descriptionKey="mentorSupport.moduleDesc"
        helperContentEn="Maintain structured counseling remarks, flag risk areas (e.g. low attendance), and track follow-ups within your assigned mentorship circle."
        helperContentHi="व्यवस्थित परामर्श टिप्पणियों को बनाए रखें, जोखिम वाले क्षेत्रों (जैसे कम उपस्थिति) को चिह्नित करें, और अपने गृह कक्षा मेंटरशिप सर्कल के भीतर अनुवर्ती कार्रवाई को ट्रैक करें।"
      />

      {loading && studentsData.length === 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="h-28 bg-gray-100/50 rounded-[2rem] animate-pulse" />
            <div className="h-28 bg-gray-100/50 rounded-[2rem] animate-pulse" />
            <div className="h-28 bg-gray-100/50 rounded-[2rem] animate-pulse" />
            <div className="h-28 bg-gray-100/50 rounded-[2rem] animate-pulse" />
          </div>
          <div className="h-96 w-full bg-gray-100/50 rounded-[2.5rem] animate-pulse" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary KPIs */}
          <MentorshipSummaryCards summary={summary} />

          {/* Core guidance split page grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* Monitored Roster Table */}
            <div className={`${selectedStudent ? "xl:col-span-2" : "xl:col-span-3"} space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    {t("mentorSupport.assignedCircle", { fallback: "Assigned Mentorship Circle" })}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                    {t("mentorSupport.selectStudent", { fallback: "Select a student to inspect their detailed guidance history portfolio." })}
                  </p>
                </div>
              </div>
              <StudentMentorshipTable 
                studentsData={studentsData}
                onSelectStudent={handleSelectStudent}
              />
            </div>

            {/* Premium Interactive Guidance File Panel */}
            <AnimatePresence>
              {selectedStudent && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1 space-y-6"
                >
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-6">
                    {/* Header with quick close toggle */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#caf0f8] text-[#03045e] flex items-center justify-center font-black text-xs shadow-sm border border-[#caf0f8]/60">
                          {selectedStudent.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#03045e]">{selectedStudent.name}</h4>
                          <p className="text-[9px] font-bold text-[#0077b6] uppercase tracking-wider">{t("mentorSupport.activeFile", { fallback: "Active Guidance File" })}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>{t("common.close", { fallback: "Close" })}</span>
                      </button>
                    </div>

                    {/* Operational performance warning cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">{t("common.attendance", { fallback: "Attendance" })}</span>
                        <span className={`text-xs font-black ${
                          (selectedStudent.performanceSummary?.attendancePct || 0) >= 85 ? "text-emerald-600" : "text-rose-500 font-extrabold"
                        }`}>
                          {selectedStudent.performanceSummary?.attendancePct || 0}%
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">{t("mentorSupport.termAverage", { fallback: "Term Average" })}</span>
                        <span className="text-xs font-black text-[#03045e]">
                          {selectedStudent.performanceSummary?.averageMarksPct || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Action compose buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-1 py-3 bg-[#03045e] hover:bg-[#0077b6] text-white rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t("mentorSupport.addObservation", { fallback: "Add Observation" })}</span>
                      </button>
                    </div>

                    {/* Observation Chronology */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {t("mentorSupport.timeline", { fallback: "Guidance Observation Timeline" })}
                      </h4>
                      <MentorshipTimeline
                        remarks={history}
                        onToggleFollowUp={handleToggleFollowUp}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add Observation Composer Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddRemarkModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            student={selectedStudent}
            teacherId={teacherId}
            onAddSuccess={fetchWorkspaceData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
