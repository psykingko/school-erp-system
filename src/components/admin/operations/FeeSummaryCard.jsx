import React from "react";
import MainCard from "../../MainCard";
import { CreditCard, Wallet, AlertCircle } from "lucide-react";

/**
 * FeeSummaryCard
 * 
 * Reusable panel presenting financial collections, outstanding ledger margins, and relative paid index metrics.
 */
const FeeSummaryCard = ({ 
  classNameName = "Class 11", 
  totalExpected = 0, 
  totalCollected = 0, 
  defaultersCount = 0 
}) => {
  const outstanding = totalExpected - totalCollected;
  const collectedPct = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <MainCard className="p-6 hover:shadow-md transition-all bg-white border border-[#caf0f8]/55 shadow-sm relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#caf0f8] pb-3 mb-4">
        <div>
          <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">Operational Section Ledger</span>
          <h3 className="text-sm font-black text-[#03045e] tracking-tight mt-0.5">{classNameName}</h3>
        </div>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
          {collectedPct}% COLLECTED
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Collected</p>
          <div className="flex items-center gap-1 text-emerald-600">
            <Wallet size={12} />
            <span className="text-xs font-black">₹{totalCollected.toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Outstanding Dues</p>
          <div className="flex items-center gap-1 text-rose-600">
            <AlertCircle size={12} />
            <span className="text-xs font-black">₹{outstanding.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-[#caf0f8]/50 pt-3 flex items-center justify-between text-[10px] font-bold text-gray-400">
        <span>Defaulters Mapped: <strong className="text-rose-600 font-black">{defaultersCount} Students</strong></span>
        <span>Target: ₹{totalExpected.toLocaleString()}</span>
      </div>
    </MainCard>
  );
};

export default React.memo(FeeSummaryCard);
