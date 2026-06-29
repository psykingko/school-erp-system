import React, { useState } from "react";
import { X, Calendar, Clock, MapPin, AlignLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function CreateEventModal({ isOpen, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !eventDate || !time || !location) {
      setErrorMsg(t("clubs.fillRequired", { fallback: "Please fill out all required fields." }));
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      await onSubmit({ title, description, eventDate, time, location });
      // Reset form
      setTitle("");
      setDescription("");
      setEventDate("");
      setTime("");
      setLocation("");
      onClose();
    } catch (err) {
      setErrorMsg(err.message || t("clubs.scheduleFailed", { fallback: "Failed to schedule event." }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#03045e]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full w-[95vw] md:w-[90vw] lg:max-w-md overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h3 className="font-black text-sm uppercase tracking-wider">{t("clubs.scheduleClubEvent", { fallback: "Schedule Club Event" })}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-black text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase">{t("clubs.eventTitleLabel", { fallback: "Event Title *" })}</label>
            <input
              type="text"
              required
              placeholder={t("clubs.eventTitlePlaceholder", { fallback: "e.g. Robotics Hackathon or Poetry Slam" })}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 p-2.5 rounded-xl focus:outline-none focus:border-blue-300 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase">{t("clubs.descriptionDetails", { fallback: "Description / Details" })}</label>
            <textarea
              placeholder={t("clubs.descriptionPlaceholder", { fallback: "Provide a short brief of the event plans..." })}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 p-2.5 rounded-xl focus:outline-none focus:border-blue-300 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase">{t("common.date", { fallback: "Date" })} *</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 p-2.5 rounded-xl focus:outline-none focus:border-blue-300 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase">{t("common.time", { fallback: "Time" })} *</label>
              <input
                type="text"
                required
                placeholder={t("clubs.timePlaceholder", { fallback: "e.g. 10:30 AM" })}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 p-2.5 rounded-xl focus:outline-none focus:border-blue-300 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase">{t("clubs.venueLocation", { fallback: "Venue / Location *" })}</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder={t("clubs.venuePlaceholder", { fallback: "e.g. Physics Lab 1 or Seminar Hall B" })}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 pl-9 pr-3 p-2.5 rounded-xl focus:outline-none focus:border-blue-300 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[10px] font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
            >
              {t("common.cancel", { fallback: "Cancel" })}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#03045e] hover:bg-[#0077b6] text-white disabled:opacity-50 text-[10px] font-black rounded-xl uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
            >
              {submitting ? t("clubs.scheduling", { fallback: "Scheduling..." }) : t("clubs.scheduleEventBtn", { fallback: "Schedule Event" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
