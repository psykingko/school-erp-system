import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BookOpen,
  PieChart,
  Medal,
  CheckCircle,
  Download,
  Eye,
  X,
  FileText,
  Printer
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";
import { getAllExams, getStudentResults } from "../../services/examService";
import { getReportCardsForStudent } from "../../services/reportCardService";
import PrintableReportCard from "../admin/examinations/academic-report-cards/components/PrintableReportCard";
import { useService } from "../../hooks/useService";
import { useAuth } from "../../context/AuthContext";
import { useStudent } from "../../context/StudentContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";
import EmptyState from "../../components/common/EmptyState";
import ExamResultsSection from "../../components/examinations/ExamResultsSection";


const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";
const LIME = "#caf0f8";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

function AcademicResultsPage() {
  const { t } = useLanguage();
  const { activeStudentId } = useStudent();
  const [showHelper, setShowHelper] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [activeTab, setActiveTab] = useState("exam-wise"); // 'exam-wise' | 'progress' | 'final'

  const { data: allExams, loading: allExamsLoading, error: examError } = useService(getAllExams, []);
  const { data: results, loading: resultsLoading, error: resultsError } = useService(
    getStudentResults, 
    [activeStudentId], 
    [activeStudentId]
  );
  const { data: reportCards, loading: reportCardsLoading } = useService(
    getReportCardsForStudent,
    [activeStudentId],
    [activeStudentId]
  );

  if (examError || resultsError) {
    throw examError || resultsError;
  }

  const loading = allExamsLoading || resultsLoading || reportCardsLoading;

  // Filter only published exams
  const publishedExams = useMemo(() => {
    return (allExams || [])
      .filter(e => e.status === 'published')
      .sort((a, b) => new Date(b.publishedAt || b.startDate) - new Date(a.publishedAt || a.startDate));
  }, [allExams]);

  // Set default active session
  React.useEffect(() => {
    if (publishedExams.length > 0 && !activeSessionId) {
      setActiveSessionId(publishedExams[0].id);
    }
  }, [publishedExams, activeSessionId]);

  const activeExam = useMemo(() => publishedExams.find(e => e.id === activeSessionId), [publishedExams, activeSessionId]);
  
  const currentResults = useMemo(() => {
    if (!activeSessionId) return [];
    return (results || []).filter(r => r.examId === activeSessionId || r.examId === activeExam?.examId);
  }, [results, activeSessionId, activeExam]);

  const currentProgressReport = useMemo(() => {
    if (!reportCards || !activeSessionId) return null;
    return reportCards.find(c => 
      c.reportType === 'progress' && 
      (c.status === 'Published' || c.status === 'Frozen') &&
      c.selectedExamIds?.includes(activeSessionId)
    );
  }, [reportCards, activeSessionId]);


  const performanceSummary = useMemo(() => {
    if (!currentResults.length) return null;
    let totalMax = 0;
    let totalObtained = 0;
    currentResults.forEach(r => {
      totalMax += Number(r.maxMarks || 0);
      totalObtained += Number(r.marksObtained || 0);
    });
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    
    let grade = "F";
    let isPass = false;
    if (percentage >= 91) { grade = "A1"; isPass = true; }
    else if (percentage >= 81) { grade = "A2"; isPass = true; }
    else if (percentage >= 71) { grade = "B1"; isPass = true; }
    else if (percentage >= 61) { grade = "B2"; isPass = true; }
    else if (percentage >= 51) { grade = "C1"; isPass = true; }
    else if (percentage >= 41) { grade = "C2"; isPass = true; }
    else if (percentage >= 33) { grade = "D"; isPass = true; }

    return {
      subjects: currentResults.length,
      percentage: percentage.toFixed(1),
      grade,
      isPass,
      totalMax,
      totalObtained
    };
  }, [currentResults]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="relative print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
              <Award size={26} className="text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black truncate" style={{ color: NAVY }}>
                {t("academicResults.title")}
              </h1>
              <p className="text-sm text-gray-500 truncate">{t("academicResults.desc")}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
             <ChildScopeSwitcher />

             <HelperButton onClick={() => setShowHelper(true)} />
          </div>
        </div>

        <div className="mb-6 print:hidden">
          <div className="inline-flex bg-gray-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab("exam-wise")}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === "exam-wise"
                  ? "bg-white shadow text-[#03045e]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("academicResults.tabExamResults", { fallback: "Exam Results" })}
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === "progress"
                  ? "bg-white shadow text-[#03045e]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("academicResults.tabProgress", { fallback: "Progress Reports" })}
            </button>
            <button
              onClick={() => setActiveTab("final")}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === "final"
                  ? "bg-white shadow text-[#03045e]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("academicResults.tabFinal", { fallback: "Final Academic Reports" })}
            </button>
          </div>
        </div>

        {activeTab !== 'final' && (
          <div className="mb-6 print:hidden">
            <div className="inline-flex bg-gray-100 p-1 rounded-xl">
              <div className="bg-white shadow rounded-lg px-4 py-2 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("academicResults.examSelect", { fallback: "EXAM:" })}</span>
                <select 
                  className="bg-transparent text-sm font-black text-[#03045e] focus:outline-none cursor-pointer"
                  value={activeSessionId}
                  onChange={(e) => setActiveSessionId(e.target.value)}
                  disabled={publishedExams.length === 0}
                >
                  {publishedExams.length === 0 ? (
                    <option value="">{t("academicResults.noPublishedExams")}</option>
                  ) : (
                    publishedExams.map(e => (
                      <option key={e.id} value={e.id}>{t(`exam.${(e.name || "").toLowerCase().replace(/\s+/g, "")}`, { fallback: t(e.name, { fallback: e.name }) })} ({e.academicYear})</option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exam-wise' ? (
          publishedExams.length === 0 ? (
            <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
              <EmptyState 
                icon={Award}
                title={t("academicResults.noResultsTitle", { fallback: "No Results Published" })}
                description={t("academicResults.noResultsDesc", { fallback: "No published results are currently available." })}
              />
            </MainCard>
          ) : currentResults.length === 0 ? (
            <MainCard className="h-[300px] flex items-center justify-center bg-white border border-dashed border-gray-300">
              <EmptyState 
                icon={FileText}
                title={t("academicResults.noResultsFoundTitle", { fallback: "No Results Found" })}
                description={t("academicResults.noResultsFoundDesc", { fallback: "No results found for this examination." })}
              />
            </MainCard>
          ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* LEFT COLUMN: SUBJECT MARKS */}
            <div className="lg:col-span-2 space-y-6">
               <ExamResultsSection results={currentResults} variants={cardVariants} />

            </div>

            {/* RIGHT COLUMN: PERFORMANCE SUMMARY & DOWNLOADS */}
            <div className="space-y-6">
              
              {/* Performance Summary */}
              {performanceSummary && (
                <MainCard variants={cardVariants} className="bg-white border border-gray-100 overflow-hidden">
                     <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                     <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                       <PieChart size={18} />
                     </div>
                     <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
                       {t("academicResults.perfSummary", { fallback: "Performance Summary" })}
                     </h3>
                   </div>
                   <div className="p-5">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                         <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                            <div className="text-2xl font-black text-[#03045e]">{performanceSummary.subjects}</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t("academicResults.subjects", { fallback: "Subjects" })}</div>
                         </div>
                         <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                            <div className="text-2xl font-black text-[#0077b6]">{performanceSummary.percentage}%</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t("academicResults.percentage", { fallback: "Percentage" })}</div>
                         </div>
                      </div>
                      
                      <div className="p-4 rounded-2xl flex items-center justify-between" style={{ backgroundColor: LIME }}>
                         <div>
                           <div className="text-[10px] font-bold text-[#0077b6] uppercase tracking-widest">{t("academicResults.overallGrade", { fallback: "Overall Grade" })}</div>
                           <div className="text-xl font-black text-[#03045e]">{performanceSummary.grade}</div>
                         </div>
                         <div className="text-right">
                           <div className="text-[10px] font-bold text-[#0077b6] uppercase tracking-widest">{t("academicResults.finalResult", { fallback: "Final Result" })}</div>
                           <div className={`text-lg font-black uppercase tracking-wider ${performanceSummary.isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                             {performanceSummary.isPass ? t("academicResults.pass", { fallback: "PASS" }) : t("academicResults.fail", { fallback: "FAIL" })}
                           </div>
                         </div>
                      </div>
                   </div>
                </MainCard>
              )}
            </div>
          </motion.div>
          )
        ) : activeTab === 'progress' ? (
          /* PROGRESS REPORT TAB */
          <div className="space-y-8">
            {publishedExams.length === 0 ? (
              <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
                <EmptyState 
                  icon={Award}
                  title={t("academicResults.noExamsTitle", { fallback: "No Exams Published" })}
                  description={t("academicResults.noExamsDesc", { fallback: "No published exams are available yet." })}
                />
              </MainCard>
            ) : currentProgressReport ? (
              <div className="relative">
                <div className="absolute top-4 right-8 z-10 print:hidden flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-white/80 backdrop-blur text-[#03045e] border border-gray-200 shadow hover:bg-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                  >
                    <Printer size={16} /> {t("academicResults.printReport", { fallback: "Print Report" })}
                  </button>
                </div>
                <PrintableReportCard card={currentProgressReport} />
              </div>
            ) : (
              <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
                <EmptyState 
                  icon={FileText}
                  title={t("academicResults.noProgressTitle", { fallback: "No Progress Report" })}
                  description={t("academicResults.noProgressDesc", { fallback: "No progress report has been generated for this examination cycle." })}
                />
              </MainCard>
            )}
          </div>
        ) : (
          /* FINAL ACADEMIC REPORT TAB */
          <div className="space-y-8">
            {reportCards && reportCards.filter(c => c.reportType === "final" && (c.status === "Published" || c.status === "Frozen")).length > 0 ? (
              reportCards.filter(c => c.reportType === "final" && (c.status === "Published" || c.status === "Frozen")).map((card, idx) => (
                <div key={card.id} className="relative">
                  <div className="absolute top-4 right-8 z-10 print:hidden flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="bg-white/80 backdrop-blur text-[#03045e] border border-gray-200 shadow hover:bg-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                    >
                      <Printer size={16} /> {t("academicResults.printCard", { fallback: "Print Card" })}
                    </button>
                  </div>
                  <PrintableReportCard card={card} />
                </div>
              ))
            ) : (
              <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
                <EmptyState 
                  icon={Award}
                  title={t("academicResults.noReportCardsTitle", { fallback: "No Report Cards" })}
                  description={t("academicResults.noReportCardsDesc", { fallback: "No final academic report cards have been published yet." })}
                />
              </MainCard>
            )}
          </div>
        )}
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="academicResults.title"
        contentEn="The Academic Results module displays your finalized grades for completed examinations. Select a published exam to view subject-wise marks, overall performance, and download your official report card."
        contentHi="अकादमिक परिणाम मॉड्यूल पूर्ण परीक्षाओं के लिए आपके अंतिम ग्रेड प्रदर्शित करता है। विषय-वार अंक, समग्र प्रदर्शन देखने और अपना आधिकारिक रिपोर्ट कार्ड डाउनलोड करने के लिए एक प्रकाशित परीक्षा का चयन करें।"
      />
    </>
  );
}

export default AcademicResultsPage;
