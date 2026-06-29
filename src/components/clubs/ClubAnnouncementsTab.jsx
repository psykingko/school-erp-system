import React, { useState } from "react";
import { Megaphone, Send, Clock, Sparkles, Pin, Archive } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ClubAnnouncementsTab({ announcements = [], onPostAnnouncement, onArchiveAnnouncement, isReadOnly }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const categories = [
    "General", "Notice", "Meeting", "Competition", 
    "Practice Session", "Event Reminder", "Achievement", "Registration"
  ];

  const getCategoryColor = (cat) => {
    switch(cat) {
      case "Meeting": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Competition": return "bg-purple-50 text-purple-600 border-purple-100";
      case "Practice Session": return "bg-orange-50 text-orange-600 border-orange-100";
      case "Achievement": return "bg-green-50 text-green-600 border-green-100";
      case "Registration": return "bg-cyan-50 text-cyan-600 border-cyan-100";
      case "Notice": return "bg-rose-50 text-rose-600 border-rose-100";
      case "Event Reminder": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !category) {
      setErrorMsg(t("clubs.fillAllFields", { fallback: "Please fill out all fields." }));
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      await onPostAnnouncement({ title, content, category, isPinned });
      setTitle("");
      setContent("");
      setCategory("General");
      setIsPinned(false);
    } catch (err) {
      setErrorMsg(err.message || t("clubs.publishFailed", { fallback: "Failed to publish announcement." }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
        <Megaphone className="w-4 h-4 text-[#00b4d8]" />
        <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
          {t("clubs.announcementsFeed", { fallback: "Club Announcements Feed" })}
        </h4>
      </div>

      {/* Post a New Announcement Form (Only visible to coordinators) */}
      {!isReadOnly && onPostAnnouncement && (
        <form onSubmit={handlePostSubmit} className="space-y-3 p-5 md:p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">{t("clubs.postAnnouncement", { fallback: "Post Announcement" })}</span>
          </div>

          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-[9px] font-black text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder={t("clubs.announcementTitlePlaceholder", { fallback: "Announcement title..." })}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-100 p-2 rounded-lg focus:outline-none focus:border-blue-300 transition-colors"
            />
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-100 p-2 rounded-lg focus:outline-none focus:border-blue-300 transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <textarea
              required
              placeholder={t("clubs.announcementContentPlaceholder", { fallback: "Type your announcement content here..." })}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
              className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-100 p-2 rounded-lg focus:outline-none focus:border-blue-300 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-gray-300 text-[#03045e] focus:ring-[#00b4d8]"
              />
              <span className="text-[10px] font-black text-gray-600 uppercase flex items-center gap-1">
                <Pin size={10} className={isPinned ? "text-[#00b4d8]" : "text-gray-400"} />
                {t("clubs.pinAnnouncement", { fallback: "Pin Announcement" })}
              </span>
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1 text-[9px] font-black bg-[#03045e] hover:bg-[#0077b6] text-white disabled:opacity-50 px-3.5 py-1.5 rounded-lg shadow-sm transition-all uppercase tracking-widest"
            >
              <Send className="w-2.5 h-2.5" />
              {submitting ? t("clubs.publishing", { fallback: "Publishing..." }) : t("clubs.publishBtn", { fallback: "Publish" })}
            </button>
          </div>
        </form>
      )}

      {/* Feed List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-6 text-xs font-bold text-gray-400 italic">
            {t("clubs.noAnnouncements", { fallback: "No announcements published yet." })}
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.announcementId} className={`p-5 md:p-6 rounded-xl border transition-colors relative ${ann.isPinned ? "bg-amber-50/30 border-amber-100" : "bg-white border-gray-100 hover:bg-gray-50/30"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${getCategoryColor(ann.category)}`}>
                    {ann.category}
                  </span>
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase bg-amber-100 px-1.5 py-0.5 rounded">
                      <Pin size={10} /> {t("clubs.pinned", { fallback: "Pinned" })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] text-gray-400 font-bold flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(ann.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {!isReadOnly && onArchiveAnnouncement && (
                    <button
                      onClick={() => onArchiveAnnouncement(ann.announcementId)}
                      className="text-[9px] font-black text-rose-500 hover:text-rose-700 uppercase"
                      title="Archive Announcement"
                    >
                      <Archive size={12} />
                    </button>
                  )}
                </div>
              </div>
              <h5 className="font-black text-xs text-[#03045e] mb-1">{ann.title}</h5>
              <p className="text-xs text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{ann.content}</p>
              <div className="mt-2 text-[9px] font-bold text-gray-400">
                {t("clubs.postedBy", { fallback: "Posted by: " })}{ann.createdByTeacherName || t("clubs.coordinator", { fallback: "Coordinator" })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
