import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, Menu, GraduationCap, User, LogOut, RotateCcw } from "lucide-react";
import { formatDate } from "../shared/utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useStudent } from "../context/StudentContext";
import ChildScopeSwitcher from "./parent/ChildScopeSwitcher";
import { ROLES } from "../auth/roles";
import { resetDemoData } from "../persistence/resetDemoData";

const NotificationBadge = React.memo(function NotificationBadge({ count }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
      <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
        {count > 9 ? "9+" : count}
      </span>
    </span>
  );
});

const NotificationPanel = React.memo(function NotificationPanel({ notifications, onClose, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute right-0 sm:right-0 -right-4 top-full mt-3 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
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
});

const LanguageToggle = React.memo(function LanguageToggle({ lang, setLang }) {
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
            aria-label={option === "en" ? "English" : "Hindi"}
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
});



const ProfileDropdown = React.memo(function ProfileDropdown({ student, t, onNavigate, onLogout }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
    >
      <div className="px-4 py-4 border-b border-gray-50 flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
          style={{ backgroundColor: student?.avatarColor || "#03045e" }}
        >
          {student?.avatarInitials || (student?.name || student?.fullName || "?")[0]?.toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-black text-[#03045e] truncate">
            {student?.name || student?.fullName || t("common.student")}
          </p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {student?.admissionNumber || student?.admissionNo || t("common.student")}
          </p>
        </div>
      </div>
      
      <div className="p-1.5">
        <button
          onClick={() => onNavigate("profile")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-[#caf0f8] hover:text-[#03045e] transition-all"
        >
          <User size={18} />
          <span>{t("nav.profile")}</span>
        </button>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-1"
        >
          <LogOut size={18} />
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </motion.div>
  );
});

const Header = React.memo(function Header({ student, notifications = [], currentDate, onMenuClick, onNavigatePage }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { role, logout, isParent } = useAuth();
  const { activeStudent } = useStudent();
  
  const displayStudent = student; // Always show the logged-in user in profile dropdown

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayDate = currentDate || formatDate(new Date(), lang);

  const handleProfileNavigate = (page) => {
    setShowProfile(false);
    if (onNavigatePage) onNavigatePage(page);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm w-full">
      <div className="flex items-center justify-between px-3 md:px-6 lg:px-8 h-16 max-w-full">
        {/* Left: mobile hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            style={{ color: "#03045e" }}
            onClick={onMenuClick}
            aria-label={t("sidebar.open")}
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
            <span className="font-black text-base hidden sm:block" style={{ color: "#03045e" }}>
              EduDash
            </span>
          </div>
        </div>

        {/* Right: date + toggles + bell + avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 ml-auto">
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

          {/* Child Scope Switcher - Only for Parents with multi-child */}
          {isParent && (
            <div className="hidden lg:block">
              <ChildScopeSwitcher />
            </div>
          )}

          {/* Language Toggle - Visible for Parents and Teachers */}
          {(role === ROLES.PARENT || role === ROLES.TEACHER) && (
            <LanguageToggle lang={lang} setLang={setLang} />
          )}

          {/* Reset Demo Data Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all ERP demo data? This will restore all default seed collections.")) {
                resetDemoData();
              }
            }}
            className="hidden md:flex items-center gap-1.5 rounded-xl border px-3 py-1.5 transition-colors text-xs font-black shadow-sm"
            style={{
              backgroundColor: "#caf0f8",
              borderColor: "#00b4d8",
              color: "#03045e",
            }}
          >
            <RotateCcw size={15} className="transition-transform duration-500" />
            <span className="hidden sm:inline">{t("header.resetErp")}</span>
          </motion.button>

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
                  key="notification-panel"
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  t={t}
                />
              )}
            </AnimatePresence>
            {showNotifications && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Avatar + name */}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfile((prev) => !prev)}
              className="flex items-center border rounded-xl p-1 pr-2.5 sm:pr-3 cursor-pointer transition-all hover:shadow-md"
              style={{ backgroundColor: "#caf0f8", borderColor: "#00b4d8" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                style={{ backgroundColor: student?.avatarColor || "#03045e" }}
              >
                {student?.avatarInitials || (student?.name || student?.fullName || "?")[0]?.toUpperCase()}
              </div>
              <ChevronDown 
                size={16} 
                className={`ml-1 sm:ml-2 text-[#03045e] transition-transform duration-200 hidden sm:block ${showProfile ? "rotate-180" : ""}`} 
              />
            </motion.div>
            
            <AnimatePresence>
              {showProfile && (
                <ProfileDropdown 
                  student={displayStudent} 
                  t={t} 
                  onNavigate={handleProfileNavigate}
                  onLogout={logout}
                />
              )}
            </AnimatePresence>
            
            {showProfile && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowProfile(false)}
                aria-hidden="true"
              />
            )}
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
});

export default Header;
