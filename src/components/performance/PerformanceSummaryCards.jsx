import React from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, FileWarning, ShieldAlert } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function PerformanceSummaryCards({ stats }) {
  const {
    totalMonitored = 0,
    lowAttendanceCount = 0,
    pendingAssignmentsCount = 0,
    alertsCount = 0
  } = stats || {};
  const { t } = useLanguage();

  const cards = [
    {
      title: t("perf.monitored"),
      value: totalMonitored,
      subtext: t("perf.rosterSize"),
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      bgColor: "bg-indigo-50/60 border-indigo-100/50 text-indigo-900"
    },
    {
      title: t("perf.lowAttendance"),
      value: lowAttendanceCount,
      subtext: t("perf.belowThreshold"),
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      bgColor: "bg-rose-50/60 border-rose-100/50 text-rose-900",
      alert: lowAttendanceCount > 0
    },
    {
      title: t("perf.overdueAssignments"),
      value: pendingAssignmentsCount,
      subtext: t("perf.unsubmitted"),
      icon: <FileWarning className="w-5 h-5 text-amber-500" />,
      bgColor: "bg-amber-50/60 border-amber-100/50 text-amber-900",
      alert: pendingAssignmentsCount > 0
    },
    {
      title: t("perf.academicConcerns"),
      value: alertsCount,
      subtext: t("perf.criticalFlag"),
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      bgColor: "bg-red-50/60 border-red-100/50 text-red-900",
      alert: alertsCount > 0
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
          className={`p-6 rounded-[2rem] border shadow-sm transition-all duration-300 ${card.bgColor}`}
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
