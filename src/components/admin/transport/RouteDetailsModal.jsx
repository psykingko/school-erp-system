import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, ShieldCheck, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { getStopsByRoute, getAllocationsByRoute } from "../../../services/transportService";

const RouteDetailsModal = ({ isOpen, onClose, route }) => {
  const [stops, setStops] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && route?.id) {
      setLoading(true);
      Promise.all([
        getStopsByRoute(route.id),
        getAllocationsByRoute(route.id)
      ]).then(([routeStops, routeAllocations]) => {
        setStops(routeStops || []);
        setAllocations((routeAllocations || []).filter(a => a.status === "ACTIVE"));
      }).finally(() => setLoading(false));
    }
  }, [isOpen, route?.id]);

  if (!isOpen || !route) return null;

  const totalStudents = allocations.length;
  const boys = allocations.filter(a => a.gender === "Male").length;
  const girls = allocations.filter(a => a.gender === "Female").length;
  const occupancyPercent = route.capacity ? Math.round((totalStudents / route.capacity) * 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03045e]/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${route.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-[#0077b6] border-blue-100"}`}>
                  {route.status || "Active"}
                </span>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {route.zone || "Transport Zone"}
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#03045e] tracking-tight">
                Route {route.routeNo}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Users size={12} className="text-[#0077b6]" /> Occupancy
                </p>
                <p className="text-xl font-black text-[#03045e]">
                  {occupancyPercent}%
                  <span className="text-xs text-gray-400 font-bold ml-1">({totalStudents}/{route.capacity})</span>
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Users size={12} className="text-pink-400" /> Demographics
                </p>
                <p className="text-xl font-black text-[#03045e]">
                  {boys} <span className="text-xs text-gray-400 font-bold">B</span> / {girls} <span className="text-xs text-gray-400 font-bold">G</span>
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Clock size={12} className="text-amber-500" /> Morning Shift
                </p>
                <p className="text-sm font-bold text-[#03045e] mt-1">Start: {route.pickupTime || "07:00 AM"}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Clock size={12} className="text-purple-500" /> Afternoon Shift
                </p>
                <p className="text-sm font-bold text-[#03045e] mt-1">End: {route.dropTime || "04:00 PM"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column */}
              <div className="space-y-4">

                {/* Vehicle */}
                <div className="bg-white p-5 rounded-3xl border border-[#caf0f8]/50 shadow-sm">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Truck size={13} className="text-[#00b4d8]" /> Vehicle Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">Bus Number</p>
                      <p className="text-sm font-bold text-[#03045e]">{route.vehicleNo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">Registration No</p>
                      <p className="text-sm font-bold text-[#03045e]">{route.registrationNo || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">Capacity</p>
                      <p className="text-sm font-bold text-[#03045e]">{route.capacity} Seats</p>
                    </div>
                  </div>
                </div>

                {/* Personnel */}
                <div className="bg-white p-5 rounded-3xl border border-[#caf0f8]/50 shadow-sm">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck size={13} className="text-emerald-500" /> Personnel Assigned
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Driver</p>
                      <p className="text-sm font-bold text-[#03045e]">{route.driverName}</p>
                      <p className="text-xs font-semibold text-gray-500">{route.driverPhone}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Attendant</p>
                      <p className="text-sm font-bold text-[#03045e]">{route.attendantName || "N/A"}</p>
                      <p className="text-xs font-semibold text-gray-500">{route.attendantPhone || "No contact"}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Stops Timeline */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-3xl border border-[#caf0f8]/50 shadow-sm h-full">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <MapPin size={13} className="text-[#0077b6]" /> Route Stops Timeline
                    <span className="ml-auto text-[10px] font-bold text-gray-400">{stops.filter(s => !s.isSchool).length} Stops</span>
                  </h3>

                  {loading ? (
                    <div className="text-xs text-gray-400 text-center py-8">Loading stops...</div>
                  ) : stops.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-8 italic">No stops registered for this route yet.</div>
                  ) : (
                    <div className="relative pl-6 space-y-5 border-l-2 border-[#caf0f8] ml-2">
                      {stops.sort((a, b) => a.sequence - b.sequence).map((stop, idx) => (
                        <div key={stop.stopId} className="relative">
                          <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${stop.isSchool ? 'bg-indigo-500' : 'bg-[#00b4d8]'}`}></div>
                          <div className="pl-2">
                            <h4 className={`text-sm font-bold ${stop.isSchool ? 'text-indigo-600' : 'text-[#03045e]'}`}>
                              {stop.stopName} {stop.isSchool && <span className="text-[10px] font-bold text-indigo-400">(School)</span>}
                            </h4>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                                <ArrowRight size={10} className="inline mr-1" />Seq: {stop.sequence === 99 ? "Final" : stop.sequence}
                              </span>
                              <span className="text-[10px] font-bold text-[#0077b6] bg-blue-50 px-2 py-0.5 rounded-md">
                                {stop.pickupTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Student allocation summary */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Students Assigned (Read-only)</h4>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-black text-[#03045e]">{totalStudents}</p>
                        <p className="text-[10px] font-bold text-gray-400">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black text-blue-500">{boys}</p>
                        <p className="text-[10px] font-bold text-gray-400">Boys</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black text-pink-400">{girls}</p>
                        <p className="text-[10px] font-bold text-gray-400">Girls</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RouteDetailsModal;
