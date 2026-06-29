import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Users, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Contact, 
  Edit3, 
  Save, 
  CheckCircle,
  Briefcase,
  Smartphone,
  ShieldCheck,
  Building2,
  BookOpen,
  Award,
  Sparkles,
  ClipboardList,
  AlertCircle,
  X,
  MessageSquare
} from "lucide-react";
import MainCard from "../../components/MainCard";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import { useAuth } from "../../context/AuthContext";
import { getTeacherProfile, updateTeacherProfile } from "../../services/teacherService";
import { useLanguage } from "../../context/LanguageContext";

// ── Shared UI Sub-components ────────────────────────────────────────────────

const ProfileSection = ({ icon: Icon, title, children, className = "" }) => (
  <section className={`${className}`}>
    <div className="flex items-center justify-between mb-4 px-1">
      <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
          <Icon size={16} />
        </div>
        {title}
      </h2>
    </div>
    {children}
  </section>
);

const InfoField = ({ label, value, icon: Icon, fullWidth = false, density = "normal" }) => (
  <div className={`flex flex-col gap-0.5 ${fullWidth ? "col-span-full" : ""}`}>
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
      {Icon && <Icon size={12} className="text-gray-300" />}
      {label}
    </span>
    <span className={`${density === "compact" ? "text-sm" : "text-base"} font-bold text-[#03045e] break-words`}>
      {value || "—"}
    </span>
  </div>
);

const StatusBadge = ({ type, text }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    error: "bg-rose-50 text-rose-600 border-rose-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[type] || styles.info}`}>
      {text}
    </span>
  );
};

const Toast = ({ message, type = "success", onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-[11px] font-black uppercase tracking-wider ${
      type === "success" 
        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
        : "bg-rose-50 text-rose-700 border-rose-200"
    }`}
  >
    <CheckCircle size={16} className={type === "success" ? "text-emerald-500" : "text-rose-500"} />
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-75">
      <X size={14} />
    </button>
  </motion.div>
);

// ── Main Page Component ─────────────────────────────────────────────────────

const ProfileSettingsPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const teacherId = user?.linkedEntityId || "teach-001";

  // State Management
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [forms, setForms] = useState({
    phoneNumber: "",
    email: "",
    emergencyContact: "",
    address: "",
    dob: "",
    gender: "",
    qualification: "",
    experience: "",
    certifications: "",
    subjectSpecialization: ""
  });

  // Notifications & Errors
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [errorMsg, setErrorMsg] = useState("");

  // Load Data Relationally
  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getTeacherProfile(teacherId);
      if (data) {
        setProfileData(data);
        setForms({
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          emergencyContact: data.emergencyContact || "",
          address: data.address || "",
          dob: data.dob || "",
          gender: data.gender || "",
          qualification: data.qualification || "",
          experience: data.experience || "",
          certifications: data.certifications || "",
          subjectSpecialization: data.subjectSpecialization || ""
        });
      }
    } catch (err) {
      console.error("Failed to load teacher profile relational record:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [teacherId]);

  // Show Toast helper
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Handle Updates globally
  const handleSaveProfile = async () => {
    // Form Validations
    if (!forms.email || !forms.email.includes("@")) {
      setErrorMsg("Please enter a valid school email address.");
      return;
    }
    if (!forms.phoneNumber || forms.phoneNumber.trim().length < 8) {
      setErrorMsg("Please enter a valid primary mobile number.");
      return;
    }
    if (!forms.emergencyContact || forms.emergencyContact.trim().length < 8) {
      setErrorMsg("Please enter a valid emergency contact number.");
      return;
    }
    if (!forms.qualification.trim()) {
      setErrorMsg("Qualification details cannot be empty.");
      return;
    }
    if (!forms.experience.trim()) {
      setErrorMsg("Teaching experience details cannot be empty.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    try {
      await updateTeacherProfile(teacherId, forms);
      await loadProfile(); // reload fresh relational details
      setIsEditing(false);
      triggerToast("Profile updated successfully!");
    } catch (err) {
      setErrorMsg("Failed to save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Get Stylized Initials
  const getInitials = (name) => {
    if (!name) return "T";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        Error: Teacher record not resolved. Please verify authorization credentials.
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-24 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* ── Title & Context ── */}
      <TeacherModuleHeader 
        titleKey="nav.profile_settings"
        descriptionKey="profile.description"
        helperContentEn="Keep your official contact records, specialized subjects, and qualifications up to date."
        helperContentHi="अपने आधिकारिक संपर्क रिकॉर्ड, विशिष्ट विषयों और योग्यताओं को अद्यतित रखें।"
      />

      {/* ── Profile Header (Hero Section - Exact Student Alignment) ── */}
      <div className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-[#03045e]/5 to-[#00b4d8]/5 -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10">
          
          {/* Left Side: Identity */}
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative group">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2.25rem] bg-gradient-to-br from-[#00b4d8] to-[#03045e] p-1 shadow-xl overflow-hidden ring-4 ring-white flex items-center justify-center text-white font-black text-4xl">
                {getInitials(profileData.name)}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2.5 mb-2.5">
                {profileData.isClassTeacher ? (
                  <StatusBadge type="success" text={`Class Teacher of ${profileData.homeroomClass?.displayName || profileData.homeroomClass?.name}`} />
                ) : (
                  <StatusBadge type="warning" text="Subject Teacher" />
                )}
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-100">
                  {profileData.department} Dept
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#03045e] mb-2 tracking-tight">
                {profileData.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-gray-500 font-bold text-xs uppercase tracking-tight">
                <span className="flex items-center gap-2"><Contact size={14} className="text-[#00b4d8]" /> ID: {profileData.employeeId}</span>
                <span className="flex items-center gap-2"><Briefcase size={14} className="text-[#00b4d8]" /> {profileData.designation}</span>
                <span className="flex items-center gap-2"><Calendar size={14} className="text-[#00b4d8]" /> Joined {profileData.joiningDate}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#03045e] text-white hover:bg-[#0077b6] transition-all shadow-lg shadow-[#03045e]/20 group"
              >
                <Edit3 size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">{t("profile.updateData", { fallback: "Update Data" })}</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  disabled={saving}
                  onClick={handleSaveProfile}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300 transition-all shadow-lg shadow-emerald-600/20 group"
                >
                  <Save size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{saving ? t("duty.saving", { fallback: "Saving..." }) : t("profile.saveChanges", { fallback: "Save Changes" })}</span>
                </button>
                <button 
                  disabled={saving}
                  onClick={() => { setIsEditing(false); setErrorMsg(""); loadProfile(); }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white border border-gray-150 text-gray-500 hover:border-gray-300 transition-all shadow-sm group"
                >
                  <X size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{t("common.cancel", { fallback: "Cancel" })}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Form Validation Error */}
      {isEditing && errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-tight flex items-start gap-2.5 max-w-[1600px] mx-auto shadow-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
          {errorMsg}
        </div>
      )}

      {/* ── Main Grid Layout (65/35 split, identical layout spacing) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT COLUMN (65% approx - Personal & Professional credentials) ── */}
        <div className="lg:col-span-8 flex flex-col gap-8 md:gap-10">
          
          {/* 1. Contact & Personal Info */}
          <ProfileSection icon={User} title={t("profile.personalInfo", { fallback: "Personal Information" })}>
            <MainCard borderColor="#00b4d8" className="p-6 md:p-8">
              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                  <InfoField label={t("profile.mobilePhone", { fallback: "Primary Mobile Phone" })} value={profileData.phoneNumber} icon={Smartphone} />
                  <InfoField label={t("profile.email", { fallback: "School Email Address" })} value={profileData.email} icon={Mail} />
                  <InfoField label={t("profile.emergencyContact", { fallback: "Emergency Contact Person / No." })} value={profileData.emergencyContact} icon={Phone} />
                  <InfoField label={t("profile.correspondenceAddress", { fallback: "Correspondence Address" })} value={profileData.address} icon={MapPin} fullWidth />
                  <InfoField label={t("profile.dob", { fallback: "Date of Birth" })} value={profileData.dob} icon={Calendar} />
                  <InfoField label={t("profile.gender", { fallback: "Gender" })} value={profileData.gender} icon={User} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 text-xs font-bold text-[#03045e]">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.mobilePhone", { fallback: "Primary Mobile Phone" })}</label>
                    <input 
                      type="text"
                      value={forms.phoneNumber}
                      onChange={(e) => setForms(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="p-3.5 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-[#03045e] font-bold shadow-sm"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.email", { fallback: "School Email Address" })}</label>
                    <input 
                      type="email"
                      value={forms.email}
                      onChange={(e) => setForms(prev => ({ ...prev, email: e.target.value }))}
                      className="p-3.5 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-[#03045e] font-bold shadow-sm"
                      placeholder="username@school.edu"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.emergencyContact", { fallback: "Emergency Contact Person / No." })}</label>
                    <input 
                      type="text"
                      value={forms.emergencyContact}
                      onChange={(e) => setForms(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      className="p-3.5 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-[#03045e] font-bold shadow-sm"
                      placeholder="Relation: +91 XXXXX XXXXX"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.dob", { fallback: "Date of Birth" })}</label>
                    <input 
                      type="date"
                      value={forms.dob}
                      onChange={(e) => setForms(prev => ({ ...prev, dob: e.target.value }))}
                      className="p-3.5 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-[#03045e] font-bold shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.gender", { fallback: "Gender" })}</label>
                    <select 
                      value={forms.gender}
                      onChange={(e) => setForms(prev => ({ ...prev, gender: e.target.value }))}
                      className="p-3.5 rounded-xl border border-gray-200 bg-white focus:border-[#00b4d8] outline-none text-[#03045e] font-bold shadow-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.correspondenceAddress", { fallback: "Correspondence Address" })}</label>
                    <textarea 
                      rows={2}
                      value={forms.address}
                      onChange={(e) => setForms(prev => ({ ...prev, address: e.target.value }))}
                      className="p-3.5 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-[#03045e] font-bold resize-none shadow-sm"
                      placeholder="Complete residential address..."
                    />
                  </div>
                </div>
              )}
            </MainCard>
          </ProfileSection>

          {/* 2. Professional Credentials */}
          <ProfileSection icon={GraduationCap} title={t("profile.professionalProfile", { fallback: "Professional Profile" })}>
            <MainCard borderColor="#00b4d8" className="p-6 md:p-8">
              {!isEditing ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                    <InfoField label={t("profile.highestQualification", { fallback: "Highest Qualification" })} value={profileData.qualification} icon={GraduationCap} />
                    <InfoField label={t("profile.teachingExperience", { fallback: "Teaching Experience" })} value={profileData.experience} icon={Briefcase} />
                    <InfoField label={t("profile.subjectSpecialization", { fallback: "Subject Specialization" })} value={profileData.subjectSpecialization} icon={Sparkles} fullWidth />
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                      <Award size={13} className="text-[#00b4d8]" /> {t("profile.certifications", { fallback: "Official Certifications & Accomplishments" })}
                    </span>
                    <p className="text-xs font-bold text-[#03045e] bg-gray-50/50 p-4 rounded-2xl border border-gray-100 leading-relaxed uppercase tracking-tight">
                      {profileData.certifications || "No special certifications registered."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 text-xs font-bold text-[#03045e]">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.highestQualification", { fallback: "Highest Qualification" })}</label>
                    <input 
                      type="text"
                      value={forms.qualification}
                      onChange={(e) => setForms(prev => ({ ...prev, qualification: e.target.value }))}
                      className="p-3.5 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-[#03045e] font-bold shadow-sm"
                      placeholder="Degree, Specialization, University"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.teachingExperience", { fallback: "Teaching Experience" })}</label>
                    <input 
                      type="text"
                      value={forms.experience}
                      onChange={(e) => setForms(prev => ({ ...prev, experience: e.target.value }))}
                      className="p-3.5 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-[#03045e] font-bold shadow-sm"
                      placeholder="e.g., 10 Years of Secondary Teaching"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.subjectSpecialization", { fallback: "Subject Specialization" })}</label>
                    <input 
                      type="text"
                      value={forms.subjectSpecialization}
                      onChange={(e) => setForms(prev => ({ ...prev, subjectSpecialization: e.target.value }))}
                      className="p-3.5 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-[#03045e] font-bold shadow-sm"
                      placeholder="Physics mechanics, Algebra, Biotech, etc."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.certifications", { fallback: "Official Certifications & Accomplishments" })}</label>
                    <textarea 
                      rows={3}
                      value={forms.certifications}
                      onChange={(e) => setForms(prev => ({ ...prev, certifications: e.target.value }))}
                      className="p-3.5 rounded-xl border border-gray-200 focus:border-[#00b4d8] outline-none text-[#03045e] font-bold resize-none shadow-sm"
                      placeholder="List achievements, CBSE panel, etc..."
                    />
                  </div>
                </div>
              )}
            </MainCard>
          </ProfileSection>

        </div>

        {/* ── RIGHT COLUMN (35% approx - Department Contacts & Workload summary) ── */}
        <div className="lg:col-span-4 flex flex-col gap-8 md:gap-10">
          
          {/* 1. Support & Contacts */}
          <ProfileSection icon={MessageSquare} title={t("profile.departmentSupport", { fallback: "Department Support" })}>
            <MainCard borderColor="#00b4d8" className="p-5">
              <div className="space-y-4">
                {/* Principal */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t("profile.principalOffice", { fallback: "Principal Office" })}</p>
                      <p className="text-sm font-black text-[#03045e] truncate leading-tight">Rev. Brother Joseph</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all">
                    <Mail size={14} />
                  </button>
                </div>
                
                <div className="h-px bg-gray-50" />

                {/* Academic Office */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <Building2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t("profile.academicHead", { fallback: "Academic Head" })}</p>
                      <p className="text-sm font-black text-[#03045e] truncate leading-tight">Administration support</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-cyan-600 hover:text-white transition-all">
                    <Phone size={14} />
                  </button>
                </div>
              </div>
            </MainCard>
          </ProfileSection>

          {/* 2. Institutional Overview (Workload Stats - Styled exactly like Student Medical Card) */}
          <ProfileSection icon={Briefcase} title={t("profile.workloadRegistry", { fallback: "Workload Registry" })}>
            <MainCard borderColor="#00b4d8" className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-black text-lg">
                    {profileData.assignedSubjects?.length || 0}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("profile.assignedCourses", { fallback: "Assigned Courses" })}</span>
                </div>
                <InfoField label={t("profile.menteeStudents", { fallback: "Mentee Students" })} value={`${profileData.mentorshipCount || 0} active`} density="compact" />
                <InfoField label={t("profile.ownershipClass", { fallback: "Ownership Class" })} value={profileData.isClassTeacher ? (profileData.homeroomClass?.displayName || profileData.homeroomClass?.name) : "None"} density="compact" />
                <InfoField label={t("profile.focusField", { fallback: "Focus Field" })} value={profileData.department} density="compact" />
              </div>
              
              <div className="space-y-5 pt-5 border-t border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2.5">{t("profile.committeeAllocations", { fallback: "Committee Allocations" })}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(profileData.committeeMembership || "General Faculty Committee").split(", ").map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-500 text-[9px] font-black uppercase border border-rose-100">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 items-start">
                  <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                    Check daily schedules for substitution notices issued by the coordinator deck.
                  </p>
                </div>
              </div>
            </MainCard>
          </ProfileSection>

          {/* 3. Address Detail Card */}
          <ProfileSection icon={MapPin} title={t("profile.residencyBase", { fallback: "Residency & Base" })}>
            <MainCard borderColor="#00b4d8" className="p-5">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-600" /> {t("profile.correspondenceAddress", { fallback: "Correspondence Address" })}
                  </h4>
                  <p className="text-sm font-bold text-[#03045e] leading-relaxed">
                    {profileData.address || "No address provided."}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-3 opacity-60">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {t("profile.permanentAddress", { fallback: "Permanent Address" })}
                  </h4>
                  <p className="text-xs font-bold text-gray-500 leading-relaxed italic">
                    Same as correspondence address
                  </p>
                </div>
              </div>
            </MainCard>
          </ProfileSection>

        </div>

      </div>

      {/* Floating Success Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(prev => ({ ...prev, show: false }))} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSettingsPage;
