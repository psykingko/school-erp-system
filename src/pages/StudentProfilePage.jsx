import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  HeartPulse, 
  Users, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Contact, 
  Download, 
  Printer, 
  Edit3, 
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Building2,
  AlertCircle,
  Smartphone
} from "lucide-react";
import MainCard from "../components/MainCard";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";
import { getStudentProfile } from "../services/studentService";
import { useLanguage } from "../context/LanguageContext";
import { useStudent } from "../context/StudentContext";
import { useAuth } from "../context/AuthContext";
import ChildScopeSwitcher from "../components/parent/ChildScopeSwitcher";

// ── Reusable UI Components ──────────────────────────────────────────────────

/**
 * ProfileSection Wrapper
 * Standardized header outside the card with consistent vertical rhythm.
 */
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

/**
 * InfoField
 * Consistent typography: small muted uppercase label + bold readable value.
 */
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

/**
 * StatusBadge
 * Standardized pills for active/medical/payment statuses.
 */
const StatusBadge = ({ type, text }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    error: "bg-rose-50 text-rose-600 border-rose-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
    medical: "bg-rose-50 text-rose-500 border-rose-100",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[type] || styles.info}`}>
      {text}
    </span>
  );
};

// ── Main Page Component ─────────────────────────────────────────────────────

const StudentProfilePage = ({ onNavigatePage }) => {
  const { t, lang } = useLanguage();
  const { activeStudentId } = useStudent();
  const { isParent: isParentMode, user } = useAuth();
  
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showHelper, setShowHelper] = useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!activeStudentId) return;
      setLoading(true);
      try {
        const profile = await getStudentProfile(activeStudentId);
        setData(profile);
      } catch (error) {
        console.error("Failed to fetch student profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [activeStudentId]);

  const handleNavigate = (page) => {
    if (onNavigatePage) onNavigatePage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1600px] mx-auto pb-24 px-4 sm:px-6 lg:px-8"
      >
        {/* ── Parent Identity Header (If in Parent Mode) ── */}
        {isParentMode && (
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 p-6 bg-white rounded-3xl border border-[#caf0f8] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-[#03045e] shadow-lg shadow-[#03045e]/20">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#03045e]">
                  {t("profile.parentTitle") || "Parent Profile"}
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  {user?.name}
                </p>
              </div>
            </div>

            <div className="flex-1">
              <ChildScopeSwitcher />
            </div>

            <div className="flex items-center gap-2">
              <HelperButton onClick={() => setShowHelper(true)} />
            </div>
          </div>
        )}

        {/* ── Profile Header (Hero Section) ── */}
        <div className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-[#03045e]/5 to-[#00b4d8]/5 -z-10" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10">
            
            {/* Left Side: Identity */}
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="relative group">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2.25rem] bg-white p-1 shadow-xl border-2 border-gray-100 overflow-hidden ring-4 ring-white">
                  {data.personal.avatarUrl ? (
                    <img 
                      src={data.personal.avatarUrl} 
                      alt={data.personal.fullName} 
                      className="w-full h-full object-cover rounded-[2rem]"
                    />
                  ) : (
                    <div 
                      className="w-full h-full rounded-[2rem] flex items-center justify-center text-white font-black text-4xl"
                      style={{ background: `linear-gradient(135deg, #00b4d8, ${data.personal.avatarColor || '#03045e'})` }}
                    >
                      {data.personal.avatarInitials || "S"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2.5 mb-2.5">
                  <StatusBadge type="success" text={data.personal.status} />
                  <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    Class {data.academic.class}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-[#03045e] mb-2 tracking-tight">
                  {data.personal.fullName}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-gray-500 font-bold text-xs uppercase tracking-tight">
                  <span className="flex items-center gap-2"><Contact size={14} className="text-[#00b4d8]" /> ID: {data.personal.studentId}</span>
                  <span className="flex items-center gap-2"><GraduationCap size={14} className="text-[#00b4d8]" /> Section {data.academic.section}</span>
                  <span className="flex items-center gap-2"><Calendar size={14} className="text-[#00b4d8]" /> {data.academic.academicSession}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Quick Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
               <button className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#03045e] text-white hover:bg-[#0077b6] transition-all shadow-lg shadow-[#03045e]/20 group">
                  <Download size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">ID Card</span>
               </button>
               <button className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white border border-gray-100 text-[#03045e] hover:border-[#00b4d8] hover:text-[#00b4d8] transition-all shadow-sm group">
                  <Edit3 size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Update Data</span>
               </button>
               <HelperButton onClick={() => setShowHelper(true)} />
               <button className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 hover:text-[#03045e] hover:bg-white border border-transparent hover:border-gray-100 flex items-center justify-center transition-all hidden lg:flex">
                  <Printer size={20} />
               </button>
            </div>
          </div>
        </div>

        {/* ── Main Grid Layout (65/35) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN (65% approx) ── */}
          <div className="lg:col-span-8 flex flex-col gap-8 md:gap-10">
            
            {/* 1. Personal Information */}
            <ProfileSection 
              icon={User} 
              title="Personal Information" 
            >
              <MainCard borderColor="#00b4d8" className="p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                  <InfoField label="Admission No." value={data.personal.admissionNumber} />
                  <InfoField label="Roll Number" value={data.personal.rollNumber} />
                  <InfoField label="Date of Birth" value={data.personal.dateOfBirth} />
                  <InfoField label="Gender" value={data.personal.gender} />
                  <InfoField label="Category" value={data.personal.category} />
                  <InfoField label="Nationality" value={data.personal.nationality} />
                  <InfoField label="Aadhaar / ID" value={data.personal.aadhaarNumber} />
                  <InfoField label="Email Address" value={data.personal.email} icon={Mail} />
                  <InfoField label="Phone Number" value={data.personal.phoneNumber} icon={Phone} />
                </div>
              </MainCard>
            </ProfileSection>

            {/* 2. Academic Information */}
            <ProfileSection 
              icon={GraduationCap} 
              title="Academic Information" 
            >
              <MainCard borderColor="#00b4d8" className="p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6 mb-8">
                  <InfoField label="Current Class" value={data.academic.class} />
                  <InfoField label="Section" value={data.academic.section} />
                  <InfoField label="Stream" value={data.academic.stream} />
                  <InfoField label="House Group" value={data.academic.house} />
                  <InfoField label="Class Teacher" value={data.academic.classTeacher} />
                  <InfoField label="Admission Date" value={data.academic.admissionDate} />
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Subjects Registered</span>
                  <div className="flex flex-wrap gap-2">
                    {data.academic.subjects.map((sub, i) => (
                      <span key={i} className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 text-[11px] font-black tracking-tight uppercase">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </MainCard>
            </ProfileSection>

            {/* 3. Family Information */}
            <ProfileSection 
              icon={Users} 
              title="Family Information" 
            >
              <MainCard borderColor="#00b4d8" className="p-6 md:p-8">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Father Details */}
                    <div className="bg-gray-50/50 rounded-[1.5rem] p-5 border border-gray-100">
                      <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <User size={12} /> Father Details
                      </h3>
                      <div className="space-y-4">
                        <InfoField label="Name" value={data.family?.father?.name || "N/A"} density="compact" />
                        <div className="grid grid-cols-2 gap-4">
                          <InfoField label="Phone" value={data.family?.father?.phoneNumber || "N/A"} icon={Smartphone} density="compact" />
                          <InfoField label="Occupation" value={data.family?.father?.occupation || "N/A"} density="compact" />
                        </div>
                      </div>
                    </div>

                    {/* Mother Details */}
                    <div className="bg-gray-50/50 rounded-[1.5rem] p-5 border border-gray-100">
                      <h3 className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <User size={12} /> Mother Details
                      </h3>
                      <div className="space-y-4">
                        <InfoField label="Name" value={data.family?.mother?.name || "N/A"} density="compact" />
                        <div className="grid grid-cols-2 gap-4">
                          <InfoField label="Phone" value={data.family?.mother?.phoneNumber || "N/A"} icon={Smartphone} density="compact" />
                          <InfoField label="Occupation" value={data.family?.mother?.occupation || "N/A"} density="compact" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guardian Info */}
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <ShieldCheck size={14} /> Emergency Guardian
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                      <InfoField label="Guardian Name" value={data.family?.guardian?.name || "N/A"} />
                      <InfoField label="Relation" value={data.family?.guardian?.relation || "N/A"} />
                      <InfoField label="Contact" value={data.family?.guardian?.phoneNumber || "N/A"} icon={Phone} />
                      <div className="md:col-span-2">
                        <InfoField label="Residential Address" value={data.family?.guardian?.address || "N/A"} icon={MapPin} />
                      </div>
                    </div>
                  </div>
                </div>
              </MainCard>
            </ProfileSection>

          </div>

          {/* ── RIGHT COLUMN (35% approx) ── */}
          <div className="lg:col-span-4 flex flex-col gap-8 md:gap-10">
            
            {/* 1. Support & Contacts (Combined) */}
            <ProfileSection icon={MessageSquare} title="Support & Contacts">
              <MainCard borderColor="#00b4d8" className="p-5">
                <div className="space-y-4">
                  {/* Coordinator */}
                  <div className="flex items-center justify-between group">
                     <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                           <User size={18} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Coordinator</p>
                           <p className="text-sm font-black text-[#03045e] truncate leading-tight">{data.academic.classTeacher}</p>
                        </div>
                     </div>
                     <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all">
                        <Mail size={14} />
                     </button>
                  </div>
                  
                  <div className="h-px bg-gray-50" />

                  {/* Administration */}
                  <div className="flex items-center justify-between group">
                     <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                           <Building2 size={18} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Administration</p>
                           <p className="text-sm font-black text-[#03045e] truncate leading-tight">Admin Support Desk</p>
                        </div>
                     </div>
                     <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-cyan-600 hover:text-white transition-all">
                        <Phone size={14} />
                     </button>
                  </div>
                </div>
              </MainCard>
            </ProfileSection>

            {/* 2. Medical Information (Compact Utility) */}
            <ProfileSection 
              icon={HeartPulse} 
              title="Medical Registry" 
            >
              <MainCard borderColor="#00b4d8" className="p-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-black text-lg">
                        {data.medical?.bloodGroup || "N/A"}
                     </div>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blood Group</span>
                  </div>
                  <InfoField label="Height" value={data.medical?.height || "N/A"} density="compact" />
                  <InfoField label="Weight" value={data.medical?.weight || "N/A"} density="compact" />
                  <InfoField label="Medical Mark" value={data.medical?.identificationMark || "N/A"} density="compact" />
                </div>
                
                <div className="space-y-5 pt-5 border-t border-gray-100">
                  <div>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2.5">Active Allergies</span>
                     <div className="flex flex-wrap gap-1.5">
                        {(data.medical?.allergies || []).map((item, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-500 text-[9px] font-black uppercase border border-rose-100">
                            {item}
                          </span>
                        ))}
                     </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 items-start">
                     <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                       {data.medical?.emergencyNotes || "N/A"}
                     </p>
                  </div>
                </div>
              </MainCard>
            </ProfileSection>

            {/* 3. Residency / Address (Compact) */}
            <ProfileSection 
              icon={MapPin} 
              title="Residency" 
            >
              <MainCard borderColor="#00b4d8" className="p-5">
                <div className="space-y-6">
                  <div className="space-y-3">
                     <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600" /> Current Address
                     </h4>
                     <p className="text-sm font-bold text-[#03045e] leading-relaxed">
                       {data.address?.current?.address || "N/A"}, {data.address?.current?.city || "N/A"}, {data.address?.current?.state || "N/A"} - {data.address?.current?.postalCode || "N/A"}
                     </p>
                  </div>

                  <div className="pt-6 border-t border-gray-100 space-y-3 opacity-60">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Permanent Address
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
      </motion.div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="Profile"
        contentEn="The Student Profile section contains all official student information including personal details, academic history, family information, and medical registry."
        contentHi="छात्र प्रोफाइल अनुभाग में व्यक्तिगत विवरण, शैक्षणिक इतिहास, पारिवारिक जानकारी और चिकित्सा रजिस्ट्री सहित सभी आधिकारिक छात्र जानकारी शामिल है।"
      />
    </>
  );
};

export default StudentProfilePage;
