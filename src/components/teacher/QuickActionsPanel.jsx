import React from "react";
import { CheckSquare, CalendarDays, ClipboardList, Megaphone, UserCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import MainCard from "../MainCard";
import { useLanguage } from "../../context/LanguageContext";

export default function QuickActionsPanel() {
  const { t } = useLanguage();
  const actions = [
    {
      titleKey: "teacherDashboard.rollCall",
      titleFallback: "Roll Call",
      descriptionKey: "teacherDashboard.rollCallDesc",
      descriptionFallback: "Mark daily class attendance",
      icon: CheckSquare,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      link: "/teacher/attendance"
    },
    {
      titleKey: "teacherDashboard.leaveReviews",
      titleFallback: "Leave Reviews",
      descriptionKey: "teacherDashboard.leaveReviewsDesc",
      descriptionFallback: "Approve or reject student leaves",
      icon: CalendarDays,
      color: "bg-rose-50 text-rose-600 border-rose-100",
      link: "/teacher/leave"
    },
    {
      titleKey: "teacherDashboard.gradeHomework",
      titleFallback: "Grade Homework",
      descriptionKey: "teacherDashboard.gradeHomeworkDesc",
      descriptionFallback: "Evaluate submissions and scores",
      icon: ClipboardList,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      link: "/teacher/assignments"
    },
    {
      titleKey: "teacherDashboard.classAdvisory",
      titleFallback: "Class Advisory",
      descriptionKey: "teacherDashboard.classAdvisoryDesc",
      descriptionFallback: "Post homework and notices",
      icon: Megaphone,
      color: "bg-[#caf0f8] text-[#0077b6] border-blue-100",
      link: "/teacher/updates"
    },
    {
      titleKey: "teacherDashboard.mentorSupport",
      titleFallback: "Mentor Support",
      descriptionKey: "teacherDashboard.mentorSupportDesc",
      descriptionFallback: "Answer mentorship requests",
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      link: "/teacher/mentorship"
    }
  ];

  return (
    <MainCard className="p-6">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-5">
        <Sparkles className="w-4.5 h-4.5 text-[#00b4d8]" />
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
          {t("teacherDashboard.quickShortcuts", { fallback: "Quick Workflow Shortcuts" })}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-5 gap-4">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link 
              key={idx}
              to={act.link}
              className="p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md hover:bg-blue-50/5 text-center flex flex-col items-center justify-center transition-all duration-300 group"
            >
              <div className={`p-3 rounded-2xl border ${act.color} flex-shrink-0 transition-transform group-hover:scale-110 duration-300 mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-[#03045e] leading-tight mb-1">{t(act.titleKey, { fallback: act.titleFallback })}</h4>
              <p className="text-[9px] font-bold text-gray-400 leading-snug">{t(act.descriptionKey, { fallback: act.descriptionFallback })}</p>
            </Link>
          );
        })}
      </div>
    </MainCard>
  );
}
