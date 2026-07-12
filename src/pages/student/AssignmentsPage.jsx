import React, { useState, useMemo } from "react";
import { useStudent } from "../../context/StudentContext";
import { useLanguage } from "../../context/LanguageContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";
import { useService } from "../../hooks/useService";
import { getAcademicProgress, getStudentAssignments } from "../../services/assignmentService";
import { ClipboardList, BookOpen, ListTodo, Search } from "lucide-react";
import { motion } from "framer-motion";

// Components
import AssignmentCard from "../../components/assignments/AssignmentCard";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";

/**
 * AssignmentsPage
 * 
 * Optimized full-width single-column operational layout.
 * Tightened operational filter/search toolbar with combinational filtering.
 */
const AssignmentsPage = () => {
  const { activeStudentId: studentId } = useStudent();
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  // Centralized services: Optimized by removing redundant timeline fetches
  const { data: progress, loading: pLoading, error: pError, refetch: refetchProgress } = useService(getAcademicProgress, [studentId], [studentId]);
  const { data: assignments, loading: aLoading, error: aError, refetch: refetchAssignments } = useService(getStudentAssignments, [studentId], [studentId]);

  // Unified Combinational Filtering Logic (Backend-Ready & Scalable)
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];

    return assignments.filter(asgn => {
      // 1. Subject Filter Match
      if (selectedSubjectId && asgn.subjectId !== selectedSubjectId) {
        return false;
      }

      // 2. Operational Status Match
      // Standardized terminology: 
      // - Pending matches active ('PENDING'), due soon ('DUE_SOON'), AND overdue ('OVERDUE') tasks.
      // - Overdue matches ONLY 'OVERDUE' tasks.
      // - Submitted matches completed ('SUBMITTED', 'REVIEWED') tasks.
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "SUBMITTED") {
          if (asgn.status !== "SUBMITTED" && asgn.status !== "REVIEWED") return false;
        } else if (selectedStatus === "PENDING") {
          if (asgn.status !== "PENDING" && asgn.status !== "DUE_SOON" && asgn.status !== "OVERDUE") return false;
        } else if (selectedStatus === "OVERDUE") {
          if (asgn.status !== "OVERDUE") return false;
        }
      }

      // 3. Multi-Key Search Match (Title, Subject, or Description Keywords)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = asgn.title?.toLowerCase().includes(query);
        const matchesSubject = asgn.subjectName?.toLowerCase().includes(query);
        const matchesDesc = asgn.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubject && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [assignments, selectedSubjectId, selectedStatus, searchQuery]);

  // Loading state
  if (pLoading || aLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (pError || aError) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-[2rem] border border-rose-100 w-full max-w-7xl mx-auto">
        <p className="text-rose-600 font-bold">Failed to load assignment data. Please try again later.</p>
      </div>
    );
  }

  const safeProgress = progress || [];

  return (
    <>
      <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
        
        {/* Header Section - Sleek ERP Branding */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#03045e] shadow-md shadow-blue-900/10">
              <ClipboardList size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#03045e] leading-tight">{t("assignments.title", { fallback: "Assignments" })}</h1>
              <p className="text-xs text-gray-500 font-bold">{t("assignments.subtitle", { fallback: "Manage your academic tasks, research work, and submissions" })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ChildScopeSwitcher />
            <HelperButton onClick={() => setShowHelper(true)} />
          </div>
        </div>

        {/* Unified Filter/Search Toolbar - Compact Operational Utility Section */}
        <div className="p-4 md:p-5 flex flex-col gap-4 w-full border border-gray-150 shadow-sm rounded-3xl bg-white">
          
          {/* Row 1: Search Input & Status Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input with Integrated Keywords Match */}
            <div className="flex-1 flex items-center gap-2.5 bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 transition-all">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder={t("assignments.searchPlaceholder", { fallback: "Search title, subject, or description keywords..." })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-[11px] font-bold bg-transparent outline-none text-[#03045e] placeholder-gray-400"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2 lg:block hidden">{t("assignments.statusFilter", { fallback: "Status:" })}</span>
              {[
                { id: "ALL", label: "All Tasks", key: "allTasks" },
                { id: "PENDING", label: "Pending", key: "pendingTasks" },
                { id: "SUBMITTED", label: "Submitted", key: "submittedTasks" },
                { id: "OVERDUE", label: "Overdue", key: "overdueTasks" }
              ].map(statusOpt => {
                const isActive = selectedStatus === statusOpt.id;
                return (
                  <motion.button
                    key={statusOpt.id}
                    whileHover={{ y: -0.5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStatus(statusOpt.id)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                      isActive 
                        ? "bg-[#03045e] border-[#03045e] text-white shadow-sm" 
                        : "bg-white border-gray-150 text-[#03045e] hover:bg-gray-50 hover:border-gray-200"
                    }`}
                  >{t(`assignments.${statusOpt.key}`, { fallback: statusOpt.label })}</motion.button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Subject Filter Chips */}
          <div className="space-y-2 pt-3.5 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen size={11} className="text-[#00b4d8]" />
                {t("assignments.filterBySubject", { fallback: "Filter by Subject" })}</span>
              {selectedSubjectId && (
                <button 
                  onClick={() => setSelectedSubjectId(null)}
                  className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                >{t("assignments.clearFilter", { fallback: "Clear Filter" })}</button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {safeProgress.map(sub => {
                const isActive = selectedSubjectId === sub.subjectId;
                return (
                  <motion.button
                    key={sub.subjectId}
                    whileHover={{ y: -0.5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSubjectId(isActive ? null : sub.subjectId)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                      isActive 
                        ? "bg-[#0077b6] border-[#0077b6] text-white shadow-sm shadow-blue-900/10" 
                        : "bg-gray-50/60 border-gray-150 text-gray-500 hover:bg-gray-100 hover:border-gray-200"
                    }`}
                  >{t(`subjects.${sub.subjectName.toLowerCase().replace(/\s+/g, "")}`, { fallback: sub.subjectName })}</motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Assignments List - Tight spacing rhythm */}
        <section className="space-y-3 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-[#03045e] flex items-center gap-2 uppercase tracking-wider">
              <ListTodo size={14} className="text-[#0077b6]" />
              {t("assignments.assignmentList", { fallback: "Assignment List" })} ({filteredAssignments.length})
            </h2>
          </div>
          
          {filteredAssignments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 w-full animate-fadeIn">
              {filteredAssignments.map(asgn => (
                <div key={asgn.id}>
                  <AssignmentCard 
                    assignment={asgn} 
                    onStatusUpdate={() => {
                      refetchProgress();
                      refetchAssignments();
                    }}
                  />
                </div>
              ))}
            </div>
          ) : assignments && assignments.length === 0 ? (
            /* No data at all — not a filter issue */
            <MainCard className="p-12 text-center border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center rounded-3xl bg-white w-full">
              <div className="w-12 h-12 rounded-full bg-[#caf0f8]/60 flex items-center justify-center text-[#00b4d8] mb-3">
                <ClipboardList size={22} />
              </div>
              <h3 className="text-sm font-black text-[#03045e] mb-1">{t("assignments.noAssignmentsYet", { fallback: "No assignments yet" })}</h3>
              <p className="text-xs text-gray-400 font-bold max-w-sm">{t("assignments.noAssignmentsYetDesc", { fallback: "Your teacher hasn't published any assignments to this class yet. Check back later." })}</p>
            </MainCard>
          ) : (
            /* Data exists but filters produce no matches */
            <MainCard className="p-12 text-center border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center rounded-3xl bg-white w-full">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
                <Search size={22} />
              </div>
              <h3 className="text-sm font-black text-[#03045e] mb-1">{t("assignments.noMatches", { fallback: "No assignments match your filters" })}</h3>
              <p className="text-xs text-gray-400 font-bold max-w-sm">{t("assignments.noMatchesDesc", { fallback: "Try clearing the subject filter or adjusting the status tab to see more results." })}</p>
            </MainCard>
          )}
        </section>
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="assignments.moduleHelper"
        contentEn="The restructured Assignments page allows you to search and filter tasks in real-time. Use the search input to search titles, subjects, and descriptions, filter by subjects, and filter operational statuses (All, Pending, Submitted, Overdue) in combinational views."
        contentHi="पुनर्गठित असाइनमेंट पृष्ठ आपको वास्तविक समय में कार्यों को खोजने और फ़िल्टर करने की अनुमति देता है। शीर्षकों और विवरणों को खोजने के लिए खोज इनपुट का उपयोग करें, विषयों के आधार पर फ़िल्टर करें, और संयोजन विचारों में परिचालन स्थितियों (सभी, लंबित, प्रस्तुत, अतिदेय) को फ़िल्टर करें।"
      />
    </>
  );
};

export default AssignmentsPage;
