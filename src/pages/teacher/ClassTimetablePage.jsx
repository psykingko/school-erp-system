import React, { useState, useEffect } from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import { teacherScheduleService } from "../../services/teacherService";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  Clock,
  MapPin,
  CalendarDays,
  Compass,
  HelpCircle,
} from "lucide-react";
import MainCard from "../../components/MainCard";
import { useLanguage } from "../../context/LanguageContext";

const ClassTimetablePage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const teacherId = user?.linkedEntityId || "teach-001";

  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      try {
        const sched =
          await teacherScheduleService.getTeacherWeeklySchedule(teacherId);
        setWeeklySchedule(sched);
      } catch (e) {
        console.error("Failed to load weekly schedule:", e);
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, [teacherId]);

  const daysOfTheWeek = [
    t("common.monday", { fallback: "Monday" }),
    t("common.tuesday", { fallback: "Tuesday" }),
    t("common.wednesday", { fallback: "Wednesday" }),
    t("common.thursday", { fallback: "Thursday" }),
    t("common.friday", { fallback: "Friday" }),
  ];
  const enDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // Mapping display day back to internal en day
  const getEnDay = (displayDay) => {
    const idx = daysOfTheWeek.indexOf(displayDay);
    return idx >= 0 ? enDays[idx] : displayDay;
  };
  
  // Mapping internal en day to display day
  const getDisplayDay = (enDay) => {
    const idx = enDays.indexOf(enDay);
    return idx >= 0 ? daysOfTheWeek[idx] : enDay;
  };

  const [selectedDisplayDay, setSelectedDisplayDay] = useState(daysOfTheWeek[0]);
  
  useEffect(() => {
    setSelectedDisplayDay(getDisplayDay(selectedDay));
  }, [t, selectedDay]);

  const handleDaySelect = (displayDay) => {
    setSelectedDisplayDay(displayDay);
    setSelectedDay(getEnDay(displayDay));
  };

  const dayFilteredSchedule = weeklySchedule.filter(
    (s) => s.day === selectedDay,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00b4d8]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <TeacherModuleHeader
        titleKey="nav.class_timetable"
        descriptionKey="timetable.desc"
        helperContentEn="The My Schedule page lets you view your complete weekly class coordination plans. Switch tabs to analyze individual days and plan homework releases."
        helperContentHi="मेरी अनुसूची पृष्ठ आपको अपनी पूरी साप्ताहिक कक्षा समन्वय योजनाओं को देखने की अनुमति देता है। व्यक्तिगत दिनों का विश्लेषण करने और होमवर्क जारी करने की योजना बनाने के लिए टैब स्विच करें।"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Day Selector Sidebar Card */}
        <div className="lg:col-span-1">
          <MainCard className="p-5">
            <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-50">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              {t("timetable.dayNavigation", { fallback: "Day Navigation" })}
            </h3>
            <div className="space-y-2">
              {daysOfTheWeek.map((displayDay) => {
                const enDay = getEnDay(displayDay);
                const count = weeklySchedule.filter(
                  (s) => s.day === enDay,
                ).length;
                const isSelected = selectedDisplayDay === displayDay;

                return (
                  <button
                    key={displayDay}
                    onClick={() => handleDaySelect(displayDay)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-black transition-all uppercase tracking-wider ${
                      isSelected
                        ? "bg-[#03045e] border-[#03045e] text-white shadow-sm"
                        : "bg-white border-gray-100 text-gray-500 hover:bg-blue-50/30 hover:border-blue-100"
                    }`}
                  >
                    <span>{displayDay}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {count} {count === 1 ? t("common.class", { fallback: "Class" }) : t("common.classes", { fallback: "Classes" })}
                    </span>
                  </button>
                );
              })}
            </div>
          </MainCard>
        </div>

        {/* Schedule Display Grid */}
        <div className="lg:col-span-3">
          <MainCard className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
              <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4.5 h-4.5 text-blue-600" />
                {t("timetable.teachingSchedule", { fallback: "Teaching Schedule" })}: {selectedDisplayDay}
              </h3>
              <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-tighter">
                {dayFilteredSchedule.length} {t("timetable.assignedPeriods", { fallback: "Assigned Periods" })}
              </span>
            </div>

            {dayFilteredSchedule.length === 0 ? (
              <div className="text-center py-16 text-xs font-bold text-gray-400 italic bg-gray-50/20 rounded-2xl border border-dashed border-gray-100">
                {t("timetable.noSchedule", { fallback: `You have no scheduled class allocations on ${selectedDisplayDay}.` })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dayFilteredSchedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-gray-50 bg-gradient-to-br from-white to-gray-50/30 hover:border-blue-100 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[8px] font-black bg-[#caf0f8] text-[#0077b6] px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {item.period}
                        </span>
                        <h4 className="font-black text-sm text-[#03045e] mt-1.5">
                          {item.subject}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-[#00b4d8] bg-[#caf0f8]/20 px-2.5 py-1 rounded-xl">
                          {t("common.class", { fallback: "Class" })} {item.class}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-3 border-t border-gray-100/50 text-[10px] font-bold text-gray-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock size={12} className="text-blue-400" />
                        <span className="truncate">{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="text-[#00b4d8]" />
                        <span className="truncate">{item.room}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </MainCard>
        </div>
      </div>
    </div>
  );
};

export default ClassTimetablePage;
