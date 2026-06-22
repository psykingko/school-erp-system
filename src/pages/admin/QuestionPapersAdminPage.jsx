import React, { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MainCard from "../../components/MainCard";
import { questionPaperService } from "../../services/questionPaperService";
import QuestionPaperPreview from "../../modules/question-papers/QuestionPaperPreview";
import { 
  Search, 
  FileText, 
  Clock, 
  CheckCircle,
  FileCheck,
  XCircle,
  Eye,
  X,
  Upload,
  Calendar,
  Layers,
  Award,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StatusBadge = ({ status }) => {
  const styles = {
    Draft: "bg-gray-100 text-gray-600 border-gray-200",
    Submitted: "bg-amber-50 text-amber-600 border-amber-200",
    Approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-600 border-rose-200",
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.Draft}`}>
      {status === 'Submitted' ? 'Pending Approval' : status}
    </span>
  );
};

const QuestionPapersAdminPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "Submitted" | "Approved" | "Rejected"
  
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [viewPaper, setViewPaper] = useState(null);
  const [remarks, setRemarks] = useState("");

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const data = await questionPaperService.getAllQuestionPapers();
      setPapers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    papers.forEach(p => {
      if (p.status === "Submitted") pending++;
      if (p.status === "Approved") approved++;
      if (p.status === "Rejected") rejected++;
    });
    return { total: papers.length, pending, approved, rejected };
  }, [papers]);

  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      // Admin dashboard typically doesn't care much about "Draft", but we can include it in "All"
      if (activeTab !== "all" && p.status !== activeTab) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.title?.toLowerCase().includes(q) && 
            !p.className?.toLowerCase().includes(q) && 
            !p.subjectName?.toLowerCase().includes(q) &&
            !p.teacherName?.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [papers, activeTab, searchQuery]);

  const handleAction = async (status) => {
    if (viewPaper) {
      if (status === "Rejected" && !remarks.trim()) {
        alert("Please provide remarks for rejection.");
        return;
      }
      await questionPaperService.updateQuestionPaperStatus(viewPaper.id, status, remarks);
      setViewPaper(null);
      setRemarks("");
      fetchPapers();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#03045e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
      <AdminPageHeader 
        title="Question Paper Management"
        description="Review and manage academic question papers submitted by the faculty."
        icon={FileCheck}
      />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <MainCard className="p-5 border-l-4 border-l-[#03045e]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Records</p>
              <p className="text-3xl font-black text-[#03045e]">{stats.total}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600"><Layers size={20} /></div>
          </div>
        </MainCard>
        <MainCard className="p-5 border-l-4 border-l-amber-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Approval</p>
              <p className="text-3xl font-black text-[#03045e]">{stats.pending}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-500"><Clock size={20} /></div>
          </div>
        </MainCard>
        <MainCard className="p-5 border-l-4 border-l-emerald-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Approved</p>
              <p className="text-3xl font-black text-[#03045e]">{stats.approved}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-500"><CheckCircle size={20} /></div>
          </div>
        </MainCard>
        <MainCard className="p-5 border-l-4 border-l-rose-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rejected</p>
              <p className="text-3xl font-black text-[#03045e]">{stats.rejected}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-500"><XCircle size={20} /></div>
          </div>
        </MainCard>
      </div>

      {/* Controls Row */}
      <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-150 shadow-sm rounded-3xl bg-white">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/60 rounded-xl px-3.5 py-2.5 flex-1 w-[95vw] md:w-[90vw] lg:max-w-md focus-within:bg-white focus-within:ring-2 focus-within:ring-[#03045e]/10 transition-all">
          <Search size={15} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by title, subject, or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[11px] font-bold bg-transparent outline-none text-[#03045e] placeholder-gray-400"
          />
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto hide-scrollbar w-full md:w-auto">
          {["all", "Submitted", "Approved", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab ? "bg-[#03045e] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab === "Submitted" ? "Pending Approval" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <MainCard className="overflow-hidden border border-gray-150">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Paper Details</th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Teacher</th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Subject & Class</th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Type & Date</th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
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
                          <p className="text-sm font-black text-[#03045e] truncate max-w-[200px]">{paper.title}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {paper.uploadedFile ? <Upload size={10} className="text-[#00b4d8]" /> : <FileText size={10} className="text-emerald-500" />}
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{paper.uploadedFile ? 'File' : 'Text'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-xs font-black text-[#03045e]">{paper.teacherName}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-xs font-black text-[#03045e]">{paper.subjectName}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Class {paper.className}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-xs font-black text-[#03045e]">{paper.examType}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{new Date(paper.updatedAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={paper.status} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => { setViewPaper(paper); setRemarks(""); }}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-[#03045e] hover:bg-[#03045e] hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileCheck size={32} className="mb-3 opacity-20" />
                      <p className="text-sm font-black text-[#03045e]">No records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MainCard>

      {/* View/Approve Modal */}
      <AnimatePresence>
        {viewPaper && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewPaper(null)}
              className="absolute inset-0 bg-[#03045e]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full w-[95vw] md:w-[90vw] lg:max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-[#03045e]">{viewPaper.title}</h2>
                    <StatusBadge status={viewPaper.status} />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                    By {viewPaper.teacherName} • Class {viewPaper.className} • {viewPaper.subjectName}
                  </p>
                </div>
                <button
                  onClick={() => setViewPaper(null)}
                  className="p-2 rounded-xl hover:bg-gray-200/50 text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* A4 Preview Engine */}
                <div className="min-h-[500px]">
                  <QuestionPaperPreview paper={viewPaper} isTeacherView={false} />
                </div>

                {/* File Attachment Viewer (Mock) */}
                {viewPaper.uploadedFile && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attached File</h3>
                    <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50">
                      <FileText size={32} className="text-[#00b4d8] mb-3" />
                      <p className="text-sm font-black text-[#03045e]">{viewPaper.uploadedFile.fileName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Preview not available in prototype</p>
                    </div>
                  </div>
                )}

                {/* Remarks Field (For Rejection) */}
                {viewPaper.status === "Submitted" && (
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Remarks (Required for rejection)</label>
                    <input
                      type="text"
                      placeholder="e.g. Please reformat Section B"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#03045e] outline-none text-sm font-bold text-[#03045e]"
                    />
                  </div>
                )}
                
                {viewPaper.status === "Rejected" && viewPaper.remarks && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Previous Rejection Remarks</p>
                    <p className="text-sm font-bold text-rose-700">{viewPaper.remarks}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                <button
                  onClick={() => setViewPaper(null)}
                  className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-200/50 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Close
                </button>
                {viewPaper.status === "Submitted" && (
                  <>
                    <button
                      onClick={() => handleAction("Rejected")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction("Approved")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#03045e] text-white hover:bg-[#03045e]/90 shadow-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      <Check size={14} />
                      Approve Paper
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionPapersAdminPage;
