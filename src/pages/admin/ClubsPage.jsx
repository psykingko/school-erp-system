import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Users, ShieldAlert, Award, BookOpen, Clock } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import ClubOverviewCard from "../../components/admin/institutional/ClubOverviewCard";
import InstitutionalFilterBar from "../../components/admin/institutional/InstitutionalFilterBar";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminDataTable from "../../components/admin/AdminDataTable";
import AdminEditForm from "../../components/admin/AdminEditForm";
import ClubDetailPanel from "../../components/clubs/ClubDetailPanel";
import { clubsService } from "../../services/clubsService";
import PermissionGate from "../../components/admin/PermissionGate";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";

const ClubsPage = () => {
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "requests"
  const [viewingClub, setViewingClub] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [proposals, setProposals] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Enrollment modal
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);

  // Review Modal
  const [reviewProposalOpen, setReviewProposalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [decisionRemarks, setDecisionRemarks] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Feedback
  const [successBanner, setSuccessBanner] = useState("");
  const [errorBanner, setErrorBanner] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const provider = getDataProvider();
      const [allClubs, allTeachers, allStudents, allEnrollments, allRequests, allProposals] =
        await Promise.all([
          provider.getClubs(),
          provider.getTeachers(),
          provider.getStudents(),
          provider.getClubEnrollments(),
          clubsService.getAllClubMembershipRequests(),
          clubsService.getAllClubProposals(),
        ]);

      setClubs(allClubs || []);
      setTeachers(allTeachers || []);
      setStudents(allStudents || []);
      setEnrollments(allEnrollments || []);
      setRequests(allRequests || []);
      setProposals(allProposals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async (formData) => {
    const studentId = formData.studentId;
    if (!studentId || !selectedClub) return;

    try {
      // Rule Verification: Student should only belong to maximum 2 clubs
      const studentEnrollments = enrollments.filter(
        (e) => e.studentId === studentId,
      );

      if (studentEnrollments.length >= 2) {
        const studentObj = students.find((s) => s.id === studentId);
        setErrorBanner(
          `Validation Failed: Student "${studentObj ? studentObj.name : "Selected Student"}" has already joined 2 clubs (maximum limit reached)!`,
        );
        setTimeout(() => setErrorBanner(""), 4500);
        return;
      }

      // Check if already in this specific club
      const alreadyJoined = studentEnrollments.some(
        (e) => e.clubId === selectedClub.id,
      );
      if (alreadyJoined) {
        setErrorBanner(
          "Validation Failed: Student is already registered in this club.",
        );
        setTimeout(() => setErrorBanner(""), 4000);
        return;
      }

      const newRecord = {
        id: `enroll-${Date.now()}`,
        studentId,
        clubId: selectedClub.id,
        enrollmentDate: new Date().toISOString().split("T")[0],
      };

      // Call database insertion
      const provider = getDataProvider();
      await provider.createClubEnrollment(newRecord);
      const updatedEnrollments = await provider.getClubEnrollments();
      setEnrollments(updatedEnrollments);

      setSuccessBanner(
        "Student has been successfully enrolled as a Club Member.",
      );
      setTimeout(() => setSuccessBanner(""), 3000);
      setEnrollOpen(false);
    } catch (e) {
      console.error(e);
      setErrorBanner("Failed to enroll student. Please try again.");
      setTimeout(() => setErrorBanner(""), 4000);
    }
  };

  const handleApproveProposal = async () => {
    setIsSubmittingDecision(true);
    try {
      await clubsService.approveClubProposal(selectedProposal.proposalId, decisionRemarks);
      setSuccessBanner("Proposal has been approved.");
      setTimeout(() => setSuccessBanner(""), 3000);
      setReviewProposalOpen(false);
      setDecisionRemarks("");
      fetchData();
    } catch (e) {
      console.error(e);
      setErrorBanner("Failed to approve proposal.");
      setTimeout(() => setErrorBanner(""), 4000);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleRejectProposal = async () => {
    setIsSubmittingDecision(true);
    try {
      await clubsService.rejectClubProposal(selectedProposal.proposalId, decisionRemarks);
      setSuccessBanner("Proposal has been rejected.");
      setTimeout(() => setSuccessBanner(""), 3000);
      setReviewProposalOpen(false);
      setDecisionRemarks("");
      fetchData();
    } catch (e) {
      console.error(e);
      setErrorBanner("Failed to reject proposal.");
      setTimeout(() => setErrorBanner(""), 4000);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Helper: Get coordinator teacher name
  const getTeacherName = (tId) => {
    const t = teachers.find((teacher) => teacher.id === tId);
    return t ? t.name : "Unassigned Staff";
  };

  const filteredClubs = clubs.filter((cl) => {
    const matchesSearch =
      cl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cl.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === "" || cl.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const enrollFields = [
    {
      name: "studentId",
      label: "Select Student to Register",
      type: "select",
      options: students.map((s) => s.id),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="School Activity Clubs"
        description="Configure institutional activity clubs, assign faculty coordinators, and verify student enrollment quotas."
        breadcrumbs={["Admin Portal", "Institutional", "Clubs"]}
      />
      
      <PageAuthorityBanner moduleId="admin_clubs" moduleName="Clubs & Extracurriculars" />

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-xs font-black shadow-sm transition-all animate-bounce">
          {successBanner}
        </div>
      )}

      {/* Error Alert */}
      {errorBanner && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-3xl text-rose-700 text-xs font-black shadow-sm transition-all">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-rose-500" />
            <span>{errorBanner}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-sm font-black transition-colors relative ${
            activeTab === "overview" ? "text-[#03045e]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Club Overview
          {activeTab === "overview" && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#03045e] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-sm font-black transition-colors relative flex items-center gap-2 ${
            activeTab === "requests" ? "text-[#03045e]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Membership Requests
          {activeTab === "requests" && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#03045e] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("proposals")}
          className={`pb-3 text-sm font-black transition-colors relative flex items-center gap-2 ${
            activeTab === "proposals" ? "text-[#03045e]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Club Proposals
          {activeTab === "proposals" && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#03045e] rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
      {/* Roster Strengths stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <OperationsStatCard
          title="Active Extracurricular Clubs"
          value={clubs.length.toString()}
          description="Ecosystem activity clubs"
          icon={Award}
        />
        <OperationsStatCard
          title="Total Club Enrolled Cohort"
          value={enrollments.length.toString()}
          description="Students active in club projects"
          icon={Award}
          color="#0096c7"
          bg="#ade8f4"
        />
        <OperationsStatCard
          title="Optimal Enrolment Index"
          value="100%"
          description="Compliance to max 2 clubs limit checked"
          icon={Award}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* Roster Filter and Grid */}
      {viewingClub ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <ClubDetailPanel
            club={viewingClub}
            onBack={() => setViewingClub(null)}
            teacherId="admin"
            isReadOnly={true}
          />
        </div>
      ) : (
        <>
          {/* Roster Filter tools */}
          <InstitutionalFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search activity clubs by name..."
            filterSlots={
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
              >
                <option value="">Filter Categories...</option>
                <option value="Science & Tech">Science & Technology</option>
                <option value="Cultural & Arts">Cultural & Performing Arts</option>
                <option value="Literary & Debate">Literary & Debate Club</option>
                <option value="Environment & Nature">Environment & Eco Club</option>
              </select>
            }
          />

          {/* Clubs Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const clubMembers = enrollments.filter(
                (e) => e.clubId === club.id,
              ).length;

              return (
                <ClubOverviewCard
                  key={club.id}
                  name={club.name}
                  category={club.category || "Co-Curricular"}
                  coordinator={getTeacherName(club.coordinatorId)}
                  membersCount={clubMembers}
                  nextActivity={club.nextActivity}
                  onDetails={() => setViewingClub(club)}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Enroll Student Modal */}
      <AdminEditForm
        isOpen={enrollOpen}
        onClose={() => setEnrollOpen(null)}
        title={
          selectedClub
            ? `Enroll Student in "${selectedClub.name}"`
            : "Register Student in Club"
        }
        data={{ studentId: "" }}
        fields={enrollFields}
        onSubmit={handleEnrollStudent}
      />
        </>
      ) : (
        <div className="space-y-6">
          {/* Institutional Requests Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <OperationsStatCard
              title="Total Requests"
              value={requests.length.toString()}
              description="All membership requests logged"
              icon={Award}
            />
            <OperationsStatCard
              title="Pending Approval"
              value={requests.filter(r => r.status === "Pending").length.toString()}
              description="Awaiting coordinator review"
              icon={Award}
              color="#d97706"
              bg="#fef3c7"
            />
            <OperationsStatCard
              title="Approved"
              value={requests.filter(r => r.status === "Approved").length.toString()}
              description="Successfully enrolled"
              icon={Award}
              color="#059669"
              bg="#d1fae5"
            />
            <OperationsStatCard
              title="Rejected"
              value={requests.filter(r => r.status === "Rejected").length.toString()}
              description="Declined applications"
              icon={Award}
              color="#e11d48"
              bg="#ffe4e6"
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-[#03045e]">Institutional Request Ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Request ID</th>
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Student</th>
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Club & Coordinator</th>
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Date</th>
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-xs font-bold text-gray-400 italic">No membership requests found in system.</td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.requestId} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                        <td className="py-4 px-5 text-xs font-bold text-gray-500">{req.requestId}</td>
                        <td className="py-4 px-5">
                          <span className="text-xs font-black text-[#03045e]">{req.studentName}</span>
                          <div className="text-[10px] font-bold text-gray-400 mt-0.5">Class {req.className}-{req.section}</div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-xs font-black text-[#03045e]">{req.clubName}</span>
                          <div className="text-[10px] font-bold text-gray-400 mt-0.5">{req.coordinatorTeacherName}</div>
                        </td>
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
                            {req.status}
                          </span>
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

      {activeTab === "proposals" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <OperationsStatCard
              title="Total Proposals"
              value={proposals.length.toString()}
              description="All submitted proposals"
              icon={BookOpen}
              color="#0077b6"
              bg="#caf0f8"
            />
            <OperationsStatCard
              title="Pending"
              value={proposals.filter(p => p.status === "Pending").length.toString()}
              description="Awaiting review"
              icon={Clock}
              color="#d97706"
              bg="#fef3c7"
            />
            <OperationsStatCard
              title="Approved"
              value={proposals.filter(p => p.status === "Approved").length.toString()}
              description="Approved proposals"
              icon={Award}
              color="#059669"
              bg="#d1fae5"
            />
            <OperationsStatCard
              title="Rejected"
              value={proposals.filter(p => p.status === "Rejected").length.toString()}
              description="Declined proposals"
              icon={ShieldAlert}
              color="#e11d48"
              bg="#ffe4e6"
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-[#03045e]">Club Creation Proposals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Student</th>
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Club Name</th>
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Category</th>
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Submitted</th>
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Status</th>
                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-xs font-bold text-gray-400 italic">No club proposals found in system.</td>
                    </tr>
                  ) : (
                    proposals.map((prop) => (
                      <tr key={prop.proposalId} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                        <td className="py-4 px-5">
                          <span className="text-xs font-black text-[#03045e]">{prop.proposedByStudentName}</span>
                          <div className="text-[10px] font-bold text-gray-400 mt-0.5">{prop.proposedByStudentId}</div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-xs font-black text-[#03045e]">{prop.clubName}</span>
                          <div className="text-[10px] font-bold text-[#00b4d8] mt-0.5 flex items-center gap-1">
                            <Users size={10} /> {prop.interestCount || 1} Interested
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border bg-gray-50 text-gray-600 border-gray-100">
                            {prop.category}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-xs font-bold text-gray-600">
                          {new Date(prop.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                            prop.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            prop.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {prop.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <PermissionGate moduleId="admin_clubs" permission="edit" mode="hidden">
                            <button
                              onClick={() => { setSelectedProposal(prop); setReviewProposalOpen(true); }}
                              className="text-[10px] font-black text-[#00b4d8] hover:text-[#0077b6] bg-[#caf0f8]/30 hover:bg-[#caf0f8] px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
                            >
                              Review
                            </button>
                          </PermissionGate>
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

      {/* Review Proposal Modal */}
      {reviewProposalOpen && selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-xl w-full w-[95vw] md:w-[90vw] lg:max-w-lg overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#00b4d8]" />
                <h3 className="font-black text-sm text-[#03045e] uppercase tracking-wider">
                  Review Club Proposal
                </h3>
              </div>
              <button 
                onClick={() => setReviewProposalOpen(false)}
                className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Proposed By</span>
                  <p className="text-sm font-black text-[#03045e] mt-0.5">{selectedProposal.proposedByStudentName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Submitted On</span>
                  <p className="text-xs font-bold text-gray-600 mt-1">
                    {new Date(selectedProposal.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Club Name</span>
                  <p className="text-sm font-black text-[#03045e] mt-0.5">{selectedProposal.clubName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Category</span>
                  <p className="text-xs font-bold text-gray-600 mt-1">{selectedProposal.category}</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  Purpose <span className="bg-[#caf0f8] text-[#00b4d8] px-1.5 py-0.5 rounded text-[8px]">{selectedProposal.interestCount || 1} Interested</span>
                </span>
                <p className="text-xs font-medium text-gray-700 mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {selectedProposal.purpose}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Decision Remarks</label>
                <textarea
                  required
                  maxLength={300}
                  rows={3}
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  disabled={selectedProposal.status !== "Pending"}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8] transition-all resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="e.g. Approved. Strong student interest."
                />
              </div>

              {selectedProposal.status === "Pending" ? (
                <div className="mt-6 flex gap-3">
                  <PermissionGate moduleId="admin_clubs" permission="edit" mode="disabled">
                    <button
                      onClick={handleRejectProposal}
                      disabled={isSubmittingDecision}
                      className="flex-1 h-10 rounded-xl bg-rose-50 text-rose-600 font-black text-[11px] uppercase tracking-wider hover:bg-rose-100 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </PermissionGate>
                  <PermissionGate moduleId="admin_clubs" permission="edit" mode="disabled">
                    <button
                      onClick={handleApproveProposal}
                      disabled={isSubmittingDecision}
                      className="flex-1 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black text-[11px] uppercase tracking-wider hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </PermissionGate>
                </div>
              ) : (
                <div className="mt-6">
                  <div className={`p-3 rounded-xl border text-center text-xs font-black uppercase tracking-wider ${
                    selectedProposal.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    This proposal has already been {selectedProposal.status.toLowerCase()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default ClubsPage;
