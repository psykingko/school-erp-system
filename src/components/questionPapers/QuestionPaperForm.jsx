import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Upload, Save, Send, FileCheck } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

const CLASSES = ["10", "11"];
const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", 
  "English", "Hindi", "Science", "Social Studies", 
  "History", "Geography", "Accountancy", "Business Studies", 
  "Economics", "Computer Science", "Physical Education"
];

const QuestionPaperForm = ({ isOpen, onClose, paperToEdit, onSaved, teacherProfile }) => {
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    className: "",
    section: "",
    subjectId: "",
    subjectName: "",
    examType: "",
    maxMarks: "",
    duration: "",
    content: "",
    uploadedFile: null,
  });

  const [inputType, setInputType] = useState("text"); // "text" or "file"
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (paperToEdit) {
        setFormData({
          title: paperToEdit.title || "",
          classId: paperToEdit.classId || "",
          className: paperToEdit.className || "",
          section: paperToEdit.section || "",
          subjectId: paperToEdit.subjectId || "",
          subjectName: paperToEdit.subjectName || "",
          examType: paperToEdit.examType || "",
          maxMarks: paperToEdit.maxMarks || "",
          duration: paperToEdit.duration || "",
          content: paperToEdit.content || "",
          uploadedFile: paperToEdit.uploadedFile || null,
        });
        setInputType(paperToEdit.uploadedFile ? "file" : "text");
      } else {
        setFormData({
          title: "",
          classId: "",
          className: "",
          section: "",
          subjectId: "",
          subjectName: "",
          examType: "",
          maxMarks: "",
          duration: "",
          content: "",
          uploadedFile: null,
        });
        setInputType("text");
      }
      setErrors({});
    }
  }, [isOpen, paperToEdit]);

  if (!isOpen) return null;

  const isReadOnly = paperToEdit?.status === 'Approved';

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.className.trim()) newErrors.className = "Class is required";
    if (!formData.section.trim()) newErrors.section = "Section is required";
    if (!formData.subjectName.trim()) newErrors.subjectName = "Subject is required";
    if (!formData.examType.trim()) newErrors.examType = "Exam Type is required";
    if (!formData.content.trim() && !formData.uploadedFile) {
      newErrors.content = "Either Question Paper Content or an Uploaded File is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (status) => {
    if (!validate()) return;

    const payload = {
      ...paperToEdit,
      ...formData,
      teacherId: teacherProfile?.id,
      teacherName: teacherProfile?.name || "Teacher",
      status,
    };
    onSaved(payload);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        uploadedFile: {
          fileName: file.name,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        }
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#03045e]/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-[#03045e]">
              {isReadOnly ? "View Question Paper" : paperToEdit ? "Edit Question Paper" : "Create Question Paper"}
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
              Section 1: Basic Information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-200/50 text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question Paper Title *</label>
              <input
                type="text"
                placeholder="e.g. Mid Term Mathematics"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isReadOnly}
                className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-rose-300 bg-rose-50' : 'border-gray-200'} focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/10 outline-none transition-all text-sm font-bold text-[#03045e] disabled:opacity-60`}
              />
              {errors.title && <p className="text-[10px] text-rose-500 font-bold">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class *</label>
              <select
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value, classId: `class-${e.target.value.toLowerCase()}` })}
                disabled={isReadOnly}
                className={`w-full px-4 py-3 rounded-xl border ${errors.className ? 'border-rose-300' : 'border-gray-200'} focus:border-[#00b4d8] outline-none text-sm font-bold text-[#03045e] bg-white disabled:opacity-60`}
              >
                <option value="">Select Class</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Section *</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                disabled={isReadOnly}
                className={`w-full px-4 py-3 rounded-xl border ${errors.section ? 'border-rose-300' : 'border-gray-200'} focus:border-[#00b4d8] outline-none text-sm font-bold text-[#03045e] bg-white disabled:opacity-60`}
              >
                <option value="">Select Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject *</label>
              <select
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value, subjectId: `sub-${e.target.value.toLowerCase().replace(" ", "-").substring(0,6)}` })}
                disabled={isReadOnly}
                className={`w-full px-4 py-3 rounded-xl border ${errors.subjectName ? 'border-rose-300' : 'border-gray-200'} focus:border-[#00b4d8] outline-none text-sm font-bold text-[#03045e] bg-white disabled:opacity-60`}
              >
                <option value="">Select Subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Exam Type *</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                disabled={isReadOnly}
                className={`w-full px-4 py-3 rounded-xl border ${errors.examType ? 'border-rose-300' : 'border-gray-200'} focus:border-[#00b4d8] outline-none text-sm font-bold text-[#03045e] bg-white disabled:opacity-60`}
              >
                <option value="">Select Type</option>
                <option value="Unit Test">Unit Test</option>
                <option value="Monthly Test">Monthly Test</option>
                <option value="Half Yearly">Half Yearly</option>
                <option value="Pre Board">Pre Board</option>
                <option value="Final Exam">Final Exam</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Maximum Marks</label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-sm font-bold text-[#03045e] disabled:opacity-60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</label>
              <input
                type="text"
                placeholder="e.g. 3 Hours"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-sm font-bold text-[#03045e] disabled:opacity-60"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Content Selection */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-black text-[#03045e] uppercase tracking-widest">Section 2: Question Paper Content</h3>
              
              <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setInputType("text")}
                  disabled={isReadOnly}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    inputType === "text" ? "bg-white text-[#03045e] shadow-sm" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Type Content
                </button>
                <button
                  type="button"
                  onClick={() => setInputType("file")}
                  disabled={isReadOnly}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    inputType === "file" ? "bg-white text-[#03045e] shadow-sm" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {errors.content && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold">{errors.content}</div>}
            
            {inputType === "text" ? (
              <div className="space-y-2">
                <RichTextEditor 
                  value={formData.content} 
                  onChange={(val) => setFormData({ ...formData, content: val, uploadedFile: null })} 
                  disabled={isReadOnly} 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 font-bold"><span className="font-black text-[#03045e]">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">JPG, PNG or PDF</p>
                    </div>
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => {
                      handleFileUpload(e);
                      setFormData(prev => ({ ...prev, content: "" }));
                    }} disabled={isReadOnly} />
                  </label>
                </div>
                {formData.uploadedFile && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck size={20} className="text-emerald-500" />
                      <div>
                        <p className="text-sm font-black text-[#03045e]">{formData.uploadedFile.fileName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ready to submit</p>
                      </div>
                    </div>
                    {!isReadOnly && <button onClick={() => setFormData({...formData, uploadedFile: null})} className="text-rose-500 hover:text-rose-700 text-[10px] font-black uppercase tracking-widest">Remove</button>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-wrap justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-200/50 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          {!isReadOnly && (
            <>
              <button
                onClick={() => handleSave("Draft")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#00b4d8] text-[#00b4d8] hover:bg-[#00b4d8]/10 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                <Save size={14} />
                Save Draft
              </button>
              <button
                onClick={() => handleSave("Submitted")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#03045e] text-white hover:bg-[#03045e]/90 shadow-lg text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                <Send size={14} />
                Submit For Approval
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuestionPaperForm;
