import React from "react";
import { ShieldAlert, AlertTriangle, Info, BellRing, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import MainCard from "../MainCard";
import { useLanguage } from "../../context/LanguageContext";

export default function TeacherActionCenter({ actionItems = [] }) {
  const { t } = useLanguage();
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "HIGH":
        return {
          bg: "bg-rose-50/70 border-rose-100 text-rose-700",
          badge: "bg-rose-500 text-white",
          icon: ShieldAlert,
          accent: "text-rose-500"
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-50/70 border-amber-100 text-amber-700",
          badge: "bg-amber-500 text-white",
          icon: AlertTriangle,
          accent: "text-amber-500"
        };
      case "LOW":
      default:
        return {
          bg: "bg-blue-50/70 border-blue-100 text-blue-700",
          badge: "bg-blue-500 text-white",
          icon: Info,
          accent: "text-blue-500"
        };
    }
  };

  return (
    <MainCard className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
          <BellRing className="w-4.5 h-4.5 text-rose-500 animate-bounce" />
          {t("teacherDashboard.actionCenterTitle", { fallback: "Teacher Operations Action Center" })}
        </h3>
        <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg uppercase tracking-tighter">
          {actionItems.length} {t("teacherDashboard.urgentTasks", { fallback: "Urgent Tasks" })}
        </span>
      </div>

      <div className="flex-1 space-y-4">
        {actionItems.length === 0 ? (
          <div className="text-center py-12 text-xs font-bold text-emerald-600 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-100/50 italic">
            {t("teacherDashboard.allCaughtUp", { fallback: "🎉 All daily teacher operations and approvals are fully up to date!" })}
          </div>
        ) : (
          actionItems.map((item) => {
            const style = getSeverityStyle(item.severity);
            const IconObj = style.icon;

            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-transform hover:translate-x-1 duration-200 ${style.bg}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-white border border-gray-100/10 ${style.accent} flex-shrink-0 shadow-sm`}>
                    <IconObj className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-white/60 px-2 py-0.5 rounded-md border border-gray-100/10">
                      {item.type}
                    </span>
                    <p className="text-xs font-bold text-gray-700 leading-snug mt-1">{item.message}</p>
                  </div>
                </div>

                <Link
                  to={item.link}
                  className="inline-flex items-center gap-1 text-[9px] font-black bg-white hover:bg-gray-50 text-[#03045e] border border-gray-100/40 shadow-sm hover:shadow px-3 py-1.5 rounded-xl transition-all uppercase tracking-widest flex-shrink-0"
                >
                  <span>{item.actionLabel ? t(`teacherDashboard.${item.actionLabel}`, { fallback: item.actionLabel }) : t("teacherDashboard.resolve", { fallback: "Resolve" })}</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </MainCard>
  );
}
