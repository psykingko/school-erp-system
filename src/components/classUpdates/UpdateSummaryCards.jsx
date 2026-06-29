import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, AlertCircle, ClipboardList, ShieldAlert } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function UpdateSummaryCards({ updates }) {
  const { t } = useLanguage();
  const totalActive = updates.length;
  const highPriority = updates.filter(u => u.priority === "IMPORTANT").length;
  const homeworkReminders = updates.filter(u => u.category === "HOMEWORK").length;
  const parentAlerts = updates.filter(u => u.visibility.includes("PARENT")).length;

  const cards = [
    {
      title: t("updates.totalPublished", { fallback: "Total Published" }),
      value: totalActive,
      subtext: t("updates.activeAnnouncements", { fallback: "Active announcements" }),
      icon: <MessageSquare className="w-5 h-5 text-indigo-500" />,
      color: "bg-indigo-50/60 border-indigo-100/50 text-indigo-900"
    },
    {
      title: t("updates.urgentAlerts", { fallback: "Urgent Alerts" }),
      value: highPriority,
      subtext: t("updates.highPriorityFlags", { fallback: "High priority flags" }),
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      color: "bg-rose-50/60 border-rose-100/50 text-rose-900",
      alert: highPriority > 0
    },
    {
      title: t("updates.homeworkTasks", { fallback: "Homework Tasks" }),
      value: homeworkReminders,
      subtext: t("updates.notebooksWorksheets", { fallback: "Notebooks & worksheets" }),
      icon: <ClipboardList className="w-5 h-5 text-emerald-500" />,
      color: "bg-emerald-50/60 border-emerald-100/50 text-emerald-900"
    },
    {
      title: t("updates.parentCommunications", { fallback: "Parent Communications" }),
      value: parentAlerts,
      subtext: t("updates.visibleToGuardians", { fallback: "Visible to guardians" }),
      icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
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
