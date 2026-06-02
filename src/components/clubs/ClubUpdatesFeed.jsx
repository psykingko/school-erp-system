import React, { useState } from "react";
import { Megaphone, Send, Clock, Sparkles } from "lucide-react";

export default function ClubUpdatesFeed({ updates = [], onPostUpdate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setErrorMsg("Please enter both a title and message.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      await onPostUpdate({ title, content });
      setTitle("");
      setContent("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to publish update.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
        <Megaphone className="w-4 h-4 text-[#00b4d8]" />
        <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
          Club-Scoped Advisory Feed
        </h4>
      </div>

      {/* Post a New Update Form (Only visible to teachers) */}
      {onPostUpdate && (
        <form onSubmit={handlePostSubmit} className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">Post Co-Curricular Update</span>
          </div>

          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-[9px] font-black text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <input
              type="text"
              required
              placeholder="Announcements title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-100 p-2 rounded-lg focus:outline-none focus:border-blue-300 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <textarea
              required
              placeholder="Type meeting reminders, instructions, or competition preparation notices here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
              className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-100 p-2 rounded-lg focus:outline-none focus:border-blue-300 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1 text-[9px] font-black bg-[#03045e] hover:bg-[#0077b6] text-white disabled:opacity-50 px-3.5 py-1.5 rounded-lg shadow-sm transition-all uppercase tracking-widest"
            >
              <Send className="w-2.5 h-2.5" />
              {submitting ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      )}

      {/* Feed List */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-6 text-xs font-bold text-gray-400 italic">
            No advisory updates published inside this club yet.
          </div>
        ) : (
          updates.map((upd) => (
            <div key={upd.id} className="p-4 rounded-xl border border-gray-50 hover:bg-gray-50/10 transition-colors relative">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-black text-xs text-gray-800">{upd.title}</h5>
                <span className="text-[8px] text-gray-400 font-bold flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(upd.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{upd.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
