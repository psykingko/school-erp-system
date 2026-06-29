import React from "react";
import { Users, ClipboardCheck, MessageSquare, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

export default function MentorshipSummaryCards({ summary }) {
  const { t } = useLanguage();

  const cards = [
    {
      title: t("mentorSupport.studentsCountTitle", { fallback: "Students Under Mentorship" }),
      value: summary?.studentsCount || 0,
      subtext: t("mentorSupport.studentsCountSub", { fallback: "Class Homeroom Assigned" }),
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      color: "bg-indigo-50/60 border-indigo-100/50 text-indigo-900"
    },
    {
      title: t("mentorSupport.activeFollowUpsTitle", { fallback: "Active Follow-Ups" }),
      value: summary?.activeFollowUps || 0,
      subtext: t("mentorSupport.activeFollowUpsSub", { fallback: "Observation tasks pending" }),
      icon: <ClipboardCheck className="w-5 h-5 text-rose-500" />,
      color: "bg-rose-50/60 border-rose-100/50 text-rose-900",
      alert: (summary?.activeFollowUps || 0) > 0
    },
    {
      title: t("mentorSupport.parentConsultationsTitle", { fallback: "Parent Consultations" }),
      value: summary?.parentInteractionsCount || 0,
      subtext: t("mentorSupport.parentConsultationsSub", { fallback: "Logged parent meetings" }),
      icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
      color: "bg-emerald-50/60 border-emerald-100/50 text-emerald-900"
    },
    {
      title: t("mentorSupport.academicConcernsTitle", { fallback: "Academic Concerns" }),
      value: summary?.academicConcernsCount || 0,
      subtext: t("mentorSupport.academicConcernsSub", { fallback: "High-priority subject alarms" }),
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      color: "bg-amber-50/60 border-amber-100/50 text-amber-900"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className={`p-6 rounded-[2rem] border shadow-sm transition-all duration-300 ${card.color}`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50">
              {card.icon}
            </div>
            {card.alert && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </div>
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            {card.title}
          </h4>
          <div className="text-3xl font-black">{card.value}</div>
          <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
            {card.subtext}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
