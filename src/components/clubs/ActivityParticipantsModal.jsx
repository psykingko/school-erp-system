import React, { useState, useEffect } from "react";
import { Check, X, Users, AlertCircle } from "lucide-react";
import { clubsService } from "../../services/clubsService";
import { useLanguage } from "../../context/LanguageContext";

export default function ActivityParticipantsModal({
  isOpen,
  onClose,
  activity,
  members = [],
  teacherId,
  teacherName = "Coordinator"
}) {
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [existingParticipations, setExistingParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen && activity) {
      loadParticipations();
      setSelectedStudentIds(new Set());
      setErrorMsg("");
    }
  }, [isOpen, activity]);

  const loadParticipations = async () => {
    setLoading(true);
    try {
      const parts = await clubsService.getActivityParticipations(activity.id || activity.activityId);
      setExistingParticipations(parts);
    } catch (err) {
      console.error(err);
      setErrorMsg(t("clubs.loadParticipationsFailed", { fallback: "Failed to load existing participations." }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !activity) return null;

  // Filter out members who are already marked as Participated
  const alreadyMarkedStudentIds = new Set(
    existingParticipations
      .filter((p) => p.participationStatus === "Participated")
      .map((p) => p.studentId)
  );

  const availableMembers = members.filter(
    (m) => m.status === "Active" && !alreadyMarkedStudentIds.has(m.studentId)
  );

  const alreadyMarkedList = existingParticipations.filter(
    (p) => p.participationStatus === "Participated"
  );

  const isAllSelected =
    availableMembers.length > 0 && selectedStudentIds.size === availableMembers.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(availableMembers.map((m) => m.studentId)));
    }
  };

  const handleToggleStudent = (studentId) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudentIds(newSet);
  };

  const handleMarkParticipation = async () => {
    if (selectedStudentIds.size === 0) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const participationsData = Array.from(selectedStudentIds).map((sId) => {
        const member = availableMembers.find((m) => m.studentId === sId);
        // We assume member.class holds className and section in the format "10-A"
        const [className, section] = member.class ? member.class.split("-") : ["Unknown", ""];
        return {
          studentId: member.studentId,
          studentName: member.name,
          className: className,
          section: section || "",
          participationStatus: "Participated"
        };
      });

      await clubsService.markActivityParticipation(
        activity.id || activity.activityId,
        participationsData,
        teacherId,
        teacherName
      );

      // Reload
      await loadParticipations();
      setSelectedStudentIds(new Set());
    } catch (err) {
      setErrorMsg(err.message || t("clubs.markParticipationFailed", { fallback: "Failed to mark participation." }));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveParticipation = async (studentId) => {
    setSaving(true);
    setErrorMsg("");
    try {
      const member = members.find((m) => m.studentId === studentId) || { name: "Unknown", class: "Unknown" };
      const [className, section] = member.class ? member.class.split("-") : ["Unknown", ""];
      
      const participationsData = [{
        studentId: studentId,
        studentName: member.name,
        className: className,
        section: section || "",
        participationStatus: "Removed" // Soft delete logic
      }];

      await clubsService.markActivityParticipation(
        activity.id || activity.activityId,
        participationsData,
        teacherId,
        teacherName
      );

      await loadParticipations();
    } catch (err) {
      setErrorMsg(err.message || t("clubs.removeParticipationFailed", { fallback: "Failed to remove participation." }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full w-[95vw] md:w-[90vw] lg:max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00b4d8]" />
            <div>
              <h3 className="font-black text-sm text-[#03045e] uppercase tracking-wider">
                {t("clubs.activityParticipants", { fallback: "Activity Participants" })}
              </h3>
              <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                {activity.title} • {activity.date}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
              <AlertCircle size={14} />
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00b4d8]"></div>
            </div>
          ) : (
            <>
              {/* Student Selection */}
              <div className="mb-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">
                  {t("clubs.studentSelection", { fallback: "Student Selection (Club Members Only)" })}
                </h4>
                
                {availableMembers.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-[11px] font-bold text-gray-400 italic">
                    {t("clubs.allMembersMarked", { fallback: "All active club members have already been marked or there are no active members." })}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            className="peer appearance-none w-4 h-4 rounded border-2 border-gray-300 checked:bg-[#00b4d8] checked:border-[#00b4d8] transition-colors cursor-pointer"
                          />
                          <Check size={10} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-[11px] font-black text-[#03045e] uppercase tracking-wider group-hover:text-[#00b4d8] transition-colors">
                          {t("clubs.selectAllMembers", { fallback: "Select All Members" })}
                        </span>
                      </label>
                      <span className="text-[10px] font-bold text-gray-500">
                        {selectedStudentIds.size} {t("clubs.selected", { fallback: "selected" })}
                      </span>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {availableMembers.map(member => (
                        <label key={member.studentId} className="flex items-center gap-3 p-3 hover:bg-gray-50/50 cursor-pointer transition-colors">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={selectedStudentIds.has(member.studentId)}
                              onChange={() => handleToggleStudent(member.studentId)}
                              className="peer appearance-none w-4 h-4 rounded border-2 border-gray-300 checked:bg-[#00b4d8] checked:border-[#00b4d8] transition-colors cursor-pointer"
                            />
                            <Check size={10} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-[#03045e]">{member.name}</div>
                            <div className="text-[10px] font-bold text-gray-400">{t("common.class", { fallback: "Class" })} {member.class}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleMarkParticipation}
                    disabled={selectedStudentIds.size === 0 || saving}
                    className="h-10 px-6 bg-[#03045e] text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-[#0077b6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {t("clubs.markParticipationBtn", { fallback: "Mark Participation" })}
                  </button>
                </div>
              </div>

              {/* Already Marked Section */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">
                  {t("clubs.alreadyMarked", { fallback: "Already Marked" })} ({alreadyMarkedList.length})
                </h4>
                
                {alreadyMarkedList.length === 0 ? (
                  <div className="text-[11px] font-bold text-gray-400 italic">
                    {t("clubs.noParticipantsMarked", { fallback: "No participants marked yet." })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 gap-2">
                    {alreadyMarkedList.map(p => (
                      <div key={p.participationId} className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/30 group">
                        <div>
                          <div className="text-[11px] font-black text-[#03045e]">{p.studentName}</div>
                          <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{p.participationStatus}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveParticipation(p.studentId)}
                          disabled={saving}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-50"
                          title={t("clubs.removeFromParticipated", { fallback: "Remove from participated" })}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
