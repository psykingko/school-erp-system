import React from "react";
import { Users, Clock, Shield } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ClubMembersTable({ members = [], loading = false }) {
  const { t } = useLanguage();
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-8 text-center font-bold text-xs text-gray-400 italic bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
        {t("clubs.noStudentsEnrolled", { fallback: "No students enrolled in this club yet." })}
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-gray-100 rounded-2xl bg-white">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-500" />
          {t("clubs.activeEnrolledStudents", { fallback: "Active Enrolled Students" })}
        </h4>
        <span className="text-[10px] font-black text-[#00b4d8] bg-[#caf0f8]/30 px-2 py-0.5 rounded-lg">
          {members.length} {t("clubs.members", { fallback: "Members" })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/40 border-b border-gray-100">
              <th className="p-3 text-[9px] font-black text-gray-400 uppercase">{t("clubs.studentName", { fallback: "Student Name" })}</th>
              <th className="p-3 text-[9px] font-black text-gray-400 uppercase">{t("common.class", { fallback: "Class" })}</th>
              <th className="p-3 text-[9px] font-black text-gray-400 uppercase">{t("clubs.roleCapacity", { fallback: "Role / Capacity" })}</th>
              <th className="p-3 text-[9px] font-black text-gray-400 uppercase">{t("clubs.joinedDate", { fallback: "Joined Date" })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-3">
                  <div className="font-black text-xs text-gray-800">{member.name}</div>
                  <div className="text-[9px] font-bold text-gray-400">ID: {member.studentId}</div>
                </td>
                <td className="p-3 text-xs font-bold text-gray-600">
                  {member.class}
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider ${
                    member.role === "President"
                      ? "bg-purple-50 text-purple-600 border border-purple-100"
                      : member.role === "Vice President"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : member.role === "Secretary"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : member.role === "Core Member"
                      ? "bg-amber-50 text-amber-600 border border-amber-100"
                      : "bg-gray-50 text-gray-600 border border-gray-100"
                  }`}>
                    <Shield className="w-2.5 h-2.5" />
                    [{member.role?.toUpperCase() || "MEMBER"}]
                  </span>
                </td>
                <td className="p-3 text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" />
                    <span>{member.joinedAt}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
