import React from "react";
import MainCard from "../../MainCard";
import { Award, ShieldAlert, Edit2, Trash2 } from "lucide-react";

/**
 * AchievementCard
 * 
 * Reusable panel presenting student honors, medals, and academic certificates.
 */
const AchievementCard = ({ 
  title, 
  studentName, 
  category = "Co-Curricular", 
  rank = "Gold Medal", 
  description,
  date,
  onEdit,
  onDelete
}) => {
  return (
    <MainCard className="p-5 hover:shadow-md transition-shadow bg-white border border-[#caf0f8]/50 shadow-sm relative flex flex-col justify-between group">
      <div className="absolute top-0 right-0 p-3 flex gap-2">
        {onEdit && (
          <button 
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-[#0077b6] hover:bg-[#caf0f8]/50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Edit Achievement"
          >
            <Edit2 size={12} />
          </button>
        )}
        {onDelete && (
          <button 
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Achievement"
          >
            <Trash2 size={12} />
          </button>
        )}
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
          rank.toLowerCase().includes("gold") ? "bg-amber-50 text-amber-600 border border-amber-100" :
          rank.toLowerCase().includes("silver") ? "bg-gray-50 text-gray-500 border border-gray-100" :
          "bg-blue-50 text-[#0077b6] border border-blue-100"
        }`}>
          {rank}
        </span>
      </div>

      <div>
        <span className="block text-[8px] font-black uppercase text-gray-400 tracking-wider">
          {category} Honor
        </span>
        
        <h3 className="text-xs font-black text-[#03045e] tracking-tight mt-1 pr-16 truncate">
          {title}
        </h3>
        
        <p className="text-[10px] font-bold text-gray-700 mt-2">
          Awarded to: <strong className="text-[#0077b6]">{studentName}</strong>
        </p>

        <p className="text-[10px] font-semibold text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      <div className="mt-4 border-t border-[#caf0f8]/50 pt-3 flex items-center justify-between text-[9px] font-black text-gray-400">
        <span>Verified by Admin</span>
        <span>{date}</span>
      </div>
    </MainCard>
  );
};

export default React.memo(AchievementCard);
