import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  User,
  Shield,
  Briefcase,
  Users,
  Edit3,
} from "lucide-react";
import { formatClassLevel, isSeniorSecondary } from "../../utils/classIdentity";

/**
 * AdminProfilePreview
 *
 * Production-ready slide-over side drawer for user profile preview.
 * Consistent across students, teachers, parents, and admins modules.
 */
const AdminProfilePreview = ({
  isOpen,
  onClose,
  type = "student", // "student" | "teacher" | "parent" | "admin"
  data,
  onEdit,
}) => {
  if (!data) return null;

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Curated color themes based on type
  const themeColors = {
    student: { text: "text-[#03045e]", bg: "bg-[#caf0f8]", icon: Users },
    teacher: { text: "text-[#0077b6]", bg: "bg-[#ade8f4]", icon: Briefcase },
    parent: { text: "text-[#0096c7]", bg: "bg-[#caf0f8]", icon: User },
    admin: { text: "text-emerald-700", bg: "bg-emerald-50", icon: Shield },
  };

  const activeTheme = themeColors[type] || themeColors.student;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 z-40 backdrop-blur-[2px]"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-[#caf0f8]"
            aria-label="Profile Detail Drawer"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#caf0f8] flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0077b6]">
                {type} Profile Overview
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card Intro */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner flex-shrink-0 ${activeTheme.bg} ${activeTheme.text}`}
                >
                  <span className="text-xl font-black">
                    {getInitials(data.name)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-[#03045e] tracking-tight truncate">
                    {data.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
                      {data.status || "Active"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {data.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#caf0f8]/50 my-2" />

              {/* Core Relational Attributes */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#03045e]">
                  Core Registry Fields
                </h4>

                {type === "student" &&
                  (() => {
                    const displayClass = `Class ${formatClassLevel(data.classLevel)}`;
                    const rollNumber =
                      data.rollNumber ||
                      (data.id && data.id.includes("-")
                        ? parseInt(data.id.split("-")[1], 10)
                        : "N/A");
                    const hasStream =
                      isSeniorSecondary(data.classLevel) && data.stream;

                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Class
                          </p>
                          <p className="text-xs font-black text-[#03045e] mt-1">
                            {displayClass}
                          </p>
                        </div>
                        <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Section
                          </p>
                          <p className="text-xs font-black text-[#03045e] mt-1">
                            {data.section || "N/A"}
                          </p>
                        </div>
                        {hasStream && (
                          <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40 col-span-2">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">
                              Academic Stream
                            </p>
                            <p className="text-xs font-black text-[#03045e] mt-1">
                              {data.stream}
                            </p>
                          </div>
                        )}
                        <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Roll Number
                          </p>
                          <p className="text-xs font-black text-[#03045e] mt-1">
                            {rollNumber}
                          </p>
                        </div>
                        <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Admission Number
                          </p>
                          <p className="text-xs font-black text-[#03045e] mt-1">
                            {data.admissionNo || data.id}
                          </p>
                        </div>
                        <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40 col-span-2">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Mapped Parent
                          </p>
                          <p className="text-xs font-black text-[#03045e] mt-1">
                            {data.parent || "Rajesh Kumar"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                {type === "teacher" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                      <p className="text-[9px] text-gray-400 font-bold uppercase">
                        Department
                      </p>
                      <p className="text-xs font-black text-[#03045e] mt-1">
                        {data.dept || "Science"}
                      </p>
                    </div>
                    <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                      <p className="text-[9px] text-gray-400 font-bold uppercase">
                        Class Teacher role
                      </p>
                      <p className="text-xs font-black text-[#03045e] mt-1">
                        {data.isClassTeacher
                          ? data.classAssigned
                          : "None Assigned"}
                      </p>
                    </div>
                    <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40 col-span-2">
                      <p className="text-[9px] text-gray-400 font-bold uppercase mb-1.5">
                        Subject Assignments
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(data.subjects || []).map((sub, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg bg-[#caf0f8] text-[#03045e] text-[10px] font-black"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {type === "parent" && (
                  <>
                    {data.student ? (
                      <>
                        {/* Student Academic Identity */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">
                              Class
                            </p>
                            <p className="text-xs font-black text-[#03045e] mt-1">
                              {`Class ${formatClassLevel(data.student.classLevel)}`}
                            </p>
                          </div>
                          <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">
                              Section
                            </p>
                            <p className="text-xs font-black text-[#03045e] mt-1">
                              {data.student.section || "N/A"}
                            </p>
                          </div>
                          {isSeniorSecondary(data.student.classLevel) &&
                            data.student.stream && (
                              <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40 col-span-2">
                                <p className="text-[9px] text-gray-400 font-bold uppercase">
                                  Academic Stream
                                </p>
                                <p className="text-xs font-black text-[#03045e] mt-1">
                                  {data.student.stream}
                                </p>
                              </div>
                            )}
                          <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">
                              Roll Number
                            </p>
                            <p className="text-xs font-black text-[#03045e] mt-1">
                              {data.student.rollNumber ||
                                (data.student.id &&
                                data.student.id.includes("-")
                                  ? parseInt(data.student.id.split("-")[1], 10)
                                  : "N/A")}
                            </p>
                          </div>
                          <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">
                              Admission Number
                            </p>
                            <p className="text-xs font-black text-[#03045e] mt-1">
                              {data.student.admissionNo || data.id}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-[#caf0f8]/50 my-2" />

                        {/* Parent / Guardian Information */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#03045e]">
                            Parent / Guardian
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                              <p className="text-[9px] text-gray-400 font-bold uppercase">
                                Parent Name
                              </p>
                              <p className="text-xs font-black text-[#03045e] mt-1">
                                {data.parent?.name || "N/A"}
                              </p>
                            </div>
                            <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                              <p className="text-[9px] text-gray-400 font-bold uppercase">
                                Relationship
                              </p>
                              <p className="text-xs font-black text-[#03045e] mt-1">
                                {data.parent?.relationship || "Guardian"}
                              </p>
                            </div>
                            <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                              <p className="text-[9px] text-gray-400 font-bold uppercase">
                                Occupation
                              </p>
                              <p className="text-xs font-black text-[#03045e] mt-1">
                                {data.occupation ||
                                  data.parent?.occupation ||
                                  "Professional"}
                              </p>
                            </div>
                            <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                              <p className="text-[9px] text-gray-400 font-bold uppercase">
                                Alternate Phone
                              </p>
                              <p className="text-xs font-black text-[#03045e] mt-1">
                                {data.parent?.alternatePhone || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Linked Siblings */}
                        {data.siblings && data.siblings.length > 0 && (
                          <>
                            <div className="border-t border-[#caf0f8]/50 my-2" />
                            <div className="space-y-4">
                              <h4 className="text-xs font-black uppercase tracking-wider text-[#03045e]">
                                Linked Siblings
                              </h4>
                              <div className="space-y-2">
                                {data.siblings.map((sib) => (
                                  <div
                                    key={sib.id}
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/40"
                                  >
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#03045e] text-white text-[10px] font-black">
                                      {sib.admissionNo}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="text-xs font-black text-[#03045e] truncate">
                                        {sib.name}
                                      </p>
                                      <p className="text-[10px] text-gray-400 font-semibold">
                                        Class {sib.classLevel}-{sib.section}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      /* Fallback for backward compatibility */
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Occupation
                          </p>
                          <p className="text-xs font-black text-[#03045e] mt-1">
                            {data.occupation || "Professional"}
                          </p>
                        </div>
                        <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Alternate Phone
                          </p>
                          <p className="text-xs font-black text-[#03045e] mt-1">
                            {data.alternatePhone || "+91 99999 88888"}
                          </p>
                        </div>
                        <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40 col-span-2">
                          <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">
                            Linked Children
                          </p>
                          <p className="text-xs font-black text-[#03045e]">
                            {data.childrenMapped || "Ashish Kumar (Class 11-A)"}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {type === "admin" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/40 col-span-2">
                      <p className="text-[9px] text-gray-400 font-bold uppercase">
                        Operational Role Accent
                      </p>
                      <p className="text-xs font-black text-[#03045e] mt-1">
                        {data.roleLabel || "Principal Administrator"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Details Card */}
              <div className="bg-[#caf0f8]/10 p-5 rounded-3xl border border-[#caf0f8]/50 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#03045e]">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-700 font-bold">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-400 border border-[#caf0f8]">
                      <Mail size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 font-semibold uppercase">
                        Email Address
                      </p>
                      <p className="truncate mt-0.5">
                        {data.email || "info@springdale.edu.in"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-700 font-bold">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-400 border border-[#caf0f8]">
                      <Phone size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 font-semibold uppercase">
                        Primary Contact No
                      </p>
                      <p className="mt-0.5">
                        {data.phone || "+91 98765 43210"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            {onEdit && (
              <div className="p-4 border-t border-[#caf0f8] bg-gray-50 flex items-center justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(data.parent || data);
                  }}
                  className="flex items-center gap-2 bg-[#03045e] hover:bg-[#0077b6] text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-sm transition-all"
                >
                  <Edit3 size={14} />
                  <span>EDIT DETAILS</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default memo(AdminProfilePreview);
