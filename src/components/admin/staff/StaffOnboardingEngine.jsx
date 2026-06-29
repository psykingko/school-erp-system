import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Briefcase,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Wrench,
  Building2,
  Image as ImageIcon
} from "lucide-react";
import employeeService from "../../../services/employeeService";
import departmentService from "../../../services/departmentService";
import identityProvisioningService from "../../../services/identityProvisioningService";
import { GENDER_OPTIONS, DEFAULT_GENDER } from "../../../constants/genderConstants";

const STEPS = [
  { id: 0, title: "Category", icon: Briefcase },
  { id: 1, title: "Personal", icon: User },
  { id: 2, title: "Employment", icon: Building2 },
  { id: 3, title: "Portal", icon: Shield },
  { id: 4, title: "ID & Review", icon: CheckCircle2 }
];

const INITIAL_STATE = {
  category: "", // "Academic", "Administrative", "Operational"
  employeeName: "",
  email: "",
  phone: "",
  gender: DEFAULT_GENDER,
  dob: "",
  address: "",
  emergencyContact: "",
  joiningDate: new Date().toISOString().split("T")[0],
  designation: "",
  departmentId: "",
  employmentType: "Full-time",
  status: "active",
  portalAccess: false,
  employeeId: "", // generated at step 4
};

const StaffOnboardingEngine = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [departments, setDepartments] = useState([]);
  const [provisionedCredentials, setProvisionedCredentials] = useState(null);
  const [identityError, setIdentityError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Load Draft or Init
  useEffect(() => {
    const draft = localStorage.getItem("staff_onboarding_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.data) setFormData(parsed.data);
        if (parsed.step !== undefined) setCurrentStep(parsed.step);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    
    // Fetch deps
    departmentService.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  // Save Draft
  useEffect(() => {
    if (!isSuccess && formData.category) { // Only save if we at least started
      localStorage.setItem("staff_onboarding_draft", JSON.stringify({
        data: formData,
        step: currentStep
      }));
    }
  }, [formData, currentStep, isSuccess]);

  const handleNext = async () => {
    setError("");

    // Step 0 Validation
    if (currentStep === 0 && !formData.category) {
      setError("Please select a staff category.");
      return;
    }

    // Step 1 Validation
    if (currentStep === 1) {
      if (!formData.employeeName.trim() || !formData.email.trim() || !formData.joiningDate) {
        setError("Name, Email, and Joining Date are required.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    // Step 2 Validation
    if (currentStep === 2) {
      if (!formData.designation.trim() || !formData.departmentId) {
        setError("Designation and Department are required.");
        return;
      }
    }

    // Entering Step 4 (ID & Review) - perform Duplicate check & ID Gen
    if (currentStep === 3) {
      setIsLoading(true);
      try {
        const existing = await employeeService.getEmployees();
        
        // Duplicate Check
        const emailDupe = existing.find(e => e.email.toLowerCase() === formData.email.toLowerCase());
        if (emailDupe) throw new Error(`Email ${formData.email} is already in use by another employee.`);
        
        if (formData.phone) {
          const phoneDupe = existing.find(e => e.phone === formData.phone);
          if (phoneDupe) throw new Error(`Phone number ${formData.phone} is already in use.`);
        }

        // Safe ID Generation
        let maxId = 0;
        existing.forEach(emp => {
          if (emp.employeeId && emp.employeeId.startsWith("EMP-")) {
            const num = parseInt(emp.employeeId.replace("EMP-", ""), 10);
            if (!isNaN(num) && num > maxId) maxId = num;
          }
        });
        const newId = `EMP-${String(maxId + 1).padStart(3, "0")}`;
        
        setFormData(prev => ({ ...prev, employeeId: newId }));
        setCurrentStep(prev => prev + 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    setIdentityError("");
    setProvisionedCredentials(null);

    try {
      // 1. Prepare Employee Payload
      const empPayload = { 
        ...formData, 
        identityStatus: formData.portalAccess ? "ELIGIBLE" : "NOT_ELIGIBLE" 
      };

      // 2. Create Employee Record
      const newEmployee = await employeeService.createEmployee(empPayload);

      // 2.5 Generate TeacherProfile if applicable (Phase 12.5)
      if (
        empPayload.category === "Academic" && 
        empPayload.designation && 
        empPayload.designation.toLowerCase().includes("teacher")
      ) {
        const { addTeacher } = await import("../../../services/teacherService");
        await addTeacher({
          employeeId: newEmployee.employeeId,
          // Academic defaults
          qualification: "Not Specified",
          experience: "0 Years",
          subjectSpecialization: "General"
        });
      }

      // 2.6 Generate OperationalProfile if applicable (Phase 12.7)
      if (empPayload.category === "Operational") {
        await employeeService.createOperationalProfile({
          employeeId: newEmployee.employeeId,
          specialization: empPayload.designation,
          licenseNumber: null,
          licenseExpiry: null,
          employmentShift: null,
        });
      }

      // 3. Provision Identity (if eligible)
      if (empPayload.portalAccess) {
        try {
          const result = await identityProvisioningService.provisionIdentity(newEmployee);
          setProvisionedCredentials(result.credentials);
        } catch (idErr) {
          console.error(idErr);
          setIdentityError("Employee created successfully, but Identity Provisioning failed. Please check logs and try again manually later.");
        }
      }

      localStorage.removeItem("staff_onboarding_draft");
      setIsSuccess(true);
      if (onComplete) onComplete();
    } catch (err) {
      setError("Failed to create employee. " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (cat) => {
    setFormData(prev => ({
      ...prev,
      category: cat,
      // Smart Default for Portal Access
      portalAccess: cat === "Operational" ? false : true
    }));
  };

  const handleClose = () => {
    if (isSuccess || currentStep === 0) {
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  };

  const renderStep0 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-[#03045e]">Select Staff Category</h3>
      <p className="text-sm text-gray-500">This determines the onboarding path and default permissions.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          { id: "Academic", icon: GraduationCap, desc: "Teachers, Coordinators, Librarians" },
          { id: "Administrative", icon: Building2, desc: "HR, Finance, Principals" },
          { id: "Operational", icon: Wrench, desc: "Drivers, Guards, Maintenance" }
        ].map(cat => (
          <div
            key={cat.id}
            onClick={() => handleCategorySelect(cat.id)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              formData.category === cat.id 
                ? "border-[#0077b6] bg-[#caf0f8]/30 shadow-md" 
                : "border-gray-100 hover:border-[#90e0ef] hover:bg-gray-50"
            }`}
          >
            <cat.icon className={`w-10 h-10 mb-4 ${formData.category === cat.id ? "text-[#0077b6]" : "text-gray-400"}`} />
            <h4 className="text-lg font-bold text-[#03045e]">{cat.id}</h4>
            <p className="text-xs text-gray-500 mt-2">{cat.desc}</p>
          </div>
        ))}
      </div>
      {formData.category === "Academic" && (
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-amber-800 font-medium">
            <strong>Note:</strong> Academic subject assignments and qualifications will be handled in the Teacher Profile management screen after onboarding is complete.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-[#03045e]">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Full Name *</label>
          <input
            type="text"
            value={formData.employeeName}
            onChange={e => setFormData({...formData, employeeName: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="john@school.edu"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Phone</label>
          <input
            type="text"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder="+1 234 567 8900"
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
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Joining Date *</label>
          <input
            type="date"
            value={formData.joiningDate}
            onChange={e => setFormData({...formData, joiningDate: e.target.value})}
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
            placeholder="123 Main St, City, Country"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-[#03045e]">Employment Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Staff Category</label>
          <input
            type="text"
            disabled
            value={formData.category}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 bg-gray-50 outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Employment Type *</label>
          <select
            value={formData.employmentType}
            onChange={e => setFormData({...formData, employmentType: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none bg-white"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Designation *</label>
          <input
            type="text"
            value={formData.designation}
            onChange={e => setFormData({...formData, designation: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
            placeholder={formData.category === "Academic" ? "Senior Mathematics Teacher" : "HR Manager"}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Department *</label>
          <select
            value={formData.departmentId}
            onChange={e => setFormData({...formData, departmentId: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none bg-white"
          >
            <option value="">-- Select Department --</option>
            {departments.map(d => (
              <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (formData.category === "Operational") {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-[#03045e]">Portal Eligibility</h3>
          <p className="text-sm text-gray-500">Determine if this staff member requires system access to the ERP platform.</p>
          
          <div className="flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 bg-gray-50 mt-6">
            <Wrench className="text-gray-400 mt-1 shrink-0" size={24} />
            <div className="flex-1">
              <h4 className="font-bold text-gray-600 mb-1">Operational Role</h4>
              <p className="text-xs text-gray-500 font-bold">
                Portal access is not applicable.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-black text-[#03045e]">Portal Eligibility</h3>
        <p className="text-sm text-gray-500">Determine if this staff member requires system access to the ERP platform.</p>
        
        <div className="flex items-start gap-4 p-5 rounded-2xl border-2 border-[#0077b6]/20 bg-[#caf0f8]/10 mt-6">
          <Shield className="text-[#0077b6] mt-1 shrink-0" size={24} />
          <div className="flex-1">
            <h4 className="font-bold text-[#03045e] mb-1">Grant System Portal Access</h4>
            <p className="text-xs text-gray-600 mb-4">
              If granted, this user will be eligible to have an account provisioned in Phase 12.4. 
              Currently defaulted to <strong>{formData.category === "Operational" ? "No" : "Yes"}</strong> based on their category.
            </p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.portalAccess === true}
                  onChange={() => setFormData({...formData, portalAccess: true})}
                  className="w-4 h-4 text-[#0077b6]"
                />
                <span className="text-sm font-bold text-[#03045e]">Yes, grant access</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.portalAccess === false}
                  onChange={() => setFormData({...formData, portalAccess: false})}
                  className="w-4 h-4 text-[#0077b6]"
                />
                <span className="text-sm font-bold text-gray-500">No, deny access</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-[#03045e]">Review & Confirm</h3>
      
      <div className="bg-gradient-to-br from-[#03045e] to-[#0077b6] p-6 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Generated Employee ID</p>
          <h2 className="text-3xl font-black">{formData.employeeId}</h2>
        </div>
        <CreditCard size={48} className="text-white/20" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Employee Details</p>
          <p className="text-sm font-bold text-[#03045e]">{formData.employeeName}</p>
          <p className="text-xs text-gray-500">{formData.email}</p>
          <p className="text-xs text-gray-500">{formData.phone || "No phone"}</p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Role & Department</p>
          <p className="text-sm font-bold text-[#03045e]">{formData.designation}</p>
          <p className="text-xs text-gray-500">{departments.find(d => d.departmentId === formData.departmentId)?.departmentName || "None"}</p>
          <p className="text-xs text-gray-500">{formData.category}</p>
        </div>
      </div>
      
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Portal Eligibility</span>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${formData.portalAccess ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
          {formData.portalAccess ? "Granted" : "Denied"}
        </span>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
        <CheckCircle2 className="text-emerald-500 w-10 h-10" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-[#03045e] mb-2">Onboarding Complete</h2>
        <p className="text-gray-500 text-sm">
          {formData.employeeName} has been successfully added to the Staff Registry as <strong>{formData.employeeId}</strong>.
        </p>
      </div>

      {formData.portalAccess && (
        <div className="w-full max-w-sm mt-4 text-left">
          {identityError ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{identityError}</p>
            </div>
          ) : provisionedCredentials ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-[#03045e] p-3 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield size={14} className="text-[#00b4d8]" /> Institutional Access
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase rounded border border-emerald-500/30">
                  Provisioned
                </span>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-500">Portal Type</span>
                  <span className="font-black text-[#03045e]">ADMIN</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-500">Account Status</span>
                  <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Pending Reset</span>
                </div>
                <hr className="border-gray-100" />
                
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Username</span>
                  <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                    <span className="text-sm font-mono font-bold text-[#03045e]">{provisionedCredentials.username}</span>
                    <button onClick={() => navigator.clipboard.writeText(provisionedCredentials.username)} className="text-gray-400 hover:text-[#0077b6] transition-colors"><Copy size={14}/></button>
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Temporary Password</span>
                  <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                    <span className="text-sm font-mono font-bold text-[#03045e]">{provisionedCredentials.password}</span>
                    <button onClick={() => navigator.clipboard.writeText(provisionedCredentials.password)} className="text-gray-400 hover:text-[#0077b6] transition-colors"><Copy size={14}/></button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-medium text-center mt-2 leading-relaxed">
                  Please securely share these credentials with the employee. They will be forced to change their password upon first login.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold">
              Provisioning state unknown.
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4 w-full max-w-sm mt-8">
        <button 
          onClick={handleClose}
          className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
        >
          Close
        </button>
        <button 
          onClick={() => {
            setFormData(INITIAL_STATE);
            setCurrentStep(0);
            setIsSuccess(false);
          }}
          className="flex-1 py-3 px-4 bg-[#0077b6] hover:bg-[#03045e] text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[#0077b6]/20"
        >
          Onboard Another
        </button>
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
        {!isSuccess && (
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
            <div>
              <h2 className="text-lg font-black text-[#03045e]">Staff Onboarding Engine</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}</p>
            </div>
            <button 
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {!isSuccess && (
          <div className="w-full h-1.5 bg-gray-100 shrink-0">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

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
              key={currentStep + (isSuccess ? "success" : "")}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isSuccess ? renderSuccess() : (
                currentStep === 0 ? renderStep0() :
                currentStep === 1 ? renderStep1() :
                currentStep === 2 ? renderStep2() :
                currentStep === 3 ? renderStep3() :
                renderStep4()
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {!isSuccess && (
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
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black transition-all shadow-lg shadow-emerald-500/20"
              >
                {isLoading ? "Saving..." : "Save Staff"} <CheckCircle2 size={16} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white text-sm font-black transition-all shadow-lg shadow-[#0077b6]/20"
              >
                {isLoading ? "Checking..." : "Next"} <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
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

export default StaffOnboardingEngine;
