/**
 * @deprecated 
 * LEGACY COMPONENT: Workload Analytics has been deprecated and officially retired.
 * All institutional capacity and coverage planning is now centralized 
 * within the Institutional Planning module. Do not add new features here.
 * This file is retained strictly to prevent breaking existing deep links.
 */
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, LayoutDashboard, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

const WorkloadAnalyticsPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Workload Analytics (Retired)"
        description="This module has been officially deprecated and retired."
        breadcrumbs={["Admin Portal", "Analytics", "Workload (Retired)"]}
      />

      <div className="max-w-3xl mx-auto mt-12">
        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={36} className="text-orange-500" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-orange-900 mb-4">
            Module Retired
          </h2>
          
          <p className="text-orange-800 font-medium text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">
            Workload Analytics has been officially retired. Staffing, capacity, coverage, and vacancy planning now live in a single unified dashboard to provide a more deterministic and actionable planning experience.
          </p>

          <button
            onClick={() => navigate("/admin/institutional-planning")}
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <LayoutDashboard size={18} />
            Go to Institutional Planning
            <ArrowRight size={18} />
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Architecture Freeze Active
          </p>
          <p className="text-[10px] font-semibold text-gray-400 mt-2">
            This route is preserved solely for deep-link compatibility.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkloadAnalyticsPage;
