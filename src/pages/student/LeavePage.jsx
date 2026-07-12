import React, { useState, useEffect, useCallback } from "react";
import MainCard from "../../components/MainCard";
import { useStudent } from "../../context/StudentContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";
import { applyLeave, getLeavesByStudent } from "../../services/leaveService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Paperclip, 
  PlusCircle, 
  ChevronRight,
  UserCheck
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const LeavePage = () => {
  const { t } = useLanguage();
  const { activeStudentId, activeStudent } = useStudent();
  
  // Form State
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [hasMedicalNote, setHasMedicalNote] = useState(false);
  const [mockFile, setMockFile] = useState(null);
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Load leave history
  const loadLeaves = useCallback(async () => {
    if (!activeStudentId) return;
    setHistoryLoading(true);
    try {
      const data = await getLeavesByStudent(activeStudentId);
      // Sort by appliedAt desc
      const sorted = [...data].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
      setLeaves(sorted);
      if (sorted.length > 0 && !selectedLeave) {
        setSelectedLeave(sorted[0]);
      }
    } catch (err) {
      console.error("Failed to load leaves:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [activeStudentId]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  // Handle application submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      let attachmentUrl = null;
      if (mockFile && mockFile.file) {
        // Read file as base64
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(mockFile.file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });

        const uploadRes = await fetch('/api/upload-leave-proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: mockFile.name,
            fileData
          })
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error("Failed to upload attachment: " + uploadData.error);
        }
        attachmentUrl = uploadData.filePath;
      }

      await applyLeave({
        studentId: activeStudentId,
        classId: activeStudent?.classId,
        reason,
        fromDate,
        toDate,
        attachmentUrl
      });

      setSuccessMsg("Leave application submitted successfully! Your class teacher has been notified.");
      setFromDate("");
      setToDate("");
      setReason("");
      setHasMedicalNote(false);
      setMockFile(null);
      await loadLeaves();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError(err.message || "Something went wrong while submitting leave.");
    } finally {
      setLoading(false);
    }
  };

  const handleMockFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMockFile({
        file: e.target.files[0],
        name: e.target.files[0].name,
        size: (e.target.files[0].size / 1024).toFixed(1) + " KB"
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e - s;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days === 1 ? t("leave.oneDay", { fallback: "1 Day" }) : t("leave.daysCount", { count: days, fallback: `${days} Days` });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#03045e] text-white rounded-2xl shadow-md">
              <CalendarDays size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#03045e]">{t("leave.title", { fallback: "Leave Management" })}</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {t("leave.subtitle", { fallback: "Apply for Institutional Leave & Track Approval Status" })}
              </p>
            </div>
          </div>
        </div>
        <ChildScopeSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Apply Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <MainCard className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#caf0f8]/40 to-transparent rounded-bl-full pointer-events-none" />
            
            <h2 className="text-lg font-black text-[#03045e] mb-2 flex items-center gap-2">
              <PlusCircle size={20} className="text-[#0077b6]" />
              {t("leave.newApplication", { fallback: "New Leave Application" })}
            </h2>
            <p className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">
              {t("leave.routeInfo", { fallback: "All applications route to your assigned class teacher." })}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 font-bold"
                  >
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-600 font-bold"
                  >
                    <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">{t("leave.fromDate", { fallback: "From Date" })}</label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-[#00b4d8] focus:bg-white rounded-xl outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">{t("leave.toDate", { fallback: "To Date" })}</label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-[#00b4d8] focus:bg-white rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">{t("leave.reasonForLeave", { fallback: "Reason for Leave" })}</label>
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t("leave.reasonPlaceholder", { fallback: "Provide a specific and genuine explanation (e.g. retroactive sick leave, family emergency)..." })}
                  className="w-full px-3 py-2 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-[#00b4d8] focus:bg-white rounded-xl outline-none resize-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={hasMedicalNote}
                    onChange={(e) => setHasMedicalNote(e.target.checked)}
                    className="rounded text-[#00b4d8] focus:ring-[#00b4d8] w-4 h-4 border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-500">{t("leave.medicalCert", { fallback: "I have a Medical Certificate" })}</span>
                </label>

                {/* Mock Upload Section */}
                <div className="p-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    onChange={handleMockFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Paperclip size={18} className="text-gray-400 group-hover:text-[#00b4d8] transition-colors" />
                  <span className="text-[10px] font-extrabold text-gray-400 group-hover:text-gray-500 uppercase tracking-wider">
                    {mockFile ? mockFile.name : t("leave.attachDocs", { fallback: "Attach Supporting Documents" })}
                  </span>
                  {mockFile && (
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
                      {t("leave.mockUploaded", { fallback: "Mock Uploaded" })} ({mockFile.size})
                    </span>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-2.5 bg-gradient-to-r from-[#03045e] to-[#023e8a] hover:from-[#023e8a] hover:to-[#0077b6] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  t("leave.submit", { fallback: "Submit Application" })
                )}
              </motion.button>
            </form>
          </MainCard>
        </div>

        {/* Right: History & Visual Status Roster (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-6">
            {/* History List */}
            <MainCard className="p-6 h-[500px] flex flex-col">
              <h2 className="text-lg font-black text-[#03045e] mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[#0077b6]" />
                {t("leave.history", { fallback: "Application History" })}
              </h2>

              {historyLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : leaves.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <CalendarDays size={36} className="text-gray-300 mb-3" />
                  <p className="text-xs font-black text-[#03045e]">{t("leave.noApplications", { fallback: "No applications found" })}</p>
                  <p className="text-[10px] text-gray-400 font-bold max-w-xs mt-1">
                    {t("leave.noAppMsg", { fallback: "Apply using the form on the left to start your leave application process." })}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  {leaves.map((leave) => {
                    const isSelected = selectedLeave?.id === leave.id;
                    return (
                      <motion.button
                        key={leave.id}
                        onClick={() => setSelectedLeave(leave)}
                        whileHover={{ x: 3 }}
                        className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all ${
                          isSelected 
                            ? "bg-white border-[#00b4d8] shadow-md" 
                            : "bg-gray-50/50 border-gray-100/50 hover:bg-gray-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#03045e] truncate">{leave.reason}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">
                            {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                          </p>
                          <span className="text-[9px] font-extrabold text-gray-400/80 uppercase tracking-widest mt-1 block">
                            {calculateDays(leave.fromDate, leave.toDate)}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {leave.status === "PENDING" && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                              {t("common.pending", { fallback: "Pending" })}
                            </span>
                          )}
                          {leave.status === "APPROVED" && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 size={8} />
                              {t("common.approved", { fallback: "Approved" })}
                            </span>
                          )}
                          {leave.status === "REJECTED" && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                              <XCircle size={8} />
                              {t("common.rejected", { fallback: "Rejected" })}
                            </span>
                          )}
                          <ChevronRight size={14} className="text-gray-400" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </MainCard>

            {/* Selected Detail View */}
            <MainCard className="p-6 h-[500px] flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-white to-[#fbfefe]">
              <div>
                <h2 className="text-lg font-black text-[#03045e] mb-6 flex items-center gap-2">
                  <UserCheck size={20} className="text-[#0077b6]" />
                  {t("leave.applicationDetails", { fallback: "Application Details" })}
                </h2>

                {selectedLeave ? (
                  <div className="space-y-5 text-left">
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t("leave.leaveDuration", { fallback: "Leave Duration" })}</span>
                      <p className="text-sm font-black text-[#03045e] mt-0.5">
                        {formatDate(selectedLeave.fromDate)} - {formatDate(selectedLeave.toDate)}
                      </p>
                      <span className="px-2 py-0.5 inline-block rounded-full bg-sky-50 text-sky-600 border border-sky-100 text-[8px] font-black uppercase tracking-wider mt-1.5">
                        {calculateDays(selectedLeave.fromDate, selectedLeave.toDate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t("leave.reasonSubmitted", { fallback: "Reason Submitted" })}</span>
                      <p className="text-xs font-semibold text-[#03045e] mt-1 leading-relaxed bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                        {selectedLeave.reason}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t("leave.reviewStatus", { fallback: "Review Status" })}</span>
                        <div>
                          {selectedLeave.status === "PENDING" && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Clock size={10} />
                              {t("leave.underReview", { fallback: "Under Review" })}
                            </span>
                          )}
                          {selectedLeave.status === "APPROVED" && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              {t("common.approved", { fallback: "Approved" })}
                            </span>
                          )}
                          {selectedLeave.status === "REJECTED" && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <XCircle size={10} />
                              {t("common.rejected", { fallback: "Rejected" })}
                            </span>
                          )}
                        </div>
                      </div>

                      {selectedLeave.attachmentUrl && (
                        <div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t("leave.attachment", { fallback: "Attachment" })}</span>
                          <div className="mt-1">
                            <a 
                              href={selectedLeave.attachmentUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#caf0f8] text-[#03045e] hover:bg-[#00b4d8] hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                            >
                              <Paperclip size={12} /> {t("leave.viewDoc", { fallback: "View Document" })}
                            </a>
                          </div>
                        </div>
                      )}

                      {selectedLeave.status !== "PENDING" && (
                        <div className="space-y-2 bg-[#caf0f8]/20 p-4 rounded-3xl border border-[#caf0f8]/30">
                          <span className="text-[9px] font-black text-[#0077b6] uppercase tracking-wider">{t("leave.teacherFeedback", { fallback: "Teacher Feedback" })}</span>
                          <p className="text-xs font-bold text-[#03045e] leading-relaxed">
                            {selectedLeave.teacherComment || t("leave.noComment", { fallback: "No comment provided." })}
                          </p>
                          <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase mt-2 pt-2 border-t border-[#caf0f8]/40">
                            <span>{t("leave.reviewedAt", { fallback: "Reviewed At:" })}</span>
                            <span>{new Date(selectedLeave.reviewedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                    <Clock size={36} className="text-gray-200 mb-3 animate-pulse" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      {t("leave.selectApp", { fallback: "Select an application to view details" })}
                    </p>
                  </div>
                )}
              </div>

              {selectedLeave && (
                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center border-t border-gray-100 pt-3">
                  {t("leave.appliedAt", { fallback: "Applied At:" })} {new Date(selectedLeave.appliedAt).toLocaleString()}
                </div>
              )}
            </MainCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavePage;
