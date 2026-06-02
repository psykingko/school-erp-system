import React, { useState, useEffect } from "react";
import { Compass, Users, Calendar, Megaphone, ArrowLeft, Info, HelpCircle } from "lucide-react";
import ClubMembersTable from "./ClubMembersTable";
import ClubEventsList from "./ClubEventsList";
import ClubUpdatesFeed from "./ClubUpdatesFeed";
import CreateEventModal from "./CreateEventModal";
import { clubsService } from "../../services/clubsService";

export default function ClubDetailPanel({ club, onBack, teacherId, isReadOnly = false }) {
  const [activeTab, setActiveTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [mLoading, setMLoading] = useState(false);
  const [eLoading, setELoading] = useState(false);
  const [uLoading, setULoading] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const loadClubData = async () => {
    if (!club) return;
    
    // 1. Members
    setMLoading(true);
    try {
      const mems = await clubsService.getClubMembers(club.id);
      setMembers(mems);
    } catch (e) {
      console.error(e);
    } finally {
      setMLoading(false);
    }

    // 2. Events
    setELoading(true);
    try {
      const evts = await clubsService.getClubEvents(club.id);
      setEvents(evts);
    } catch (e) {
      console.error(e);
    } finally {
      setELoading(false);
    }

    // 3. Updates
    setULoading(true);
    try {
      const upds = await clubsService.getClubUpdates(club.id);
      setUpdates(upds);
    } catch (e) {
      console.error(e);
    } finally {
      setULoading(false);
    }
  };

  useEffect(() => {
    loadClubData();
  }, [club?.id]);

  const handleScheduleEvent = async (eventDetails) => {
    await clubsService.createClubEvent({
      clubId: club.id,
      teacherId,
      ...eventDetails
    });
    // Reload events list
    const evts = await clubsService.getClubEvents(club.id);
    setEvents(evts);
  };

  const handlePostUpdate = async (updateDetails) => {
    await clubsService.createClubUpdate({
      clubId: club.id,
      teacherId,
      ...updateDetails
    });
    // Reload updates list
    const upds = await clubsService.getClubUpdates(club.id);
    setUpdates(upds);
  };

  if (!club) return null;

  const tabs = [
    { id: "members", label: "Members", icon: Users, badge: members.length },
    { id: "events", label: "Activities", icon: Calendar, badge: events.length },
    { id: "updates", label: "Advisories", icon: Megaphone, badge: updates.length }
  ];

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
            {club.category} {isReadOnly ? "Member" : "Coordinator"}
          </span>
          <h2 className="text-xl font-black text-[#03045e] mt-1">{club.name}</h2>
        </div>
      </div>

      {/* Description Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-[#caf0f8]/20 border border-blue-100 rounded-3xl p-5 flex items-start gap-4">
        <div className="p-3 bg-white border border-blue-200 rounded-2xl shadow-sm text-blue-600 flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider mb-1">About this Co-Curricular Club</h4>
          <p className="text-xs text-gray-600 font-medium leading-relaxed mb-3">
            {club.description}
          </p>
          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-500">
            <div>
              <span className="text-gray-400">Class Scope:</span>{" "}
              <span className="text-[#03045e]">{club.allowedClasses?.join(", ") || "11-A, 11-B"}</span>
            </div>
            <div>
              <span className="text-gray-400">Max Member Capacity:</span>{" "}
              <span className="text-[#03045e]">{club.maxMembers || 30}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 ${
                isActive 
                  ? "border-[#03045e] text-[#03045e]" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                  isActive ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {activeTab === "members" && (
          <ClubMembersTable members={members} loading={mLoading} />
        )}

        {activeTab === "events" && (
          <ClubEventsList 
            events={events} 
            onOpenScheduleModal={isReadOnly ? undefined : () => setIsScheduleModalOpen(true)} 
          />
        )}

        {activeTab === "updates" && (
          <ClubUpdatesFeed 
            updates={updates} 
            onPostUpdate={isReadOnly ? undefined : handlePostUpdate} 
          />
        )}
      </div>

      {/* Scheduler Modal */}
      <CreateEventModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleScheduleEvent}
      />
    </div>
  );
}
