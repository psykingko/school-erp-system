import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  BadgeCheck,
  FileText,
  ScrollText,
  GraduationCap,
  FileBadge,
  Award,
  CreditCard,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Upload,
  X,
  ShieldCheck,
  Search,
  FileQuestion,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getDocuments, getDocumentCategories } from "../../services/studentService";
import { useService } from "../../hooks/useService";
import { useStudent } from "../../context/StudentContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";

const ICON_MAP = {
  IdCard: BadgeCheck,
  FileText,
  ScrollText,
  GraduationCap,
  FileBadge,
  Award,
  CreditCard,
  HeartPulse: Activity,
};

const STATUS_CONFIG = {
  verified: {
    labelEn: "Verified",
    labelHi: "सत्यापित",
    icon: CheckCircle,
    color: "#059669",
    bg: "#d1fae5",
    border: "#a7f3d0",
  },
  pending: {
    labelEn: "Pending Verification",
    labelHi: "सत्यापन लंबित",
    icon: Clock,
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fde68a",
  },
  missing: {
    labelEn: "Missing",
    labelHi: "अनुपस्थित",
    icon: AlertTriangle,
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fca5a5",
  },
  uploaded: {
    labelEn: "Uploaded",
    labelHi: "अपलोड किया गया",
    icon: Clock,
    color: "#2563eb",
    bg: "#dbeafe",
    border: "#bfdbfe",
  },
  rejected: {
    labelEn: "Rejected",
    labelHi: "अस्वीकृत",
    icon: AlertTriangle,
    color: "#ea580c",
    bg: "#ffedd5",
    border: "#fed7aa",
  },
  expired: {
    labelEn: "Expired",
    labelHi: "समाप्त",
    icon: AlertTriangle,
    color: "#b91c1c",
    bg: "#fee2e2",
    border: "#fca5a5",
  },
  reupload: {
    labelEn: "Re-upload Required",
    labelHi: "पुनः अपलोड आवश्यक",
    icon: Clock,
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fde68a",
  },
};

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
  }),
};

const HELPER_EN =
  "This section stores all important school-related documents. Verified documents (green) have been confirmed by the school administration. Pending documents (yellow) are under review. Missing documents (red) need to be uploaded soon.";
const HELPER_HI =
  "यह अनुभाग सभी महत्वपूर्ण स्कूल-संबंधित दस्तावेज़ संग्रहीत करता है। सत्यापित दस्तावेज़ (हरा) स्कूल प्रशासन द्वारा पुष्टि किए गए हैं। लंबित दस्तावेज़ (पीला) समीक्षाधीन हैं। अनुपस्थित दस्तावेज़ (लाल) जल्द अपलोड करने की आवश्यकता है।";

const HELPER_LEGEND = [
  { color: "#059669", labelEn: "Green — Verified by school administration.", labelHi: "हरा — स्कूल प्रशासन द्वारा सत्यापित।" },
  { color: "#d97706", labelEn: "Yellow — Pending review. Please wait.", labelHi: "पीला — समीक्षाधीन। कृपया प्रतीक्षा करें।" },
  { color: "#dc2626", labelEn: "Red — Missing. Upload required immediately.", labelHi: "लाल — अनुपस्थित। तुरंत अपलोड आवश्यक।" },
];

function DocumentPreviewModal({ doc, isOpen, onClose, lang, t }) {
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.18s ease",
  };

  if (!doc) return <div style={overlayStyle} aria-hidden="true" />;

  const IconComponent = ICON_MAP[doc.icon] || FileText;
  const status = STATUS_CONFIG[doc.status];
  const StatusIcon = status.icon;
  const title = lang === "hi" ? doc.titleHi : doc.titleEn;
  const description = lang === "hi" ? doc.descriptionHi : doc.descriptionEn;

  return (
    <div
      style={overlayStyle}
      role={isOpen ? "dialog" : undefined}
      aria-modal={isOpen ? "true" : undefined}
      aria-label={isOpen ? title : undefined}
      aria-hidden={!isOpen}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{ zIndex: 10 }}
        initial={false}
        animate={isOpen ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, #03045e, #0077b6, #00b4d8)" }}
          aria-hidden="true"
        />

        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: "#caf0f8" }}
            >
              <IconComponent size={28} style={{ color: "#03045e" }} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold leading-snug" style={{ color: "#03045e" }}>
                {title}
              </h2>
              {doc.uploadDate && (
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {t("docs.uploadedPrefix", { fallback: "Uploaded:" })} {doc.uploadDate}
                  {doc.fileType && ` · ${doc.fileType}`}
                  {doc.fileSizeKb && ` · ${doc.fileSizeKb} KB`}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
              aria-label="Close preview"
            >
              <X size={15} />
            </button>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-4"
            style={{ backgroundColor: status.bg, border: `1px solid ${status.border}` }}
          >
            <StatusIcon size={16} style={{ color: status.color }} aria-hidden="true" />
            <span className="text-sm font-bold" style={{ color: status.color }}>
              {t(`docs.status_${doc.status}`, { fallback: status.labelEn })}
            </span>
            {doc.verifiedBy && doc.status === "verified" && (
              <span className="text-xs text-gray-500 ml-auto font-medium">
                {t("docs.verifiedBy", { fallback: "by" })} {doc.verifiedBy}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed font-medium text-gray-600 mb-5">
            {description}
          </p>

          <div className="flex gap-3">
            {doc.status !== "missing" ? (
              <>
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-colors"
                  style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
                >
                  <Download size={16} />
                  {t("docs.download", { fallback: "Download" })}
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-colors"
                  style={{ backgroundColor: "#0077b6" }}
                >
                  <Upload size={16} />
                  {t("docs.replace", { fallback: "Replace" })}
                </button>
              </>
            ) : (
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: "#03045e" }}
              >
                <Upload size={16} />
                {t("docs.uploadDoc", { fallback: "Upload Document" })}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DocumentCard({ doc, index, onPreview, lang, t }) {
  const IconComponent = ICON_MAP[doc.icon] || FileText;
  const status = STATUS_CONFIG[doc.status];
  const StatusIcon = status.icon;
  const title = lang === "hi" ? doc.titleHi : doc.titleEn;

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
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: "#caf0f8" }}
          >
            <IconComponent size={24} style={{ color: "#03045e" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-extrabold leading-tight line-clamp-1"
              style={{ color: "#03045e" }}
            >
              {title}
            </h3>
            {doc.uploadDate ? (
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                {doc.fileType} · {doc.fileSizeKb} KB
              </p>
            ) : (
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                {t("docs.notUploaded", { fallback: "Not yet uploaded" })}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: status.bg }}
            >
              <StatusIcon size={14} style={{ color: status.color }} />
              <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: status.color }}>
                {t(`docs.status_${doc.status}`, { fallback: status.labelEn })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {doc.uploadDate && (
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg" style={{ backgroundColor: "#caf0f8" }}>
                  <Clock size={12} style={{ color: "#0077b6" }} />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {t("docs.uploadedPrefix", { fallback: "Uploaded:" })} {doc.uploadDate}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={() => onPreview(doc)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-extrabold transition-all hover:opacity-90"
            style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
          >
            <Eye size={16} />
            {t("docs.preview", { fallback: "Preview" })}
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-extrabold transition-all hover:opacity-90 shadow-sm ${doc.status === "missing" ? "bg-[#dc2626]" : "bg-[#03045e]"} text-white`}
          >
            {doc.status === "missing" ? <Upload size={16} /> : <Download size={16} />}
            {doc.status === "missing" ? t("docs.upload", { fallback: "Upload" }) : t("docs.download", { fallback: "Download" })}
          </button>
        </div>
      </div>
    </MainCard>
  );
}

export default function DocumentsPage() {
  const { lang, t } = useLanguage();
  const { activeStudentId } = useStudent();
  const { isParent: isParentMode } = useAuth();

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHelper, setShowHelper] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: MOCK_DOCUMENTS, loading: dLoading } = useService(getDocuments, [activeStudentId], [activeStudentId]);
  const { data: DOCUMENT_CATEGORIES, loading: cLoading } = useService(getDocumentCategories, [activeStudentId], [activeStudentId]);

  const handlePreview = useCallback((doc) => {
    setPreviewDoc(doc);
    setIsPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setTimeout(() => setPreviewDoc(null), 300);
  }, []);

  const filtered = useMemo(() => {
    return (MOCK_DOCUMENTS || []).filter((doc) => {
      const matchCat = activeCategory === "all" || doc.category === activeCategory;
      const searchTitle = lang === "hi" ? doc.titleHi : doc.titleEn;
      const matchSearch =
        !searchQuery ||
        searchTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery, lang, MOCK_DOCUMENTS]);

  const counts = useMemo(() => ({
    verified: (MOCK_DOCUMENTS || []).filter((d) => d.status === "verified").length,
    pending: (MOCK_DOCUMENTS || []).filter((d) => d.status === "pending").length,
    missing: (MOCK_DOCUMENTS || []).filter((d) => d.status === "missing").length,
  }), [MOCK_DOCUMENTS]);

  if (dLoading || cLoading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00b4d8]"></div>
    </div>
  );

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: "#03045e" }}>
              <FolderOpen size={31} className="text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black truncate" style={{ color: "#03045e" }}>
                {t("docs.title", { fallback: "Student Documents" })}
              </h1>
              <p className="text-sm text-gray-500 truncate">
                {isParentMode
                  ? t("docs.descParent", { fallback: "View and manage your child's official school documents." })
                  : t("docs.descStudent", { fallback: "Access, preview, and manage your official school documents securely." })}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 ml-auto">
            <HelperButton onClick={() => setShowHelper(true)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { id: "verified", count: counts.verified, labelEn: "Verified", color: "#059669", bg: "#d1fae5", icon: CheckCircle },
            { id: "pending", count: counts.pending, labelEn: "Pending", color: "#d97706", bg: "#fef3c7", icon: Clock },
            { id: "missing", count: counts.missing, labelEn: "Missing", color: "#dc2626", bg: "#fee2e2", icon: AlertTriangle },
          ].map(({ id, count, labelEn, color, bg, icon: Icon }) => (
            <div
              key={labelEn}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm"
              style={{ outline: "1px solid #caf0f8" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                <Icon size={24} style={{ color }} />
              </div>
              <div>
                <span className="text-xl font-black block leading-none" style={{ color }}>{count}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1 block">
                  {t(`docs.count_${id}`, { fallback: labelEn })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={t("docs.searchPlaceholder", { fallback: "Search documents..." })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
              style={{ border: "1px solid #caf0f8", color: "#03045e" }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(DOCUMENT_CATEGORIES || []).map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-3.5 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap"
                  style={
                    isActive
                      ? { backgroundColor: "#03045e", color: "#caf0f8" }
                      : { backgroundColor: "white", color: "#6b7280", border: "1px solid #e5e7eb" }
                  }
                >
                  {t(`docs.cat_${cat.id}`, { fallback: cat.labelEn })}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 bg-white rounded-2xl" style={{ border: "1px solid #caf0f8" }}>
            <FileQuestion size={48} className="text-gray-300" />
            <p className="text-sm font-bold text-gray-400">
              {t("docs.noDocumentsFound", { fallback: "No documents found." })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((doc, i) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                index={i}
                onPreview={handlePreview}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        )}

        <div
          className="border-2 border-dashed rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "#00b4d8", backgroundColor: "#f0f9ff" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#caf0f8" }}
            >
              <Upload size={20} style={{ color: "#0077b6" }} />
            </div>
            <div>
              <p className="text-sm font-extrabold" style={{ color: "#03045e" }}>
                {t("docs.uploadNewDoc", { fallback: "Upload a New Document" })}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {t("docs.uploadNewDocDesc", { fallback: "PDF, JPG, PNG accepted · Active once backend is connected" })}
              </p>
            </div>
          </div>
          <button
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-opacity opacity-60 cursor-not-allowed"
            style={{ backgroundColor: "#0077b6" }}
            disabled
          >
            {t("docs.uploadComingSoon", { fallback: "Upload (Coming Soon)" })}
          </button>
        </div>
      </motion.div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="docs.title"
        contentEn={HELPER_EN}
        contentHi={HELPER_HI}
        colorLegend={HELPER_LEGEND}
      />

      <DocumentPreviewModal
        doc={previewDoc}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        lang={lang}
        t={t}
      />
    </>
  );
}

