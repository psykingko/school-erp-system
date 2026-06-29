import React, { useState, useMemo } from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import MainCard from "../../components/MainCard";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useService } from "../../hooks/useService";
import { 
  getAssignmentsByTeacher, 
  getSubmissionsByAssignment, 
  deleteAssignment 
} from "../../services/assignmentService";
import AssignmentForm from "../../components/assignments/AssignmentForm";
import SubmissionTable from "../../components/assignments/SubmissionTable";
import GradeModal from "../../components/assignments/GradeModal";
import { 
  Plus, 
  Users, 
  BookOpen, 
  Clock, 
  ChevronRight, 
  Search, 
  Calendar, 
  Award, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle,
  FileCheck,
  FileText,
  Download,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AssignmentsManagementPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const teacherProfile = user?.profile;
  const teacherId = teacherProfile?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("ALL");
  const [activeTab, setActiveTab] = useState("active"); // "active" | "all"

  // Selected Assignment details view
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState(null);
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [submissionToGrade, setSubmissionToGrade] = useState(null);

  // Fetch all assignments for this teacher
  const { 
    data: assignments, 
    loading: aLoading, 
    refetch: refetchAssignments 
  } = useService(getAssignmentsByTeacher, [teacherId], [teacherId]);

  // Fetch student roster submissions for the selected assignment (safe to pass null)
  const { 
    data: rosterSubmissions, 
    loading: rLoading, 
    refetch: refetchRoster 
  } = useService(getSubmissionsByAssignment, [selectedAssignment?.id], [selectedAssignment?.id]);

  // Get list of unique subjects the teacher teaches for filtering
  const uniqueSubjects = useMemo(() => {
    if (!assignments) return [];
    const subjects = new Map();
    assignments.forEach(asgn => {
      subjects.set(asgn.subjectId, asgn.subjectName);
    });
    return Array.from(subjects.entries()).map(([id, name]) => ({ id, name }));
  }, [assignments]);

  // Combinational filtering for assignments
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter(asgn => {
      // 1. Tab Filter (Active vs Past)
      const isPast = new Date(asgn.dueDate) < new Date();
      if (activeTab === "active" && isPast) return false;

      // 3. Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = asgn.title?.toLowerCase().includes(query);
        const matchesClass = asgn.className?.toLowerCase().includes(query) || asgn.classDisplayName?.toLowerCase().includes(query);
        const matchesDesc = asgn.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesClass && !matchesDesc) return false;
      }

      return true;
    });
  }, [assignments, activeTab, searchQuery]);

  // Dynamic statistics
  const stats = useMemo(() => {
    if (!assignments) return { total: 0, pendingReview: 0, completion: 0 };
    const total = assignments.length;
    let totalSubm = 0;
    let totalGraded = 0;
    
    assignments.forEach(a => {
      totalSubm += a.submissionsCount || 0;
      totalGraded += a.gradedCount || 0;
    });

    const pending = totalSubm - totalGraded;
    const completion = totalSubm > 0 ? Math.round((totalGraded / totalSubm) * 100) : 0;

    return { total, pendingReview: pending, completion };
  }, [assignments]);

  const handleDeleteAssignment = async (id) => {
    if (window.confirm(t("assignments.deleteConfirm", { fallback: "Are you sure you want to delete this assignment? All student submissions and grades for it will be lost." }))) {
      try {
        await deleteAssignment(id);
        setSelectedAssignment(null);
        refetchAssignments();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGradeStudent = (studentRosterItem) => {
    setSubmissionToGrade(studentRosterItem);
    setIsGradeOpen(true);
  };

  if (aLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
      {/* Header and Back navigation */}
      <div className="flex flex-col gap-4">
        {selectedAssignment && (
          <button
            onClick={() => setSelectedAssignment(null)}
            className="flex items-center gap-2 text-xs font-black text-primary hover:text-[#03045e] transition-colors w-fit bg-primary/5 px-4 py-2.5 rounded-xl uppercase tracking-widest border border-primary/10 shadow-sm"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            {t("assignments.backToDashboard", { fallback: "Back to Dashboard" })}
          </button>
        )}

        <TeacherModuleHeader 
          titleKey={!selectedAssignment ? "assignments.moduleTitle" : undefined}
          title={selectedAssignment ? selectedAssignment.title : undefined}
          descriptionKey={!selectedAssignment ? "assignments.moduleDesc" : undefined}
          description={selectedAssignment ? `${t("assignments.class", { fallback: "Class:" })} ${selectedAssignment.classDisplayName} • ${t("assignments.subject", { fallback: "Subject:" })} ${selectedAssignment.subjectName}` : undefined}
          helperContentEn="The assignment workflow module supports structured task creation, relational class roster generation, text/link grading reviews, and dynamic status propagation."
          helperContentHi="असाइनमेंट वर्कफ़्लो मॉड्यूल संरचित कार्य निर्माण, संबंधपरक वर्ग रोस्टर निर्माण, पाठ/लिंक ग्रेडिंग समीक्षाओं और गतिशील स्थिति प्रसार का समर्थन करता है।"
        />
      </div>

      <AnimatePresence mode="wait">
        {!selectedAssignment ? (
          /* ================= MAIN ASSIGNMENT LIST VIEW ================= */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Quick Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <MainCard className="p-6 border-l-4 border-l-[#03045e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("assignments.totalAssignments", { fallback: "Total Assignments" })}</p>
                    <p className="text-3xl font-black text-[#03045e]">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-50 text-[#03045e]">
                    <BookOpen size={20} />
                  </div>
                </div>
              </MainCard>

              <MainCard className="p-6 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("assignments.pendingReviews", { fallback: "Pending Reviews" })}</p>
                    <p className="text-3xl font-black text-[#03045e]">{stats.pendingReview}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                    <Clock size={20} />
                  </div>
                </div>
              </MainCard>

              <MainCard className="p-6 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("assignments.gradingProgress", { fallback: "Grading Progress" })}</p>
                    <p className="text-3xl font-black text-[#03045e]">{stats.completion}%</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                    <FileCheck size={20} />
                  </div>
                </div>
              </MainCard>
            </div>

            {/* Filter / Search / Control Row */}
            <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-150 shadow-sm rounded-3xl bg-white">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                {/* Search */}
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 flex-1 max-w-md focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <Search size={15} className="text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={t("assignments.searchPlaceholder", { fallback: "Search by title, description or class..." })}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-[11px] font-bold bg-transparent outline-none text-[#03045e] placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                {/* Status Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-2xl">
                  {["active", "all"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                        activeTab === tab ? "bg-[#03045e] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab === "active" ? t("assignments.tabActive", { fallback: "active" }) : t("assignments.tabAll", { fallback: "all" })}
                    </button>
                  ))}
                </div>

                {/* Create Button */}
                <button 
                  onClick={() => {
                    setAssignmentToEdit(null);
                    setIsFormOpen(true);
                  }}
                  className="bg-[#03045e] text-white px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-[#03045e]/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  <Plus size={14} />
                  {t("assignments.newAssignment", { fallback: "New Assignment" })}
                </button>
              </div>
            </div>

            {/* Assignments List */}
            <div className="grid grid-cols-1 gap-5">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((asgn) => (
                  <MainCard 
                    key={asgn.id} 
                    className="p-6 group hover:border-[#00b4d8] hover:shadow-md transition-all border-l-4 border-l-[#03045e] cursor-pointer"
                    onClick={() => setSelectedAssignment(asgn)}
                  >
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                      <div className="flex-1 space-y-2 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-tighter">
                            {asgn.subjectName}
                          </span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {t("assignments.class", { fallback: "Class:" })} {asgn.classDisplayName}
                          </span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-auto lg:ml-0">
                            • {t("assignments.max", { fallback: "Max:" })} {asgn.maxMarks || asgn.totalMarks} {t("assignments.marks", { fallback: "Marks" })}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-[#03045e] group-hover:text-primary transition-colors line-clamp-1">
                          {asgn.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-6 pt-1.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Calendar size={13} className="text-amber-500" />
                            {t("assignments.due", { fallback: "Due:" })} {asgn.dueDate}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Users size={13} className="text-[#00b4d8]" />
                            {t("assignments.rosterSubmitted", { fallback: "Roster Submitted:" })} {asgn.submissionsCount} / {asgn.totalStudents}
                          </div>
                        </div>
                      </div>

                      <div className="w-full lg:w-48 shrink-0">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t("assignments.gradingProgress", { fallback: "Grading Progress" })}</span>
                          <span className="text-xs font-black text-[#03045e]">{asgn.gradingProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${asgn.gradingProgress}%` }}
                            className="h-full bg-[#00b4d8] rounded-full"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssignment(asgn);
                        }}
                        className="p-3.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#03045e] group-hover:text-white transition-all shadow-sm shrink-0"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </MainCard>
                ))
              ) : (
                <MainCard className="p-16 text-center border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center rounded-3xl bg-white w-full">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
                    <Search size={24} />
                  </div>
                  <h3 className="text-sm font-black text-[#03045e] mb-1.5">{t("assignments.noAssignmentsFound", { fallback: "No assignments found" })}</h3>
                  <p className="text-xs text-gray-400 font-bold max-w-sm">
                    {t("assignments.noAssignmentsHelp", { fallback: 'Try altering your search query, selecting another subject filter, or check the "all" tab for past deadlines.' })}
                  </p>
                </MainCard>
              )}
            </div>
          </motion.div>
        ) : (
          /* ================= ASSIGNMENT DETAILED ROSTER / GRADING VIEW ================= */
          <motion.div
            key="roster-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
          >
            {/* Sidebar Details Card */}
            <div className="space-y-6">
              <MainCard className="p-6 space-y-5 border-t-4 border-t-[#00b4d8]">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-tighter">
                      {selectedAssignment.subjectName}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-black uppercase tracking-tighter">
                      {t("assignments.class", { fallback: "Class:" })} {selectedAssignment.classDisplayName}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#03045e] leading-tight">
                    {selectedAssignment.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold leading-relaxed whitespace-pre-wrap">
                    {selectedAssignment.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-gray-400 uppercase tracking-widest text-[9px]">{t("assignments.maxMarks", { fallback: "Max Marks" })}</span>
                    <span className="font-black text-[#03045e] flex items-center gap-1">
                      <Award size={13} className="text-amber-500" />
                      {selectedAssignment.maxMarks || selectedAssignment.totalMarks} {t("assignments.marks", { fallback: "Marks" })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-gray-400 uppercase tracking-widest text-[9px]">{t("assignments.dueDate", { fallback: "Due Date" })}</span>
                    <span className="font-black text-[#03045e] flex items-center gap-1">
                      <Calendar size={13} className="text-[#00b4d8]" />
                      {selectedAssignment.dueDate}
                    </span>
                  </div>
                  {selectedAssignment.attachment && (
                    <div className="pt-2">
                      <span className="font-black text-gray-400 uppercase tracking-widest text-[9px] mb-2 block">{t("assignments.attachment", { fallback: "Attachment" })}</span>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-150 rounded-xl w-full">
                         <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                           <FileText size={16} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-xs font-black text-[#03045e] truncate block w-full">
                             {typeof selectedAssignment.attachment === "string" ? t("assignments.materialLink", { fallback: "Material Link" }) : selectedAssignment.attachment.fileName}
                           </p>
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                             {typeof selectedAssignment.attachment === "string" ? t("assignments.externalResource", { fallback: "External Resource" }) : t("assignments.uploadedFile", { fallback: "Uploaded File" })}
                           </p>
                         </div>
                         <a 
                           href={typeof selectedAssignment.attachment === "string" ? selectedAssignment.attachment : selectedAssignment.attachment.data} 
                           download={typeof selectedAssignment.attachment === "string" ? undefined : selectedAssignment.attachment.fileName}
                           target="_blank"
                           rel="noreferrer"
                           className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#03045e] hover:bg-[#03045e] hover:text-white transition-colors shrink-0"
                         >
                           <Download size={14} />
                         </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit / Delete Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setAssignmentToEdit(selectedAssignment);
                      setIsFormOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-250 text-[#03045e] hover:bg-gray-50 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <Edit size={13} />
                    {t("common.edit", { fallback: "Edit" })}
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(selectedAssignment.id)}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-black uppercase tracking-wider transition-all border border-rose-100"
                  >
                    <Trash2 size={13} />
                    {t("common.delete", { fallback: "Delete" })}
                  </button>
                </div>
              </MainCard>
            </div>

            {/* Main roster Submissions table */}
            <div className="lg:col-span-2 space-y-6">
              {rLoading ? (
                <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-gray-150 shadow-sm">
                  <div className="w-8 h-8 border-3 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-[#03045e] uppercase tracking-wider flex items-center gap-2">
                    <Users size={15} className="text-[#0077b6]" />
                    {t("assignments.studentRoster", { fallback: "Student Submission Roster (" })}{rosterSubmissions?.length || 0} {t("assignments.enrolled", { fallback: "enrolled)" })}
                  </h3>

                  <SubmissionTable 
                    roster={rosterSubmissions || []} 
                    totalMarks={selectedAssignment.maxMarks || selectedAssignment.totalMarks}
                    onGradeStudent={handleGradeStudent}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}

      {/* Create / Edit Assignment Modal */}
      <AssignmentForm 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setAssignmentToEdit(null);
        }}
        teacherProfile={teacherProfile}
        assignmentToEdit={assignmentToEdit}
        onAssignmentSaved={async () => {
          // If we edited the current selected assignment, let's refresh its details
          if (assignmentToEdit && selectedAssignment && assignmentToEdit.id === selectedAssignment.id) {
            const freshList = await getAssignmentsByTeacher(teacherId);
            const freshItem = freshList.find(a => a.id === selectedAssignment.id);
            if (freshItem) setSelectedAssignment(freshItem);
          }
          refetchAssignments();
        }}
      />

      {/* Grading Modal */}
      <GradeModal 
        isOpen={isGradeOpen}
        onClose={() => {
          setIsGradeOpen(false);
          setSubmissionToGrade(null);
        }}
        submission={submissionToGrade}
        totalMarks={selectedAssignment?.maxMarks || selectedAssignment?.totalMarks || 20}
        assignmentId={selectedAssignment?.id}
        onGradeSaved={async () => {
          // Refresh both roster submissions and main list analytics
          refetchRoster();
          const freshList = await getAssignmentsByTeacher(teacherId);
          if (selectedAssignment) {
            const freshItem = freshList.find(a => a.id === selectedAssignment.id);
            if (freshItem) setSelectedAssignment(freshItem);
          }
          refetchAssignments();
        }}
      />
    </div>
  );
};

export default AssignmentsManagementPage;
