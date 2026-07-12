import React from 'react';
import MainCard from "../MainCard";
import { useLanguage } from "../../context/LanguageContext";

const ProgressCard = ({ icon: Icon, title, value, progress, colorClass = "blue", className = "" }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', fill: 'from-[#0077b6] to-[#00b4d8]' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', fill: 'from-emerald-400 to-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', fill: 'from-amber-400 to-amber-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', fill: 'from-rose-400 to-rose-500' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600', fill: 'from-gray-400 to-gray-500' },
  };

  const colors = colorMap[colorClass] || colorMap.blue;
  const { t } = useLanguage();

  return (
    <MainCard className={`p-5 flex flex-col justify-center gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
            <Icon size={24} />
          </div>
        )}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-black text-[#03045e]">{value}</p>
        </div>
      </div>
      
      {progress !== undefined && (
        <div className="w-full mt-auto">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            <span>{t("common.progress")}</span>
            <span className="text-[#03045e]">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colors.fill} rounded-full transition-all duration-1000`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </MainCard>
  );
};

export default ProgressCard;
