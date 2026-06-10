import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// === BASE MODAL WRAPPER ===
const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03045e]/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-black text-[#03045e] tracking-tight">{title}</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// === DRIVER MODAL ===
export const DriverModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      employeeName: formData.name,
      phone: formData.phone,
      email: formData.email,
      departmentId: "dept-transport",
      roleId: "role-driver",
      designation: "Driver",
      status: "active",
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setFormData({ name: "", phone: "", email: "" });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Add New Driver">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Driver Name</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" placeholder="e.g. Rajesh Kumar" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
          <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" placeholder="+91-9876543210" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Email (Optional)</label>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" placeholder="rajesh@school.edu" />
        </div>
        <button type="submit" className="w-full mt-4 bg-[#03045e] hover:bg-[#0077b6] text-white font-black text-xs py-3 rounded-xl transition-colors tracking-wide">SAVE DRIVER</button>
      </form>
    </ModalWrapper>
  );
};

// === VEHICLE MODAL ===
export const VehicleModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ vehicleNo: "", capacity: 40, model: "Tata Starbus 40" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ vehicleNo: "", capacity: 40, model: "Tata Starbus 40" });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Add New Vehicle">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Registration No.</label>
          <input required type="text" value={formData.vehicleNo} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" placeholder="e.g. UP32 AB 1234" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Vehicle Model</label>
          <input required type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" placeholder="e.g. Tata Starbus 40" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Capacity</label>
          <input required type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" />
        </div>
        <button type="submit" className="w-full mt-4 bg-[#03045e] hover:bg-[#0077b6] text-white font-black text-xs py-3 rounded-xl transition-colors tracking-wide">SAVE VEHICLE</button>
      </form>
    </ModalWrapper>
  );
};

// === ROUTE MODAL ===
export const RouteModal = ({ isOpen, onClose, onSave, drivers, vehicles }) => {
  const [formData, setFormData] = useState({ routeNo: "", zone: "North Zone", vehicleId: "", driverId: "", attendantName: "", attendantPhone: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, status: "In-Route", activeDirection: "PICKUP_ROUTE", pickupTime: "07:00 AM", dropTime: "04:00 PM" });
    setFormData({ routeNo: "", zone: "North Zone", vehicleId: "", driverId: "", attendantName: "", attendantPhone: "" });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Add New Route">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Route Number</label>
            <input required type="text" value={formData.routeNo} onChange={e => setFormData({...formData, routeNo: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" placeholder="e.g. RT-110" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Zone</label>
            <select value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]">
              {["North Zone","South Zone","East Zone","West Zone","Central Zone"].map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Assign Vehicle</label>
          <select required value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]">
            <option value="">Select Vehicle...</option>
            {vehicles?.map(v => <option key={v.id} value={v.id}>{v.vehicleNo} ({v.capacity} Seats)</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Assign Driver</label>
          <select required value={formData.driverId} onChange={e => setFormData({...formData, driverId: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]">
            <option value="">Select Driver...</option>
            {drivers?.map(d => <option key={d.employeeId} value={d.employeeId}>{d.employeeName} ({d.phone})</option>)}
          </select>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Attendant Name</label>
          <input type="text" value={formData.attendantName} onChange={e => setFormData({...formData, attendantName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" placeholder="e.g. Geeta Devi" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Attendant Phone</label>
          <input type="text" value={formData.attendantPhone} onChange={e => setFormData({...formData, attendantPhone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" placeholder="+91-..." />
        </div>
        <button type="submit" className="w-full mt-4 bg-[#03045e] hover:bg-[#0077b6] text-white font-black text-xs py-3 rounded-xl transition-colors tracking-wide">SAVE ROUTE</button>
      </form>
    </ModalWrapper>
  );
};

// === STOP MODAL ===
export const StopModal = ({ isOpen, onClose, onSave, routes }) => {
  const [formData, setFormData] = useState({ routeId: "", stopName: "", sequence: 1, pickupTime: "07:05 AM" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, sequence: parseInt(formData.sequence) });
    setFormData({ routeId: "", stopName: "", sequence: 1, pickupTime: "07:05 AM" });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Add Route Stop">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Route</label>
          <select required value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]">
            <option value="">Select Route...</option>
            {routes?.map(r => <option key={r.id} value={r.id}>{r.routeNo} — {r.zone}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Stop Name</label>
          <input required type="text" value={formData.stopName} onChange={e => setFormData({...formData, stopName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" placeholder="e.g. Sector 62 Metro Gate" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Sequence #</label>
            <input required type="number" min="1" value={formData.sequence} onChange={e => setFormData({...formData, sequence: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Pickup Time</label>
            <input required type="text" value={formData.pickupTime} onChange={e => setFormData({...formData, pickupTime: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]" placeholder="07:05 AM" />
          </div>
        </div>
        <button type="submit" className="w-full mt-4 bg-[#03045e] hover:bg-[#0077b6] text-white font-black text-xs py-3 rounded-xl transition-colors tracking-wide">SAVE STOP</button>
      </form>
    </ModalWrapper>
  );
};

// === ALLOCATE STUDENT MODAL ===
export const AllocateStudentModal = ({ isOpen, onClose, onSave, routes, stops, students }) => {
  const [formData, setFormData] = useState({ studentId: "", routeId: "", stopId: "", gender: "Male" });

  const routeStops = stops?.filter(s => s.routeId === formData.routeId && !s.isSchool) || [];

  const handleRouteChange = (routeId) => {
    setFormData(prev => ({ ...prev, routeId, stopId: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const student = students?.find(s => s.studentId === formData.studentId || s.id === formData.studentId);
    onSave({
      ...formData,
      studentName: student?.name || "Unknown",
      className: student?.className || "N/A",
      status: "ACTIVE"
    });
    setFormData({ studentId: "", routeId: "", stopId: "", gender: "Male" });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Allocate Student to Route">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Select Student</label>
          <select required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]">
            <option value="">Select Student...</option>
            {students?.map(s => <option key={s.id || s.studentId} value={s.id || s.studentId}>{s.name} ({s.className})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Gender</label>
          <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Select Route</label>
          <select required value={formData.routeId} onChange={e => handleRouteChange(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6]">
            <option value="">Select Route...</option>
            {routes?.map(r => <option key={r.id} value={r.id}>{r.routeNo} — {r.zone}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
            Pickup Stop {!formData.routeId && <span className="text-gray-300">(select route first)</span>}
          </label>
          <select required value={formData.stopId} onChange={e => setFormData({...formData, stopId: e.target.value})} disabled={!formData.routeId} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#03045e] font-bold outline-none focus:border-[#0077b6] disabled:opacity-40">
            <option value="">Select Stop...</option>
            {routeStops.map(s => <option key={s.stopId} value={s.stopId}>{s.stopName} ({s.pickupTime})</option>)}
          </select>
        </div>
        <button type="submit" className="w-full mt-4 bg-[#03045e] hover:bg-[#0077b6] text-white font-black text-xs py-3 rounded-xl transition-colors tracking-wide">SAVE ALLOCATION</button>
      </form>
    </ModalWrapper>
  );
};

