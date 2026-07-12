import React from "react";
import { useLanguage } from "../../context/LanguageContext";

export default function PerformanceStatusBadge({ status }) {
  const { t } = useLanguage();
  let badgeStyles = "";

  switch (status) {
    case "Excellent":
      badgeStyles = "bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100/50";
      break;
    case "Good":
      badgeStyles = "bg-sky-50 text-sky-700 border-sky-200/50 hover:bg-sky-100/50";
      break;
    case "Warning":
      badgeStyles = "bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-100/50";
      break;
    case "At Risk":
      badgeStyles = "bg-rose-50 text-rose-700 border-rose-200/50 hover:bg-rose-100/50 shadow-sm shadow-rose-100/30";
      break;
    default:
      badgeStyles = "bg-gray-50 text-gray-700 border-gray-200";
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 text-[11px] font-black tracking-wider uppercase border rounded-full transition-all duration-300 ${badgeStyles}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === "Excellent" ? "bg-emerald-500" :
        status === "Good" ? "bg-sky-500" :
        status === "Warning" ? "bg-amber-500" : "bg-rose-500"
      }`}></span>
      {t(`status.${status}`, { fallback: status })}
    </span>
  );
}
