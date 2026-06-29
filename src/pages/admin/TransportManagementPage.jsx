import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, Plus, AlertTriangle, ToggleLeft, MapPin, Users, Trash2, Edit3, X } from "lucide-react";

import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import RouteOverviewCard from "../../components/admin/operations/RouteOverviewCard";
import OperationsFilterBar from "../../components/admin/operations/OperationsFilterBar";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminDataTable from "../../components/admin/AdminDataTable";
import PermissionGate from "../../components/admin/PermissionGate";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";
import RouteDetailsModal from "../../components/admin/transport/RouteDetailsModal";
import { DriverModal, VehicleModal, RouteModal, StopModal, AllocateStudentModal } from "../../components/admin/transport/TransportCRUDModals";
import {
  getAllRoutes, getAllAlerts, getAllVehicles, getAllDrivers, getAllStops, getAllAllocations,
  createRoute, createVehicle, createDriver, createStop, deleteStop, createAllocation, deleteAllocation,
  createAlert, deleteAlert
} from "../../services/transportService";

import { getDataProvider } from "../../data";

const TABS = [
  { id: "routes", label: "Routes & Fleet", icon: Truck },
  { id: "stops", label: "Route Stops", icon: MapPin },
  { id: "allocation", label: "Student Allocation", icon: Users },
];

const TransportManagementPage = () => {
  const [activeTab, setActiveTab] = useState("routes");
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stops, setStops] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [stopRouteFilter, setStopRouteFilter] = useState("");
  const [allocRouteFilter, setAllocRouteFilter] = useState("");

  // Modal states
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isDriverModalOpen, setDriverModalOpen] = useState(false);
  const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [isRouteModalOpen, setRouteModalOpen] = useState(false);
  const [isStopModalOpen, setStopModalOpen] = useState(false);
  const [isAllocModalOpen, setAllocModalOpen] = useState(false);
  const [isAlertModalOpen, setAlertModalOpen] = useState(false);


  const [directionFilter, setDirectionFilter] = useState("PICKUP_ROUTE");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const provider = getDataProvider();
      const [allRoutes, allAlerts, allVehicles, allDrivers, allStops, allAllocations, allStudents] = await Promise.all([
        getAllRoutes(),
        getAllAlerts(),
        getAllVehicles(),
        getAllDrivers(),
        getAllStops(),
        getAllAllocations(),
        provider.getStudents()
      ]);
      setRoutes(allRoutes || []);
      setAlerts(allAlerts || []);
      setVehicles(allVehicles || []);
      setDrivers(allDrivers || []);
      setStops(allStops || []);
      setAllocations(allAllocations || []);
      setStudents(allStudents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriver = async (data) => { await createDriver(data); setDriverModalOpen(false); fetchData(); };
  const handleCreateVehicle = async (data) => { await createVehicle(data); setVehicleModalOpen(false); fetchData(); };
  const handleCreateRoute = async (data) => { await createRoute(data); setRouteModalOpen(false); fetchData(); };
  const handleCreateStop = async (data) => { await createStop(data); setStopModalOpen(false); fetchData(); };
  const handleCreateAllocation = async (data) => { await createAllocation(data); setAllocModalOpen(false); fetchData(); };
  const handleDeleteStop = async (stopId) => { if (window.confirm("Delete this stop?")) { await deleteStop(stopId); fetchData(); } };
  const handleDeleteAllocation = async (allocationId) => { if (window.confirm("Remove this student allocation?")) { await deleteAllocation(allocationId); fetchData(); } };
  const handlePushAlert = async (data) => { await createAlert(data); setAlertModalOpen(false); fetchData(); };
  const handleDismissAlert = async (alertId) => { await deleteAlert(alertId); fetchData(); };


  const toggleDirections = () => {
    const nextDir = directionFilter === "PICKUP_ROUTE" ? "DROP_ROUTE" : "PICKUP_ROUTE";
    setDirectionFilter(nextDir);
    setRoutes((prev) => prev.map((r) => ({ ...r, activeDirection: nextDir })));
  };

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch = !searchTerm || r.routeNo?.toLowerCase().includes(searchTerm.toLowerCase()) || r.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) || r.zone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = !selectedZone || r.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  const filteredStops = stops.filter(s => !stopRouteFilter || s.routeId === stopRouteFilter);
  const filteredAllocations = allocations.filter(a => !allocRouteFilter || a.routeId === allocRouteFilter);

  const totalOccupancy = routes.reduce((acc, r) => acc + (r.occupancy || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-12">
      <AdminPageHeader
        title="School Transport Management"
        description="Monitor school bus route fleets, verify driver credentials, track occupancy, manage route stops, and allocate students."
        breadcrumbs={["Admin Portal", "Operations", "Transport"]}
        actionButton={
          <button onClick={toggleDirections} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#03045e] hover:bg-[#0077b6] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors">
            <ToggleLeft size={16} />
            SWITCH TO {directionFilter === "PICKUP_ROUTE" ? "DROP ROUTE" : "PICKUP ROUTE"}
          </button>
        }
      />
      
      <PageAuthorityBanner moduleId="admin_transport" moduleName="Transport Management" />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <OperationsStatCard title="Active Bus Fleet" value={routes.length.toString()} description="CNG & Green-Electric Vehicles" icon={Truck} />
        <OperationsStatCard title="Total Bus Commuters" value={`${totalOccupancy} Students`} description="Calculated from allocations" icon={Users} color="#0096c7" bg="#ade8f4" />
        <OperationsStatCard title="Route Stops Mapped" value={stops.filter(s => !s.isSchool).length.toString()} description="Across all active routes" icon={MapPin} color="#03045e" bg="#e0f2fe" />
      </div>

      {/* Push-able Alerts Panel */}
      <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs font-black uppercase text-amber-600">
            <AlertTriangle size={16} className="text-amber-500" />
            Active Transport Alerts
            <span className="ml-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black border border-amber-100">
              Visible on Student &amp; Parent Portals
            </span>
          </div>
          <PermissionGate moduleId="admin_transport" permission="create" mode="hidden">
            <button
              onClick={() => setAlertModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
            >
              <Plus size={13} /> Push Alert
            </button>
          </PermissionGate>
        </div>
        {alerts.length === 0 ? (
          <p className="text-xs text-gray-400 font-bold italic">No active alerts. Use &ldquo;Push Alert&rdquo; to broadcast to student/parent portals.</p>
        ) : (
          <div className="divide-y divide-amber-50">
            {alerts.map((al) => (
              <div key={al.alertId} className="flex items-start justify-between gap-3 py-3">
                <div className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${al.severity === "danger" ? "bg-red-500 animate-pulse" : "bg-amber-400"}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      <span className="text-[#03045e] font-black">{al.routeId === "ALL" ? "📢 All Routes" : `Route ${al.routeId}`}</span>
                      {" — "}{al.messageEn}
                    </p>
                    {al.createdAt && (
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        Pushed: {new Date(al.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
                <PermissionGate moduleId="admin_transport" permission="delete" mode="hidden">
                  <button
                    onClick={() => handleDismissAlert(al.alertId)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Dismiss alert"
                  >
                    <Trash2 size={12} />
                  </button>
                </PermissionGate>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl self-start">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${isActive ? "bg-white text-[#03045e] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <Icon size={13} />{tab.label}
            </button>
          );
        })}
      </div>

      {/* ========== TAB: ROUTES ========== */}
      {activeTab === "routes" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <PermissionGate moduleId="admin_transport" permission="create" mode="hidden">
              <button onClick={() => setRouteModalOpen(true)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border border-[#caf0f8] hover:border-[#00b4d8] text-[#03045e] px-4 py-2 rounded-xl text-xs font-bold transition-colors"><Plus size={14} /> Add Route</button>
            </PermissionGate>
            <PermissionGate moduleId="admin_transport" permission="create" mode="hidden">
              <button onClick={() => setVehicleModalOpen(true)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border border-[#caf0f8] hover:border-[#00b4d8] text-[#03045e] px-4 py-2 rounded-xl text-xs font-bold transition-colors"><Plus size={14} /> Add Vehicle</button>
            </PermissionGate>
            <PermissionGate moduleId="admin_transport" permission="create" mode="hidden">
              <button onClick={() => setDriverModalOpen(true)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border border-[#caf0f8] hover:border-[#00b4d8] text-[#03045e] px-4 py-2 rounded-xl text-xs font-bold transition-colors"><Plus size={14} /> Add Driver</button>
            </PermissionGate>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRoutes.map((route) => (
              <RouteOverviewCard key={route.id} route={route} onViewDetails={(r) => setSelectedRoute(r)} />
            ))}
          </div>

          <AdminSectionCard>
            <OperationsFilterBar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search by driver, route no, or zone..."
              filterSlots={
                <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] bg-white outline-none cursor-pointer">
                  <option value="">All Zones</option>
                  {["North Zone","South Zone","East Zone","West Zone","Central Zone"].map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              }
            />
            <div className="mt-6">
              <AdminDataTable
                headers={["Route", "Driver", "Attendant", "Vehicle", "Zone", "Occupancy", "Duration", "Status"]}
                items={filteredRoutes} isEmpty={filteredRoutes.length === 0} emptyTitle="No routes found"
                renderRow={(r) => (
                  <tr key={r.id} className="hover:bg-[#caf0f8]/10 text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40">
                    <td className="py-4 px-3 text-[#03045e] font-black">{r.routeNo}</td>
                    <td className="py-4 px-3 text-gray-800 font-extrabold">{r.driverName}</td>
                    <td className="py-4 px-3 text-gray-500">{r.attendantName || "N/A"}</td>
                    <td className="py-4 px-3 text-[#0077b6]">{r.vehicleNo}</td>
                    <td className="py-4 px-3 text-gray-500">{r.zone}</td>
                    <td className="py-4 px-3 font-bold">
                      <span className={r.occupancy / r.capacity > 0.9 ? "text-red-500" : "text-emerald-600"}>
                        {r.occupancy} / {r.capacity}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-gray-400">{r.estimatedDuration}</td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${r.status === "Completed" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-[#0077b6]"}`}>{r.status || "In-Route"}</span>
                    </td>
                  </tr>
                )}
              />
            </div>
          </AdminSectionCard>
        </div>
      )}

      {/* ========== TAB: STOPS ========== */}
      {activeTab === "stops" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <PermissionGate moduleId="admin_transport" permission="create" mode="hidden">
              <button onClick={() => setStopModalOpen(true)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#03045e] hover:bg-[#0077b6] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"><Plus size={14} /> Add Stop</button>
            </PermissionGate>
            <select value={stopRouteFilter} onChange={e => setStopRouteFilter(e.target.value)} className="border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] bg-white outline-none cursor-pointer">
              <option value="">All Routes</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.routeNo} — {r.zone}</option>)}
            </select>
          </div>
          <AdminSectionCard>
            <AdminDataTable
              headers={["Route", "Stop Name", "Sequence", "Pickup Time", "School Stop", "Actions"]}
              items={filteredStops} isEmpty={filteredStops.length === 0} emptyTitle="No stops found. Add stops for each route."
              renderRow={(s) => {
                const route = routes.find(r => r.id === s.routeId);
                return (
                  <tr key={s.stopId} className="hover:bg-[#caf0f8]/10 text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40">
                    <td className="py-4 px-3 text-[#03045e] font-black">{route?.routeNo || s.routeId}</td>
                    <td className="py-4 px-3 text-gray-800 font-extrabold">{s.stopName}</td>
                    <td className="py-4 px-3 text-center">{s.sequence === 99 ? "—" : s.sequence}</td>
                    <td className="py-4 px-3 text-[#0077b6] font-bold">{s.pickupTime}</td>
                    <td className="py-4 px-3">
                      {s.isSchool ? <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black">YES</span> : "—"}
                    </td>
                    <td className="py-4 px-3">
                      {!s.isSchool && (
                        <PermissionGate moduleId="admin_transport" permission="delete" mode="hidden">
                          <button onClick={() => handleDeleteStop(s.stopId)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </PermissionGate>
                      )}
                    </td>
                  </tr>
                );
              }}
            />
          </AdminSectionCard>
        </div>
      )}

      {/* ========== TAB: STUDENT ALLOCATION ========== */}
      {activeTab === "allocation" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <PermissionGate moduleId="admin_transport" permission="create" mode="hidden">
              <button onClick={() => setAllocModalOpen(true)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#03045e] hover:bg-[#0077b6] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"><Plus size={14} /> Allocate Student</button>
            </PermissionGate>
            <select value={allocRouteFilter} onChange={e => setAllocRouteFilter(e.target.value)} className="border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] bg-white outline-none cursor-pointer">
              <option value="">All Routes</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.routeNo} — {r.zone}</option>)}
            </select>
          </div>
          <AdminSectionCard>
            <AdminDataTable
              headers={["Student", "Class", "Route", "Pickup Stop", "Gender", "Status", "Action"]}
              items={filteredAllocations} isEmpty={filteredAllocations.length === 0} emptyTitle="No student allocations. Allocate students to routes."
              renderRow={(a) => {
                const route = routes.find(r => r.id === a.routeId);
                const stop = stops.find(s => s.stopId === a.stopId);
                return (
                  <tr key={a.allocationId} className="hover:bg-[#caf0f8]/10 text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40">
                    <td className="py-4 px-3 text-[#03045e] font-black">{a.studentName}</td>
                    <td className="py-4 px-3 text-gray-500">{a.className}</td>
                    <td className="py-4 px-3 text-[#0077b6]">{route?.routeNo || a.routeId}</td>
                    <td className="py-4 px-3 text-gray-700">{stop?.stopName || a.stopId}</td>
                    <td className="py-4 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${a.gender === "Female" ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"}`}>{a.gender}</span>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${a.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{a.status}</span>
                    </td>
                    <td className="py-4 px-3">
                      <PermissionGate moduleId="admin_transport" permission="delete" mode="hidden">
                        <button onClick={() => handleDeleteAllocation(a.allocationId)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={12} /></button>
                      </PermissionGate>
                    </td>
                  </tr>
                );
              }}
            />
          </AdminSectionCard>
        </div>
      )}

      {/* Modals */}
      <RouteDetailsModal isOpen={!!selectedRoute} onClose={() => setSelectedRoute(null)} route={selectedRoute} />
      <DriverModal isOpen={isDriverModalOpen} onClose={() => setDriverModalOpen(false)} onSave={handleCreateDriver} />
      <VehicleModal isOpen={isVehicleModalOpen} onClose={() => setVehicleModalOpen(false)} onSave={handleCreateVehicle} />
      <RouteModal isOpen={isRouteModalOpen} onClose={() => setRouteModalOpen(false)} onSave={handleCreateRoute} drivers={drivers} vehicles={vehicles} />
      <StopModal isOpen={isStopModalOpen} onClose={() => setStopModalOpen(false)} onSave={handleCreateStop} routes={routes} />
      <AllocateStudentModal isOpen={isAllocModalOpen} onClose={() => setAllocModalOpen(false)} onSave={handleCreateAllocation} routes={routes} stops={stops} students={students} />
      <PushAlertModal isOpen={isAlertModalOpen} onClose={() => setAlertModalOpen(false)} onSave={handlePushAlert} routes={routes} />
    </motion.div>
  );
};

// ===== PUSH ALERT MODAL (inline, no separate file needed) =====
const PushAlertModal = ({ isOpen, onClose, onSave, routes }) => {
  const [form, setForm] = useState({
    routeId: "ALL",
    type: "delay",
    severity: "warning",
    messageEn: "",
    messageHi: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.messageEn.trim()) return;
    onSave(form);
    setForm({ routeId: "ALL", type: "delay", severity: "warning", messageEn: "", messageHi: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03045e]/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl w-full w-[95vw] md:w-[90vw] lg:max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
          <div>
            <h2 className="text-xl font-black text-[#03045e] tracking-tight">Push Transport Alert</h2>
            <p className="text-[10px] font-bold text-amber-600 mt-0.5">Instantly visible on Student &amp; Parent portals</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} />
          </button>

        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Target */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Target Route</label>
            <select
              value={form.routeId}
              onChange={e => setForm({ ...form, routeId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#03045e] font-bold outline-none focus:border-amber-400"
            >
              <option value="ALL">📢 All Routes (Broadcast to all students &amp; parents)</option>
              {routes?.map(r => (
                <option key={r.id} value={r.id}>{r.routeNo} — {r.zone}</option>
              ))}
            </select>
          </div>

          {/* Type + Severity row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Alert Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#03045e] font-bold outline-none focus:border-amber-400"
              >
                <option value="delay">🕐 Delay</option>
                <option value="breakdown">🔧 Breakdown</option>
                <option value="diversion">🔀 Diversion</option>
                <option value="reassignment">🔄 Vehicle Reassignment</option>
                <option value="weather">🌧️ Weather Advisory</option>
                <option value="general">📣 General Notice</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={e => setForm({ ...form, severity: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#03045e] font-bold outline-none focus:border-amber-400"
              >
                <option value="warning">⚠️ Warning</option>
                <option value="danger">🔴 Danger (Critical)</option>
                <option value="info">ℹ️ Info</option>
              </select>
            </div>
          </div>

          {/* Message EN */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Message (English) <span className="text-red-400">*</span></label>
            <textarea
              required
              rows={2}
              value={form.messageEn}
              onChange={e => setForm({ ...form, messageEn: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#03045e] font-bold outline-none focus:border-amber-400 resize-none"
              placeholder="e.g. Bus RT-101 is delayed by 15 minutes due to traffic."
            />
          </div>

          {/* Message HI */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Message (Hindi) <span className="text-gray-300">optional</span></label>
            <textarea
              rows={2}
              value={form.messageHi}
              onChange={e => setForm({ ...form, messageHi: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#03045e] font-bold outline-none focus:border-amber-400 resize-none"
              placeholder="उदाहरण: बस RT-101 ट्रैफिक के कारण 15 मिनट देरी से आएगी।"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-black text-xs rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-2 flex-grow py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl transition-colors tracking-wide">
              📡 PUSH ALERT TO PORTALS
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TransportManagementPage;

