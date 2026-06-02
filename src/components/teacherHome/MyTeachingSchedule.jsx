import React, { useState, useMemo } from "react";
import { Clock, MapPin, Compass, Play, BookOpen, AlertCircle, ArrowRight, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import MainCard from "../MainCard";
import { MiniDatePicker } from "../common/MiniDatePicker";
import { AnimatePresence } from "framer-motion";

export default function MyTeachingSchedule({ schedule = {}, currentClass, nextClass }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getDayName = (date) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
  
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

  const displaySchedule = useMemo(() => {
    // schedule prop is now teachingSchedule which contains weekly and today
    const { weekly = {}, today = [] } = schedule;
    const isToday = new Date().toDateString() === selectedDate.toDateString();
    
    if (isToday && today.length > 0) return today;
    
    const dayName = getDayName(selectedDate);
    const dayNameLower = dayName.toLowerCase();
    
    // Find the weekly array that matches dayName (weekly keys might be lowercase from rawWeeklySchedule)
    const dayScheduleKey = Object.keys(weekly).find(k => k.toLowerCase() === dayNameLower);
    return dayScheduleKey ? weekly[dayScheduleKey] : [];
  }, [selectedDate, schedule]);

  const isToday = new Date().toDateString() === selectedDate.toDateString();

  return (
    <MainCard className="p-6 border border-slate-100 bg-white shadow-sm rounded-3xl h-full flex flex-col justify-between overflow-visible relative">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-4">
          <div>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
              Teaching Movement
            </span>
            <h3 className="text-base font-black text-[#03045e] mt-1.5 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              My Teaching Schedule {isToday ? "(Today)" : `(${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()})`}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 hidden sm:block">
              {displaySchedule.length} Lectures
            </span>
            <div className="flex bg-blue-50/50 p-1 rounded-xl border border-blue-50">
              <button 
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-blue-600"
                title="Previous Day"
              >
                <ChevronLeft size={17} />
              </button>
              <button 
                onClick={handleNextDay}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-blue-600"
                title="Next Day"
              >
                <ChevronRight size={17} />
              </button>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`p-1.5 rounded-xl transition-all ${showDatePicker ? "bg-[#03045e] text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
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
        </div>

        {/* Schedule Timeline */}
        {displaySchedule.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-bold text-slate-400 italic">
              {isToday ? "No teaching periods assigned to you today." : "No teaching periods scheduled on this date."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displaySchedule.map((item, idx) => {
              // Only highlight current/next if we're looking at today's schedule
              const showStatus = isToday;
              const isCurrent = showStatus && currentClass && currentClass.period === item.period && currentClass.classId === item.classId;
              const isNext = showStatus && nextClass && nextClass.period === item.period && nextClass.classId === item.classId;

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrent 
                      ? "bg-gradient-to-r from-blue-50/50 to-[#caf0f8]/20 border-blue-200 shadow-sm"
                      : isNext
                      ? "bg-amber-50/20 border-amber-100"
                      : "bg-white border-slate-100 hover:bg-slate-50/45"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                      isCurrent
                        ? "bg-[#03045e] text-white shadow-md shadow-[#03045e]/20"
                        : isNext
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                        : "bg-slate-50 text-slate-400 border border-slate-100"
                    }`}>
                      {item.period.replace("Period ", "P")}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[#03045e]">{item.subject}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span className="font-bold text-xs text-slate-600">Class {item.class}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] font-bold text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>{item.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#00b4d8]" />
                          <span>{item.room}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[8px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                        <Play className="w-2 h-2 fill-current" />
                        Active Now
                      </span>
                    )}
                    {isNext && !isCurrent && (
                      <span className="flex items-center gap-1 text-[8px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Next Up
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {displaySchedule.length > 0 && (
        <div className="pt-4 border-t border-slate-100 mt-6 flex items-center gap-2 text-[10px] font-bold text-slate-400">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span>Need adjustments? Report schedule conflicts to the Coordination Desk.</span>
        </div>
      )}
    </MainCard>
  );
}
