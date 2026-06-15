import React, { useState, useEffect } from "react";
import { X, CheckCircle, ExternalLink, FileText, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gradeSubmission } from "../../services/assignmentService";

const GradeModal = ({ isOpen, onClose, submission, totalMarks, assignmentId, onGradeSaved }) => {
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (submission) {
      const defaultMarks = submission.marksAwarded ?? submission.marksObtained ?? submission.score;
      setMarks(defaultMarks !== null && defaultMarks !== undefined ? String(defaultMarks) : "");
      setFeedback(submission.feedback || submission.remarks || "");
      setValidationError("");
    }
  }, [submission]);

  if (!isOpen || !submission) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    const numericMarks = Number(marks);

    if (isNaN(numericMarks) || marks.trim() === "") {
      setValidationError("Please enter valid numeric marks.");
      return;
    }

    if (numericMarks < 0 || numericMarks > totalMarks) {
      setValidationError(`Marks must be between 0 and ${totalMarks}.`);
      return;
    }

    setIsSaving(true);
    setValidationError("");

    try {
      await gradeSubmission(submission.id || submission.submissionId, {
        assignmentId,
        studentId: submission.studentId,
        marksAwarded: numericMarks,
        feedback: feedback
      });
      setIsSaving(false);
      onGradeSaved();
      onClose();
    } catch (err) {
      console.error("Grading failed:", err);
      setValidationError("Failed to submit grades. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl relative overflow-hidden"
        >
          {/* Header Panel */}
          <div className="p-6 bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white flex justify-between items-start">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                Grading Center
              </span>
              <h3 className="text-xl font-black mt-1 leading-tight">{submission.studentName}</h3>
              <p className="text-[10px] text-blue-100 font-bold mt-0.5">Adm No: {submission.admissionNo}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            {/* Student's Submission Content */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={12} className="text-[#0077b6]" />
                Submitted Response
              </span>
              <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl min-h-[80px] flex flex-col justify-center gap-3">
                {submission.status === "PENDING" || submission.status === "OVERDUE" ? (
                  <span className="text-xs text-rose-500 font-bold italic">No response submitted yet ( Roster Entry Grading Mode ).</span>
                ) : (
                  <>
                    {(submission.submissionText || (!submission.submissionText && !submission.attachment && submission.content)) && (
                      <p className="text-xs text-gray-600 font-bold whitespace-pre-wrap leading-relaxed">
                        {submission.submissionText || submission.content}
                      </p>
                    )}
                    {submission.attachment && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500 font-bold block mb-1">Attached File:</span>
                        {typeof submission.attachment === "string" ? (
                          <a 
                            href={submission.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 font-black hover:underline flex items-center gap-1 w-fit bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100/60"
                          >
                            <ExternalLink size={12} />
                            Open Student Link
                          </a>
                        ) : (
                          <a 
                            href={submission.attachment.data}
                            download={submission.attachment.fileName}
                            className="text-xs text-blue-600 font-black hover:underline flex items-center gap-1 w-fit bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100/60"
                          >
                            <FileText size={12} />
                            Download {submission.attachment.fileName}
                          </a>
                        )}
                      </div>
                    )}
                    {!submission.submissionText && !submission.attachment && !submission.content && (
                      <span className="text-xs text-gray-500 font-bold italic">Empty submission.</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Marks & Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Award Marks */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-500" />
                  Score (Max {totalMarks})
                </span>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.5"
                    className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-4 text-center text-lg font-black text-[#03045e] focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="--"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                  />
                </div>
              </div>

              {/* Feedback Notes */}
              <div className="md:col-span-2 space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare size={12} className="text-indigo-500" />
                  Feedback / Comments
                </span>
                <textarea 
                  className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-3.5 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                  placeholder="Provide qualitative guidance..."
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </div>

            {validationError && (
              <p className="text-xs text-rose-500 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100 text-center animate-fadeIn">
                {validationError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all border border-gray-150"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                  isSaving 
                    ? "bg-gray-150 text-gray-300 cursor-not-allowed border border-gray-200" 
                    : "bg-[#03045e] text-white shadow-xl shadow-[#03045e]/20 hover:scale-[1.02]"
                }`}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={15} />
                    <span>Publish Grade</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GradeModal;
