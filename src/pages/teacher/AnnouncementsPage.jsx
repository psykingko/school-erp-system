import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getTeacherWorkload } from "../../services/teacherService";
import { getUpdatesForTeacher, deleteClassUpdate } from "../../services/classUpdatesService";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import UpdateSummaryCards from "../../components/classUpdates/UpdateSummaryCards";
import UpdateForm from "../../components/classUpdates/UpdateForm";
import UpdateFeed from "../../components/classUpdates/UpdateFeed";

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const teacherId = user?.linkedEntityId || "teach-001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [updatesList, setUpdatesList] = useState([]);

  const fetchWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      const [workload, updates] = await Promise.all([
        getTeacherWorkload(teacherId),
        getUpdatesForTeacher(teacherId)
      ]);
      setTeacherProfile(workload?.profile || null);
      setUpdatesList(updates);
    } catch (err) {
      console.error("Failed to load Class Updates Workspace:", err);
      setError("Failed to compile targeted academic updates roster.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const handleDeleteUpdate = async (id) => {
    try {
      await deleteClassUpdate(id, teacherId);
      // Refresh local feed state
      await fetchWorkspaceData();
    } catch (err) {
      console.error("Failed to delete update:", err);
      alert(err.message || "Failed to remove circular.");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.announcements"
        descriptionKey="announcements.subtitle"
        helperContentEn="Publish class-scoped announcements, homework assignments alerts, parent-teacher reminders, and examine visibility targets."
        helperContentHi="कक्षा-विशिष्ट घोषणाएं, गृहकार्य अनुस्मारक, अभिभावक-शिक्षक बैठक सूचनाएं प्रकाशित करें और उनकी दृश्यता लक्ष्यों का प्रबंधन करें।"
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b4d8] mb-2"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("announcements.compiling", { fallback: "Compiling Workspace Data..." })}</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-6 rounded-2xl text-center">
          <p className="font-bold">{error}</p>
          <button 
            onClick={fetchWorkspaceData} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-indigo-700 transition"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* 1. Statistics Cards */}
          <UpdateSummaryCards updates={updatesList} />

          {/* 2. Form & Feed Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Composing Circular Panel */}
            <div className="lg:col-span-1">
              <UpdateForm 
                teacherProfile={teacherProfile}
                onPublishSuccess={fetchWorkspaceData}
              />
            </div>

            {/* Active circular lists */}
            <div className="lg:col-span-2 space-y-4">
              <div className="border-b pb-2 flex justify-between items-center">
                <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
                  {t("announcements.activeNoticeBoard", { fallback: "Active Notice Board Feed" })}
                </h3>
                <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded border uppercase">
                  {t("announcements.classScoped", { fallback: "Class scoped" })}
                </span>
              </div>
              <UpdateFeed 
                updates={updatesList}
                onDeleteUpdate={handleDeleteUpdate}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnnouncementsPage;
