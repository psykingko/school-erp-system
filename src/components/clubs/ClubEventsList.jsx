import React from "react";
import { Calendar, Clock, MapPin, Plus, CheckCircle, HelpCircle } from "lucide-react";

export default function ClubEventsList({ events = [], onOpenScheduleModal }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
        <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-500" />
          Scheduled Co-Curricular Events
        </h4>
        {onOpenScheduleModal && (
          <button
            onClick={onOpenScheduleModal}
            className="inline-flex items-center gap-1 text-[9px] font-black bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl border border-blue-100 transition-all uppercase tracking-tighter"
          >
            <Plus className="w-3 h-3" />
            Schedule Event
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-xs font-bold text-gray-400 italic">
          {onOpenScheduleModal 
            ? "No events scheduled for this club yet. Click \"Schedule Event\" to plan one!"
            : "No events scheduled for this club yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((evt) => (
            <div 
              key={evt.id} 
              className="p-4 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/10 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h5 className="font-black text-xs text-[#03045e]">{evt.title}</h5>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">{evt.description}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  evt.status === "Upcoming"
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}>
                  {evt.status === "Upcoming" ? <HelpCircle className="w-2.5 h-2.5" /> : <CheckCircle className="w-2.5 h-2.5" />}
                  {evt.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50/50 mt-2 text-[10px] font-bold text-gray-500">
                <div className="flex items-center gap-1 truncate">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="truncate">{evt.date}</span>
                </div>
                <div className="flex items-center gap-1 truncate">
                  <Clock size={12} className="text-gray-400" />
                  <span className="truncate">{evt.time}</span>
                </div>
                <div className="flex items-center gap-1 truncate">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="truncate">{evt.venue || evt.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
