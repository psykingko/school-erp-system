import React from "react";
import MainCard from "../../MainCard";
import { Calendar, Tag } from "lucide-react";

/**
 * CalendarEventCard
 * 
 * Reusable panel presenting dates, event descriptions, and category tags.
 */
const CalendarEventCard = ({ 
  title, 
  dateStr, 
  category = "Academic", 
  description,
  type = "standard",
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  const styles = {
    holiday: "border-rose-100 bg-rose-50/10 text-rose-600",
    exam: "border-amber-100 bg-amber-50/10 text-amber-600",
    competition: "border-blue-100 bg-blue-50/10 text-[#0077b6]",
    standard: "border-[#caf0f8]/50 bg-white text-gray-700"
  };

  const activeStyle = styles[type.toLowerCase()] || styles.standard;

  return (
    <MainCard 
      className={`p-4 border shadow-sm flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 ${
        isHovered ? "bg-[#03045e] text-white scale-[1.02] z-10 shadow-lg border-transparent" : activeStyle
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 transition-colors ${isHovered ? "bg-white/10 border border-white/20" : "bg-gray-50 border border-gray-150"}`}>
          <Calendar size={14} className={isHovered ? "text-white" : "text-[#03045e]"} />
        </div>
        <div>
          <span className={`block text-[8px] font-black uppercase tracking-wider ${isHovered ? "text-white/60" : "text-gray-400"}`}>
            {category} Event
          </span>
          <h4 className={`text-xs font-black tracking-tight mt-0.5 ${isHovered ? "text-white" : "text-[#03045e]"}`}>
            {title}
          </h4>
          <p className={`text-[10px] font-semibold mt-1 ${isHovered ? "text-white/80" : "text-gray-500"}`}>
            {description}
          </p>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <span className={`block text-xs font-black ${isHovered ? "text-white" : "text-[#0077b6]"}`}>
          {dateStr}
        </span>
        <span className={`inline-block mt-1 text-[8px] font-bold uppercase tracking-widest ${isHovered ? "text-white/40" : "text-gray-400"}`}>
          TERM-I
        </span>
      </div>
    </MainCard>
  );
};

export default React.memo(CalendarEventCard);
