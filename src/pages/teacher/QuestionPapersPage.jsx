import React, { useState, useMemo, useEffect } from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import MainCard from "../../components/MainCard";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { questionPaperService } from "../../services/questionPaperService";
import QuestionPaperForm from "../../components/questionPapers/QuestionPaperForm";
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle,
  FileCheck,
  XCircle,
  Edit,
  Trash2,
  ChevronRight,
  Upload,
  Calendar,
  Layers,
  Award,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StatusBadge = ({ status }) => {
  const styles = {
    Draft: "bg-gray-100 text-gray-600 border-gray-200",
    Submitted: "bg-blue-50 text-blue-600 border-blue-200",
    Approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-600 border-rose-200",
  };
  
  const { t } = useLanguage();
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.Draft}`}>
      {status === 'Submitted' ? t("questionPapers.pendingApproval", { fallback: 'Pending Approval' }) : t(`questionPapers.status${status}`, { fallback: status })}
    </span>
  );
};

const QuestionPapersPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const teacherProfile = user?.profile;
  const teacherId = teacherProfile?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "Draft" | "Submitted" | "Approved" | "Rejected"
  
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [paperToEdit, setPaperToEdit] = useState(null);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      if (teacherId) {
        const data = await questionPaperService.getTeacherQuestionPapers(teacherId);
        setPapers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [teacherId]);

  const stats = useMemo(() => {
    let draft = 0;
    let submitted = 0;
    let approved = 0;
    papers.forEach(p => {
      if (p.status === "Draft") draft++;
      if (p.status === "Submitted") submitted++;
      if (p.status === "Approved") approved++;
    });
    return { total: papers.length, draft, submitted, approved };
  }, [papers]);

  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      if (activeTab !== "all" && p.status !== activeTab) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.title?.toLowerCase().includes(q) && !p.className?.toLowerCase().includes(q) && !p.subjectName?.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [papers, activeTab, searchQuery]);



  const handleDelete = async (id) => {
    if (window.confirm(t("questionPapers.deleteConfirm", { fallback: "Are you sure you want to delete this question paper?" }))) {
      await questionPaperService.deleteQuestionPaper(id);
      fetchPapers();
    }
  };

  const handleFormSave = async (payload) => {
    await questionPaperService.saveQuestionPaper(payload);
    setIsFormOpen(false);
    fetchPapers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
      <TeacherModuleHeader 
        titleKey="nav.question_papers"
        descriptionKey="questionPapers.moduleDesc"
        helperContentEn="The Question Paper module lets you draft textual papers or upload formatted PDF/Images, submitting them directly to the administration for review."
        helperContentHi="प्रश्न पत्र मॉड्यूल आपको प्रश्न पत्र का मसौदा तैयार करने या स्वरूपित पीडीएफ / चित्र अपलोड करने की अनुमति देता है, उन्हें समीक्षा के लिए सीधे प्रशासन को प्रस्तुत करता है।"
      />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <MainCard className="p-5 border-l-4 border-l-[#03045e]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("questionPapers.totalPapers", { fallback: "Total Papers" })}</p>
              <p className="text-3xl font-black text-[#03045e]">{stats.total}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600"><Layers size={20} /></div>
          </div>
        </MainCard>
        <MainCard className="p-5 border-l-4 border-l-gray-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("questionPapers.drafts", { fallback: "Drafts" })}</p>
              <p className="text-3xl font-black text-[#03045e]">{stats.draft}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-gray-50 text-gray-500"><Edit size={20} /></div>
          </div>
        </MainCard>
        <MainCard className="p-5 border-l-4 border-l-blue-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("questionPapers.pendingApproval", { fallback: "Pending Approval" })}</p>
              <p className="text-3xl font-black text-[#03045e]">{stats.submitted}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-500"><Clock size={20} /></div>
          </div>
        </MainCard>
        <MainCard className="p-5 border-l-4 border-l-emerald-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("questionPapers.approved", { fallback: "Approved" })}</p>
              <p className="text-3xl font-black text-[#03045e]">{stats.approved}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-500"><CheckCircle size={20} /></div>
          </div>
        </MainCard>
      </div>



      {/* Controls Row */}
      <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-150 shadow-sm rounded-3xl bg-white">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 flex-1 max-w-md focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <Search size={15} className="text-gray-400" />
          <input 
            type="text" 
            placeholder={t("questionPapers.searchPlaceholder", { fallback: "Search papers..." })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[11px] font-bold bg-transparent outline-none text-[#03045e] placeholder-gray-400"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto hide-scrollbar">
            {["all", "Draft", "Submitted", "Approved", "Rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab ? "bg-[#03045e] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === 'Submitted' ? t("questionPapers.pendingApproval", { fallback: 'Pending Approval' }) : t(`questionPapers.status${tab}`, { fallback: tab })}
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
              setPaperToEdit(null);
              setIsFormOpen(true);
            }}
            className="bg-[#03045e] text-white px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-[#03045e]/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all whitespace-nowrap"
          >
            <Plus size={14} />
            {t("questionPapers.createNew", { fallback: "Create New" })}
          </button>
        </div>
      </div>

      {/* Table */}
      <MainCard className="overflow-hidden border border-gray-150">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{t("questionPapers.paperDetails", { fallback: "Paper Details" })}</th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{t("questionPapers.classAndSubject", { fallback: "Class & Subject" })}</th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{t("questionPapers.type", { fallback: "Type" })}</th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{t("questionPapers.format", { fallback: "Format" })}</th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{t("questionPapers.status", { fallback: "Status" })}</th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">{t("common.actions", { fallback: "Actions" })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPapers.length > 0 ? (
                filteredPapers.map(paper => (
                  <tr key={paper.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#03045e] group-hover:text-[#00b4d8] transition-colors">{paper.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t("questionPapers.id", { fallback: "ID:" })} {paper.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-xs font-black text-[#03045e]">{paper.subjectName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t("questionPapers.class", { fallback: "Class" })} {paper.className}</p>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {paper.examType}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                        {paper.uploadedFile ? (
                          <><Upload size={14} className="text-[#00b4d8]" /> {t("questionPapers.file", { fallback: "File" })}</>
                        ) : (
                          <><FileText size={14} className="text-emerald-500" /> {t("questionPapers.text", { fallback: "Text" })}</>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={paper.status} />
                      {paper.status === 'Rejected' && paper.remarks && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 max-w-[150px] truncate" title={paper.remarks}>
                          {paper.remarks}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        {paper.status === 'Approved' ? (
                          <button 
                            onClick={() => { setPaperToEdit(paper); setIsFormOpen(true); }}
                            className="p-2 rounded-xl bg-gray-100 text-[#03045e] hover:bg-emerald-500 hover:text-white transition-colors"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => { setPaperToEdit(paper); setIsFormOpen(true); }}
                            className="p-2 rounded-xl bg-gray-100 text-[#03045e] hover:bg-[#00b4d8] hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        {paper.status !== 'Approved' && (
                          <button 
                            onClick={() => handleDelete(paper.id)}
                            className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileText size={32} className="mb-3 opacity-20" />
                      <p className="text-sm font-black text-[#03045e]">{t("questionPapers.noPapers", { fallback: "No question papers found" })}</p>
                      <p className="text-xs font-bold mt-1">{t("questionPapers.noPapersHelp", { fallback: "Create a new paper or adjust your filters." })}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MainCard>

      <QuestionPaperForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setPaperToEdit(null); }}
        paperToEdit={paperToEdit}
        onSaved={handleFormSave}
        teacherProfile={teacherProfile}
      />
    </div>
  );
};

export default QuestionPapersPage;
