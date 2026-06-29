import React, { useState, useEffect } from "react";
import MainCard from "../../components/MainCard";
import { clubsService } from "../../services/clubsService";
import { getAllTeachers } from "../../services/teacherService";
import { 
  Building2, Users, FileText, Plus, Edit, Power, 
  PowerOff, Search, Filter, ShieldCheck, Activity, Award
} from "lucide-react";
import PermissionGate from "../../components/admin/PermissionGate";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";

const ClubManagementCenterPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Data State
  const [clubs, setClubs] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [clubProposals, setClubProposals] = useState([]);
  const [participations, setParticipations] = useState([]);
  
  // Loading State
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [currentClub, setCurrentClub] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchedClubs = await clubsService.getClubOverview();
      const fetchedTeachers = await getAllTeachers();
      const fetchedRequests = await clubsService.getAllClubMembershipRequests() || [];
      const fetchedProposals = await clubsService.getAllClubProposals() || [];
      const fetchedParts = await clubsService.getAllActivityParticipations() || [];

      setClubs(fetchedClubs);
      setTeachers(fetchedTeachers);
      setMembershipRequests(fetchedRequests);
      setClubProposals(fetchedProposals);
      setParticipations(fetchedParts);
    } catch (error) {
      console.error("Error fetching club management data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (clubId) => {
    try {
      await clubsService.deactivateClub(clubId);
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleActivate = async (clubId) => {
    try {
      await clubsService.updateClub(clubId, { status: "Active" });
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setCurrentClub({ name: "", category: "Academic", description: "", coordinatorTeacherId: "", logo: "award" });
    setIsModalOpen(true);
  };

  const openEditModal = (club) => {
    setModalMode("edit");
    setCurrentClub(club);
    setIsModalOpen(true);
  };

  const handleSaveClub = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        const selectedTeacher = teachers.find(t => (t.id || t.teacherId) === currentClub.coordinatorTeacherId);
        const tName = selectedTeacher ? (selectedTeacher.name || selectedTeacher.teacherName || `${selectedTeacher.firstName || ""} ${selectedTeacher.lastName || ""}`.trim()) : "Unassigned";
        await clubsService.createClub({
          ...currentClub,
          coordinatorTeacherName: tName || "Unassigned"
        });
      } else {
        const selectedTeacher = teachers.find(t => (t.id || t.teacherId) === currentClub.coordinatorTeacherId);
        const tName = selectedTeacher ? (selectedTeacher.name || selectedTeacher.teacherName || `${selectedTeacher.firstName || ""} ${selectedTeacher.lastName || ""}`.trim()) : "Unassigned";
        await clubsService.updateClub(currentClub.id, {
          name: currentClub.name,
          category: currentClub.category,
          description: currentClub.description,
          coordinatorTeacherId: currentClub.coordinatorTeacherId,
          coordinatorTeacherName: tName || "Unassigned",
          logo: currentClub.logo
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const renderOverviewDashboard = () => {
    const totalClubs = clubs.length;
    const activeClubs = clubs.filter(c => c.status === "Active").length;
    const totalMemberships = clubs.reduce((acc, c) => acc + (c.membershipCount || 0), 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-[#03045e] to-[#023e8a] p-5 rounded-2xl text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Building2 size={24} className="text-[#caf0f8]" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-semibold">Total Clubs</p>
              <p className="text-3xl font-black">{totalClubs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-[#caf0f8] p-5 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="p-3 bg-[#e0fbfc] rounded-xl">
              <Activity size={24} className="text-[#0077b6]" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold">Active Clubs</p>
              <p className="text-3xl font-black text-[#03045e]">{activeClubs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#caf0f8] p-5 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="p-3 bg-[#e0fbfc] rounded-xl">
              <Users size={24} className="text-[#0077b6]" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold">Total Memberships</p>
              <p className="text-3xl font-black text-[#03045e]">{totalMemberships}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {renderOverviewDashboard()}
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-black text-[#03045e]">Institutional Clubs</h2>
          <PermissionGate moduleId="admin_clubs" permission="create" mode="hidden">
            <button 
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#03045e] text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#023e8a] transition-colors"
            >
              <Plus size={16} /> Create Club
            </button>
          </PermissionGate>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Club Name</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Coordinator</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Members</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clubs.map((club) => (
                <tr key={club.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#03045e]">{club.name}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">
                      {club.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-semibold text-gray-700">{club.coordinatorTeacherName || "Unassigned"}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-[#0077b6] bg-[#caf0f8]/30 px-3 py-1 rounded-full inline-block">
                      {club.membershipCount || 0}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      club.status === "Active" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {club.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <PermissionGate moduleId="admin_clubs" permission="edit" mode="hidden">
                      <button 
                        onClick={() => openEditModal(club)}
                        className="p-1.5 text-gray-500 hover:text-[#0077b6] hover:bg-[#caf0f8]/50 rounded-lg transition-colors inline-block"
                        title="Edit Club"
                      >
                        <Edit size={16} />
                      </button>
                    </PermissionGate>
                    <PermissionGate moduleId="admin_clubs" permission="delete" mode="hidden">
                      {club.status === "Active" ? (
                        <button 
                          onClick={() => handleDeactivate(club.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                          title="Deactivate Club"
                        >
                          <PowerOff size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleActivate(club.id)}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-block"
                          title="Activate Club"
                        >
                          <Power size={16} />
                        </button>
                      )}
                    </PermissionGate>
                  </td>
                </tr>
              ))}
              {clubs.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 font-semibold">
                    No clubs found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRequestsTab = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-black text-[#03045e]">Membership Requests Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Read-only view of student membership requests.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Student</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Club</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {membershipRequests.map((req) => {
              const club = clubs.find(c => c.id === req.clubId);
              return (
                <tr key={req.id} className="hover:bg-gray-50/50">
                  <td className="p-4 text-sm text-gray-600">{new Date(req.requestDate).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold text-[#03045e]">{req.studentName}</td>
                  <td className="p-4 text-sm text-gray-700">{club?.name || req.clubId}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      req.status === "Approved" ? "bg-green-100 text-green-700" :
                      req.status === "Rejected" ? "bg-red-100 text-red-700" :
                      req.status === "Withdrawn" ? "bg-gray-100 text-gray-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              )
            })}
            {membershipRequests.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500 font-semibold">
                  No membership requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProposalsTab = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-black text-[#03045e]">Club Creation Proposals</h2>
        <p className="text-sm text-gray-500 mt-1">Read-only view of student club proposals.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Proposed By</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Proposed Club</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Category</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clubProposals.map((prop) => (
              <tr key={prop.proposalId} className="hover:bg-gray-50/50">
                <td className="p-4 text-sm text-gray-600">{new Date(prop.submittedAt).toLocaleDateString()}</td>
                <td className="p-4 font-semibold text-[#03045e]">{prop.proposedByStudentName}</td>
                <td className="p-4 font-bold text-gray-800">{prop.clubName}</td>
                <td className="p-4 text-sm text-gray-600">{prop.category}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    prop.status === "Approved" ? "bg-green-100 text-green-700" :
                    prop.status === "Rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {prop.status}
                  </span>
                </td>
              </tr>
            ))}
            {clubProposals.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 font-semibold">
                  No club proposals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return <MainCard className="p-8 text-center text-[#03045e] font-bold">Loading Club Management Center...</MainCard>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="w-12 h-12 bg-[#caf0f8] rounded-xl flex items-center justify-center text-[#03045e]">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#03045e] tracking-tight">Club Management Center</h1>
            <p className="text-sm font-semibold text-gray-500">Institutional Governance Hub</p>
          </div>
        </div>
      </div>
      
      <PageAuthorityBanner moduleId="admin_clubs" moduleName="Club Management Center" />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "overview" 
              ? "bg-[#03045e] text-white" 
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Building2 size={16} /> Overview
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "requests" 
              ? "bg-[#03045e] text-white" 
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Users size={16} /> Membership Requests
        </button>
        <button
          onClick={() => setActiveTab("proposals")}
          className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "proposals" 
              ? "bg-[#03045e] text-white" 
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <FileText size={16} /> Club Proposals
        </button>
        <button
          onClick={() => setActiveTab("participations")}
          className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "participations" 
              ? "bg-[#03045e] text-white" 
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Award size={16} /> Activity Participation
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "requests" && renderRequestsTab()}
        {activeTab === "proposals" && renderProposalsTab()}
        {activeTab === "participations" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 rounded-2xl text-white shadow-lg">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Award size={24} className="text-emerald-100" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-semibold">Total Participations</p>
                    <p className="text-3xl font-black">{participations.filter(p => p.participationStatus === "Participated").length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-emerald-100 p-5 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Users size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-semibold">Unique Students</p>
                    <p className="text-3xl font-black text-[#03045e]">
                      {new Set(participations.filter(p => p.participationStatus === "Participated").map(p => p.studentId)).size}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-emerald-100 p-5 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Activity size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-semibold">Activities Conducted</p>
                    <p className="text-3xl font-black text-[#03045e]">
                      {new Set(participations.map(p => p.activityId)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                <h2 className="text-lg font-black text-[#03045e]">Participation Records</h2>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Search student or activity..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0077b6] text-sm" />
                  </div>
                  <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors">
                    <Filter size={16} /> Filter
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Activity & Club</th>
                      <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {participations.sort((a,b) => new Date(b.participationDate) - new Date(a.participationDate)).map((p) => (
                      <tr key={p.participationId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#03045e]">{p.studentName}</div>
                          <div className="text-[10px] font-bold text-gray-400">Class {p.className}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-semibold text-[#03045e]">{p.activityTitle}</div>
                          <div className="text-xs font-medium text-gray-500">{p.clubName}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-semibold text-gray-700">{p.markedByTeacherName}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-semibold text-gray-700">{p.participationDate}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                            p.participationStatus === "Participated" 
                              ? "bg-emerald-100 text-emerald-700" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {p.participationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {participations.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500 font-semibold italic">
                          No participation records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full w-[95vw] md:w-[90vw] lg:max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-[#03045e] p-6 text-white">
              <h3 className="text-xl font-black">{modalMode === "create" ? "Create New Club" : "Edit Club"}</h3>
              <p className="text-[#caf0f8] text-sm opacity-80 mt-1">
                {modalMode === "create" ? "Define a new institutional club." : "Update club details and coordinator."}
              </p>
            </div>
            
            <form onSubmit={handleSaveClub} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Club Name</label>
                <input
                  type="text"
                  required
                  value={currentClub?.name || ""}
                  onChange={e => setCurrentClub({...currentClub, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6] outline-none font-semibold text-gray-800"
                  placeholder="e.g. Robotics Club"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                  <select
                    value={currentClub?.category || "Academic"}
                    onChange={e => setCurrentClub({...currentClub, category: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6] outline-none font-semibold text-gray-800"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Technology">Technology</option>
                    <option value="Arts">Arts</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Community Service">Community Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Coordinator</label>
                  <select
                    value={currentClub?.coordinatorTeacherId || ""}
                    onChange={e => setCurrentClub({...currentClub, coordinatorTeacherId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6] outline-none font-semibold text-gray-800"
                  >
                    <option value="">Unassigned</option>
                    {teachers.map(t => {
                      const tName = t.name || t.teacherName || `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Unknown";
                      const tId = t.id || t.teacherId;
                      return (
                        <option key={tId} value={tId}>{tName}</option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={currentClub?.description || ""}
                  onChange={e => setCurrentClub({...currentClub, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6] outline-none font-semibold text-gray-800 resize-none"
                  placeholder="Brief description of the club's purpose..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#03045e] hover:bg-[#023e8a] text-white font-bold rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagementCenterPage;
