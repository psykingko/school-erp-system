import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const MiniDatePicker = ({ selectedDate, onSelect, onClose }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const startPadding = firstDay === 0 ? 6 : firstDay - 1; // Start from Monday
  
  const days = [];
  for (let i = 0; i < startPadding; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const isToday = (d) => {
    const today = new Date();
    return d === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (d) => {
    return d === selectedDate.getDate() && viewDate.getMonth() === selectedDate.getMonth() && viewDate.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-[#caf0f8] p-4 w-64"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-[#03045e] text-sm">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h4>
        <div className="flex gap-1">
          <button 
            onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
            className="p-1 hover:bg-[#caf0f8] rounded-md transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
            className="p-1 hover:bg-[#caf0f8] rounded-md transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map(d => (
          <span key={d} className="text-[10px] font-black text-gray-400">{d}</span>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {d && (
              <button
                onClick={() => {
                  const newDate = new Date(viewDate);
                  newDate.setDate(d);
                  onSelect(newDate);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all
                  ${isSelected(d) ? "bg-[#03045e] text-white" : isToday(d) ? "bg-[#00b4d820] text-[#00b4d8] border border-[#00b4d8]" : "hover:bg-[#caf0f8] text-gray-600"}
                `}
              >
                {d}
              </button>
            )}
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => onSelect(new Date())}
        className="mt-4 w-full py-2 text-[11px] font-black uppercase tracking-widest text-[#0077b6] hover:bg-[#caf0f8] rounded-xl transition-colors"
      >
        Jump to Today
      </button>
    </motion.div>
  );
};
