import React from "react";
import { LayoutDashboard, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../../context/LanguageContext";

const tabs = [
  { id: "overview", label: "teacherExams.tab.overview", icon: LayoutDashboard },
  { id: "marks", label: "teacherExams.tab.marks", icon: CheckSquare },
];

const TeacherExaminationNav = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
              ${isActive 
                ? "text-white" 
                : "text-gray-500 hover:bg-gray-50 hover:text-[#03045e]"}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="teacherExamTab"
                className="absolute inset-0 bg-gradient-to-r from-[#03045e] to-[#0077b6] rounded-xl shadow-md"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon size={18} className={`relative z-10 ${isActive ? "text-white" : ""}`} />
            <span className="relative z-10">{t(tab.label)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TeacherExaminationNav;
