import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  BookOpen,
  Trophy,
  Users,
  GraduationCap,
  Star,
  ChevronLeft,
  ChevronRight,
  Info,
  X
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getSchoolCalendar } from "../../services/sharedService";
import { useService } from "../../hooks/useService";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";

const TYPE_CONFIG = {
  holiday: { label: "Holiday", bg: "#EF444420", color: "#EF4444", icon: Star },
  exam: { label: "Exam", bg: NAVY + "18", color: NAVY, icon: BookOpen },
  event: { label: "Event", bg: TEAL + "20", color: TEAL, icon: Trophy },
  ptm: { label: "PTM", bg: SAGE + "30", color: SAGE, icon: Users },
  academic: {
    label: "Academic",
    bg: "#F59E0B20",
    color: "#F59E0B",
    icon: GraduationCap,
  },
};

const ALL_TYPES = ["upcoming", "all", "holiday", "exam", "event", "ptm", "academic"];

const getMonthData = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];


function AgendaView({ events, hoveredEventId, onHover, onClickEvent, tr }) {
  const now = new Date();
  now.setHours(0,0,0,0);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const sections = { 
    [tr("calendar.today", "Today")]: [], 
    [tr("calendar.tomorrow", "Tomorrow")]: [], 
    [tr("calendar.thisWeek", "This Week")]: [], 
    [tr("calendar.upcoming", "Upcoming")]: [] 
  };

  (events || []).forEach(e => {
    const d = new Date(e.date);
    d.setHours(0,0,0,0);
    if (d.getTime() === now.getTime()) sections[tr("calendar.today", "Today")].push(e);
    else if (d.getTime() === tomorrow.getTime()) sections[tr("calendar.tomorrow", "Tomorrow")].push(e);
    else if (d.getTime() > tomorrow.getTime() && d.getTime() <= nextWeek.getTime()) sections[tr("calendar.thisWeek", "This Week")].push(e);
    else if (d.getTime() > nextWeek.getTime()) sections[tr("calendar.upcoming", "Upcoming")].push(e);
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {Object.entries(sections).map(([title, items]) => {
        if (items.length === 0) return null;
        return (
          <div key={title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
              {title} <span className="text-gray-400 font-bold ml-2">({items.length})</span>
            </h3>
            <div className="flex flex-col gap-3">
              {items.map((event, idx) => (
                <EventRow
                  key={event.id}
                  event={event}
                  index={idx}
                  isHovered={hoveredEventId === event.id}
                  onHover={onHover}
                  onClick={() => {
                    const parts = event.date.split(" ");
                    onClickEvent(parseInt(parts[0]), parts[1], [event]);
                  }}
                  tr={tr}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}


function MiniMonth({ year, monthIndex, events, hoveredEventId, onDateClick, isCurrent, tr }) {
  const days = useMemo(() => getMonthData(year, monthIndex), [year, monthIndex]);
  const monthName = MONTHS[monthIndex];

  const eventsByDay = useMemo(() => {
    const map = {};
    (events || []).forEach(e => {
      const parts = e.date.split(" ");
      const dDay = parseInt(parts[0]);
      const dMonth = parts[1];
      const dYear = parseInt(parts[2]);
      if (dYear === year && (dMonth.startsWith(monthName.substring(0, 3)) || dMonth === monthName)) {
        if (!map[dDay]) map[dDay] = [];
        map[dDay].push(e);
      }
    });
    return map;
  }, [events, year, monthIndex, monthName]);

  return (
    <div className={`bg-white rounded-xl p-2 border shadow-sm hover:shadow-md transition-all duration-300
      ${isCurrent ? "border-[#00b4d8] bg-[#caf0f8]/20 shadow-lg shadow-[#00b4d8]/10" : "border-[#caf0f8]"}
    `}>
      <div className="flex items-center justify-between mb-1.5 border-b border-[#caf0f8] pb-1">
        <h4 className={`text-[10px] font-black uppercase tracking-wider ${isCurrent ? "text-[#0077b6]" : "text-[#03045e]"}`}>
          {tr(`calendar.month_${monthName}`, monthName)}
        </h4>
        {isCurrent && (
          <span className="text-[7px] font-black bg-[#00b4d8] text-white px-1 rounded-sm uppercase tracking-tighter">{tr("calendar.current", "Current")}</span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-[7px] font-bold text-gray-400 text-center mb-0.5">
            {tr(`calendar.weekday_${i}`, d)}
          </span>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dayEvents = eventsByDay[day] || [];
          const isHovered = dayEvents.some(e => e.id === hoveredEventId);
          const isToday = isCurrent && day === new Date().getDate();
          return (
            <div 
              key={i} 
              className={`relative h-6 w-full flex flex-col items-center justify-center rounded-md text-[9px] font-bold transition-all duration-200 pb-1
                ${dayEvents.length > 0 ? "cursor-pointer" : "text-gray-300"}
                ${isHovered ? "bg-[#03045e] text-white scale-110 z-10 shadow-lg" : isToday ? "ring-1 ring-[#00b4d8] bg-[#00b4d8]/10 text-[#00b4d8]" : "hover:bg-[#caf0f8]"}
              `}
              onClick={() => dayEvents.length > 0 && onDateClick(day, monthName, dayEvents)}
            >
              <span className={dayEvents.length > 0 && !isHovered && !isToday ? "text-[#03045e]" : ""}>
                {day}
              </span>
              {dayEvents.length > 0 && !isHovered && (
                <div className="absolute bottom-0.5 flex gap-0.5 justify-center flex-wrap px-0.5">
                  {dayEvents.slice(0, 4).map((e, idx) => (
                    <div 
                      key={idx} 
                      className="w-1.5 h-1.5 rounded-full ring-1 ring-white" 
                      style={{ backgroundColor: TYPE_CONFIG[e.type]?.color || TEAL }} 
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventRow({ event, index, isHovered, onHover, onClick, tr }) {
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.event;
  const IconComponent = cfg.icon;
  const parts = event.date.split(" ");
  const day = parts[0];
  const month = parts[1];
  const year = parts[2];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onMouseEnter={() => onHover(event.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      className={`flex items-start gap-4 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-300
        ${isHovered ? "bg-[#03045e] text-white scale-[1.02] shadow-lg z-10" : "bg-white hover:bg-[#caf0f8]/30"}
      `}
      style={{
        outline: !isHovered ? "1px solid #caf0f8" : "none",
        marginBottom: "8px"
      }}
    >
      <div className="flex-shrink-0 w-12 text-center">
        <p className={`text-[10px] font-black uppercase ${isHovered ? "text-[#00b4d8]" : "text-[#0077b6]"}`}>
          {tr(`calendar.month_${month}`, month)}
        </p>
        <p className={`text-2xl font-black leading-none ${isHovered ? "text-white" : "text-[#03045e]"}`}>
          {day}
        </p>
        <p className={`text-[9px] font-bold ${isHovered ? "text-white/60" : "text-gray-400"}`}>
          {year}
        </p>
      </div>
      <div className={`w-px self-stretch flex-shrink-0 mt-1 ${isHovered ? "bg-white/20" : "bg-[#0077b620]"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-sm font-extrabold truncate">
            {event.title}
          </p>
          <span
            className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-tighter
              ${isHovered ? "bg-white/20 text-white" : ""}
            `}
            style={!isHovered ? { backgroundColor: cfg.bg, color: cfg.color } : {}}
          >
            <IconComponent size={10} />
            {tr(`calendar.${event.type}`, cfg.label)}
          </span>
        </div>
        <p className={`text-[11px] leading-snug line-clamp-1 ${isHovered ? "text-white/80" : "text-gray-500 font-medium"}`}>
          {event.description}
        </p>
      </div>
    </motion.div>
  );
}

function SchoolCalendarPage() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { t } = useLanguage();
  const { role } = useAuth();
  const isParentOrTeacher = role === 'TEACHER' || role === 'PARENT';
  const tr = (k, f) => isParentOrTeacher ? t(k, { fallback: f || k }) : (f || k);
  
  const [showHelper, setShowHelper] = useState(false);
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const scrollContainerRef = useRef(null);

  const { data: schoolCalendar, loading } = useService(getSchoolCalendar);

  const academicYear = schoolCalendar?.academicYear || "2024-25";
  const yearParts = academicYear.split(/[–-]/);
  const startYear = parseInt(yearParts[0]) || new Date().getFullYear();
  let endYear = yearParts[1] ? (yearParts[1].trim().length === 2 ? 2000 + parseInt(yearParts[1].trim()) : parseInt(yearParts[1].trim())) : startYear + 1;

  const calendarMonths = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthIndex = (3 + i) % 12;
      const year = (3 + i) >= 12 ? endYear : startYear;
      months.push({ year, month: monthIndex });
    }
    return months;
  }, [startYear, endYear]);

  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYearIdx = now.getFullYear();

  const filtered = useMemo(() => {
    // 1. Filter by category
    let result = (activeFilter === "all" || activeFilter === "upcoming")
      ? (schoolCalendar?.events || [])
      : (schoolCalendar?.events || []).filter((e) => e.type === activeFilter);
      
    // 2. Helper to parse event date strings like "15 Jul 2026"
    const parseEventDate = (dateStr) => {
      if (!dateStr) return 0;
      const parts = dateStr.split(" ");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIdx = monthNames.findIndex(m => parts[1].startsWith(m));
        const year = parseInt(parts[2], 10);
        return new Date(year, monthIdx, day).getTime();
      }
      return new Date(dateStr).getTime();
    };

    // 3. Sort chronologically
    result = [...result].sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));

    // 4. If viewing "upcoming", only show upcoming events in the timeline (from today onwards)
    if (activeFilter === "upcoming") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTime = today.getTime();
      result = result.filter(e => parseEventDate(e.date) >= todayTime);
    }
    
    return result;
  }, [activeFilter, schoolCalendar?.events]);

  const handleDateClick = (day, month, events) => {
    setSelectedDayInfo({ day, month, events });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!schoolCalendar) return null;

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3.5 rounded-2xl shadow-lg shadow-[#03045e]/10" style={{ backgroundColor: NAVY }}>
          <CalendarDays size={32} className="text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black tracking-tight truncate" style={{ color: NAVY }}>
            {t("calendar.title") || "Academic Calendar"}
          </h1>
          <p className="text-sm font-bold text-gray-400 truncate">
            {t("calendar.academicYear") || "Academic Year"} {schoolCalendar.academicYear}
          </p>
        </div>
        <div className="flex-shrink-0">
          <HelperButton onClick={() => setShowHelper(true)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(schoolCalendar.terms || []).map((term) => (
          <motion.div
            key={term.id}
            whileHover={{ y: -4 }}
            className="bg-white p-4 rounded-2xl border border-[#caf0f8] shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${term.status === "ongoing" ? "bg-[#00b4d8] animate-pulse" : "bg-[#0077b6]"}`} />
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{term.name}</p>
                <p className="text-sm font-extrabold text-[#03045e]">{term.period}</p>
              </div>
            </div>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase
              ${term.status === "ongoing" ? "bg-[#00b4d8]/10 text-[#00b4d8]" : "bg-gray-100 text-gray-400"}
            `}>
              {term.status === "ongoing" ? tr("calendar.active", "Active") : tr("calendar.done", "Done")}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-8 items-start mb-8">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2">
              <BookOpen size={20} className="text-[#00b4d8]" />
              {tr("calendar.eventTimeline", "Event Timeline")}
            </h2>
            <span className="text-[11px] font-black text-gray-400 uppercase bg-gray-50 px-2.5 py-1 rounded-full">
              {filtered.length} {tr("calendar.eventsListed", "Events Listed")}
            </span>
          </div>

          <div 
            className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
            style={{ borderTop: "6px solid #00b4d8", maxHeight: "700px", display: "flex", flexDirection: "column" }}
          >
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md py-4 px-4 border-b border-gray-50 mb-4 overflow-visible">
              <div className="flex flex-wrap gap-2">
                {ALL_TYPES.map((type) => {
                  const isActive = activeFilter === type;
                  const cfg = TYPE_CONFIG[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveFilter(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 capitalize
                        ${isActive ? "bg-[#03045e] text-white shadow-lg shadow-[#03045e]/20" : "bg-[#caf0f8]/50 text-[#03045e] hover:bg-[#caf0f8]"}
                      `}
                    >
                      {type === "all" ? tr("calendar.allEvents", "All Events") : type === "upcoming" ? tr("calendar.upcoming", "Upcoming") : tr(`calendar.${type}`, cfg?.label ?? type)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1"
              style={{ scrollBehavior: "smooth" }}
            >
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                  <Star size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">{tr("calendar.noEvents", "No events match your filter")}</p>
                </div>
              ) : (
                filtered.map((event, i) => (
                  <EventRow 
                    key={event.id} 
                    event={event} 
                    index={i} 
                    isHovered={hoveredEventId === event.id}
                    onHover={setHoveredEventId}
                    onClick={() => {
                      const parts = event.date.split(" ");
                      handleDateClick(parseInt(parts[0]), parts[1], [event]);
                    }}
                    tr={tr}
                  />
                ))
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none opacity-80" />
          </div>
        </div>

        <div className="flex flex-col gap-4 min-w-0 h-full">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2">
              <CalendarDays size={20} className="text-[#00b4d8]" />
              {tr("calendar.academicPlanner", "Academic Planner")}
              <span className="ml-2 px-2 py-0.5 rounded-md bg-[#03045e] text-white text-[9px] font-black tracking-widest uppercase">
                {academicYear}
              </span>
            </h2>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-lg bg-white border border-[#caf0f8] text-gray-400 hover:text-[#03045e]">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1.5 rounded-lg bg-white border border-[#caf0f8] text-gray-400 hover:text-[#03045e]">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full relative overflow-hidden"
               style={{ borderTop: "6px solid #00b4d8" }}>
            {isMobile ? (
              <AgendaView events={schoolCalendar.events} hoveredEventId={hoveredEventId} onHover={setHoveredEventId} onClickEvent={handleDateClick} tr={tr} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-2">
                {calendarMonths.map((m, idx) => (
                  <MiniMonth 
                  key={idx}
                  year={m.year}
                  monthIndex={m.month}
                  events={schoolCalendar.events}
                  hoveredEventId={hoveredEventId}
                  onDateClick={handleDateClick}
                  isCurrent={m.year === currentYearIdx && m.month === currentMonthIdx}
                  tr={tr}
                />
              ))}
            </div>
            )}
          </div>
        </div>
      </div>

      <MainCard borderColor="#00b4d8" className="p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#03045e] mb-1">{tr("calendar.scheduleKey", "Schedule Key")}</h3>
            <p className="text-[11px] font-bold text-gray-400">{tr("calendar.colorCoding", "Academic & Activity Color Coding")}</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
              const IconComponent = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[#03045e] leading-none mb-1">{tr(`calendar.${key}`, cfg.label)}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{tr("calendar.systemCode", "System Code:")} {key}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden xl:flex items-center gap-2 bg-[#caf0f8] px-4 py-2 rounded-2xl">
            <Info size={16} className="text-[#0077b6]" />
            <p className="text-[10px] font-bold text-[#0077b6] leading-tight">
              {tr("calendar.officialBoard", "Calendar reflects official")} <br/> {tr("calendar.officialBoard2", "School Board dates")}
            </p>
          </div>
        </div>
      </MainCard>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="calendar.title"
        contentEn="The Academic Planner provides a chronological timeline of all school events and a compact 12-month calendar."
        contentHi="अकादमिक प्लानर स्कूल के सभी कार्यक्रमों और 12 महीने के कैलेंडर की समयरेखा प्रदान करता है।"
      />

      <AnimatePresence>
        {selectedDayInfo && (
          <>
            <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={() => setSelectedDayInfo(null)} />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed bottom-8 right-8 w-80 bg-[#03045e] text-white p-5 rounded-[2rem] shadow-2xl z-50 border border-white/10 overflow-hidden"
            >
              <button onClick={() => setSelectedDayInfo(null)} className="absolute top-5 right-5 text-white/40 hover:text-white"><X size={20} /></button>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black text-[#00b4d8]">{selectedDayInfo.day}</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00b4d8] leading-none mb-1">{tr(`calendar.month_${selectedDayInfo.month}`, selectedDayInfo.month)}</p>
                  <p className="text-sm font-extrabold">{selectedDayInfo.events.length} {selectedDayInfo.events.length > 1 ? tr("calendar.eventsCount", "Events") : tr("calendar.eventCount", "Event")}</p>
                </div>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedDayInfo.events.map((e, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: TYPE_CONFIG[e.type]?.color || TEAL }} />
                    <div><p className="text-xs font-black mb-0.5 group-hover:text-[#00b4d8] transition-colors">{e.title}</p><p className="text-[10px] text-white/60 font-medium leading-relaxed">{e.description}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #caf0f8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00b4d8; }
      `}} />
    </div>
  );
}

export default SchoolCalendarPage;

