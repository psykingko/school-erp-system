import React, { useState, useEffect } from "react";
import {
  Users,
  Code,
  Mic,
  Cpu,
  Camera,
  Music,
  BookOpen,
  Calendar,
  Award,
  ChevronRight,
  Mail,
  Clock,
  ExternalLink,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  Megaphone
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { clubsService } from "../services/clubsService";
import { useStudent } from "../context/StudentContext";
import MainCard from "../components/MainCard";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";
import ClubDetailPanel from "../components/clubs/ClubDetailPanel";

const logoMap = {
  cpu: Cpu,
  mic: Mic,
  music: Music,
  camera: Camera,
  code: Code,
  "book-open": BookOpen
};

const NAVY = "#03045e";

export default function ClubsCommitteesPage() {
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [studentClubs, setStudentClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  
  const { activeStudentId } = useStudent();
  const studentId = activeStudentId || 'stud-001';

  const loadStudentData = async () => {
    setLoading(true);
    try {
      // 1. Get clubs with membership status
      const clubs = await clubsService.getStudentClubs(studentId);
      setStudentClubs(clubs);

      // 2. Resolve all upcoming activities / events for the clubs the student has joined
      const joinedIds = clubs.filter(c => c.isMember).map(c => c.id);
      const allEvents = [];
      for (const cid of joinedIds) {
        const evs = await clubsService.getClubEvents(cid);
        allEvents.push(...evs);
        
        const updates = await clubsService.getClubUpdates(cid);
        
        const clubObj = clubs.find(c => c.id === cid);
        if (clubObj) {
          clubObj.activitiesCount = evs.length;
          clubObj.advisoriesCount = updates.length;
        }
      }
      setActivities(allEvents);

      // 3. Populate fallback faculty coordinators list for all clubs
      const validClubsWithCoords = clubs.filter(
        c => c.coordinator && 
             !c.coordinator.toLowerCase().includes('faculty member') && 
             !c.coordinator.toLowerCase().includes('faculty coordinator')
      );
      
      const uniqueNames = new Set();
      const resolvedCoordinators = [];
      
      validClubsWithCoords.forEach(c => {
        if (!uniqueNames.has(c.coordinator)) {
          uniqueNames.add(c.coordinator);
          resolvedCoordinators.push({
            id: `fac-${c.id}`,
            name: c.coordinator,
            department: c.category || 'Co-Curricular',
            email: `${c.coordinator.toLowerCase().replace(/\s/g, '.').replace(/[^a-z.]/g, '')}@edudash.edu`,
            timings: 'Mon, Wed: 3:30 PM - 5:00 PM'
          });
        }
      });
      
      setCoordinators(resolvedCoordinators);
    } catch (err) {
      console.error("Failed to load student club dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const handleJoinClub = async (clubId) => {
    setErrorMsg("");
    try {
      await clubsService.joinClub(studentId, clubId);
      await loadStudentData();
    } catch (err) {
      setErrorMsg(err.message || "Failed to join club.");
    }
  };

  const handleLeaveClub = async (clubId) => {
    setErrorMsg("");
    try {
      await clubsService.leaveClub(studentId, clubId);
      await loadStudentData();
    } catch (err) {
      setErrorMsg(err.message || "Failed to leave club.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00b4d8]"></div>
    </div>
  );

  const joinedClubs = studentClubs.filter(c => c.isMember);
  const discoverClubs = studentClubs.filter(c => !c.isMember);

  return (
    <div className="max-w-[1600px] mx-auto pb-12 px-4 sm:px-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
          <Users size={31} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: NAVY }}>
            {t("clubs.title") || "Clubs & Committees"}
          </h1>
          <p className="text-sm text-gray-500">
            {t("clubs.subtitle") || "Discover, join, and manage your co-curricular engagement."}
          </p>
        </div>
        <div className="ml-auto">
          <HelperButton onClick={() => setShowHelper(true)} />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-black text-rose-700 flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {selectedClub ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <ClubDetailPanel 
                club={selectedClub} 
                onBack={() => setSelectedClub(null)} 
                isReadOnly={true}
              />
            </div>
          ) : (
            <>
              {/* My Memberships */}
              <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
                  <Award size={16} />
                </div>
                {t("clubs.memberships") || "My Memberships"}
              </h2>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-xl">
                {joinedClubs.length} / 2 Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedClubs.length === 0 ? (
                <div className="col-span-2 p-8 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-center font-bold text-xs text-gray-400 italic">
                  You are not enrolled in any clubs. Discover and join up to 2 clubs below!
                </div>
              ) : (
                joinedClubs.map((club) => {
                  const Icon = logoMap[club.logo] || Award;
                  return (
                    <MainCard key={club.id} className="p-5 hover:translate-y-[-4px] transition-all duration-300 flex flex-col h-full relative group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-[#caf0f8]/30 text-[#0077b6] shadow-sm flex-shrink-0">
                          <Icon size={22} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedClub(club)}
                            className="text-[9px] font-black px-2.5 py-1.5 rounded-lg bg-[#03045e] text-white uppercase tracking-wider hover:bg-[#0077b6] shadow-sm transition-colors"
                          >
                            View Details
                          </button>
                          <span className="text-[9px] font-black px-2.5 py-1.5 rounded-lg bg-[#00b4d8]/10 text-[#00b4d8] uppercase tracking-wider hidden sm:inline-block">
                            {club.category}
                          </span>
                          <button
                            onClick={() => handleLeaveClub(club.id)}
                            title="Leave Club"
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <MinusCircle size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-[#03045e] mb-0.5">{club.name}</h3>
                        <p className="text-[10px] font-black text-[#00b4d8] mb-3 uppercase tracking-[0.1em]">{club.role || 'Member'}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                          {club.description}
                        </p>
                        
                        <div className="flex items-center gap-5 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={15} color="#8C9EB5" strokeWidth={2.5} />
                            <span className="text-[11px] font-black text-[#8C9EB5] uppercase tracking-wider pt-[2px]">Activities</span>
                            <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-slate-50 text-[10px] font-black text-[#8C9EB5] border border-slate-100 ml-1">
                              {club.activitiesCount || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Megaphone size={15} color="#8C9EB5" strokeWidth={2.5} />
                            <span className="text-[11px] font-black text-[#8C9EB5] uppercase tracking-wider pt-[2px]">Advisories</span>
                            <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-slate-50 text-[10px] font-black text-[#8C9EB5] border border-slate-100 ml-1">
                              {club.advisoriesCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 mt-auto">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase">Coordinator</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-bold text-gray-700 truncate">{club.coordinator}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase">Joined Date</span>
                          <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-[#00b4d8]" />
                            <span className="text-[10px] font-bold text-gray-700 truncate">{club.joinedAt || '2024-07-20'}</span>
                          </div>
                        </div>
                      </div>
                    </MainCard>
                  );
                })
              )}
            </div>
          </section>

          {/* Discover Clubs */}
          <section className="pt-2">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
                  <ExternalLink size={16} />
                </div>
                {t("clubs.discover") || "Discover Clubs"}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {discoverClubs.length === 0 ? (
                <div className="col-span-2 p-8 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-center font-bold text-xs text-gray-400 italic">
                  No other clubs available to join at this time.
                </div>
              ) : (
                discoverClubs.map((club) => {
                  const Icon = logoMap[club.logo] || ChevronRight;
                  return (
                    <div key={club.id} className="bg-white border border-[#caf0f8] rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#caf0f8] group-hover:text-[#0077b6] transition-colors flex-shrink-0">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#03045e] group-hover:text-[#0077b6] transition-colors leading-tight mb-1">{club.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-gray-400">{30 + (club.id.charCodeAt(club.id.length - 1) % 15)} Members</span>
                            <div className="w-1 h-1 rounded-full bg-gray-200" />
                            <span className="text-[9px] font-bold text-[#00b4d8] uppercase tracking-tighter">{club.category}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinClub(club.id)}
                        disabled={joinedClubs.length >= 2}
                        className="h-7 px-3 rounded-lg text-[10px] font-black text-[#0077b6] hover:bg-[#0077b6] hover:text-white border border-[#0077b6]/20 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#0077b6] transition-all uppercase tracking-tighter flex-shrink-0 ml-2"
                      >
                        Join
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
            </>
          )}
        </div>

        {/* Sidebar Activities and Coordinators */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <section>
            <div className="flex items-center gap-2.5 mb-4 px-1">
              <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
                <Calendar size={16} />
              </div>
              <h2 className="text-lg font-black text-[#03045e]">
                {t("clubs.activities") || "Upcoming Activities"}
              </h2>
            </div>
            <MainCard borderColor="#0077b6" className="p-6">
              {activities.length === 0 ? (
                <div className="text-center py-6 text-xs font-bold text-gray-400 italic">
                  No upcoming activities scheduled for your active memberships.
                </div>
              ) : (
                <div className="space-y-5">
                  {activities.slice(0, showAllActivities ? undefined : 3).map((act, idx) => (
                    <div key={`${act.id}-${idx}`} className="relative pl-5 border-l-2 border-[#caf0f8] pb-1 last:pb-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#00b4d8]" />
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#00b4d8] uppercase tracking-[0.1em]">{act.date}</span>
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-md bg-gray-50 text-gray-400 border border-gray-100 uppercase">
                          {act.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-[#03045e] leading-snug mb-1">{act.title}</h4>
                      <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                        <Clock size={10} className="text-[#00b4d8] flex-shrink-0" />
                        <span>{act.time}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                        <span>{act.venue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activities.length > 3 && (
                <button 
                  onClick={() => setShowAllActivities(!showAllActivities)}
                  className="w-full mt-6 py-2.5 rounded-xl bg-gray-50 text-[10px] font-black text-[#0077b6] uppercase tracking-widest hover:bg-[#caf0f8] transition-colors border border-dashed border-[#00b4d8]/30"
                >
                  {showAllActivities ? "Show Less" : "View All Activities"}
                </button>
              )}
            </MainCard>
          </section>

          {/* Coordinators */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-2">
              <Users size={16} className="text-[#00b4d8]" />
              <h2 className="text-md font-black text-[#03045e]">{t("clubs.coordinators") || "Faculty Coordinators"}</h2>
            </div>
            <div className="space-y-3">
              {coordinators.map((fac) => (
                <div key={fac.id} className="bg-white border border-[#caf0f8] rounded-[1.25rem] p-3.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#03045e] flex items-center justify-center text-white font-black text-md shadow-md shadow-[#03045e]/20 flex-shrink-0">
                      {fac.name.split(" ").pop()[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-[#03045e] leading-tight truncate">{fac.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate mt-0.5">{fac.department}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                      <div className="w-5 h-5 rounded-md bg-[#caf0f8]/30 flex items-center justify-center text-[#0077b6] flex-shrink-0">
                        <Mail size={10} />
                      </div>
                      <span className="truncate">{fac.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                      <div className="w-5 h-5 rounded-md bg-[#caf0f8]/30 flex items-center justify-center text-[#0077b6] flex-shrink-0">
                        <Clock size={10} />
                      </div>
                      <span className="truncate">{fac.timings}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="clubs.title"
        contentEn="The Clubs & Committees section provides a central hub for all your extracurricular engagements."
        contentHi="क्लब और समितियाँ अनुभाग आपकी सभी पाठ्येतर व्यस्तताओं के लिए एक केंद्रीय केंद्र प्रदान करता है।"
      />
    </div>
  );
}
