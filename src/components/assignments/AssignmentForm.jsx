import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, FilePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";
import { createAssignment, updateAssignment } from "../../services/assignmentService";
import { useLanguage } from "../../context/LanguageContext";

const AssignmentForm = ({ isOpen, onClose, teacherProfile, assignmentToEdit, onAssignmentSaved }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("20");
  const [attachment, setAttachment] = useState(null);

  const [classesList, setClassesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  
  const [validationError, setValidationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load teacher-specific classes and subjects
  useEffect(() => {
    const loadTeacherOptions = () => {
      if (!teacherProfile) return;

      const allClasses = getItem(STORAGE_KEYS.CLASSES, []);
      const allSubjects = getItem(STORAGE_KEYS.SUBJECTS, []);
      const allAssignments = getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS, []);

      // Relational assignments
      const assignments = allAssignments.filter(a => a.teacherId === teacherProfile.id);
      const uniqueClassIds = [...new Set(assignments.map(a => a.classId))];
      const allowedClasses = allClasses.filter(c => uniqueClassIds.includes(c.id));

      setClassesList(allowedClasses);

      if (allowedClasses.length > 0) {
        const initialClassId = allowedClasses[0].id;
        setClassId(initialClassId);

        // Filter allowed subjects for this initial class
        const classAssignments = assignments.filter(a => a.classId === initialClassId);
        const assignedSubjectIds = classAssignments.map(a => a.subjectId);
        const allowedSubjects = allSubjects.filter(s => assignedSubjectIds.includes(s.id));

        setSubjectsList(allowedSubjects);
        if (allowedSubjects.length > 0) {
          setSubjectId(allowedSubjects[0].id);
        }
      }
    };

    loadTeacherOptions();
  }, [teacherProfile]);

  const handleClassChange = (selectedClassId) => {
    setClassId(selectedClassId);
    if (!teacherProfile) return;
    try {
      const allSubjects = getItem(STORAGE_KEYS.SUBJECTS, []);
      const allAssignments = getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS, []);
      const assignments = allAssignments.filter(a => a.teacherId === teacherProfile.id);
      
      const classAssignments = assignments.filter(a => a.classId === selectedClassId);
      const assignedSubjectIds = classAssignments.map(a => a.subjectId);
      const allowedSubjects = allSubjects.filter(s => assignedSubjectIds.includes(s.id));

      setSubjectsList(allowedSubjects);
      if (allowedSubjects.length > 0) {
        setSubjectId(allowedSubjects[0].id);
      } else {
        setSubjectId("");
      }
    } catch (err) {
      console.error("Failed to update subjects for class:", err);
    }
  };

  // Load edit data
  useEffect(() => {
    if (assignmentToEdit) {
      setTitle(assignmentToEdit.title || "");
      setDescription(assignmentToEdit.description || "");
      setClassId(assignmentToEdit.classId || "");
      setSubjectId(assignmentToEdit.subjectId || "");
      setDueDate(assignmentToEdit.dueDate || "");
      setTotalMarks(String(assignmentToEdit.totalMarks || 20));
      setAttachment(assignmentToEdit.attachment || null);
      setValidationError("");
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setTotalMarks("20");
      setAttachment(null);
      setValidationError("");
    }
  }, [assignmentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !classId || !subjectId || !dueDate || !totalMarks) {
      setValidationError(t("assignments.fillRequired", { fallback: "Please fill all required fields (Title, Class, Subject, Due Date, Marks)." }));
      return;
    }

    if (!description.trim() && !attachment) {
      setValidationError(t("assignments.provideDescOrFile", { fallback: "Provide an assignment description or attach a file." }));
      return;
    }

    if (Number(totalMarks) <= 0) {
      setValidationError(t("assignments.positiveMarks", { fallback: "Total marks must be a positive number." }));
      return;
    }

    setIsSaving(true);
    setValidationError("");

    try {
      const assignmentData = {
        title,
        description,
        classId,
        subjectId,
        dueDate,
        totalMarks: Number(totalMarks),
        attachment: attachment || null,
        teacherId: teacherProfile.id
      };

      if (assignmentToEdit) {
        await updateAssignment(assignmentToEdit.id, assignmentData);
      } else {
        await createAssignment(assignmentData);
      }

      setIsSaving(false);
      onAssignmentSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setValidationError(t("assignments.saveError", { fallback: "An error occurred while saving. Please try again." }));
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2.5rem] w-full w-[95vw] md:w-[90vw] lg:max-w-2xl shadow-2xl relative overflow-hidden my-8"
        >
          {/* Header Panel */}
          <div className="p-6 bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <FilePlus size={18} />
              </div>
              <div>
                <h3 className="text-xl font-black leading-tight">
                  {assignmentToEdit ? t("assignments.editAssignment", { fallback: "Edit Assignment" }) : t("assignments.createAssignment", { fallback: "Create New Assignment" })}
                </h3>
                <p className="text-[10px] text-blue-100 font-bold mt-0.5">
                  {t("assignments.createDesc", { fallback: "Set academic criteria and publish to class stream" })}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignment Title */}
              <div className="md:col-span-2 space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("assignments.assignmentTitle", { fallback: "Assignment Title" })}</span>
                <input 
                  type="text"
                  className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                  placeholder={t("assignments.titlePlaceholder", { fallback: "e.g., Chapter 3 Forces Numerical Sheet" })}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("assignments.subject", { fallback: "Subject" })}</span>
                <select
                  className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  {subjectsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              {/* Class Dropdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("assignments.targetClass", { fallback: "Target Class" })}</span>
                <select
                  className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                  value={classId}
                  onChange={(e) => handleClassChange(e.target.value)}
                >
                  {classesList.map(c => (
                    <option key={c.id} value={c.id}>{c.displayName || c.name}</option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("assignments.dueDate", { fallback: "Due Date" })}</span>
                <input 
                  type="date"
                  className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {/* Total Marks */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("assignments.maxMarks", { fallback: "Max Marks" })}</span>
                <input 
                  type="number"
                  className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                  placeholder="20"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                />
              </div>

              {/* Attachment */}
              <div className="md:col-span-2 space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("assignments.attachmentMax", { fallback: "Attachment (Max 10MB)" })}</span>
                <input 
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                      setValidationError(t("assignments.fileTooLarge", { fallback: "File size exceeds 10MB limit." }));
                      e.target.value = "";
                      return;
                    }
                    setValidationError("");
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
                  className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-3 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                />
                {attachment && attachment.fileName && (
                  <p className="text-xs text-emerald-600 font-bold ml-1">
                    {t("assignments.selectedFile", { fallback: "Selected File:" })} {attachment.fileName} ({(attachment.fileSize / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {attachment && typeof attachment === "string" && (
                  <p className="text-xs text-blue-600 font-bold ml-1">
                    {t("assignments.existingLink", { fallback: "Existing Link:" })} {attachment}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("assignments.descInstructions", { fallback: "Description / Instructions" })}</span>
                <textarea 
                  className="w-full rounded-2xl border border-gray-150 bg-gray-50 p-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#03045e]"
                  placeholder={t("assignments.descPlaceholder", { fallback: "State guidelines, chapters covered, and assignment steps..." })}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {validationError && (
              <p className="text-xs text-rose-500 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100 text-center flex items-center justify-center gap-1">
                <AlertCircle size={14} />
                {validationError}
              </p>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all border border-gray-150"
              >
                {t("common.cancel", { fallback: "Cancel" })}
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
                    <Save size={15} />
                    <span>{t("assignments.publishAssignment", { fallback: "Publish Assignment" })}</span>
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

export default AssignmentForm;
