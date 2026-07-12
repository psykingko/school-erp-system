import React, { useState } from "react";
import {
  Bus,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  Navigation,
  Zap,
  Map,
  Phone,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { 
  getTransportSummary, 
  getVehicleDetails, 
  getPersonnelInfo, 
  getRouteTimeline, 
  getTransportNotices, 
  getSafetyGuidelines 
} from "../../services/transportService";
import { useService } from "../../hooks/useService";
import { useStudent } from "../../context/StudentContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";
import MainCard from "../../components/MainCard";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const CYAN = "#00b4d8";
const LIME = "#caf0f8";

function SectionHeader({ icon, title, aside }) {
  return (
    <div className="flex items-center justify-between mb-4 px-1">
      <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6] flex-shrink-0">
          {icon}
        </div>
        {title}
      </h2>
      {aside && <div>{aside}</div>}
    </div>
  );
}

function MetaRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-[9px] font-black uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className={`text-xs font-bold text-right ${valueClass || "text-[#03045e]"}`}>
        {value}
      </span>
    </div>
  );
}

export default function TransportPage() {
  const { t, lang } = useLanguage();
  const { activeStudentId } = useStudent();
  const [showHelper, setShowHelper] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  const { data: summary, loading: sLoading } = useService(getTransportSummary, [activeStudentId], [activeStudentId]);
  const { data: vehicle, loading: vLoading } = useService(getVehicleDetails, [activeStudentId], [activeStudentId]);
  const { data: personnel, loading: pLoading } = useService(getPersonnelInfo, [activeStudentId], [activeStudentId]);
  const { data: route, loading: rLoading } = useService(getRouteTimeline, [activeStudentId], [activeStudentId]);
  const { data: notices, loading: nLoading } = useService(getTransportNotices, [activeStudentId, lang], [activeStudentId, lang]);
  const { data: guidelines, loading: gLoading } = useService(getSafetyGuidelines, [activeStudentId, lang], [activeStudentId, lang]);

  const loading = sLoading || vLoading || pLoading || rLoading || nLoading || gLoading;

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00b4d8]"></div>
    </div>
  );

  const routeList = route || [];
  const currentIdx = routeList.findIndex(item => item.current);
  const progressPct = routeList.length > 1
    ? (currentIdx / (routeList.length - 1)) * 100
    : 0;

  return (
    <div className="max-w-[1600px] mx-auto pb-12 px-2 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
            <Bus size={28} className="text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black truncate" style={{ color: NAVY }}>
              {t("transport.title", { fallback: "Student Transport" })}
            </h1>
            <p className="text-sm text-gray-500 truncate">{t("transport.subtitle", { fallback: "Track your route, vehicle, and personnel details." })}</p>
          </div>
        </div>

        <div className="flex-shrink-0 ml-auto">
          <HelperButton onClick={() => setShowHelper(true)} />
        </div>
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-12 lg:col-span-8">
            <SectionHeader
              icon={<Map size={16} />}
              title={t("transport.assigned_route", { fallback: "Assigned Route" })}
            />
            <MainCard
              className="p-6 flex flex-col gap-5 h-[calc(100%-3.25rem)]"
              borderColor={CYAN}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#00b4d8] mb-1">
                    {summary?.activeDirection === "DROP_ROUTE"
                      ? t("transport.returnDropTitle", { fallback: "Return Drop Route • Heading Home" })
                      : t("transport.morningPickupTitle", { fallback: "Morning Pickup Route • Heading to School" })}
                  </p>
                  <h2 className="text-4xl font-black leading-none" style={{ color: NAVY }}>
                    {summary?.routeNo}
                  </h2>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-1">
                      {summary?.activeDirection === "DROP_ROUTE"
                        ? t("transport.dropStop", { fallback: "Drop Stop" })
                        : t("transport.pickup", { fallback: "Pickup Stop" })}
                    </p>
                    <p className="text-sm font-bold" style={{ color: NAVY }}>
                      {summary?.pickupStop}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-1">
                      {summary?.activeDirection === "DROP_ROUTE"
                        ? t("transport.dropTime", { fallback: "Drop Time" })
                        : t("transport.departure", { fallback: "Pickup Time" })}
                    </p>
                    <p className="text-sm font-bold" style={{ color: NAVY }}>
                      {summary?.pickupTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: t("transport.vehicleNo", { fallback: "Vehicle No" }), value: summary?.vehicleNo },
                  { label: t("transport.passId", { fallback: "Pass ID" }),    value: summary?.passId,    accent: true },
                  { label: t("transport.status", { fallback: "Status" }),     value: summary?.status,    green: true },
                ].map(({ label, value, accent, green }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 border border-gray-100"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-1">
                      {label}
                    </p>
                    <p className={`text-xs font-bold ${green ? "text-emerald-600" : accent ? "text-[#0077b6]" : "text-[#03045e]"}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3 mt-auto">
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wide">
                    <Zap size={10} /> {t("transport.gpsActive", { fallback: "GPS Active" })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0077b6] text-[10px] font-black uppercase tracking-wide">
                    <Clock size={10} /> {t("transport.onTime", { fallback: "On Time" })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400">
                    {t("transport.next", { fallback: "Next:" })} <span className="font-black" style={{ color: NAVY }}>{summary?.nextStop || t("transport.mainGate", { fallback: "Main Gate" })}</span>
                  </span>
                  <button
                    className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-60"
                    style={{ backgroundColor: NAVY, color: LIME }}
                  >
                    {t("transport.track", { fallback: "Track" })}
                  </button>
                </div>
              </div>
            </MainCard>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <SectionHeader icon={<Bus size={16} />} title={t("transport.details", { fallback: "Vehicle Details" })} />
            <MainCard borderColor={CYAN} className="p-6 flex flex-col gap-4 h-[calc(100%-3.25rem)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-0.5">{t("transport.modelType", { fallback: "Model / Type" })}</p>
                  <p className="text-sm font-black" style={{ color: NAVY }}>{vehicle?.model}</p>
                  <p className="text-[10px] font-bold uppercase" style={{ color: CYAN }}>{vehicle?.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-0.5">{t("transport.capacity", { fallback: "Capacity" })}</p>
                  <p className="text-sm font-black" style={{ color: NAVY }}>{vehicle?.capacity}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-0.5">{t("transport.fuelType", { fallback: "Fuel Type" })}</p>
                  <p className="text-xs font-bold" style={{ color: NAVY }}>{vehicle?.fuelType}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-0.5">{t("transport.routeZone", { fallback: "Route Zone" })}</p>
                  <p className="text-xs font-bold" style={{ color: NAVY }}>{vehicle?.zone}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(vehicle?.features || []).map((f, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider"
                    style={{ backgroundColor: `${CYAN}15`, color: TEAL }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="pt-3 mt-auto border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">{t("transport.supervisor", { fallback: "Supervisor" })}</p>
                  <p className="text-xs font-bold" style={{ color: NAVY }}>{vehicle?.coordinator}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <ShieldCheck size={16} />
                </div>
              </div>
            </MainCard>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-12 lg:col-span-8">
            <SectionHeader
              icon={<Map size={16} />}
              title={t("transport.timeline", { fallback: "Route Timeline" })}
              aside={
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border"
                    style={{
                      backgroundColor: summary?.activeDirection === "DROP_ROUTE" ? "#fee2e2" : "#dcfce7",
                      color: summary?.activeDirection === "DROP_ROUTE" ? "#991b1b" : "#166534",
                      borderColor: summary?.activeDirection === "DROP_ROUTE" ? "#fca5a5" : "#86efac"
                    }}
                  >
                    {summary?.activeDirection === "DROP_ROUTE"
                      ? t("transport.returnDrop", { fallback: "Return Drop Route" })
                      : t("transport.morningPickup", { fallback: "Morning Pickup Route" })}
                  </span>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg"
                    style={{ backgroundColor: LIME, color: TEAL }}
                  >
                    {t("transport.eta", { fallback: "ETA" })} {routeList[routeList.length - 1]?.time || "08:10 AM"}
                  </span>
                </div>
              }
            />
            <MainCard borderColor={TEAL} className="p-6 h-[calc(100%-3.25rem)] flex flex-col justify-center">
              <div className="relative w-full">
                <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-100 rounded-full" />
                <div
                  className="absolute top-5 left-0 h-[2px] bg-[#00b4d8] rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />

                <div
                  className="relative z-10 grid w-full"
                  style={{ gridTemplateColumns: `repeat(${routeList.length}, 1fr)` }}
                >
                  {routeList.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="h-10 flex items-center justify-center">
                        <div
                          className={[
                            "rounded-full flex items-center justify-center transition-all duration-300 relative",
                            item.isPickup || item.isSchool
                              ? "w-5 h-5 shadow-md"
                              : "w-3.5 h-3.5",
                            item.isPickup
                              ? "ring-4 ring-[#caf0f8]"
                              : "",
                          ].join(" ")}
                          style={{
                            backgroundColor: item.isPickup
                              ? NAVY
                              : item.isSchool
                              ? CYAN
                              : item.current
                              ? CYAN
                              : "#e5e7eb",
                          }}
                        >
                          {item.isSchool && (
                            <Bus size={9} className="text-white" />
                          )}
                          {item.current && (
                            <div className="absolute inset-0 rounded-full bg-[#00b4d8] animate-ping opacity-60" />
                          )}
                        </div>
                      </div>

                      <p
                        className="text-center text-xs font-bold leading-tight mt-3 px-1 line-clamp-2"
                        style={{ color: item.current ? TEAL : NAVY, opacity: item.current ? 1 : 0.75 }}
                      >
                        {item.stop}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-tight">
                        {item.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </MainCard>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <SectionHeader icon={<User size={16} />} title={t("transport.driver", { fallback: "Driver Info" })} />
            <MainCard borderColor={CYAN} className="p-6 flex flex-col gap-5 h-[calc(100%-3.25rem)]">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md flex-shrink-0"
                  style={{ backgroundColor: NAVY }}
                >
                  {personnel?.driver?.name?.[0]}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-black truncate" style={{ color: NAVY }}>
                    {personnel?.driver?.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                    <Zap size={10} className="text-emerald-500" />
                    {personnel?.driver?.rating || "4.8"} • {personnel?.driver?.shift || "Morning Shift"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-0">
                <MetaRow label={t("transport.emergency", { fallback: "Emergency" })} value={personnel?.driver?.contact} />
                <MetaRow label={t("transport.licenseValid", { fallback: "License Valid" })} value="Dec 2028" />
                <MetaRow label={t("transport.experience", { fallback: "Experience" })} value={personnel?.driver?.experience} />
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">{t("transport.attendant", { fallback: "Attendant" })}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: NAVY }}>
                    {personnel?.attendant?.name}
                  </p>
                </div>
                <button
                  className="p-2 rounded-xl transition-colors hover:opacity-90"
                  style={{ backgroundColor: LIME, color: TEAL }}
                >
                  <Phone size={14} />
                </button>
              </div>
            </MainCard>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-12 lg:col-span-8">
            <SectionHeader icon={<ShieldCheck size={16} />} title={t("transport.safety", { fallback: "Safety First" })} />
            <div
              className="rounded-3xl p-7 text-white shadow-xl relative overflow-hidden h-[calc(100%-3.25rem)]"
              style={{ backgroundColor: NAVY }}
            >
              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5">
                <ShieldCheck size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-extrabold uppercase tracking-widest mb-5" style={{ color: CYAN }}>
                  {t("transport.securityChecklist", { fallback: "Security Protocol Checklist" })}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {(guidelines || []).map((g) => (
                    <div key={g.id} className="flex gap-3 items-start text-xs font-semibold leading-relaxed text-white/75">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${CYAN}25`, color: CYAN }}
                      >
                        <Zap size={8} />
                      </div>
                      {g.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <SectionHeader icon={<AlertCircle size={16} />} title={t("transport.alerts", { fallback: "Transport Alerts" })} />
            <MainCard borderColor={CYAN} className="p-6 flex flex-col h-[calc(100%-3.25rem)]">
              <div className="flex-1 space-y-0">
                {(notices || []).map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-3 items-start py-3 border-b border-gray-50 last:border-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        n.priority === "high" ? "bg-red-500 animate-pulse" : "bg-[#00b4d8]"
                      }`}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-black leading-tight" style={{ color: NAVY }}>
                        {n.title}
                      </h4>
                      <p className="text-xs font-medium text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAlertsModal(true)}
                className="w-full mt-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors hover:opacity-90"
                style={{ backgroundColor: LIME, color: TEAL }}
              >
                {t("transport.viewAllAlerts", { fallback: "View All Alerts" })}
              </button>
            </MainCard>
          </div>
        </div>
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="transport.moduleHelper"
        contentEn="The Student Transport dashboard provides real-time information regarding your assigned route, vehicle, and personnel."
        contentHi="छात्र परिवहन डैशबोर्ड आपके असाइन किए गए मार्ग, वाहन और कर्मियों के संबंध में वास्तविक समय की जानकारी प्रदान करता है।"
      />

      {showAlertsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setShowAlertsModal(false)}
        >
          <div 
            className="w-full w-[95vw] md:w-[90vw] lg:max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh] scale-100 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-white flex items-center justify-between" style={{ backgroundColor: NAVY }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <AlertCircle size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black leading-tight">
                    {t("transport.alertHistory", { fallback: "Transport Alert History" })}
                  </h3>
                  <p className="text-xs text-white/70 font-semibold mt-0.5">
                    {summary?.routeNo} • {summary?.activeDirection === "DROP_ROUTE" ? t("transport.returnDropShort", { fallback: "Return Drop" }) : t("transport.morningPickupShort", { fallback: "Morning Pickup" })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAlertsModal(false)}
                className="text-white/60 hover:text-white text-xs font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl transition-all"
              >
                {t("transport.close", { fallback: "Close" })}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {notices && notices.length > 0 ? (
                notices.map((n) => (
                  <div 
                    key={n.id}
                    className="p-4 rounded-2xl border flex gap-3.5 items-start bg-[#f8fafc] border-gray-100"
                  >
                    <div 
                      className={`w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0 ${
                        n.priority === "high" ? "bg-red-500 animate-pulse" : "bg-[#00b4d8]"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black" style={{ color: NAVY }}>
                          {n.title}
                        </h4>
                        <span 
                          className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: n.priority === "high" ? "#fee2e2" : "#e0f2fe",
                            color: n.priority === "high" ? "#991b1b" : "#0369a1"
                          }}
                        >
                          {n.priority === "high" ? t("transport.critical", { fallback: "Critical" }) : t("transport.normal", { fallback: "Normal" })}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 mt-1.5 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-wide">
                        {t("transport.activeAlert", { fallback: "Active Alert" })} • {summary?.vehicleNo}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-gray-400">
                    {t("transport.noActiveAlerts", { fallback: "No active alerts for this route." })}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                {t("transport.systemStatus", { fallback: "System Status: Active & Operational" })}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> {t("transport.gpsLive", { fallback: "GPS Live" })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

