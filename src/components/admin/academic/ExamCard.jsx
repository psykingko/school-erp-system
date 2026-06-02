import React from "react";
import MainCard from "../../MainCard";
import { Calendar, Clock, Award, ShieldAlert } from "lucide-react";

/**
 * ExamCard
 * 
 * Reusable panel presenting examination schedules, terms, and subject details.
 */
const ExamCard = ({ 
  title, 
  term, 
  subject, 
  date, 
  time, 
  maxMarks = 100, 
  room,
  className = "Class 11-A" 
}) => {
  return (
    <MainCard className="p-5 hover:shadow-md transition-shadow bg-white border border-[#caf0f8]/50 shadow-sm relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-3">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 uppercase tracking-wider">
          {term}
        </span>
      </div>

      <div>
        <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">
          {className}
        </span>
        <h3 className="text-sm font-black text-[#03045e] tracking-tight mt-1 truncate">
          {title}
        </h3>
        
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Calendar size={13} className="text-[#00b4d8]" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Clock size={13} className="text-[#00b4d8]" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <Award size={13} className="text-gray-400" />
            <span>Max Marks: <strong className="text-[#03045e]">{maxMarks}</strong></span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-[#caf0f8]/50 pt-3 flex items-center justify-between text-[10px] font-black text-[#03045e]">
        <span>Subject: <strong className="text-[#0077b6]">{subject}</strong></span>
        <span className="text-gray-400 font-bold">Room: {room || "Main Hall"}</span>
      </div>
    </MainCard>
  );
};

export default React.memo(ExamCard);
