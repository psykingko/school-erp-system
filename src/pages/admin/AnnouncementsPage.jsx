import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Calendar, Bell } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import AnnouncementBanner from "../../components/admin/institutional/AnnouncementBanner";
import ActivityFeed from "../../components/shared/ActivityFeed";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminEditForm from "../../components/admin/AdminEditForm";
import { getDataProvider } from "../../data";

const AnnouncementsPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allNotices = await getDataProvider().getNotices();
      setNotices(allNotices || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (formData) => {
    try {
      const newAnnouncement = {
        titleEn: formData.title,
        contentEn: formData.content,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        audience: formData.audience || "ALL",
        isPinned: true, // Auto-featured!
        status: "Published",
      };

      await getDataProvider().createNotice(newAnnouncement);
      const allNotices = await getDataProvider().getNotices();
      setNotices(allNotices || []);

      setSuccessBanner(`Featured announcement "${formData.title}" published!`);
      setTimeout(() => setSuccessBanner(""), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Resolve the single most important pinned notice as our active Announcement banner
  const featuredAnnouncement = notices.find((n) => n.isPinned) ||
    notices[0] || {
      titleEn: "Annual Sports Meet Registration Schedule Announced",
      contentEn:
        "Students can register for athletic activities, track field trials timings, and download medical certificates. Registrations conclude by next Friday.",
      date: "May 19, 2026",
      audience: "ALL",
    };

  // Convert notices into activity feed entries
  const activityLogs = notices.slice(0, 5).map((n) => ({
    type: "notice",
    description: `[${n.audience === "FACULTY" ? "Faculty" : n.audience === "PARENTS" ? "Parents" : "All"}] ${n.titleEn || n.title}`,
    timestamp: n.date || null,
    user: "Admin",
  }));

  const announcementFields = [
    {
      name: "title",
      label: "Featured Update Title",
      type: "text",
      required: true,
    },
    {
      name: "content",
      label: "Announcement Description Content",
      type: "text",
      required: true,
    },
    {
      name: "audience",
      label: "Target Audience",
      type: "select",
      options: ["ALL", "STUDENTS", "FACULTY", "PARENTS"],
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
        title="Featured Announcements"
        description="Publish institutional spotlight updates, broadcast urgent circular alerts, and review communication timelines."
        breadcrumbs={["Admin Portal", "Institutional", "Announcements"]}
        actionButton={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors"
          >
            <Plus size={16} />
            <span>DISPATCH FEATURED BANNER</span>
          </button>
        }
      />

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-xs font-black shadow-sm transition-all animate-bounce">
          {successBanner}
        </div>
      )}

      {/* Primary Banner Spotlight */}
      <AnnouncementBanner
        title={featuredAnnouncement.titleEn || featuredAnnouncement.title}
        content={featuredAnnouncement.contentEn || featuredAnnouncement.content}
        date={featuredAnnouncement.date}
        audience={featuredAnnouncement.audience}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">


        {/* Dispatch Guidelines Info panel */}
        <AdminSectionCard>
          <div className="flex items-center gap-2 text-[#03045e] border-b border-[#caf0f8] pb-3 mb-4">
            <Bell size={16} className="text-[#0077b6]" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              Communication Matrix
            </h3>
          </div>
          <div className="space-y-3.5 text-xs font-semibold text-gray-500 leading-relaxed">
            <p>
              🌟 <strong>Admins:</strong> Have full authority to post
              school-wide spotlight banners and urgent event highlights.
            </p>
            <p>
              🏫 <strong>Class Teachers:</strong> Scope remains restricted to
              posting class circulars.
            </p>
            <p>
              🧪 <strong>Subject Teachers:</strong> Can only share homework
              briefs or course syllabus updates.
            </p>
          </div>
        </AdminSectionCard>
      </div>

      {/* Create Modal */}
      <AdminEditForm
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Dispatch Featured Banner Alert"
        data={{ title: "", content: "", audience: "ALL" }}
        fields={announcementFields}
        onSubmit={handleCreateAnnouncement}
      />
    </motion.div>
  );
};

export default AnnouncementsPage;
