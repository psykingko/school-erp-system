import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  User,
  GraduationCap,
  Users,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Shield
} from "lucide-react";
import identityProvisioningService from "../../../services/identityProvisioningService";
import { GENDER_OPTIONS, DEFAULT_GENDER } from "../../../constants/genderConstants";
import { isSeniorSecondary } from "../../../shared/utils/classIdentity";

const STEPS = [
  { id: 0, title: "Personal", icon: User },
  { id: 1, title: "Academic", icon: GraduationCap },
  { id: 2, title: "Parent", icon: Users },
  { id: 3, title: "Credentials", icon: Key },
  { id: 4, title: "Review", icon: CheckCircle2 }
];

const INITIAL_STATE = {
  studentName: "",
  gender: DEFAULT_GENDER,
  dob: "",
  admissionNo: "",
  mobile: "",
  email: "",
  address: "",
  classLevel: "",
  section: "",
  stream: "",
  fatherName: "",
  fatherMobile: "",
  fatherOccupation: "",
  motherName: "",
  motherMobile: "",
  motherOccupation: "",
  primaryContact: "Father",
  parentEmail: ""
};

// Based on StudentsPage filtering options
const CLASS_OPTIONS = [
  "Nursery", "LKG", "UKG", 
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];

const SECTION_OPTIONS = ["A", "B", "C", "D"];

const STREAM_OPTIONS = [
  "Science Non-Medical",
  "Science Medical",
  "Commerce",
  "Humanities"
];

const RELATIONSHIP_OPTIONS = ["Father", "Mother", "Guardian"];

const StudentOnboardingEngine = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [previewCredentials, setPreviewCredentials] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Load Draft
  useEffect(() => {
    const draft = localStorage.getItem("student_onboarding_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.data) setFormData(parsed.data);
        if (parsed.step !== undefined) setCurrentStep(parsed.step);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // Save Draft
  useEffect(() => {
    // Alert if they try to close with unsaved valid data
    if (formData.studentName || formData.classLevel || formData.fatherName) {
      localStorage.setItem("student_onboarding_draft", JSON.stringify({
        data: formData,
        step: currentStep
      }));
    }
  }, [formData, currentStep]);

  const generatePreviewCredentials = async () => {
    setIsLoading(true);
    try {
      // Mock employee objects for identity provisioning service
      const baseStudentUsername = formData.studentName.toLowerCase().replace(/\s/g, ".") || "student";
      
      const parentUsername = await identityProvisioningService.generateUsername({
        employeeName: formData.parentName,
        employeeId: `PAR${formData.admissionNo || Date.now()}`
      });
      const loginParentName = formData.primaryContact === "Father" ? formData.fatherName : formData.motherName;
      const baseParentUsername = loginParentName.toLowerCase().replace(/\s/g, ".") || "parent";
      
      const newCredentials = {
        student: {
          username: `${baseStudentUsername}${formData.admissionNo.slice(-3)}`,
          password: `Edu@${new Date().getFullYear()}`,
        },
        parent: {
          username: `${baseParentUsername}${formData.admissionNo.slice(-3)}`,
          password: `Edu@${new Date().getFullYear()}`,
        }
      };
      setPreviewCredentials(newCredentials);
    } catch (err) {
      setError("Failed to generate preview credentials");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    setError("");

    // Step 0 Validation: Personal
    if (currentStep === 0) {
      if (!formData.studentName.trim() || !formData.admissionNo.trim()) {
        setError("Student Name and Admission Number are required.");
        return;
      }
    }

    // Step 1 Validation: Academic
    if (currentStep === 1) {
      if (!formData.classLevel || !formData.section) {
        setError("Class and Section are required.");
        return;
      }
      if (isSeniorSecondary(formData.classLevel) && !formData.stream) {
        setError("Stream is required for Senior Secondary classes.");
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.fatherName.trim() || !formData.fatherMobile.trim()) {
        alert("Please fill all required parent fields (Father Name and Mobile).");
        return;
      }
      // If progressing to Credentials (step 3), generate previews
      await generatePreviewCredentials();
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleFinish = () => {
    // Phase 1 constraint: Pass the normalized payload, do not persist
    const normalizedPayload = {
      student: {
        name: formData.studentName,
        gender: formData.gender,
        dob: formData.dob,
        admissionNo: formData.admissionNo,
        phoneNumber: formData.mobile,
        email: formData.email,
        address: formData.address,
        classLevel: formData.classLevel,
        section: formData.section,
        stream: formData.stream,
        fatherName: formData.fatherName,
        fatherMobile: formData.fatherMobile,
        fatherOccupation: formData.fatherOccupation,
        motherName: formData.motherName,
        motherMobile: formData.motherMobile,
        motherOccupation: formData.motherOccupation,
      },
      parent: {
        name: formData.primaryContact === "Father" ? formData.fatherName : formData.motherName,
        relationship: formData.primaryContact,
        phoneNumber: formData.primaryContact === "Father" ? formData.fatherMobile : formData.motherMobile,
        email: formData.parentEmail,
      },
      credentials: previewCredentials
    };

    localStorage.removeItem("student_onboarding_draft");
    if (onComplete) onComplete(normalizedPayload);
    else onClose();
  };

  const handleClose = () => {
    if (currentStep === 0 && !formData.studentName) {
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  };

  const handleClassChange = (e) => {
    const val = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, classLevel: val };
      if (!isSeniorSecondary(val)) {
        updated.stream = ""; // Clear stream if not senior secondary
      }
      return updated;
    });
  };

  const renderStep0 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-[#03045e]">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Full Name *</label>
          <input
            type="text"
            value={formData.studentName}
            onChange={e => setFormData({...formData, studentName: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Admission Number *</label>
          <input
            type="text"
            value={formData.admissionNo}
            onChange={e => setFormData({...formData, admissionNo: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="ADM-2026-001"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Mobile</label>
          <input
            type="text"
            value={formData.mobile}
            onChange={e => setFormData({...formData, mobile: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none bg-white"
          >
            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Date of Birth</label>
          <input
            type="date"
            value={formData.dob}
            onChange={e => setFormData({...formData, dob: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="123 Student Ave, City"
          />
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-[#03045e]">Academic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Class Level *</label>
          <select
            value={formData.classLevel}
            onChange={handleClassChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none bg-white"
          >
            <option value="">-- Select Class --</option>
            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c === "11" || c === "12" ? `Class ${c}` : c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Section *</label>
          <select
            value={formData.section}
            onChange={e => setFormData({...formData, section: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none bg-white"
          >
            <option value="">-- Select Section --</option>
            {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
        
        {isSeniorSecondary(formData.classLevel) && (
          <div className="col-span-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Stream *</label>
            <select
              value={formData.stream}
              onChange={e => setFormData({...formData, stream: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none bg-white"
            >
              <option value="">-- Select Stream --</option>
              {STREAM_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-[#03045e]">Parent Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Father Name *</label>
          <input
            type="text"
            value={formData.fatherName}
            onChange={e => setFormData({...formData, fatherName: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="John Doe Sr."
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Father Mobile *</label>
          <input
            type="text"
            value={formData.fatherMobile}
            onChange={e => setFormData({...formData, fatherMobile: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="+91 98765 12345"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Father Occupation</label>
          <input
            type="text"
            value={formData.fatherOccupation}
            onChange={e => setFormData({...formData, fatherOccupation: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="Business"
          />
        </div>

        <div className="col-span-2 border-t border-gray-100 my-2"></div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Mother Name</label>
          <input
            type="text"
            value={formData.motherName}
            onChange={e => setFormData({...formData, motherName: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Mother Mobile</label>
          <input
            type="text"
            value={formData.motherMobile}
            onChange={e => setFormData({...formData, motherMobile: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="+91 98765 54321"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Mother Occupation</label>
          <input
            type="text"
            value={formData.motherOccupation}
            onChange={e => setFormData({...formData, motherOccupation: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="Homemaker"
          />
        </div>

        <div className="col-span-2 border-t border-gray-100 my-2"></div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Primary Contact (Receives Login)</label>
          <select
            value={formData.primaryContact}
            onChange={e => setFormData({...formData, primaryContact: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none bg-white"
          >
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Parent Email (Login ID)</label>
          <input
            type="email"
            value={formData.parentEmail}
            onChange={e => setFormData({...formData, parentEmail: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="parent@example.com"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-[#03045e]">Credentials Preview</h3>
      <p className="text-sm text-gray-500">
        The system has automatically generated draft portal credentials for the student and parent.
        These will only be finalized upon submission in the next phase.
      </p>
      
      {previewCredentials ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#03045e] p-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <GraduationCap size={14} className="text-[#00b4d8]" /> Student Portal
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Username</span>
                <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                  <span className="text-sm font-mono font-bold text-[#03045e]">{previewCredentials.student.username}</span>
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Temp Password</span>
                <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                  <span className="text-sm font-mono font-bold text-[#03045e]">{previewCredentials.student.password}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#03045e] p-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users size={14} className="text-[#00b4d8]" /> Parent Portal
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Username</span>
                <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                  <span className="text-sm font-mono font-bold text-[#03045e]">{previewCredentials.parent.username}</span>
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Temp Password</span>
                <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                  <span className="text-sm font-mono font-bold text-[#03045e]">{previewCredentials.parent.password}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold">
          Credentials are being generated...
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-[#03045e]">Review & Confirm</h3>
      
      <div className="bg-gradient-to-br from-[#03045e] to-[#0077b6] p-6 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Admission Number</p>
          <h2 className="text-3xl font-black">{formData.admissionNo}</h2>
        </div>
        <GraduationCap size={48} className="text-white/20" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Student Details</p>
          <p className="text-sm font-bold text-[#03045e]">{formData.studentName}</p>
          <p className="text-xs text-gray-500">{formData.gender} • {formData.dob || "No DOB"}</p>
          <p className="text-xs text-gray-500">{formData.mobile || "No Mobile"}</p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Academic Assignment</p>
          <p className="text-sm font-bold text-[#03045e]">Class {formData.classLevel}-{formData.section}</p>
          {isSeniorSecondary(formData.classLevel) && (
            <p className="text-xs text-gray-500">{formData.stream}</p>
          )}
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 col-span-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Parent Details</p>
          <p className="text-sm font-bold text-[#03045e]">{formData.fatherName || "No Father Listed"} (Father)</p>
          <p className="text-sm font-bold text-[#03045e]">{formData.motherName || "No Mother Listed"} (Mother)</p>
          <p className="text-xs text-gray-500 mt-1">Primary Login: {formData.primaryContact}</p>
        </div>
      </div>
      
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between mt-4">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Generated Credentials</span>
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700">
          Ready for Dispatch
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#03045e]/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-black text-[#03045e]">Student Onboarding Engine</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}</p>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 shrink-0">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-sm text-rose-600 font-bold">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 ? renderStep0() :
               currentStep === 1 ? renderStep1() :
               currentStep === 2 ? renderStep2() :
               currentStep === 3 ? renderStep3() :
               renderStep4()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              currentStep === 0 ? "opacity-0 pointer-events-none" : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>
          
          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleFinish}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black transition-all shadow-lg shadow-emerald-500/20"
            >
              Finish <CheckCircle2 size={16} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white text-sm font-black transition-all shadow-lg shadow-[#0077b6]/20"
            >
              {isLoading ? "Generating..." : "Next"} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowExitConfirm(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-black text-[#03045e] mb-2">Discard Onboarding?</h3>
              <p className="text-sm text-gray-500 mb-6">Your progress is saved as a draft and can be resumed later. Are you sure you want to close?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Yes, Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentOnboardingEngine;
