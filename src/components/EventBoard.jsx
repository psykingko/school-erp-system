import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Sparkles, Clock, Calendar } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};
const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: "easeIn" } },
};

const CATEGORY_COLORS = {
  Tech: { bg: "bg-[#03045e]/10", text: "text-[#03045e]" },
  Cultural: { bg: "bg-[#0077b6]/15", text: "text-[#0077b6]" },
  Networking: { bg: "bg-[#00b4d8]/20", text: "text-[#00b4d8]" },
  Academic: { bg: "bg-[#03045e]/10", text: "text-[#03045e]" },
  Sports: { bg: "bg-[#00b4d8]/20", text: "text-[#00b4d8]" },
  Other: { bg: "bg-gray-100", text: "text-gray-700" },
};

const TAB_ICONS = { happenings: Sparkles, upcoming: Calendar };

function EventCard({ event, index }) {
  const { name, date, category, bgGradient, daysLeft } = event;
  const showCountdown =
    typeof daysLeft === "number" && daysLeft > 0 && daysLeft <= 7;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative rounded-2xl p-5 text-white shadow-md hover:shadow-xl overflow-hidden cursor-default"
      style={{ background: bgGradient }}
      role="article"
      aria-label={`Event: ${name} on ${date}`}
    >
      <div
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/20 blur-xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top row: category badge only — full width, never competes with countdown */}
      <div className="mb-3 relative z-10">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/25 text-white backdrop-blur-sm">
          {category}
        </span>
      </div>

      <h3 className="text-base font-extrabold leading-snug mb-1.5 relative z-10 line-clamp-2">
        {name}
      </h3>

      {/* Date row */}
      <div className="flex items-center gap-1.5 relative z-10">
        <CalendarDays size={17} className="opacity-80" aria-hidden="true" />
        <span className="text-xs font-semibold opacity-90">{date}</span>
      </div>

      {/* Countdown badge — sits below the date, always on its own line */}
      {showCountdown && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.08 + 0.25,
            duration: 0.3,
            ease: "easeOut",
          }}
          className="mt-3 relative z-10"
          aria-label={`${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
        >
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: "rgba(202,240,248,0.92)",
              color: "#03045e",
              backdropFilter: "blur(6px)",
              boxShadow: "0 1px 6px rgba(3,4,94,0.18)",
            }}
          >
            <Clock size={14} aria-hidden="true" />
            {daysLeft} day{daysLeft === 1 ? "" : "s"} left
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

function EventBoard({ happenings = [], upcoming = [], index = 0 }) {
  const [activeTab, setActiveTab] = useState("happenings");
  const tabs = [
    { id: "happenings", label: "Happenings", data: happenings },
    { id: "upcoming", label: "Upcoming", data: upcoming },
  ];
  const activeData = tabs.find((t) => t.id === activeTab)?.data ?? [];

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
      style={{ outline: "1px solid #caf0f8" }}
      role="region"
      aria-label="Event Board"
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-2xl"
            style={{ backgroundColor: "#0077b615" }}
          >
            <Sparkles
              size={26}
              style={{ color: "#0077b6" }}
              aria-hidden="true"
            />
          </div>
          <div>
            <h2
              className="text-lg font-extrabold leading-tight"
              style={{ color: "#03045e" }}
            >
              Event Board
            </h2>
            <span className="text-xs font-semibold text-gray-400">
              Campus life &amp; activities
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 px-6 mt-4 border-b border-gray-100"
        role="tablist"
        aria-label="Event categories"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = TAB_ICONS[tab.id];
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`event-tabpanel-${tab.id}`}
              id={`event-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors duration-150 focus:outline-none"
              style={
                isActive
                  ? { color: "#0077b6", backgroundColor: "#0077b612" }
                  : { color: "#9ca3af" }
              }
            >
              <TabIcon size={18} aria-hidden="true" />
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="event-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: "#0077b6" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="tabpanel"
            id={`event-tabpanel-${activeTab}`}
            aria-labelledby={`event-tab-${activeTab}`}
          >
            {activeData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No events available.
              </p>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                aria-label="Event list"
              >
                {activeData.map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default EventBoard;
