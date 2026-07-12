import React, { useState } from "react";
import MainCard from "../MainCard";
import { useStudent } from "../../context/StudentContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { submitAssignment } from "../../services/assignmentService";
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Upload,
  Download, 
  FileCheck,
  Timer,
  Link as LinkIcon,
  AlignLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  PENDING: { color: "text-blue-500", bg: "bg-blue-50", icon: Clock, label: "Active" },
  DUE_SOON: { color: "text-amber-500", bg: "bg-amber-50", icon: Timer, label: "Due Soon" },
  OVERDUE: { color: "text-rose-500", bg: "bg-rose-50", icon: AlertCircle, label: "Overdue" },
  SUBMITTED: { color: "text-emerald-500", bg: "bg-emerald-50", icon: FileCheck, label: "Submitted" },
  REVIEWED: { color: "text-indigo-500", bg: "bg-indigo-50", icon: CheckCircle2, label: "Reviewed" },
  GRADED: { color: "text-indigo-500", bg: "bg-indigo-50", icon: CheckCircle2, label: "Graded" },
  LATE: { color: "text-orange-500", bg: "bg-orange-50", icon: AlertCircle, label: "Late Submission" }
};

const AssignmentCard = ({ assignment, onStatusUpdate }) => {
  const { activeStudentId: studentId } = useStudent();
  const { isParent } = useAuth();
  const { t } = useLanguage();
  
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [submissionText, setSubmissionText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [fileError, setFileError] = useState("");
  const [comments, setComments] = useState("");

  const config = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitAssignment(studentId, assignment.id, {
        submissionText,
        attachment,
        comments
      });
      setIsSubmitting(false);
      setShowSubmitModal(false);
      setSubmissionText("");
      setAttachment(null);
      setComments("");
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setIsSubmitting(false);
    }
  };

  const isFormValid = submissionText.trim().length > 0 || attachment !== null;

  return (
    <>
      <MainCard 
        className="p-6 group relative overflow-hidden transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${config.bg} ${config.color}`}>
                    {assignment.type || t("assignments.active")}
                  </span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {assignment.totalMarks ?? assignment.maxMarks} {t("assignments.marks")} • {t(`subjects.${(assignment.subjectName || "").toLowerCase().replace(/\s+/g, "")}`, { fallback: assignment.subjectName })}
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#03045e] group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                  {assignment.title}
                </h3>
              </div>
              <div className={`p-2 rounded-xl shrink-0 ${config.bg} ${config.color} shadow-sm`}>
                <StatusIcon size={18} strokeWidth={2.5} />
              </div>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-500 font-bold leading-relaxed line-clamp-2 mb-4 flex-1">
              {assignment.description}
            </p>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-gray-600 transition-colors">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{assignment.dueDate}</span>
                </div>
                {assignment.attachment && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-150 rounded-xl w-full max-w-[200px] sm:max-w-[250px]">
                    <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <FileText size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-[#03045e] truncate block w-full">
                        {typeof assignment.attachment === "string" ? "Resource Link" : assignment.attachment.fileName}
                      </p>
                    </div>
                    <a 
                      href={typeof assignment.attachment === "string" ? assignment.attachment : assignment.attachment.data}
                      download={typeof assignment.attachment === "string" ? undefined : assignment.attachment.fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[#03045e] hover:bg-[#03045e] hover:text-white transition-colors shrink-0"
                    >
                      <Download size={10} />
                    </a>
                  </div>
                )}
              </div>
              
              {assignment.status === "SUBMITTED" ? (
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  <CheckCircle2 size={14} />
                  <span>{t("assignments.submissionReceived")}</span>
                </div>
              ) : assignment.status === "REVIEWED" || assignment.status === "GRADED" ? (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    <CheckCircle2 size={13} />
                    <span>{t("assignments.graded")}: {assignment.submissionDetails?.score ?? assignment.submissionDetails?.marksAwarded ?? assignment.submissionDetails?.marksObtained} / {assignment.totalMarks ?? assignment.maxMarks}</span>
                  </div>
                  {(assignment.submissionDetails?.feedback || assignment.submissionDetails?.remarks) && (
                    <span className="text-[9px] font-bold text-gray-500 italic max-w-xs text-right line-clamp-1">
                      "{assignment.submissionDetails.feedback || assignment.submissionDetails.remarks}"
                    </span>
                  )}
                </div>
              ) : isParent ? (
                <div className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                  <AlertCircle size={14} />
                  <span>{t("assignments.notSubmitted")}</span>
                </div>
              ) : (
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <Upload size={14} />
                  <span>{t("assignments.submitWork")}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </MainCard>

      {/* Submission Modal (Simulated Text / Link) */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 w-full w-[95vw] md:w-[90vw] lg:max-w-lg shadow-2xl relative overflow-hidden"
            >
              {/* Modal Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-2xl font-black text-[#03045e] mb-2">{t("assignments.submitAssignment")}</h3>
                <p className="text-sm text-gray-500 font-bold mb-6">
                  {t("assignments.uploadCompletedWork")} <span className="text-primary">{assignment.title}</span>.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {/* Text Submission */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("assignments.submissionNotes")}</span>
                      <textarea 
                        className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                        placeholder={t("assignments.typeResponse")}
                        rows={4}
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                      />
                    </div>

                    {/* File Attachment */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("assignments.uploadFile")}</span>
                      <input 
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            setFileError(t("assignments.fileSizeExceeds"));
                            e.target.value = "";
                            return;
                          }
                          setFileError("");
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setAttachment({
                              id: `ATT-${Date.now()}`,
                              fileName: file.name,
                              fileType: file.type,
                              fileSize: file.size,
                              data: event.target.result
                            });
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-3 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                      />
                      {attachment && (
                        <p className="text-xs text-emerald-600 font-bold ml-1"> {t("assignments.attached")} {attachment.fileName} ({(attachment.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      {fileError && (
                        <p className="text-xs text-rose-500 font-bold ml-1">
                          {fileError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("assignments.commentsForTeacher")}</span>
                      <textarea 
                        className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                        placeholder={t("assignments.addExtraNotes")}
                        rows={2}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
                    >{t("assignments.cancel")}</button>
                    <button 
                      type="submit"
                      disabled={isSubmitting || !isFormValid}
                      className={`flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                        isSubmitting || !isFormValid
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200" 
                          : "bg-[#03045e] text-white shadow-xl shadow-[#03045e]/20 hover:scale-[1.02]"
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>{t("assignments.submitAssignment")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssignmentCard;
