import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ShieldCheck, Building2, BadgeAlert, Activity } from "lucide-react";

import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminQuickActionCard from "../../components/admin/AdminQuickActionCard";
import DashboardCardSkeleton from "../../shared/components/skeletons/DashboardCardSkeleton";
import adminDashboardService from "../../services/adminDashboardService";
import MainCard from "../../components/MainCard";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      staggerChildren: 0.1,
    },
  },
};

const IconRenderer = ({ iconName, ...props }) => {
  const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;
  return <Icon {...props} />;
};

IconRenderer.propTypes = {
  iconName: PropTypes.string.isRequired,
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#caf0f8] rounded-2xl bg-gray-50/50">
    <BadgeAlert size={32} className="text-[#00b4d8] mb-3" />
    <p className="text-sm font-black text-[#03045e]">{message}</p>
  </div>
);

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};

const WorkspaceCommandCard = ({ title, description, cta, iconName, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full p-5 text-left rounded-2xl bg-white border border-[#caf0f8] hover:bg-[#caf0f8]/30 hover:border-[#00b4d8] transition-all duration-150 group flex flex-col justify-between h-full shadow-sm hover:shadow-md"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-xl bg-[#caf0f8]/50 text-[#03045e] group-hover:bg-[#0077b6] group-hover:text-white transition-colors flex-shrink-0">
          <IconRenderer iconName={iconName} size={20} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-black text-[#03045e] group-hover:text-[#0077b6] transition-colors">{title}</h3>
          <p className="text-xs font-semibold text-gray-500 mt-1 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#00b4d8] group-hover:text-[#03045e] transition-colors">
        <span>{cta || "Open Module"}</span>
        <LucideIcons.ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

WorkspaceCommandCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  cta: PropTypes.string,
  iconName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const AdminIdentityCard = ({ welcome, profile }) => {
  if (!welcome || !profile) return null;
  return (
    <MainCard className="p-6 border border-[#caf0f8] bg-gradient-to-br from-[#03045e] via-[#023e8a] to-[#0077b6] text-white relative overflow-hidden">
      <div className="absolute right-0 top-0 w-80 h-80 bg-[#48cae4]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-[#90e0ef]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00b4d8] to-[#90e0ef] p-0.5 flex-shrink-0 shadow-lg">
            <div className="w-full h-full bg-[#03045e] rounded-[14px] flex items-center justify-center font-black text-xl text-[#caf0f8]">
              {welcome.avatarInitials}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">{welcome.greeting}</h2>
            <p className="text-xs text-[#caf0f8] font-bold mt-0.5">
              {welcome.designation} • {welcome.department}
            </p>
            {profile.isSuperAdmin && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Super Administrator</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm self-start">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-[#caf0f8]/70">Employee ID</span>
            <p className="text-sm font-black text-white mt-0.5">{profile.employeeId}</p>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-[#caf0f8]/70">Department</span>
            <p className="text-sm font-black text-white mt-0.5 flex items-center gap-1.5">
              <Building2 size={14} className="text-[#90e0ef]" />
              {profile.department}
            </p>
          </div>
        </div>
      </div>
    </MainCard>
  );
};

AdminIdentityCard.propTypes = {
  welcome: PropTypes.shape({
    avatarInitials: PropTypes.string,
    greeting: PropTypes.string,
    designation: PropTypes.string,
    department: PropTypes.string,
  }).isRequired,
  profile: PropTypes.shape({
    isSuperAdmin: PropTypes.bool,
    employeeId: PropTypes.string,
    department: PropTypes.string,
  }).isRequired,
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await adminDashboardService.getAdminDashboardPayload(user);
        setPayload(data);
      } catch (err) {
        console.error("Failed to load admin dashboard payload", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardCardSkeleton />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
      </div>
    );
  }

  if (!payload) {
    return <EmptyState message="Unable to load dashboard configuration." />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Institution Command Center"
        description="Daily administrative operations and personalized workspace."
        breadcrumbs={["Admin Portal", "Dashboard"]}
        actionButton={
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-[#caf0f8]">
            <Activity size={16} className="text-[#0077b6] animate-pulse" />
            <span className="text-xs font-black text-[#03045e] uppercase tracking-wider">
              SYSTEM BALANCED
            </span>
          </div>
        }
      />

      {/* Profile & Welcome Section */}
      <AdminIdentityCard welcome={payload.welcome} profile={payload.profile} />

      {/* Active Modules Grid */}
      <AdminSectionCard title="Active Modules" subtitle="Assigned operational domains">
        {payload.activeModules && payload.activeModules.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {payload.activeModules.map(module => (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="p-5 rounded-2xl border border-[#caf0f8] bg-white hover:border-[#00b4d8] hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group text-center"
              >
                <div className="p-3.5 rounded-xl bg-[#caf0f8]/30 text-[#03045e] group-hover:bg-[#0077b6] group-hover:text-white transition-colors">
                  <IconRenderer iconName={module.icon} size={26} strokeWidth={1.5} />
                </div>
                <span className="text-xs font-black text-[#03045e] group-hover:text-[#0077b6] leading-tight">{module.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState message="No modules assigned to your profile. Contact Super Administrator." />
        )}
      </AdminSectionCard>

      {/* Bottom Layout: Common Workspace & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <AdminSectionCard title="Personal Workspace" subtitle="Your personal tools and records">
            {payload.commonWorkspace && payload.commonWorkspace.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {payload.commonWorkspace.map(item => (
                  <WorkspaceCommandCard
                    key={item.id}
                    title={item.label}
                    description={item.description || `Access your ${item.label.toLowerCase()} details`}
                    cta={item.cta}
                    iconName={item.icon}
                    onClick={() => navigate(item.path)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="Personal workspace tools are currently unavailable." />
            )}
          </AdminSectionCard>
        </div>

        <div>
          <AdminSectionCard title="Quick Access" subtitle="Frequently used modules">
            <div className="space-y-3">
              {payload.quickAccess && payload.quickAccess.length > 0 ? (
                payload.quickAccess.map(item => (
                  <AdminQuickActionCard
                    key={item.id}
                    title={item.label}
                    icon={LucideIcons[item.icon] || LucideIcons.Settings}
                    onClick={() => navigate(item.path)}
                  />
                ))
              ) : (
                <EmptyState message="No quick actions available." />
              )}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
