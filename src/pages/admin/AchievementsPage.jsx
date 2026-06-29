import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Plus, Star } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import AchievementCard from "../../components/admin/institutional/AchievementCard";
import InstitutionalFilterBar from "../../components/admin/institutional/InstitutionalFilterBar";
import AdminEditForm from "../../components/admin/AdminEditForm";
import { getDataProvider } from "../../data";

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [students, setStudents] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAch, setSelectedAch] = useState(null);
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const provider = getDataProvider();
      const [allAchievements, allStudents] = await Promise.all([
        provider.getAchievements(),
        provider.getStudents(),
      ]);

      setAchievements(allAchievements || []);
      setStudents(allStudents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAchievement = async (formData) => {
    try {
      const provider = getDataProvider();
      
      const payload = {
        studentId: formData.scope === "student" ? formData.studentId : null,
        titleEn: formData.title,
        category: formData.category,
        scope: formData.scope || "student",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        rank: formData.rank || "gold",
      };

      if (selectedAch) {
        await provider.updateAchievement(selectedAch.id, payload);
        setSuccessBanner(`Successfully updated achievement!`);
      } else {
        await provider.createAchievement(payload);
        setSuccessBanner(`Successfully recorded new achievement!`);
      }

      const allAchievements = await provider.getAchievements();
      setAchievements(allAchievements || []);

      setTimeout(() => setSuccessBanner(""), 4000);
      setCreateOpen(false);
      setSelectedAch(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAchievement = async (id) => {
    if (window.confirm("Are you sure you want to delete this achievement?")) {
      try {
        const provider = getDataProvider();
        await provider.deleteAchievement(id);
        setSuccessBanner(`Achievement deleted successfully!`);
        setTimeout(() => setSuccessBanner(""), 4000);
        
        const allAchievements = await provider.getAchievements();
        setAchievements(allAchievements || []);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Helper resolver to format achievements display
  const resolvedAchievements = achievements.map((ach) => {
    const stu = ach.studentId ? students.find((s) => s.id === ach.studentId) : null;

    // Format category
    let catStr = "Co-Curricular";
    if (ach.category === "academic") catStr = "Academic";
    else if (ach.category === "technical") catStr = "Technical";
    else if (ach.category === "sports") catStr = "Sports";
    else if (ach.category === "cultural") catStr = "Cultural & MUN";

    // Format rank
    let rankStr = "Gold Medal";
    if (ach.rank === "silver") rankStr = "Silver Medal";
    else if (ach.rank === "bronze") rankStr = "Bronze Medal";
    
    // Format Scope
    let scopeDisplay = stu ? stu.name : "Student";
    if (ach.scope === "school") scopeDisplay = "School Achievement";
    else if (ach.scope === "house") scopeDisplay = "House Achievement";
    else if (ach.scope === "class") scopeDisplay = "Class Achievement";

    return {
      ...ach,
      studentName: scopeDisplay,
      categoryStr: catStr,
      rankStr: rankStr,
      description: `Secured the highest honors during the state level ${ach.category} competitions representing the school.`,
    };
  });

  const filteredAchievements = resolvedAchievements.filter((ach) => {
    const matchesSearch =
      ach.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ach.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === "" || ach.category === selectedCategory;
    const matchesRank = selectedRank === "" || ach.rank === selectedRank;

    return matchesSearch && matchesCat && matchesRank;
  });

  const achievementFields = [
    {
      name: "scope",
      label: "Achievement Scope",
      type: "select",
      options: [
        { value: "student", label: "Individual Student" },
        { value: "house", label: "House Achievement" },
        { value: "class", label: "Class Achievement" },
        { value: "school", label: "School Achievement" }
      ]
    },
    {
      name: "studentId",
      label: "Select Mapped Student",
      type: "select",
      options: students.map((s) => s.id),
      hidden: (form) => form.scope !== "student"
    },
    {
      name: "title",
      label: "Competition / Event Title",
      type: "text",
      required: true,
    },
    {
      name: "category",
      label: "Achievement Category",
      type: "select",
      options: ["academic", "technical", "sports", "cultural"],
    },
    {
      name: "rank",
      label: "Award Rank Medal",
      type: "select",
      options: ["gold", "silver", "bronze"],
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
        title="Student Achievements Board"
        description="Celebrate and record student laurels, olympiad medals, and athletic competition rankings."
        breadcrumbs={["Admin Portal", "Institutional", "Achievements"]}
        actionButton={
          <button
            onClick={() => {
              setSelectedAch(null);
              setCreateOpen(true);
            }}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors"
          >
            <Plus size={16} />
            <span>RECORD NEW HONOR</span>
          </button>
        }
      />

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-xs font-black shadow-sm transition-all animate-bounce">
          {successBanner}
        </div>
      )}

      {/* Roster Strengths stats */}
      <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <OperationsStatCard
          title="Total Medals Awarded"
          value={achievements.length.toString()}
          description="Verified institutional laurels"
          icon={Award}
        />
        <OperationsStatCard
          title="Gold Medal Honors"
          value={achievements
            .filter((a) => a.rank === "gold")
            .length.toString()}
          description="First-place competition wins"
          icon={Award}
          color="#0096c7"
          bg="#ade8f4"
        />
        <OperationsStatCard
          title="Spotlight Nominees"
          value="4 Students"
          description="Schedules compiled"
          icon={Award}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* Roster Filter tools */}
      <InstitutionalFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search achievements by student name or competition..."
        filterSlots={
          <>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
            >
              <option value="">Filter Categories...</option>
              <option value="academic">Academic Honors</option>
              <option value="technical">Technical Coding</option>
              <option value="sports">Athletic Sports</option>
              <option value="cultural">Cultural Debate/Arts</option>
            </select>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
            >
              <option value="">Filter Medals...</option>
              <option value="gold">Gold Medal</option>
              <option value="silver">Silver Medal</option>
              <option value="bronze">Bronze Medal</option>
            </select>
          </>
        }
      />

      {/* Achievements Cards Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-wider">
          No honors posted matching active filter criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((ach) => (
            <AchievementCard
              key={ach.id}
              title={ach.titleEn}
              studentName={ach.studentName}
              category={ach.categoryStr}
              rank={ach.rankStr}
              description={ach.description}
              date={ach.date}
              onEdit={() => {
                setSelectedAch(ach);
                setCreateOpen(true);
              }}
              onDelete={() => handleDeleteAchievement(ach.id)}
            />
          ))}
        </div>
      )}

      {/* Record Achievement Modal */}
      <AdminEditForm
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setSelectedAch(null);
        }}
        title={selectedAch ? "Edit Achievement Honor" : "Record Student Honor Medal"}
        data={selectedAch ? {
          studentId: selectedAch.studentId || "",
          title: selectedAch.titleEn,
          category: selectedAch.category,
          rank: selectedAch.rank,
          scope: selectedAch.scope || "student"
        } : { studentId: "", title: "", category: "academic", rank: "gold", scope: "student" }}
        fields={achievementFields}
        onSubmit={handleRecordAchievement}
      />
    </motion.div>
  );
};

export default AchievementsPage;
