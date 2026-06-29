import React, { useState, forwardRef } from "react";
import { Trash2, Pin, Calendar, Users, Layers, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

const UpdateCard = forwardRef(({ update, onDelete }, ref) => {
  const { t } = useLanguage();
  const [pinned, setPinned] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Category Colors Map
  const CATEGORY_STYLES = {
    HOMEWORK: "bg-emerald-50 text-emerald-700 border-emerald-100",
    EXAM: "bg-indigo-50 text-indigo-700 border-indigo-100",
    REMINDER: "bg-sky-50 text-sky-700 border-sky-100",
    MENTOR: "bg-purple-50 text-purple-700 border-purple-100",
    CLASS_NOTICE: "bg-slate-50 text-slate-700 border-slate-100",
    PARENT_MEETING: "bg-amber-50 text-amber-700 border-amber-100"
  };

  // Priority Styles Map
  const PRIORITY_STYLES = {
    LOW: "bg-gray-50 text-gray-500 border-gray-200",
    NORMAL: "bg-blue-50 text-blue-600 border-blue-200",
    IMPORTANT: "bg-rose-50 text-rose-600 border-rose-200 shadow-sm shadow-rose-50"
  };

  const getFormattedDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      whileHover={{ y: -2 }}
      className={`bg-white p-5 rounded-[2rem] border transition-all duration-200 relative ${
        pinned ? "border-indigo-300 ring-2 ring-indigo-50" : "border-gray-100 shadow-sm"
      }`}
    >
      {/* Pin Badge Overlay */}
      {pinned && (
        <span className="absolute top-4 right-14 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
          <Pin className="w-3.5 h-3.5 fill-indigo-600" />
        </span>
      )}

      {/* Top Meta info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {/* Category Badge */}
          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
            CATEGORY_STYLES[update.category] || CATEGORY_STYLES.CLASS_NOTICE
          }`}>
            {update.category.replace("_", " ")}
          </span>

          {/* Priority Badge */}
          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
            PRIORITY_STYLES[update.priority] || PRIORITY_STYLES.NORMAL
          }`}>
            {update.priority}
          </span>
        </div>

        {/* Date Published */}
        <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{getFormattedDate(update.createdAt)}</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-black text-[#03045e] leading-snug">
        {update.title}
      </h4>

      {/* Class & Subject Relational info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 mb-3 border-b border-gray-50 pb-2.5">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>{t("updates.class", { fallback: "Class:" })} {update.className}</span>
        </span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{t("updates.subject", { fallback: "Subject:" })} {update.subjectName}</span>
        </span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>{t("updates.scope", { fallback: "Scope:" })} {update.visibility.join(" & ")}</span>
        </span>
      </div>

      {/* Message Content */}
      <p className="text-xs font-bold text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
        {update.message}
      </p>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-50">
        {/* Toggle Pin Button */}
        <button
          onClick={() => setPinned(!pinned)}
          className={`p-2 rounded-xl border transition-colors ${
            pinned 
              ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
              : "border-gray-100 hover:bg-gray-50 text-gray-400"
          }`}
          title={pinned ? "Unpin update" : "Pin update to top"}
        >
          <Pin className={`w-3.5 h-3.5 ${pinned ? "fill-indigo-600" : ""}`} />
        </button>

        {/* Delete update */}
        {onDelete && (
          <div className="relative flex items-center">
            {confirmDelete ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <button
                  onClick={() => {
                    onDelete(update.id);
                    setConfirmDelete(false);
                  }}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm"
                >
                  {t("common.confirm", { fallback: "Confirm" })}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[9px] font-black uppercase tracking-wider"
                >
                  {t("common.cancel", { fallback: "Cancel" })}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 border border-gray-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-gray-400 rounded-xl transition-colors"
                title="Delete update"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

UpdateCard.displayName = "UpdateCard";

export default UpdateCard;
