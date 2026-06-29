import React from "react";
import { ChevronRight, ShieldAlert, Award, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

export default function StudentMentorshipTable({ studentsData, onSelectStudent }) {
  const { t } = useLanguage();
  // Styles for Academic Status
  const STATUS_STYLES = {
    Excellent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Good: "bg-blue-50 text-blue-700 border-blue-100",
    Warning: "bg-amber-50 text-amber-700 border-amber-100",
    "At Risk": "bg-rose-50 text-rose-700 border-rose-100 animate-pulse"
  };

  const getAttendanceColor = (pct) => {
    if (pct >= 85) return "text-emerald-600";
    if (pct >= 75) return "text-amber-500";
    return "text-rose-500 font-extrabold";
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-6">{t("common.studentInfo", { fallback: "Student Info" })}</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("common.classSection", { fallback: "Class Section" })}</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t("common.attendance", { fallback: "Attendance" })}</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t("mentorSupport.academicStatus", { fallback: "Academic Status" })}</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("mentorSupport.wellbeingIndicators", { fallback: "Wellbeing Indicators" })}</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t("mentorSupport.followUps", { fallback: "Follow-ups" })}</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pr-6 text-right">{t("common.actions", { fallback: "Actions" })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {studentsData.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-xs font-bold text-gray-400 italic">
                   {t("mentorSupport.noStudents", { fallback: "No students currently mapped to your mentorship circle." })}
                </td>
              </tr>
            ) : (
              studentsData.map((student, idx) => {
                const summary = student.performanceSummary;
                const wellbeing = student.wellbeingFlags || [];
                const followUpsCount = student.pendingFollowUpsCount || 0;

                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className="hover:bg-[#caf0f8]/10 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#caf0f8] text-[#03045e] flex items-center justify-center font-black text-xs shadow-sm border border-[#caf0f8]/60">
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#03045e]">{student.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">Adm No: {student.admissionNo}</p>
                        </div>
                      </div>
                    </td>

                    {/* Homeroom section */}
                    <td className="p-4">
                      <span className="text-xs font-extrabold text-gray-600 bg-gray-50 border px-2.5 py-1 rounded-xl">
                        {t("common.class", { fallback: "Class" })} {student.className || "11"}
                      </span>
                    </td>

                    {/* Attendance percentage */}
                    <td className="p-4 text-center">
                      <span className={`text-xs font-black ${getAttendanceColor(summary?.attendancePct || 0)}`}>
                        {summary?.attendancePct || 0}%
                      </span>
                    </td>

                    {/* Academic status */}
                    <td className="p-4 text-center">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        STATUS_STYLES[summary?.status] || STATUS_STYLES.Good
                      }`}>
                        {summary?.status || "Good"}
                      </span>
                    </td>

                    {/* Wellbeing indicators */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {wellbeing.length === 0 ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>{t("mentorSupport.healthy", { fallback: "Healthy" })}</span>
                          </span>
                        ) : (
                          wellbeing.map((flag, fIdx) => (
                            <span
                              key={fIdx}
                              className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse"
                            >
                              <ShieldAlert className="w-3 h-3 text-rose-500" />
                              <span>{flag.label}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Pending follow-up count */}
                    <td className="p-4 text-center">
                      {followUpsCount > 0 ? (
                        <span className="inline-block text-xs font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg animate-pulse">
                          {followUpsCount} {t("mentorSupport.pending", { fallback: "Pending" })}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-300">-</span>
                      )}
                    </td>

                    {/* Action View guidance file */}
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => onSelectStudent(student)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#03045e] hover:bg-[#0077b6] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
                      >
                        <span>{t("mentorSupport.guidanceFile", { fallback: "Guidance File" })}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
