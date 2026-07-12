import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardEdit,
  BookOpen,
  CalendarClock,
  BookCheck,
  WalletCards,
  Bus,
  Palette,
  HeartHandshake,
  FolderOpen,
  Trophy,
  BadgeCheck,
  CalendarDays,
  Palmtree,
  LifeBuoy,
  UserCircle,
  LogOut,
  CheckSquare,
  FileQuestion,
  LineChart,
  Megaphone,
  Users,
  Presentation,
  UserCog,
  School,
  CalendarRange,
  Folder,
  PieChart,
  Tent,
  Layers,
  Send,
  Headset,
  ShieldCheck,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_SECTIONS } from "../../auth/navigation";
import permissionService from "../../services/permissionService";

// Redux mock block fallback just in case or React.memo
const iconMap = {
  LayoutDashboard,
  ClipboardEdit,
  BookOpen,
  CalendarClock,
  BookCheck,
  WalletCards,
  Bus,
  Palette,
  HeartHandshake,
  FolderOpen,
  Trophy,
  BadgeCheck,
  CalendarDays,
  Palmtree,
  LifeBuoy,
  UserCircle,
  LogOut,
  CheckSquare,
  FileQuestion,
  LineChart,
  Megaphone,
  Users,
  Presentation,
  UserCog,
  School,
  CalendarRange,
  Folder,
  PieChart,
  Tent,
  Layers,
  Send,
  Headset,
  ShieldCheck,
  Settings,
  GraduationCap
};

const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};
const drawerVariants = {
  closed: { x: "-100%" },
  open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

// ── Single Nav Item ──
const NavItem = React.memo(function NavItem({
  item,
  activePath,
  onClick,
  isCollapsed,
}) {
  const IconComponent = iconMap[item.icon] || LayoutDashboard;
  const [showTooltip, setShowTooltip] = useState(false);
  const label = item.label;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => onClick && onClick(item)}
        onMouseEnter={() => isCollapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          w-full flex items-center rounded-xl text-left transition-colors duration-200 font-semibold text-xs py-2.5
          ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"}
          ${
            item.active
              ? "bg-[#caf0f8] text-[#03045e] font-extrabold border-l-4 border-[#03045e]"
              : "text-white/70 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
          }
        `}
        aria-label={label}
      >
        <IconComponent
          size={18}
          className={item.active ? "text-[#03045e]" : "text-white/60"}
          aria-hidden="true"
        />
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="truncate overflow-hidden whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip for Collapsed Sidebar */}
      <AnimatePresence>
        {isCollapsed && showTooltip && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none"
          >
            <div className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap shadow-lg bg-[#03045e] text-[#caf0f8] border border-[#caf0f8]/20">
              {label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ── Sidebar Content ──
const SidebarContent = React.memo(function SidebarContent({
  sections = [],
  onNavClick,
  isCollapsed,
  onToggleCollapse,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div
        className={`flex items-center border-b border-white/10 ${
          isCollapsed ? "justify-center px-2 py-5" : "gap-3 px-5 py-6"
        }`}
      >
        <div className="w-10 h-10 bg-[#caf0f8] rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
          <GraduationCap
            size={22}
            className="text-[#03045e]"
            aria-hidden="true"
          />
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <h1 className="text-lg font-black text-white leading-none whitespace-nowrap">
                EduDash
              </h1>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider whitespace-nowrap mt-1">
                Admin Center
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {onToggleCollapse && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleCollapse}
            className={`flex-shrink-0 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors ${
              isCollapsed ? "mt-0" : "ml-auto"
            }`}
            aria-label={
              isCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </motion.button>
        )}
      </div>

      {/* Grouped Sidebar Navigation */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
        aria-label="Admin Navigation"
      >
        {sections.map((section, idx) => (
          <div key={section.title} className="space-y-1.5 px-3">
            {/* Section Heading */}
            {!isCollapsed ? (
              <h3 className="text-[10px] uppercase font-black tracking-widest text-white/40 px-3 pt-2 pb-1">
                {section.title}
              </h3>
            ) : (
              idx > 0 && <div className="border-t border-white/5 my-2 mx-1" />
            )}

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  onClick={onNavClick}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
});

// ── AdminSidebar Component ──
function AdminSidebar({
  sections = [],
  activePath,
  onNavClick,
  onCollapse,
  openRef,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (openRef) {
      openRef.current = () => setIsMobileOpen(true);
    }
  }, [openRef]);

  const handleNavClick = (item) => {
    setIsMobileOpen(false);
    if (item.id === "logout") {
      logout();
      return;
    }
    if (onNavClick) onNavClick(item);
  };

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (onCollapse) onCollapse(next);
  };

  // 1. Filter sections dynamically based on user permissions
  const filteredSections = React.useMemo(() => {
    return sections
      .map((sect) => ({
        ...sect,
        items: sect.items.filter((item) => {
          return permissionService.canAccessModule(user, item.id);
        }),
      }))
      .filter((sect) => sect.items.length > 0);
  }, [sections, user]);

  // 2. Maps flat active indicator over filtered sections items
  const sectionsWithActive = React.useMemo(() => {
    return filteredSections.map((sect) => ({
      ...sect,
      items: sect.items.map((item) => ({
        ...item,
        active:
          activePath === item.id ||
          (item.id === "admin_home" && activePath === "home"),
      })),
    }));
  }, [filteredSections, activePath]);

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col flex-shrink-0 fixed left-0 top-0 h-full z-30 shadow-xl overflow-hidden print:hidden"
        style={{ backgroundColor: "#03045e" }}
        aria-label="Admin Sidebar"
      >
        <SidebarContent
          sections={sectionsWithActive}
          onNavClick={handleNavClick}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </motion.aside>

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        {isMobileOpen && (
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden fixed left-0 top-0 h-full w-72 shadow-2xl z-50 flex flex-col pt-12"
            style={{ backgroundColor: "#03045e" }}
          >
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={16} />
            </button>
            <SidebarContent
              sections={sectionsWithActive}
              onNavClick={handleNavClick}
              isCollapsed={false}
              onToggleCollapse={null}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default React.memo(AdminSidebar);
