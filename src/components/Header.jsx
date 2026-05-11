import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, Menu, GraduationCap, Users } from "lucide-react";
import { formatDate } from "../utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useViewMode } from "../context/ViewModeContext";

function NotificationBadge({ count }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
      {/* FIX: removed animate-ping — it runs forever and accumulates RAF callbacks */}
      <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
        {count > 9 ? "9+" : count}
      </span>
    </span>
  );
}

function NotificationPanel({ notifications, onClose, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-sm">
          {t("header.notifications")}
        </h3>
        <span className="text-xs text-gray-400 font-medium">
          {notifications.filter((n) => !n.read).length} {t("header.unread")}
        </span>
      </div>
      <ul className="max-h-64 overflow-y-auto divide-y divide-gray-50">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${!notif.read ? "bg-[#caf0f8]/40" : ""}`}
          >
            <span
              className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!notif.read ? "bg-[#00b4d8]" : "bg-gray-200"}`}
            />
            <p className="text-sm text-gray-700 leading-snug">
              {notif.message}
            </p>
          </li>
        ))}
      </ul>
      <div className="px-4 py-2.5 border-t border-gray-100 text-center">
        <button
          onClick={onClose}
          className="text-xs font-semibold transition-colors"
          style={{ color: "#0077b6" }}
        >
          {t("header.markRead")}
        </button>
      </div>
    </motion.div>
  );
}

function LanguageToggle({ lang, setLang }) {
  const options = ["en", "hi"];
  return (
    <div
      className="flex items-center rounded-full p-0.5 border"
      style={{ backgroundColor: "#caf0f8", borderColor: "#00b4d8" }}
      role="group"
      aria-label="Language selector"
    >
      {options.map((option) => {
        const isActive = lang === option;
        return (
          <button
            key={option}
            onClick={() => setLang(option)}
            className="relative px-3 py-1 rounded-full text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            style={{ color: isActive ? "#ffffff" : "#03045e", zIndex: 1 }}
            aria-pressed={isActive}
            aria-label={`Switch to ${option === "en" ? "English" : "Hindi"}`}
          >
            {isActive && (
              <motion.span
                layoutId="lang-active-pill"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "#03045e", zIndex: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{option.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}

function ViewModeToggle({ viewMode, setViewMode, t }) {
  const options = [
    { id: "student", labelKey: "view.student", icon: GraduationCap },
    { id: "parent", labelKey: "view.parent", icon: Users },
  ];

  return (
    <div
      className="hidden md:flex items-center rounded-full p-0.5 border"
      style={{ backgroundColor: "#caf0f8", borderColor: "#00b4d8" }}
      role="group"
      aria-label="View mode selector"
    >
      {options.map(({ id, labelKey, icon: Icon }) => {
        const isActive = viewMode === id;
        return (
          <button
            key={id}
            onClick={() => setViewMode(id)}
            className="relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 whitespace-nowrap"
            style={{ color: isActive ? "#ffffff" : "#03045e", zIndex: 1 }}
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.span
                layoutId="view-active-pill"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "#03045e", zIndex: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon size={16} className="relative" aria-hidden="true" />
            <span className="relative">{t(labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}

function Header({ student, notifications = [], currentDate, onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { viewMode, setViewMode } = useViewMode();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayDate = currentDate || formatDate(new Date());

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-16">
        {/* Left: mobile hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            style={{ color: "#03045e" }}
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu size={26} />
          </button>
          <div className="md:hidden flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#caf0f8" }}
            >
              <GraduationCap
                size={21}
                style={{ color: "#03045e" }}
                aria-hidden="true"
              />
            </div>
            <span className="font-black text-base" style={{ color: "#03045e" }}>
              EduDash
            </span>
          </div>
        </div>

        {/* Right: date + toggles + bell + avatar */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* Date */}
          <div
            className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 border"
            style={{ backgroundColor: "#caf0f8", borderColor: "#00b4d8" }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#00b4d8" }}
            />
            <span
              className="text-xs font-semibold whitespace-nowrap"
              style={{ color: "#03045e" }}
            >
              {displayDate}
            </span>
          </div>

          {/* Language Toggle */}
          <LanguageToggle lang={lang} setLang={setLang} />

          {/* View Mode Toggle (hidden on mobile) */}
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} t={t} />

          {/* Notification bell */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative w-10 h-10 rounded-xl border flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "#caf0f8",
                borderColor: "#00b4d8",
                color: "#03045e",
              }}
              aria-label={`${t("header.notifications")} — ${unreadCount} ${t("header.unread")}`}
            >
              <Bell size={26} />
              <NotificationBadge count={unreadCount} />
            </motion.button>
            <AnimatePresence>
              {showNotifications && (
                <NotificationPanel
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  t={t}
                />
              )}
            </AnimatePresence>
            {/* FIX: backdrop must be BELOW the panel (z-40 < z-50) and only
                present when panel is open — previously it was always rendered
                when showNotifications was true, which is correct, but the
                z-index was competing with other fixed elements. Using z-30
                keeps it below the sidebar (z-30) on desktop but still catches
                outside clicks for the notification panel. */}
            {showNotifications && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Avatar + name */}
          <div
            className="flex items-center gap-2.5 border rounded-xl px-3 py-1.5 cursor-pointer transition-colors"
            style={{ backgroundColor: "#caf0f8", borderColor: "#00b4d8" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
              style={{ backgroundColor: student?.avatarColor || "#03045e" }}
            >
              {student?.avatarInitials || "?"}
            </div>
            <span
              className="hidden sm:block text-sm font-bold whitespace-nowrap"
              style={{ color: "#03045e" }}
            >
              {student?.name || "Student"}
            </span>
            <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
        style={{
          background:
            "linear-gradient(90deg, transparent, #0077b6 30%, #03045e 70%, transparent)",
        }}
        aria-hidden="true"
      />
    </header>
  );
}

export default Header;
