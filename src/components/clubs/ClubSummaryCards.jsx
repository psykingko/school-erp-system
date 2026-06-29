import React from "react";
import { Users, Calendar, Award, Compass } from "lucide-react";
import MainCard from "../MainCard";
import { useLanguage } from "../../context/LanguageContext";

export default function ClubSummaryCards({ clubs = [], totalMembers = 0, upcomingEventsCount = 0 }) {
  const { t } = useLanguage();
  const cards = [
    {
      title: t("clubs.clubsManaged", { fallback: "Clubs Managed" }),
      value: clubs.length,
      icon: Compass,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      description: t("clubs.clubsManagedDesc", { fallback: "Active co-curricular charges" })
    },
    {
      title: t("clubs.activeMembers", { fallback: "Active Members" }),
      value: totalMembers,
      icon: Users,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description: t("clubs.activeMembersDesc", { fallback: "Students enrolled" })
    },
    {
      title: t("clubs.upcomingEvents", { fallback: "Upcoming Events" }),
      value: upcomingEventsCount,
      icon: Calendar,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      description: t("clubs.upcomingEventsDesc", { fallback: "Co-curricular plans" })
    },
    {
      title: t("clubs.allowedClasses", { fallback: "Allowed Classes" }),
      value: "11 (All Sections)",
      icon: Award,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      description: t("clubs.allowedClassesDesc", { fallback: "Institutional eligibility scope" })
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <MainCard key={idx} className="p-5 flex items-center justify-between border hover:shadow-md transition-all duration-300">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{card.title}</p>
              <h3 className="text-2xl font-black text-[#03045e] mb-0.5">{card.value}</h3>
              <p className="text-[10px] text-gray-500 font-medium">{card.description}</p>
            </div>
            <div className={`p-3.5 rounded-2xl border ${card.color} flex-shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
          </MainCard>
        );
      })}
    </div>
  );
}
