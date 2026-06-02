import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CalendarDays,
  ClipboardList,
  Award,
  CheckCircle,
  Clock,
  Info,
  Download,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";
import MainCard from "../components/MainCard";
import { getExamData, getStudentResults, getStudentAnalytics, getAllExams } from "../services/examService";
import { useService } from "../hooks/useService";
import { useAuth } from "../context/AuthContext";
import { useStudent } from "../context/StudentContext";
import ChildScopeSwitcher from "../components/parent/ChildScopeSwitcher";

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

function AdmitCardSection({ admitCard = {} }) {
  const { t } = useLanguage();
  return (
    <MainCard variants={cardVariants}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
              <FileText size={26} style={{ color: NAVY }} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
                {t("exam.admitCard")}
              </h3>
              <p className="text-xs text-gray-400">{admitCard?.examName || "N/A"}</p>
            </div>
          </div>
          {admitCard?.issued ? (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: SAGE + "25", color: SAGE }}
            >
              <CheckCircle size={16} aria-hidden="true" /> {t("exam.issued")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-600">
              <Clock size={13} aria-hidden="true" /> {t("exam.pending")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "exam.rollNumber", value: admitCard?.rollNo || "N/A" },
            { label: "exam.examCenter", value: admitCard?.examCenter || "N/A" },
            { label: "exam.reportingTime", value: admitCard?.reportingTime || "N/A" },
            { label: "exam.examDates", value: admitCard?.examDates || "N/A" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: LIME }}
            >
              <p
                className="text-[10px] font-extrabold uppercase tracking-wide mb-0.5"
                style={{ color: TEAL }}
              >
                {t(item.label)}
              </p>
              <p className="text-sm font-bold" style={{ color: NAVY }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <button
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-extrabold transition-all hover:opacity-90"
          style={{ backgroundColor: NAVY, color: LIME }}
          aria-label={t("exam.downloadAdmitCard")}
        >
          <Download size={20} aria-hidden="true" />
          {t("exam.downloadAdmitCard")}
        </button>
      </div>
    </MainCard>
  );
}

function ScheduleSection({ schedule = [] }) {
  const { t } = useLanguage();
  return (
    <MainCard variants={cardVariants}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
            <CalendarDays size={26} style={{ color: TEAL }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("exam.schedule")}
            </h3>
            <p className="text-xs text-gray-400">Half-Yearly Examination 2025</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {(schedule || []).map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5"
              style={{
                backgroundColor: i % 2 === 0 ? LIME : "white",
                outline: i % 2 !== 0 ? `1px solid ${LIME}` : "none",
              }}
            >
              <div className="flex-shrink-0 w-12 text-center">
                <p className="text-xs font-extrabold" style={{ color: TEAL }}>
                  {exam.date.split(" ")[1]}
                </p>
                <p
                  className="text-lg font-black leading-none"
                  style={{ color: NAVY }}
                >
                  {exam.date.split(" ")[0]}
                </p>
              </div>
              <div
                className="w-px h-10 flex-shrink-0"
                style={{ backgroundColor: TEAL + "40" }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: NAVY }}>
                  {exam.subject}
                </p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={13} aria-hidden="true" />
                    {exam.time}
                  </span>
                  <span className="text-xs text-gray-400">{exam.room}</span>
                  <span className="text-xs text-gray-400">{exam.day}</span>
                </div>
              </div>
              <span
                className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: TEAL + "20", color: TEAL }}
              >
                {t("exam.upcoming")}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </MainCard>
  );
}

function ResultsSection({ results, examination, allExams }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("term");
  const [selectedResult, setSelectedResult] = useState(null);

  const [expandedExamId, setExpandedExamId] = useState(null);

  const isUnderEvaluation = React.useMemo(() => {
    return examination?.activeSession?.status === "evaluation";
  }, [examination]);

  const examsWithResults = React.useMemo(() => {
    const terms = [];
    const units = [];
    
    // Sort exams by date
    const sortedExams = [...(allExams || [])].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    sortedExams.forEach(exam => {
      // get results for this exam
      const examResults = (results || []).filter(r => r.examId === exam.id || r.examId === exam.examId);
      
      const examObj = { ...exam, results: examResults };
      
      if (exam.type === "UNIT") {
        units.push(examObj);
      } else {
        terms.push(examObj);
      }
    });

    return { terms, units };
  }, [allExams, results]);

  const activeData = activeTab === "term" ? examsWithResults.terms : examsWithResults.units;

  const renderResultCard = (r) => (
    <div
      key={r.id}
      onClick={() => setSelectedResult(r)}
      className="rounded-2xl px-4 py-3 flex items-center justify-between group hover:bg-white transition-all shadow-sm border border-transparent hover:border-[#caf0f8] cursor-pointer"
      style={{ backgroundColor: LIME + "30" }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-black" style={{ color: NAVY }}>
            {r.subjectName}
          </p>
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 italic">"{r.remarks}"</p>
      </div>
      
      <div className="flex flex-col items-end gap-1 ml-4">
        <div className="text-base font-black" style={{ color: NAVY }}>
          {r.marksObtained}<span className="text-[9px] text-gray-400 font-bold ml-0.5">/{r.maxMarks}</span>
        </div>
        <div 
          className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider"
          style={{ 
            backgroundColor: r.grade === 'A+' || r.grade === 'A' || r.grade === 'A1' || r.grade === 'A2' ? '#d8f3dc' : '#fee2e2',
            color: r.grade === 'A+' || r.grade === 'A' || r.grade === 'A1' || r.grade === 'A2' ? '#2d6a4f' : '#991b1b'
          }}
        >
          Grade {r.grade}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "term", label: t("exam.termExams"), icon: Award, data: examsWithResults.terms, color: TEAL },
    { id: "unit", label: t("exam.unitTests"), icon: ClipboardList, data: examsWithResults.units, color: SAGE }
  ];

  return (
    <MainCard variants={cardVariants}>
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
            <Award size={26} style={{ color: SAGE }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("exam.results")}
            </h3>
            <p className="text-xs text-gray-400">{t("exam.pastResults")}</p>
          </div>
        </div>

        {isUnderEvaluation ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center bg-sky-50/20 border border-dashed border-[#caf0f8] rounded-2xl p-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center bg-[#caf0f8]/50 animate-pulse"
            >
              <Info size={31} style={{ color: TEAL }} aria-hidden="true" />
            </div>
            <p className="text-sm font-black uppercase tracking-wider text-[#03045e]">
              Results Under Evaluation
            </p>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed font-medium">
              Examinations have successfully concluded. Score sheets are currently undergoing secure academic evaluation and moderation by school authorities.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: LIME }}
            >
              <Info size={31} style={{ color: TEAL }} aria-hidden="true" />
            </div>
            <p className="text-sm font-bold" style={{ color: NAVY }}>
              {t("exam.noResults")}
            </p>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              {t("exam.noResultsDetail")}
            </p>
          </div>
        ) : (
          /* Tabs */
          <div
            className="flex gap-1 border-b border-gray-100 mb-4"
            role="tablist"
            aria-label="Result categories"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`results-tabpanel-${tab.id}`}
                  id={`results-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all duration-150 focus:outline-none"
                  style={
                    isActive
                      ? { color: tab.color, backgroundColor: tab.color + "12" }
                      : { color: "#9ca3af" }
                  }
                >
                  <TabIcon size={14} aria-hidden="true" />
                  {tab.label}
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full ml-1" style={{ backgroundColor: isActive ? tab.color + "25" : "#f3f4f6", color: isActive ? tab.color : "#9ca3af" }}>
                    {tab.data.length}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="results-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: tab.color }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="px-5 pb-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              role="tabpanel"
              id={`results-tabpanel-${activeTab}`}
              aria-labelledby={`results-tab-${activeTab}`}
              className="flex flex-col gap-2"
            >
              {activeData.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <p className="text-xs font-bold text-gray-400">
                    No results listed under this section
                  </p>
                </div>
              ) : (
                activeData.map(exam => {
                  const isExpanded = expandedExamId === exam.id;
                  const hasResults = exam.results && exam.results.length > 0;
                  
                  return (
                    <div key={exam.id} className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm mb-3">
                      <button 
                        onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: LIME, color: TEAL }}>
                             <Award size={16} />
                           </div>
                           <div className="text-left">
                             <p className="text-sm font-black text-[#03045e]">{exam.name}</p>
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{hasResults ? `${exam.results.length} Subject marks declared` : "No results yet"}</p>
                           </div>
                        </div>
                        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-gray-50"
                          >
                            <div className="p-4 bg-gray-50/50 flex flex-col gap-2">
                               {!hasResults ? (
                                 <div className="py-4 text-center">
                                   <p className="text-xs font-bold text-gray-400">Exam will be held soon or results are pending.</p>
                                 </div>
                               ) : (
                                 exam.results.map(renderResultCard)
                               )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#03045e]/40 backdrop-blur-sm"
              onClick={() => setSelectedResult(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
            >
              <div className="px-6 py-5 bg-gradient-to-br from-[#caf0f8] to-white border-b border-gray-100/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2.5 rounded-2xl bg-white shadow-sm inline-block">
                    <Award size={24} style={{ color: TEAL }} />
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/80" style={{ color: NAVY }}>
                    {selectedResult.examName}
                  </span>
                </div>
                <h3 className="text-xl font-black mt-3" style={{ color: NAVY }}>
                  {selectedResult.subjectName}
                </h3>
                <p className="text-xs text-gray-500 font-medium italic mt-1">"{selectedResult.remarks}"</p>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Score</p>
                    <div className="text-3xl font-black" style={{ color: NAVY }}>
                      {selectedResult.marksObtained}<span className="text-sm text-gray-400 ml-1">/ {selectedResult.maxMarks}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Final Grade</p>
                    <div 
                      className="inline-block text-lg font-black px-3 py-1 rounded-xl uppercase"
                      style={{ 
                        backgroundColor: selectedResult.grade.includes('A') ? '#d8f3dc' : '#fee2e2',
                        color: selectedResult.grade.includes('A') ? '#2d6a4f' : '#991b1b'
                      }}
                    >
                      {selectedResult.grade}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Score Breakdown</h4>
                  
                  {['theory', 'practical', 'viva'].map(type => {
                    const data = selectedResult.breakdown?.[type];
                    if (!data) return null;
                    const percent = Math.round((data.obtained / data.max) * 100);
                    
                    return (
                      <div key={type} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="capitalize text-gray-600">{type}</span>
                          <span style={{ color: NAVY }}>{data.obtained} <span className="text-[10px] text-gray-400">/ {data.max}</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: TEAL }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setSelectedResult(null)}
                  className="mt-8 w-full py-3 rounded-xl text-sm font-extrabold transition-all hover:opacity-90"
                  style={{ backgroundColor: NAVY, color: LIME }}
                >
                  Close Result
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainCard>
  );
}

function AcademicAlertsSection({ analytics }) {
  const { t } = useLanguage();
  if (!analytics?.weakAreas?.length) return null;

  return (
    <MainCard variants={cardVariants} className="bg-red-50/30 border-red-100 border">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-red-100">
            <AlertCircle size={26} className="text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-red-900">
              Academic Attention Required
            </h3>
            <p className="text-xs text-red-700/60 font-bold uppercase tracking-widest">Performance Insight</p>
          </div>
        </div>

        <div className="space-y-3">
          {analytics.weakAreas.map((wa, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-red-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-red-900">{wa.subjectName}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Current Score: {wa.score}%</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-red-50 text-red-700 uppercase tracking-tighter">Needs Improvement</span>
              </div>
            </div>
          ))}
          <p className="text-[10px] font-bold text-red-800/50 italic px-2">
            * We recommend scheduling a mentor session for these subjects.
          </p>
        </div>
      </div>
    </MainCard>
  );
}

function InstructionsSection({ instructions }) {
  const { t } = useLanguage();
  return (
    <MainCard variants={cardVariants}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
            <ClipboardList size={26} style={{ color: NAVY }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("exam.instructions")}
            </h3>
            <p className="text-xs text-gray-400">{t("exam.instructionDesc")}</p>
          </div>
        </div>
        <ol className="flex flex-col gap-2.5">
          {(instructions || []).map((inst, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5"
                style={{ backgroundColor: NAVY, color: LIME }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="text-sm text-gray-600 leading-snug">{inst}</p>
            </li>
          ))}
        </ol>
      </div>
    </MainCard>
  );
}

function ExaminationPage() {
  const { t } = useLanguage();
  const { activeStudentId } = useStudent();
  const { isParent: isParentMode } = useAuth();
  const [showHelper, setShowHelper] = useState(false);
  
  const { data: examination, loading: examLoading, error: examError } = useService(getExamData, [activeStudentId], [activeStudentId]);
  const { data: results, loading: resultsLoading, error: resultsError } = useService(
    getStudentResults, 
    [activeStudentId], 
    [activeStudentId]
  );
  const { data: analytics, loading: analyticsLoading, error: analyticsError } = useService(
    getStudentAnalytics,
    [activeStudentId],
    [activeStudentId]
  );

  const { data: allExams, loading: allExamsLoading } = useService(getAllExams, []);

  if (examError || resultsError || analyticsError) {
    throw examError || resultsError || analyticsError;
  }

  const loading = examLoading || resultsLoading || analyticsLoading || allExamsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!examination) return null;

  return (
    <>
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
              <FileText size={26} className="text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black truncate" style={{ color: NAVY }}>
                {t("exam.title")}
              </h1>
              <p className="text-sm text-gray-500 truncate">{t("exam.subtitle")}</p>
            </div>
          </div>


          <div className="flex-shrink-0">
            <HelperButton
              onClick={() => setShowHelper(true)}
              className="relative"
            />
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col gap-6">
            <AdmitCardSection admitCard={examination.admitCard} />
            <AcademicAlertsSection analytics={analytics} />
            <ResultsSection results={results || []} examination={examination} allExams={allExams} />
          </div>

          <div className="flex flex-col gap-6">
            <ScheduleSection schedule={examination.schedule} />
            <InstructionsSection instructions={examination.instructions} />
          </div>
        </motion.div>
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="exam.title"
        contentEn="The Examinations section shows your admit card, upcoming exam schedule, past results, and important exam instructions. Download your admit card before the exam date."
        contentHi="परीक्षा अनुभाग आपका प्रवेश पत्र, आगामी परीक्षा कार्यक्रम, पिछले परिणाम और महत्वपूर्ण परीक्षा निर्देश दिखाता है। परीक्षा तिथि से पहले अपना प्रवेश पत्र डाउनलोड करें।"
      />
    </>
  );
}

export default ExaminationPage;
