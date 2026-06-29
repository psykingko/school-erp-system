import React, { useState, useMemo } from "react";
import UpdateCard from "./UpdateCard";
import { Search, SlidersHorizontal, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

export default function UpdateFeed({ updates, onDeleteUpdate }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");

  const filteredUpdates = useMemo(() => {
    return updates.filter(upd => {
      const matchesSearch = 
        upd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        upd.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (upd.className && upd.className.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (upd.subjectName && upd.subjectName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "ALL" || upd.category === selectedCategory;
      const matchesPriority = selectedPriority === "ALL" || upd.priority === selectedPriority;

      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [updates, searchQuery, selectedCategory, selectedPriority]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder={t("updates.searchPlaceholder", { fallback: "Search circulars by keyword..." })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none focus:border-indigo-200 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 px-2.5 py-1.5 rounded-lg border border-gray-100">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t("updates.filters", { fallback: "Filters" })}</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-[10px] cursor-pointer focus:outline-none focus:border-indigo-100"
          >
            <option value="ALL">{t("updates.allCategories", { fallback: "All Categories" })}</option>
            <option value="HOMEWORK">{t("updates.catHomework", { fallback: "Homework Reminder" })}</option>
            <option value="EXAM">{t("updates.catExam", { fallback: "Exam / Assessment Notice" })}</option>
            <option value="REMINDER">{t("updates.catReminder", { fallback: "General Reminder" })}</option>
            <option value="MENTOR">{t("updates.catMentor", { fallback: "Mentor support Alert" })}</option>
            <option value="CLASS_NOTICE">{t("updates.catClassNotice", { fallback: "Classroom Announcement" })}</option>
            <option value="PARENT_MEETING">{t("updates.catParentMeeting", { fallback: "Parent Meeting Circular" })}</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-[10px] cursor-pointer focus:outline-none focus:border-indigo-100"
          >
            <option value="ALL">{t("updates.allPriorities", { fallback: "All Priorities" })}</option>
            <option value="LOW">{t("updates.priorityLow", { fallback: "Low" })}</option>
            <option value="NORMAL">{t("updates.priorityNormal", { fallback: "Normal" })}</option>
            <option value="IMPORTANT">{t("updates.priorityImportant", { fallback: "Important" })}</option>
          </select>
        </div>
      </div>

      {/* Updates Grid */}
      {filteredUpdates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[2rem] border border-gray-100 shadow-sm">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 font-bold">{t("updates.noUpdatesMatch", { fallback: "No active updates match your search criteria." })}</p>
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6" layout>
          <AnimatePresence mode="popLayout">
            {filteredUpdates.map(upd => (
              <UpdateCard
                key={upd.id}
                update={upd}
                onDelete={onDeleteUpdate}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
