import React, { useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { getRouteForNavItem, isNavItemActive } from "../shared/utils/routeHelpers";
import { ROLES } from "../auth/roles";
import { ADMIN_SECTIONS } from "../auth/navigation";
import ProtectedRoute from "../routes/ProtectedRoute";

/**
 * AdminLayout
 * 
 * Production-ready layout container for the EduDash Admin Portal.
 * Visually grouped sections, responsive mobile drawer toggle, and HSL color alignment.
 */
const AdminLayout = ({ children, navItems = [], activePage, setActivePage, notifications = [], currentDate }) => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarOpenRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const derivedActivePage = useMemo(() => {
    if (activePage && activePage !== "home") return activePage;
    
    // Find matching active nav item ID
    const activeItem = (navItems || []).find((item) =>
      isNavItemActive(item.id, user?.role, currentPath)
    );
    return activeItem ? activeItem.id : "admin_home";
  }, [navItems, activePage, user?.role, currentPath]);

  const handleMenuClick = useCallback(() => {
    if (sidebarOpenRef.current) {
      sidebarOpenRef.current();
    }
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

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="flex min-h-screen bg-[#caf0f8]">
        {/* Admin Sidenav with 7 Sections */}
        <AdminSidebar
          sections={ADMIN_SECTIONS}
          activePath={derivedActivePage}
          openRef={sidebarOpenRef}
          onNavClick={handleNavClick}
          onCollapse={setSidebarCollapsed}
        />

        {/* Content Panel Area */}
        <motion.div
          animate={{ marginLeft: window.innerWidth < 768 ? 0 : (sidebarCollapsed ? 64 : 240) }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 flex flex-col min-w-0 print:!m-0 print:w-full"
        >
          <Header
            student={user}
            notifications={notifications}
            currentDate={currentDate}
            onMenuClick={handleMenuClick}
            onNavigatePage={handleHeaderNavigate}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children || <Outlet />}
          </main>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
};

export default React.memo(AdminLayout);
