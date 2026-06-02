import React, { useState, useMemo } from "react";
import { Calendar, Clock, MapPin, User, BookOpen, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import MainCard from "../MainCard";
import { MiniDatePicker } from "../common/MiniDatePicker";
import { AnimatePresence } from "framer-motion";

export default function MyClassSchedule({ classSchedule, className }) {
  const [activeTab, setActiveTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!classSchedule) return null;

  const { today = [], weekly = [] } = classSchedule;
  const getDayName = (date) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];

  const isToday = new Date().toDateString() === selectedDate.toDateString();
  const displaySchedule = useMemo(() => {
    if (isToday && today.length > 0) return today;
    
    const dayName = getDayName(selectedDate);
    const dayNameLower = dayName.toLowerCase();
    
    return weekly.filter(slot => slot.day && slot.day.toLowerCase() === dayNameLower);
  }, [selectedDate, today, weekly, isToday]);

  // Group weekly schedule by day
  const groupedWeekly = weekly.reduce((acc, curr) => {
    if (!acc[curr.day]) acc[curr.day] = [];
    acc[curr.day].push(curr);
    return acc;
  }, {});

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <MainCard borderColor="#00b4d8" className="p-6 bg-white shadow-sm rounded-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
        <div>
          <span className="text-[9px] font-black text-[#00b4d8] uppercase tracking-wider bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-md">
            Class Timetable
          </span>
          <h3 className="text-base font-black text-[#03045e] mt-1.5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00b4d8]" />
            My Class Timetable ({className})
            {activeTab === "today" && (
              <span className="text-sm font-semibold text-slate-500 ml-2">
                — {isToday ? "Today" : selectedDate.toLocaleDateString()}
              </span>
            )}
          </h3>
        </div>

        {/* Tab Switcher and Controls */}
        <div className="flex items-center gap-3 self-start sm:self-center flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === "today"
                ? "bg-white text-[#03045e] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Today's Periods
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === "weekly"
                ? "bg-white text-[#03045e] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Weekly Grid
          </button>
        </div>

        {activeTab === "today" && (
          <div className="flex items-center gap-2">
            <div className="flex bg-cyan-50/50 p-1 rounded-xl border border-cyan-50">
              <button 
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-[#00b4d8]"
                title="Previous Day"
              >
                <ChevronLeft size={17} />
              </button>
              <button 
                onClick={handleNextDay}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-[#00b4d8]"
                title="Next Day"
              >
                <ChevronRight size={17} />
              </button>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`p-2 rounded-xl transition-all ${showDatePicker ? "bg-[#03045e] text-white" : "bg-cyan-50 text-[#00b4d8] hover:bg-cyan-100"}`}
                title="Select Date"
              >
                <CalendarIcon size={18} />
              </button>
              <AnimatePresence>
                {showDatePicker && (
                  <MiniDatePicker 
                    selectedDate={selectedDate} 
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setShowDatePicker(false);
                    }}
                    onClose={() => setShowDatePicker(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === "today" ? (
        displaySchedule.length === 0 ? (
          <div className="text-center py-10 text-xs font-bold text-slate-400 italic">
            {isToday ? "Timetable has not been set yet" : "No classes scheduled on this date"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Teacher</th>
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displaySchedule.map((period, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5">
                      <span className="text-xs font-black text-[#03045e] bg-slate-100 px-2.5 py-1 rounded-lg">
                        {period.period}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-black text-slate-700">{period.subject}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">{period.teacher}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#00b4d8]" />
                        <span className="text-xs font-bold text-slate-600">{period.room}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="space-y-6">
          {daysOfWeek.map((day) => {
            const dayPeriods = groupedWeekly[day] || [];
            return (
              <div key={day} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00b4d8]" />
                  {day}
                </h4>
                {dayPeriods.length === 0 ? (
                  <p className="text-[10px] font-bold text-slate-400 italic pl-4">Timetable has not been set yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {dayPeriods.map((period, pIdx) => (
                      <div key={pIdx} className="bg-white border border-slate-100 p-3 rounded-xl hover:shadow-xs transition-shadow">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[9px] font-black text-[#03045e] bg-slate-100 px-2 py-0.5 rounded-md">
                            {period.period.replace("Period ", "P")}
                          </span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{period.time.split(" - ")[0]}</span>
                        </div>
                        <h5 className="text-xs font-black text-slate-700 line-clamp-1">{period.subject}</h5>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">
                          {period.teacher}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00b4d8]" /> {period.room}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </MainCard>
  );
}
