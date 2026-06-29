import React, { useState, useEffect } from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import ClubSummaryCards from "../../components/clubs/ClubSummaryCards";
import ClubTable from "../../components/clubs/ClubTable";
import ClubDetailPanel from "../../components/clubs/ClubDetailPanel";
import { clubsService } from "../../services/clubsService";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

const ClubsActivitiesPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const teacherId = user?.linkedEntityId || "teach-001";

  const [clubs, setClubs] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Membership Requests State
  const [activeTab, setActiveTab] = useState("clubs"); // "clubs", "requests"
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Pending"); // "All", "Pending", "Approved", "Rejected", "Withdrawn"
  const [actionModal, setActionModal] = useState({ isOpen: false, request: null, remark: "" });

  const loadTeacherWorkspace = async (clearSelected = false) => {
    setLoading(true);
    try {
      // 1. Get clubs managed by this teacher
      const managedClubs = await clubsService.getTeacherClubs(teacherId);
      setClubs(managedClubs);

      // 2. Aggregate active members & upcoming activities count
      let memberCountAcc = 0;
      let eventCountAcc = 0;

      for (const club of managedClubs) {
        const membersList = await clubsService.getClubMembers(club.id);
        memberCountAcc += membersList.length;

        const eventsList = await clubsService.getClubEvents(club.id);
        eventCountAcc += eventsList.filter(e => e.status === "Upcoming").length;
      }

      setTotalMembers(memberCountAcc);
      setUpcomingEventsCount(eventCountAcc);

      // 3. Get membership requests for this coordinator
      const reqs = await clubsService.getClubMembershipRequestsByCoordinator(teacherId);
      setRequests(reqs);

      // Refresh currently selected club reference if it exists
      if (clearSelected) {
        setSelectedClub(null);
      } else if (selectedClub) {
        const refreshed = managedClubs.find(c => c.id === selectedClub.id);
        if (refreshed) {
          setSelectedClub(refreshed);
        }
      }
    } catch (e) {
      console.error("Failed to load teacher clubs workspace:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherWorkspace();
  }, [teacherId]);

  const handleApprove = async () => {
    if (!actionModal.request) return;
    try {
      await clubsService.approveClubMembershipRequest(actionModal.request.requestId, actionModal.remark);
      await loadTeacherWorkspace();
      setActionModal({ isOpen: false, request: null, remark: "" });
    } catch (err) {
      alert(`${t("clubs.approveFailed", { fallback: "Failed to approve: " })}${err.message}`);
    }
  };

  const handleReject = async () => {
    if (!actionModal.request) return;
    try {
      await clubsService.rejectClubMembershipRequest(actionModal.request.requestId, actionModal.remark);
      await loadTeacherWorkspace();
      setActionModal({ isOpen: false, request: null, remark: "" });
    } catch (err) {
      alert(`${t("clubs.rejectFailed", { fallback: "Failed to reject: " })}${err.message}`);
    }
  };

  const filteredRequests = requests.filter(r => filterStatus === "All" || r.status === filterStatus);

  return (
    <div className="space-y-6 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.clubs_activities"
        descriptionKey="clubs.moduleDesc"
        helperContentEn="Manage co-curricular memberships, schedule club events, and post advisory updates for students."
        helperContentHi="सह-पाठ्यचर्या सदस्यता प्रबंधित करें, क्लब कार्यक्रम निर्धारित करें और छात्रों के लिए सलाह अपडेट पोस्ट करें।"
      />

      {loading && clubs.length === 0 ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00b4d8]"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-100 mb-6">
            <button
              onClick={() => setActiveTab("clubs")}
              className={`pb-3 text-sm font-black transition-colors relative ${
                activeTab === "clubs" ? "text-[#03045e]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t("clubs.myClubs", { fallback: "My Clubs" })}
              {activeTab === "clubs" && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[#03045e] rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`pb-3 text-sm font-black transition-colors relative flex items-center gap-2 ${
                activeTab === "requests" ? "text-[#03045e]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t("clubs.membershipRequests", { fallback: "Membership Requests" })}
              {requests.filter(r => r.status === "Pending").length > 0 && (
                <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {requests.filter(r => r.status === "Pending").length}
                </span>
              )}
              {activeTab === "requests" && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[#03045e] rounded-t-full" />
              )}
            </button>
          </div>

          {activeTab === "clubs" ? (
            <>
              {/* Top Summary Metrics */}
              <ClubSummaryCards 
                clubs={clubs} 
                totalMembers={totalMembers} 
                upcomingEventsCount={upcomingEventsCount} 
              />

          <AnimatePresence mode="wait">
            {!selectedClub ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <ClubTable 
                  clubs={clubs} 
                  selectedClubId={selectedClub?.id} 
                  onSelectClub={(club) => setSelectedClub(club)} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm"
              >
                <ClubDetailPanel 
                  club={selectedClub} 
                  onBack={() => {
                    setSelectedClub(null);
                    loadTeacherWorkspace(true); // Refresh metrics and clear selection when going back
                  }} 
                  teacherId={teacherId}
                />
              </motion.div>
            )}
          </AnimatePresence>
            </>
          ) : (
            <div className="space-y-6">
              {/* Request Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl">
                  <div className="text-amber-600 text-[10px] font-black uppercase tracking-wider mb-1">{t("clubs.pendingRequests", { fallback: "Pending Requests" })}</div>
                  <div className="text-3xl font-black text-amber-700">{requests.filter(r => r.status === "Pending").length}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl">
                  <div className="text-emerald-600 text-[10px] font-black uppercase tracking-wider mb-1">{t("clubs.approved", { fallback: "Approved" })}</div>
                  <div className="text-3xl font-black text-emerald-700">{requests.filter(r => r.status === "Approved").length}</div>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl">
                  <div className="text-rose-600 text-[10px] font-black uppercase tracking-wider mb-1">{t("clubs.rejected", { fallback: "Rejected" })}</div>
                  <div className="text-3xl font-black text-rose-700">{requests.filter(r => r.status === "Rejected").length}</div>
                </div>
              </div>

              {/* Requests Filter & Table */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#03045e]">{t("clubs.studentRequests", { fallback: "Student Requests" })}</h3>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0077b6]"
                  >
                    <option value="All">{t("clubs.allRequests", { fallback: "All Requests" })}</option>
                    <option value="Pending">{t("clubs.pending", { fallback: "Pending" })}</option>
                    <option value="Approved">{t("clubs.approved", { fallback: "Approved" })}</option>
                    <option value="Rejected">{t("clubs.rejected", { fallback: "Rejected" })}</option>
                    <option value="Withdrawn">{t("clubs.withdrawn", { fallback: "Withdrawn" })}</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">{t("clubs.student", { fallback: "Student" })}</th>
                        <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">{t("clubs.club", { fallback: "Club" })}</th>
                        <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">{t("common.date", { fallback: "Date" })}</th>
                        <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">{t("common.status", { fallback: "Status" })}</th>
                        <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">{t("common.action", { fallback: "Action" })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-xs font-bold text-gray-400 italic">{t("clubs.noRequestsPrefix", { fallback: "No " })}{filterStatus !== "All" ? t(`clubs.${filterStatus.toLowerCase()}`, { fallback: filterStatus }) : ""}{t("clubs.noRequestsSuffix", { fallback: " membership requests found." })}</td>
                        </tr>
                      ) : (
                        filteredRequests.map((req) => (
                          <tr key={req.requestId} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                            <td className="py-4 px-5">
                              <span className="text-xs font-black text-[#03045e]">{req.studentName}</span>
                              <div className="text-[10px] font-bold text-gray-400 mt-0.5">{t("clubs.class", { fallback: "Class " })}{req.className}-{req.section}</div>
                            </td>
                            <td className="py-4 px-5 text-xs font-bold text-gray-600">{req.clubName}</td>
                            <td className="py-4 px-5 text-xs font-bold text-gray-600">
                              {new Date(req.requestDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                                {t(`clubs.${req.status.toLowerCase()}`, { fallback: req.status })}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              {req.status === 'Pending' ? (
                                <button
                                  onClick={() => setActionModal({ isOpen: true, request: req, remark: "" })}
                                  className="text-[10px] font-black text-white bg-[#03045e] hover:bg-[#0077b6] px-4 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
                                >
                                  {t("common.review", { fallback: "Review" })}
                                </button>
                              ) : (
                                <button
                                  onClick={() => setActionModal({ isOpen: true, request: req, remark: req.remarks || "" })}
                                  className="text-[10px] font-black text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
                                >
                                  {t("common.view", { fallback: "View" })}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Approval Modal */}
      <AnimatePresence>
        {actionModal.isOpen && actionModal.request && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActionModal({ isOpen: false, request: null, remark: "" })}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full w-[95vw] md:w-[90vw] lg:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="text-xs font-black uppercase tracking-widest text-[#03045e]">
                  {actionModal.request.status === 'Pending' ? t("clubs.reviewRequest", { fallback: "Review Membership Request" }) : t("clubs.requestDetails", { fallback: "Request Details" })}
                </span>
                <button
                  onClick={() => setActionModal({ isOpen: false, request: null, remark: "" })}
                  className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors font-bold text-gray-500"
                >
                  X
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                    <p className="text-[9px] font-black text-gray-400 uppercase">{t("clubs.student", { fallback: "Student" })}</p>
                    <p className="text-sm font-black text-[#03045e] mt-1">{actionModal.request.studentName}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">{t("clubs.class", { fallback: "Class " })}{actionModal.request.className}-{actionModal.request.section}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                    <p className="text-[9px] font-black text-gray-400 uppercase">{t("clubs.targetClub", { fallback: "Target Club" })}</p>
                    <p className="text-sm font-black text-[#03045e] mt-1">{actionModal.request.clubName}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">{t("clubs.requestedOn", { fallback: "Requested on " })}{new Date(actionModal.request.requestDate).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                {actionModal.request.decisionDate && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase">{t("clubs.decisionLog", { fallback: "Decision Log" })}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        actionModal.request.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>{t(`clubs.${actionModal.request.status.toLowerCase()}`, { fallback: actionModal.request.status })}</span>
                      <span className="text-[10px] font-bold text-gray-500">{t("clubs.onDate", { fallback: "on " })}{new Date(actionModal.request.decisionDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t("clubs.remarksNotes", { fallback: "Remarks / Notes" })}</label>
                  <textarea
                    value={actionModal.remark}
                    onChange={(e) => setActionModal({ ...actionModal, remark: e.target.value })}
                    placeholder={t("clubs.addOptionalNote", { fallback: "Add an optional note to the student..." })}
                    readOnly={actionModal.request.status !== 'Pending'}
                    className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[80px] focus:outline-none focus:border-[#0077b6] focus:bg-white transition-colors disabled:opacity-70"
                  />
                </div>
              </div>

              {actionModal.request.status === 'Pending' && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                  <button
                    onClick={handleReject}
                    className="px-5 py-2.5 rounded-xl text-[11px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 uppercase tracking-widest transition-colors"
                  >
                    {t("common.reject", { fallback: "Reject" })}
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-5 py-2.5 rounded-xl text-[11px] font-black text-white bg-[#03045e] hover:bg-[#0077b6] uppercase tracking-widest transition-colors shadow-sm"
                  >
                    {t("clubs.approveRequest", { fallback: "Approve Request" })}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClubsActivitiesPage;
