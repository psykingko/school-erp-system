import React, { useState } from "react";
import MainCard from "./MainCard";
import { motion } from "framer-motion";
import { ClipboardList, AlertCircle, FileCheck, ExternalLink } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

function AssignmentsSummaryCard({
  pendingCount,
  overdueCount,
  completionRate,
  onViewAll,
  index = 0,
}) {
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);

  return (
    <>
      <MainCard
        custom={index}
        variants={cardVariants}
        className="h-full p-6 flex flex-col gap-5 relative overflow-hidden"
      >
        <HelperButton onClick={() => setShowHelper(true)} className="absolute top-4 right-4" />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0077b6]">
            <ClipboardList size={28} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#03045e] leading-tight">
              {t("assignments.title", { fallback: "Assignments" })}
            </h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {t("assignments.academicWorkflow", { fallback: "Academic Workflow" })}
            </span>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t("assignments.weeklyCompletion", { fallback: "Weekly Completion" })}
            </span>
            <span className="text-2xl font-black text-[#00b4d8]">
              {completionRate}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#00b4d8]"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-rose-50 p-4 rounded-[1.5rem] border border-rose-100/50">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-rose-500" />
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{t("assignments.overdue", { fallback: "Overdue" })}</span>
            </div>
            <p className="text-xl font-black text-[#03045e]">{overdueCount}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-[1.5rem] border border-emerald-100/50">
            <div className="flex items-center gap-2 mb-1">
              <FileCheck size={14} className="text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{t("assignments.pending", { fallback: "Pending" })}</span>
            </div>
            <p className="text-xl font-black text-[#03045e]">{pendingCount}</p>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewAll}
          className="mt-auto flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl px-6 py-4 bg-[#03045e] shadow-xl shadow-[#03045e]/20 transition-all"
        >
          <span>{t("assignments.openAssignmentsPage", { fallback: "Open Assignments Page" })}</span>
          <ExternalLink size={16} />
        </motion.button>
      </MainCard>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="assignments.summaryCardHelper"
        contentEn="This card provides a quick overview of your current academic assignments. Track your weekly completion rate, see overdue tasks, and pending submissions at a glance."
        contentHi="यह कार्ड आपके वर्तमान शैक्षणिक असाइनमेंट का त्वरित विवरण प्रदान करता है। अपनी साप्ताहिक पूर्णता दर को ट्रैक करें, अतिदेय कार्यों को देखें, और लंबित सबमिशन को एक नज़र में देखें।"
      />
    </>
  );
}

export default React.memo(AssignmentsSummaryCard);
