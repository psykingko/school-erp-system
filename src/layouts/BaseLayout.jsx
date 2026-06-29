import React, { useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useStudent } from "../context/StudentContext";
import { getRouteForNavItem, isNavItemActive } from "../shared/utils/routeHelpers";

/**
 * BaseLayout
 * 
 * Shared UI shell for all roles.
 * Handles Sidebar, Header, and main content transition logic.
 */
const BaseLayout = React.memo(({ children, navItems = [], activePage, setActivePage, notifications = [], currentDate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isSwitching, activeStudent } = useStudent();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarOpenRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const derivedActivePage = useMemo(() => {
    if (activePage && activePage !== "home") return activePage;
    const activeItem = (navItems || []).find((item) =>
      isNavItemActive(item.id, user?.role, currentPath)
    );
    return activeItem ? activeItem.id : "home";
  }, [navItems, activePage, user?.role, currentPath]);

  const handleMenuClick = useCallback(() => {
    if (sidebarOpenRef.current) sidebarOpenRef.current();
  }, []);

  const handleNavClick = useCallback(
    (item) => {
      const path = getRouteForNavItem(item.id, user?.role);
      if (path) {
        navigate(path);
      }
      if (setActivePage) {
        setActivePage(item.id);
      }
    },
    [navigate, user?.role, setActivePage],
  );

  const handleHeaderNavigate = useCallback(
    (pageId) => {
      if (pageId.startsWith("subject_")) {
        const subjectId = pageId.split("_")[1];
        navigate(`/${user?.role.toLowerCase()}/subjects/${subjectId}`);
        return;
      }
      const path = getRouteForNavItem(pageId, user?.role);
      if (path) {
        navigate(path);
      }
      if (setActivePage) {
        setActivePage(pageId);
      }
    },
    [navigate, user?.role, setActivePage],
  );

  const navWithActive = useMemo(
    () => (navItems || []).map((item) => ({ 
      ...item, 
      label: t(`nav.${item.id}`),
      active: isNavItemActive(item.id, user?.role, currentPath) 
    })),
    [navItems, currentPath, user?.role, t],
  );

  return (
    <div className="flex min-h-screen bg-[#caf0f8]">
      <Sidebar
        navItems={navWithActive}
        student={user}
        openRef={sidebarOpenRef}
        onNavClick={handleNavClick}
        onCollapse={setSidebarCollapsed}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ml-0 md:ml-16 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"}`}
      >
        <Header
          student={user}
          notifications={notifications}
          currentDate={currentDate}
          onMenuClick={handleMenuClick}
          onNavigatePage={handleHeaderNavigate}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 md:py-6 lg:py-8 w-full max-w-full">
          {children || <Outlet />}
        </main>
      </div>

      {/* Premium Profile Switching Overlay Loader */}
      <AnimatePresence>
        {isSwitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#caf0f8]/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#caf0f8] flex flex-col items-center gap-5 max-w-sm text-center"
            >
              {/* Spinning gradient rings */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-[#00b4d8] animate-spin" />
                <div className="absolute inset-1.5 rounded-full border-4 border-b-transparent border-[#03045e] animate-spin" style={{ animationDirection: "reverse" }} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#03045e]">
                  {t("parent.switchingProfile", { name: activeStudent?.name || "..." })}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t("school.portal")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default BaseLayout;
