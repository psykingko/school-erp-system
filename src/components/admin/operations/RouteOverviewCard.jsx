import React, { useState } from "react";
import MainCard from "../../MainCard";
import StatusBadge from "./StatusBadge";
import { Truck, Users, Phone, MapPin, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RouteOverviewCard = ({ 
  route,
  onViewDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const occupancy = route.occupancy || 0;
  const capacity = route.capacity || 40;
  const percentage = Math.round((occupancy / capacity) * 100) || 0;

  return (
    <MainCard className="p-0 hover:shadow-md transition-all bg-white border border-[#caf0f8]/50 shadow-sm relative overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between border-b border-[#caf0f8] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#caf0f8] text-[#03045e] flex items-center justify-center">
              <Truck size={18} />
            </div>
            <div>
              <span className="block text-[9px] font-black uppercase text-gray-400">{route.zone || "Transport Fleet"}</span>
              <h3 className="text-sm font-black text-[#03045e] tracking-tight">{route.routeNo}</h3>
            </div>
          </div>
          <StatusBadge status={route.status} />
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#00b4d8]" />
            <span><strong className="text-[#03045e]">{route.stops?.length || 0}</strong> Stops</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#00b4d8]" />
            <span><strong className={percentage > 90 ? "text-red-500" : "text-[#03045e]"}>{occupancy}</strong> / {capacity}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black tracking-wider border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isExpanded ? "COLLAPSE" : "EXPAND"}
          </button>
          <button 
            onClick={() => onViewDetails(route)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black tracking-wider bg-[#caf0f8]/50 text-[#0077b6] hover:bg-[#caf0f8] transition-colors"
          >
            <ExternalLink size={14} />
            VIEW DETAILS
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50"
          >
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[9px] font-black text-gray-400 uppercase mb-1">Vehicle Details</span>
                  <div className="text-xs font-bold text-[#03045e]">{route.vehicleNo}</div>
                  <div className="text-[10px] font-semibold text-gray-500">Cap: {capacity} Seats</div>
                </div>
                <div>
                  <span className="block text-[9px] font-black text-gray-400 uppercase mb-1">Attendant</span>
                  <div className="text-xs font-bold text-[#03045e]">{route.attendantName || "N/A"}</div>
                  <div className="text-[10px] font-semibold text-gray-500">{route.attendantPhone || "No contact"}</div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="block text-[9px] font-black text-gray-400 uppercase mb-1">Primary Driver</span>
                <div className="flex items-center gap-2 text-xs font-bold text-[#03045e]">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  {route.driverName}
                </div>
                <div className="text-[10px] font-semibold text-gray-500 flex items-center gap-1 mt-0.5 ml-5">
                  <Phone size={10} /> {route.driverPhone}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainCard>
  );
};

export default React.memo(RouteOverviewCard);
