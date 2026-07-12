import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Star, Medal, Plus, X, ChevronDown, ChevronUp,
  Award, Sparkles, Calendar, Building2, FileCheck,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";
import { getAchievements } from "../../services/studentService";
import { useService } from "../../hooks/useService";
import { useStudent } from "../../context/StudentContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";

const ACHIEVEMENT_CATEGORIES = [
  { id: "all", labelEn: "All", labelHi: "सभी", color: "#03045e" },
  { id: "academic", labelEn: "Academic", labelHi: "शैक्षणिक", color: "#0077b6" },
  { id: "sports", labelEn: "Sports", labelHi: "खेल", color: "#059669" },
  { id: "cultural", labelEn: "Cultural", labelHi: "सांस्कृतिक", color: "#6d28d9" },
  { id: "technical", labelEn: "Technical", labelHi: "तकनीकी", color: "#dc2626" },
];

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.3, ease: "easeOut" },
  }),
};

const RANK_CONFIG = {
  gold:          { icon: Trophy,  bg: "#fef3c7", border: "#fde68a", text: "#b45309", labelEn: "Gold", labelHi: "स्वर्ण" },
  silver:        { icon: Medal,   bg: "#f1f5f9", border: "#cbd5e1", text: "#475569", labelEn: "Silver", labelHi: "रजत" },
  bronze:        { icon: Medal,   bg: "#fef0e7", border: "#fed7aa", text: "#c2410c", labelEn: "Bronze", labelHi: "कांस्य" },
  participation: { icon: Award,   bg: "#ede9fe", border: "#ddd6fe", text: "#6d28d9", labelEn: "Participant", labelHi: "प्रतिभागी" },
  certificate:   { icon: FileCheck, bg: "#d1fae5", border: "#a7f3d0", text: "#065f46", labelEn: "Certified", labelHi: "प्रमाणित" },
};

const HELPER_EN = "This section showcases all your academic, sports, cultural, technical, and competition achievements. Each card represents a verified accomplishment.";
const HELPER_HI = "यह अनुभाग आपकी सभी शैक्षणिक, खेल, सांस्कृतिक, तकनीकी और प्रतियोगिता उपलब्धियों को दर्शाता है। प्रत्येक कार्ड एक सत्यापित उपलब्धि को दर्शाता है।";

const BLANK_FORM = { title: "", category: "academic", date: "", organization: "", description: "" };

function AddAchievementModal({ isOpen, onClose, onAdd, lang, t }) {
  const [form, setForm] = useState(BLANK_FORM);
  const [errors, setErrors] = useState({});

  const overlayStyle = {
    position: "fixed", inset: 0, zIndex: 60,
    display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.18s ease",
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = true;
    if (!form.date.trim()) e.date = true;
    if (!form.organization.trim()) e.organization = true;
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({ ...form, id: `ach-new-${Date.now()}`, rank: "certificate", hasCertificate: false, iconEmoji: "🏅", color: "#0077b6", colorBg: "#dbeafe" });
    setForm(BLANK_FORM);
    setErrors({});
    onClose();
  };

  const field = (key, labelEn, labelHi, type = "text") => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#0077b6" }}>
        {t(`achievements.${key}Label`, { fallback: labelEn })}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((er) => ({ ...er, [key]: false })); }}
        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#00b4d8]"
        style={{ backgroundColor: "#f8fafc", border: `1px solid ${errors[key] ? "#dc2626" : "#e2e8f0"}`, color: "#03045e" }}
      />
      {errors[key] && <span className="text-[10px] text-red-500 font-semibold">{t("achievements.fieldRequired", { fallback: "This field is required" })}</span>}
    </div>
  );

  return (
    <div style={overlayStyle} role={isOpen ? "dialog" : undefined} aria-modal={isOpen ? "true" : undefined} aria-hidden={!isOpen}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose} aria-hidden="true" />
      <motion.div
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{ zIndex: 10 }}
        initial={false}
        animate={isOpen ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#03045e,#0077b6,#00b4d8)" }} aria-hidden="true" />
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold" style={{ color: "#03045e" }}>
              <Plus size={18} className="inline mr-2" />
              {t("achievements.addTitle", { fallback: "Add Achievement" })}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#caf0f8", color: "#03045e" }} aria-label="Close">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {field("title", "Achievement Title", "उपलब्धि शीर्षक")}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#0077b6" }}>{t("achievements.category", { fallback: "Category" })}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#00b4d8]"
                style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#03045e" }}
              >
                {ACHIEVEMENT_CATEGORIES.filter(c => c.id !== "all").map(c => (
                  <option key={c.id} value={c.id}>{lang === "hi" ? c.labelHi : c.labelEn}</option>
                ))}
              </select>
            </div>
            {field("date", "Date Achieved", "उपलब्धि की तारीख", "date")}
            {field("organization", "Issuing Organization", "जारी करने वाली संस्था")}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#0077b6" }}>{t("achievements.description", { fallback: "Description" })}</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#00b4d8] resize-none"
                style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#03045e" }}
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-2xl text-sm font-extrabold text-white transition-colors" style={{ backgroundColor: "#03045e" }}>
              {t("achievements.save", { fallback: "Save Achievement" })}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function AchievementCard({ ach, index, lang, t }) {
  const [expanded, setExpanded] = useState(false);
  const rank = RANK_CONFIG[ach.rank] || RANK_CONFIG.certificate;
  const RankIcon = rank.icon;
  const cat = ACHIEVEMENT_CATEGORIES.find(c => c.id === ach.category);
  const title = lang === "hi" ? (ach.titleHi || ach.titleEn || ach.title) : (ach.titleEn || ach.title);
  const description = lang === "hi" ? (ach.descriptionHi || ach.descriptionEn || ach.description) : (ach.descriptionEn || ach.description);
  const org = lang === "hi" ? (ach.organizationHi || ach.organizationEn || ach.organization) : (ach.organizationEn || ach.organization);

  return (
    <MainCard
      custom={index}
      variants={cardVariants}
      className="h-full flex flex-col transition-shadow duration-200 hover:shadow-lg"
      aria-label={title}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ backgroundColor: ach.colorBg || "#f3f4f6" }}
            aria-hidden="true"
          >
            <RankIcon size={24} style={{ color: ach.color || "#4b5563" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold leading-tight line-clamp-1" style={{ color: "#03045e" }}>{title}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {cat && (
                <span
                  className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ backgroundColor: cat.color + "18", color: cat.color }}
                >
                  {lang === "hi" ? cat.labelHi : cat.labelEn}
                </span>
              )}
              <div
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border"
                style={{ backgroundColor: rank.bg, color: rank.text, borderColor: rank.border }}
              >
                <RankIcon size={10} />
                <span className="text-[10px] font-extrabold uppercase tracking-wide">
                  {t(`achievements.rank_${ach.rank}`, { fallback: rank.labelEn })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg" style={{ backgroundColor: "#caf0f8" }}>
              <Calendar size={13} style={{ color: "#0077b6" }} />
            </div>
            <span className="text-xs font-semibold text-gray-600">{ach.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg" style={{ backgroundColor: "#caf0f8" }}>
              <Building2 size={13} style={{ color: "#00b4d8" }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 truncate">{org}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-[11px] font-bold transition-colors"
          style={{ color: "#0077b6" }}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded
            ? t("achievements.showLess", { fallback: "Show less" })
            : t("achievements.readMore", { fallback: "Read more" })}
        </button>

        {expanded && (
          <p className="text-xs leading-relaxed font-medium text-gray-600">
            {description}
          </p>
        )}

        {ach.hasCertificate && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl mt-auto" style={{ backgroundColor: "#d1fae5" }}>
            <FileCheck size={13} className="text-[#059669]" aria-hidden="true" />
            <span className="text-[10px] font-extrabold text-[#059669]">
              {t("achievements.certAvailable", { fallback: "Certificate available" })}
            </span>
          </div>
        )}
      </div>
    </MainCard>
  );
}

export default function AchievementsPage() {
  const { lang, t } = useLanguage();
  const { activeStudentId } = useStudent();
  const { isParent: isParentMode } = useAuth();

  const [activeCategory, setActiveCategory] = useState("all");
  const [showHelper, setShowHelper] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [extraAchievements, setExtraAchievements] = useState([]);

  const { data: MOCK_ACHIEVEMENTS, loading } = useService(getAchievements, [activeStudentId], [activeStudentId]);

  const handleAdd = useCallback((newAch) => {
    setExtraAchievements(prev => [newAch, ...prev]);
  }, []);

  const allAchievements = useMemo(() => [...extraAchievements, ...(MOCK_ACHIEVEMENTS || [])], [extraAchievements, MOCK_ACHIEVEMENTS]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return allAchievements;
    return allAchievements.filter(a => a.category === activeCategory);
  }, [activeCategory, allAchievements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: "#03045e" }}>
              <Trophy size={31} className="text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black truncate" style={{ color: "#03045e" }}>
                {t("achievements.title", { fallback: "Achievements" })}
              </h1>
              <p className="text-sm text-gray-500 truncate">
                {isParentMode
                  ? t("achievements.subtitleParent", { fallback: "Academic and extracurricular achievements of your child." })
                  : t("achievements.subtitleStudent", { fallback: "Your awards, medals & milestones — all in one place." })}
              </p>
            </div>
          </div>


          <div className="flex-shrink-0 flex items-center gap-2">
            {!isParentMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#03045e" }}
              >
                <Plus size={16} />
                {t("achievements.add", { fallback: "Add" })}
              </button>
            )}
            <HelperButton onClick={() => setShowHelper(true)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {[
            { id: "gold", count: allAchievements.filter(a => a.rank === "gold").length, labelEn: "Gold", color: "#b45309", bg: "#fef3c7", icon: Trophy },
            { id: "silver", count: allAchievements.filter(a => a.rank === "silver").length, labelEn: "Silver", color: "#475569", bg: "#f1f5f9", icon: Medal },
            { id: "others", count: allAchievements.filter(a => ["bronze","participation"].includes(a.rank)).length, labelEn: "Medals", color: "#6d28d9", bg: "#ede9fe", icon: Award },
            { id: "certs", count: allAchievements.filter(a => a.hasCertificate).length, labelEn: "Certs", color: "#059669", bg: "#d1fae5", icon: FileCheck },
          ].map(({ id, count, labelEn, color, bg, icon: Icon }) => (
            <div
              key={id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-[#caf0f8]"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                <Icon size={24} style={{ color }} />
              </div>
              <div>
                <span className="text-xl font-black block leading-none" style={{ color }}>{count}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1 block">
                  {t(`achievements.stat_${id}`, { fallback: labelEn })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
          {ACHIEVEMENT_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-3.5 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap"
                style={isActive
                  ? { backgroundColor: cat.color, color: "white" }
                  : { backgroundColor: "white", color: "#6b7280", border: "1px solid #e5e7eb" }}
              >
                {t(`achievements.cat_${cat.id}`, { fallback: cat.labelEn })}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 bg-white rounded-2xl" style={{ border: "1px solid #caf0f8" }}>
            <Star size={48} className="text-gray-300" aria-hidden="true" />
            <p className="text-sm font-bold text-gray-400">
              {t("achievements.noAchievements", { fallback: "No achievements in this category yet." })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ach, i) => (
              <AchievementCard key={ach.id} ach={ach} index={i} lang={lang} t={t} />
            ))}
          </div>
        )}

        <div
          className="flex items-center gap-4 p-5 rounded-2xl"
          style={{ background: "linear-gradient(135deg, #03045e, #0077b6)" }}
        >
          <Sparkles size={32} className="text-[#caf0f8] flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-extrabold text-white">
              {t("achievements.promoTitle", { fallback: "Every achievement matters!" })}
            </p>
            <p className="text-xs text-white/70 font-medium mt-0.5">
              {t("achievements.promoDesc", { fallback: "Keep adding your milestones here and track your incredible journey." })}
            </p>
          </div>
        </div>
      </motion.div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="achievements.title"
        contentEn={HELPER_EN}
        contentHi={HELPER_HI}
      />
      <AddAchievementModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
        lang={lang}
        t={t}
      />
    </>
  );
}

