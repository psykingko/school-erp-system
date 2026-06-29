import React from "react";
import { Compass, Users, ChevronRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ClubTable({ clubs = [], selectedClubId, onSelectClub }) {
  const { t } = useLanguage();
  
  if (clubs.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center font-bold text-xs text-gray-400 italic">
        {t("clubs.noClubsAssigned", { fallback: "No clubs assigned to you in the co-curricular directory." })}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-500" />
          {t("clubs.myAssignedClubs", { fallback: "My Assigned Clubs & Committees" })}
        </h3>
        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-xl">
          {clubs.length} {t("clubs.clubsCount", { fallback: "Clubs" })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase">{t("clubs.clubCommittee", { fallback: "Club / Committee" })}</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase">{t("clubs.category", { fallback: "Category" })}</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase">{t("clubs.scope", { fallback: "Scope" })}</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase">{t("common.status", { fallback: "Status" })}</th>
              <th className="p-4 text-right text-[10px] font-black text-gray-400 uppercase">{t("clubs.operations", { fallback: "Operations" })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clubs.map((club) => {
              const isSelected = selectedClubId === club.id;
              return (
                <tr 
                  key={club.id} 
                  className={`hover:bg-blue-50/30 transition-colors ${isSelected ? 'bg-blue-50/20' : ''}`}
                >
                  <td className="p-4">
                    <div className="font-black text-sm text-[#03045e]">{club.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{club.description}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter">
                      {club.category}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-600">
                    {club.allowedClasses?.join(", ") || "11-A, 11-B"}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tighter">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {t("common.active", { fallback: "Active" })}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onSelectClub(club)}
                      className={`inline-flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all uppercase tracking-tighter ${
                        isSelected 
                          ? 'bg-[#03045e] text-white border-[#03045e]' 
                          : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <span>{t("clubs.manage", { fallback: "Manage" })}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
