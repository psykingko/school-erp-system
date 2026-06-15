import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Briefcase, Activity, AlertCircle, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import MainCard from "../MainCard";
import { getBalanceByUser, getBalanceSummaryByUser } from "../../services/leaveBalanceService";
import { getLeaveTypes } from "../../services/leavePortfolioService";

const LeavePortfolioDashboard = ({ userId, userType, gender, refreshTrigger = 0 }) => {
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [summary, setSummary] = useState({ totalAllocatedDays: 0, totalUsedDays: 0, totalRemainingDays: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    if (!userId || !userType) return;
    
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const fetchedBalances = await getBalanceByUser(userId, userType);
        const fetchedTypes = await getLeaveTypes();
        // We will calculate summary locally after filtering for gender

        // Filter active leave types based on gender
        const isFemale = gender === "Female";
        const isMale = gender === "Male";
        
        const activeTypes = fetchedTypes.filter(t => {
          if (!t.isActive) return false;
          if (t.leaveTypeName.toLowerCase().includes("maternity") && !isFemale) return false;
          if (t.leaveTypeName.toLowerCase().includes("paternity") && !isMale) return false;
          return true;
        });

        // Join and filter: only show allocations that exist
        const resolvedBalances = fetchedBalances
          .map(b => {
            const type = activeTypes.find(t => t.leaveTypeId === b.leaveTypeId);
            if (!type) return null; // Type inactive or deleted
            return {
              ...b,
              leaveTypeName: type.leaveTypeName,
              description: type.description,
              defaultAllocation: type.defaultAllocation,
              sortOrder: type.sortOrder || 999
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const calculatedSummary = {
          totalAllocatedDays: resolvedBalances.reduce((sum, b) => sum + (Number(b.allocated) || 0), 0),
          totalUsedDays: resolvedBalances.reduce((sum, b) => sum + (Number(b.used) || 0), 0),
          totalRemainingDays: resolvedBalances.reduce((sum, b) => sum + (Number(b.remaining) || 0), 0)
        };

        setBalances(resolvedBalances);
        setSummary(calculatedSummary);
      } catch (err) {
        console.error("Failed to load portfolio dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, userType, gender, refreshTrigger]);

  const getStatusIndicator = (remaining, allocated) => {
    if (allocated === 0) return { label: "N/A", color: "text-gray-400", bg: "bg-gray-50", icon: Activity };
    const percentage = (remaining / allocated) * 100;
    
    if (remaining === 0) {
      return { label: "Exhausted", color: "text-rose-600", bg: "bg-rose-50 border-rose-100", icon: AlertCircle };
    } else if (percentage <= 50) {
      return { label: "Low Balance", color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: AlertTriangle };
    } else {
      return { label: "Available", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: CheckCircle2 };
    }
  };

  const toggleExpand = (id) => {
    setExpandedCardId(prev => prev === id ? null : id);
  };

  if (loading) {
    return <div className="p-8 text-center text-xs font-bold text-gray-400 animate-pulse">Loading Leave Portfolio...</div>;
  }

  if (balances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
        <Briefcase size={32} className="text-gray-300 mb-3" />
        <h3 className="text-sm font-black text-[#03045e]">No Allocations Assigned</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-md text-center">
          No leave allocations have been assigned yet. Please contact Administration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portfolio Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart size={18} className="text-[#0077b6]" />
          <h2 className="text-lg font-black text-[#03045e]">My Leave Portfolio</h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold bg-[#f8fafc] px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-[#03045e]">Allocated: <span className="font-black">{summary.totalAllocatedDays}</span></span>
          <span className="text-rose-500">Used: <span className="font-black">{summary.totalUsedDays}</span></span>
          <span className="text-emerald-600">Remaining: <span className="font-black">{summary.totalRemainingDays}</span></span>
        </div>
      </div>

      {/* Portfolio Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {balances.map(b => {
          const status = getStatusIndicator(Number(b.remaining), Number(b.allocated));
          const isExpanded = expandedCardId === b.balanceId;
          const StatusIcon = status.icon;

          return (
            <MainCard 
              key={b.balanceId} 
              className={`p-0 overflow-hidden border-l-4 transition-all duration-300 ${status.remaining === 0 ? 'border-rose-400' : 'border-[#0077b6]'}`}
            >
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => toggleExpand(b.balanceId)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider leading-tight">
                    {b.leaveTypeName}
                  </h3>
                  <div className={`px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-black tracking-wider uppercase border ${status.bg} ${status.color}`}>
                    <StatusIcon size={10} />
                    {status.label}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Allocated</p>
                    <p className="text-lg font-black text-[#03045e] leading-none mt-1">{b.allocated}</p>
                  </div>
                  <div className="bg-rose-50/50 rounded-lg p-2 border border-rose-100/50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Used</p>
                    <p className="text-lg font-black text-rose-500 leading-none mt-1">{b.used}</p>
                  </div>
                  <div className="bg-emerald-50/50 rounded-lg p-2 border border-emerald-100/50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Remaining</p>
                    <p className="text-lg font-black text-emerald-600 leading-none mt-1">{b.remaining}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center text-gray-300 hover:text-gray-500">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {/* Expanded Read-Only Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-100 bg-gray-50 overflow-hidden"
                  >
                    <div className="p-4 space-y-2 text-xs">
                      {b.description && (
                        <p className="text-gray-500 font-medium leading-relaxed pb-2 border-b border-gray-100">
                          {b.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center text-gray-500 font-bold">
                        <span>Institution Default</span>
                        <span className="text-[#03045e]">{b.defaultAllocation || "N/A"} Days</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500 font-bold">
                        <span>My Current Allocation</span>
                        <span className="text-[#03045e]">{b.allocated} Days</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500 font-bold">
                        <span>Total Consumed</span>
                        <span className="text-rose-500">{b.used} Days</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500 font-bold">
                        <span>Available Balance</span>
                        <span className="text-emerald-600">{b.remaining} Days</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </MainCard>
          );
        })}
      </div>
    </div>
  );
};

export default LeavePortfolioDashboard;
