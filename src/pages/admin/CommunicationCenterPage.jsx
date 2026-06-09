import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Mail, MessageSquare, Radio, Bell, Users, Search, Plus, Eye,
  Copy, Archive, CheckCircle, Clock, AlertTriangle, X, Paperclip,
  Smile, Bold, Italic, List, Tag, Zap, BarChart2, TrendingUp, Phone,
  LayoutGrid, FileText, Star, ChevronRight, Filter, ChevronDown,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import MainCard from "../../components/MainCard";
import AudienceSelector from "../../components/shared/AudienceSelector";

// ─── School Structure ─────────────────────────────────────────────────────────

const PRE_PRIMARY = ["Nursery", "LKG", "UKG"];
const PRIMARY     = [1, 2, 3, 4, 5];
const MIDDLE      = [6, 7, 8];
const SECONDARY   = [9, 10];
const STREAMS_11_12 = ["Science", "Commerce", "Arts / Humanities"];
const SECTIONS    = ["A", "B", "C", "D"];

// Build flat filter options grouped by category
const FILTER_GROUPS = [
  {
    label: "Grade Band",
    options: [
      "All Students",
      "Pre-Primary (Nursery–UKG)",
      "Primary (Class 1–5)",
      "Middle School (Class 6–8)",
      "Secondary (Class 9–10)",
      "Senior Secondary (Class 11–12)",
    ],
  },
  {
    label: "Pre-Primary",
    options: PRE_PRIMARY.flatMap((cls) => SECTIONS.map((s) => `${cls} – ${s}`)),
  },
  {
    label: "Class 1 – 5",
    options: PRIMARY.flatMap((n) => SECTIONS.map((s) => `Class ${n} – ${s}`)),
  },
  {
    label: "Class 6 – 8",
    options: MIDDLE.flatMap((n) => SECTIONS.map((s) => `Class ${n} – ${s}`)),
  },
  {
    label: "Class 9 – 10",
    options: SECONDARY.flatMap((n) => SECTIONS.map((s) => `Class ${n} – ${s}`)),
  },
  {
    label: "Class 11 – Streams",
    options: STREAMS_11_12.flatMap((stream) =>
      SECTIONS.map((s) => `Class 11 ${stream} – ${s}`)
    ),
  },
  {
    label: "Class 12 – Streams",
    options: STREAMS_11_12.flatMap((stream) =>
      SECTIONS.map((s) => `Class 12 ${stream} – ${s}`)
    ),
  },
  {
    label: "Special Segments",
    options: [
      "Fee Defaulters",
      "Attendance < 75%",
      "Transport Users",
      "Exam Appearing – Class 10",
      "Exam Appearing – Class 12",
      "New Admissions",
      "Merit Scholarship Students",
    ],
  },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGNS = [
  { id: "camp-001", name: "PTM Reminder – Grade 10 & 11", audience: ["Parents", "Students"], channels: ["Email", "SMS"],            status: "completed", sentBy: "Admin Raj",   deliveryRate: 97.4, created: "2026-05-24", sent: 1142 },
  { id: "camp-002", name: "Fee Due Alert – May 2026",      audience: ["Parents"],             channels: ["Email", "WhatsApp"],       status: "completed", sentBy: "Admin Priya", deliveryRate: 99.1, created: "2026-05-20", sent: 843  },
  { id: "camp-003", name: "Exam Schedule Broadcast",       audience: ["Students", "Parents"], channels: ["Email", "SMS", "Portal"],  status: "sending",   sentBy: "Admin Raj",   deliveryRate: 64.2, created: "2026-05-26", sent: 2108 },
  { id: "camp-004", name: "Sports Day Circular",           audience: ["All"],                 channels: ["Portal", "Email"],         status: "scheduled", sentBy: "Admin Sana",  deliveryRate: 0,    created: "2026-05-26", sent: 0    },
  { id: "camp-005", name: "Transport Route Change Alert",  audience: ["Parents"],             channels: ["SMS", "WhatsApp"],         status: "draft",     sentBy: "Admin Raj",   deliveryRate: 0,    created: "2026-05-25", sent: 0    },
  { id: "camp-006", name: "Annual Day Invitation",         audience: ["Parents", "Students"], channels: ["Email"],                   status: "failed",    sentBy: "Admin Priya", deliveryRate: 12.3, created: "2026-05-22", sent: 87   },
];

const TEMPLATES = [
  { id: "tpl-001", name: "Fee Reminder",          type: "Email + SMS",     icon: "💰", tags: ["Finance", "Parents"],   uses: 24 },
  { id: "tpl-002", name: "Attendance Warning",    type: "Email",           icon: "⚠️", tags: ["Academic", "Parents"],  uses: 18 },
  { id: "tpl-003", name: "Exam Announcement",     type: "Email + Portal",  icon: "📝", tags: ["Academic", "Students"], uses: 31 },
  { id: "tpl-004", name: "Holiday Notice",        type: "SMS + Portal",    icon: "🏖️", tags: ["Admin", "All"],         uses: 12 },
  { id: "tpl-005", name: "Emergency Alert",       type: "SMS + WhatsApp",  icon: "🚨", tags: ["Emergency"],            uses: 3  },
  { id: "tpl-006", name: "Birthday Greeting",     type: "WhatsApp",        icon: "🎂", tags: ["Engagement"],           uses: 8  },
  { id: "tpl-007", name: "Result Declaration",    type: "Email + SMS",     icon: "📊", tags: ["Academic", "Parents"],  uses: 15 },
  { id: "tpl-008", name: "Sports Day Invite",     type: "Email + Portal",  icon: "🏆", tags: ["Events", "All"],        uses: 6  },
  { id: "tpl-009", name: "Board Exam Timetable",  type: "Email + SMS",     icon: "📅", tags: ["Class 10", "Class 12"], uses: 22 },
];

const MERGE_TAGS = [
  "{StudentName}", "{ParentName}", "{Class}", "{Section}", "{Stream}",
  "{FeeAmount}", "{DueDate}", "{ExamDate}", "{AttendancePercent}",
  "{SchoolName}", "{TeacherName}", "{RollNo}",
];

const CHANNEL_OPTIONS = [
  { id: "email",    label: "Email",             icon: Mail,         color: "text-blue-600",    activeBg: "border-blue-400 bg-blue-50"    },
  { id: "sms",      label: "SMS",               icon: Phone,        color: "text-emerald-600", activeBg: "border-emerald-400 bg-emerald-50" },
  { id: "push",     label: "Push Notification", icon: Bell,         color: "text-purple-600",  activeBg: "border-purple-400 bg-purple-50"  },
  { id: "whatsapp", label: "WhatsApp",          icon: MessageSquare,color: "text-green-600",   activeBg: "border-green-400 bg-green-50"    },
];

const AUDIENCE_GROUPS = ["Students", "Parents", "Teachers", "Departments", "Staff"];

const PRIORITIES = [
  { value: "low",       label: "Low",       cls: "text-gray-500  bg-gray-50  border-gray-300"   },
  { value: "normal",    label: "Normal",    cls: "text-blue-600  bg-blue-50  border-blue-300"   },
  { value: "important", label: "Important", cls: "text-amber-600 bg-amber-50 border-amber-300"  },
  { value: "emergency", label: "Emergency", cls: "text-red-600   bg-red-50   border-red-300"    },
];

const STATUS_CONFIG = {
  draft:     { label: "Draft",     color: "bg-gray-100    text-gray-600",     dot: "bg-gray-400"    },
  scheduled: { label: "Scheduled", color: "bg-purple-100  text-purple-700",   dot: "bg-purple-500"  },
  sending:   { label: "Sending",   color: "bg-blue-100    text-blue-700",     dot: "bg-blue-500"    },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700",  dot: "bg-emerald-500" },
  failed:    { label: "Failed",    color: "bg-red-100     text-red-700",      dot: "bg-red-500"     },
};

const CHANNEL_ICON_MAP = { Email: Mail, SMS: Phone, Portal: Bell, WhatsApp: MessageSquare };

const SECTION_TABS = [
  { id: "composer",  label: "Campaign Composer",  icon: Send      },
  { id: "history",   label: "Campaign History",   icon: BarChart2 },
  { id: "templates", label: "Templates Library",  icon: LayoutGrid },
];

// Removed AudienceFilterPicker in favor of shared AudienceSelector

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 40, scale: 0.95 }}
    className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 bg-[#03045e] text-white rounded-2xl shadow-2xl shadow-[#03045e]/30"
  >
    <CheckCircle size={18} className="text-[#caf0f8] shrink-0" />
    <span className="text-sm font-black">{message}</span>
    <button type="button" onClick={onClose} className="ml-2 p-0.5 hover:opacity-70 transition-opacity">
      <X size={14} />
    </button>
  </motion.div>
);

// ─── Main Page Component ──────────────────────────────────────────────────────

const CommunicationCenterPage = () => {
  // Composer state
  const [activeChannel, setActiveChannel]             = useState("email");
  const [audienceObj, setAudienceObj]                 = useState({
    groups: [], classes: [], sections: [], streams: [], teacherTypes: [], subjects: [], studentIds: [], employeeIds: []
  });
  const [subject, setSubject]                         = useState("");
  const [messageBody, setMessageBody]                 = useState("");
  const [priority, setPriority]                       = useState("normal");
  const [sendTiming, setSendTiming]                   = useState("now");
  const [deliveryChannels, setDeliveryChannels]       = useState(["email"]);

  // History state
  const [campaigns, setCampaigns]   = useState(MOCK_CAMPAIGNS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // UI state
  const [toast, setToast]                   = useState(null);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [activeSection, setActiveSection]   = useState("composer");

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredCampaigns = useMemo(() =>
    campaigns.filter((c) => {
      const matchSearch = !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.sentBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    }),
  [campaigns, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    sentToday:    1248,
    pending:      campaigns.filter((c) => c.status === "scheduled").length,
    deliveryRate: 98.2,
    smsCredits:   12400,
    failed:       campaigns.filter((c) => c.status === "failed").reduce((a, c) => a + c.sent, 0),
  }), [campaigns]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const toggleDeliveryChannel = (ch) =>
    setDeliveryChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );

  const insertMergeTag = (tag) =>
    setMessageBody((prev) => prev + " " + tag);

  const handleSendCampaign = () => {
    // Basic check
    const hasAudience = Object.values(audienceObj).some(arr => arr.length > 0);
    if (!subject.trim() || !messageBody.trim() || !hasAudience) {
      showToast("⚠️  Fill in subject, message, and select an audience.");
      return;
    }
    const newCamp = {
      id: `camp-${Date.now()}`,
      name: subject,
      audience: [...audienceObj.groups, ...audienceObj.classes.map(c => `Class ${c}`)], // Simplified for UI history list display
      audienceMetadata: audienceObj, // Real backend targeting logic goes here
      channels: deliveryChannels.map((c) => c.charAt(0).toUpperCase() + c.slice(1)),
      status: sendTiming === "now" ? "sending" : sendTiming === "schedule" ? "scheduled" : "draft",
      sentBy: "Admin Portal",
      deliveryRate: 0,
      created: new Date().toISOString().split("T")[0],
      sent: 0,
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    setSubject(""); setMessageBody(""); setAudienceObj({ groups: [], classes: [], sections: [], streams: [], teacherTypes: [], subjects: [], studentIds: [], employeeIds: [] });
    showToast("✅  Campaign queued successfully");
  };

  const handleDuplicate = (c) => {
    const dup = { ...c, id: `camp-${Date.now()}`, name: `${c.name} (Copy)`, status: "draft", deliveryRate: 0, sent: 0 };
    setCampaigns((prev) => [dup, ...prev]);
    showToast("Campaign duplicated as Draft");
  };

  const handleArchive = (id) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast("Campaign archived");
  };

  const handleLoadTemplate = (tpl) => {
    setSubject(tpl.name);
    setMessageBody(
      `Dear {StudentName},\n\nThis is a communication from {SchoolName} regarding ${tpl.name.toLowerCase()}.\n\n[Your message here]\n\nRegards,\nSchool Administration`
    );
    setActiveSection("composer");
    showToast(`Template "${tpl.name}" loaded`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <AdminPageHeader
        title="Communication Center"
        description="Manage institutional email, SMS, and direct communication campaigns across all portals"
        breadcrumbs={["Admin Portal", "Communications", "Campaign Center"]}
        actionButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection("templates")}
              className="flex items-center gap-2 border border-[#0077b6] text-[#0077b6] hover:bg-[#0077b6] hover:text-white px-4 py-2.5 rounded-2xl text-xs font-black transition-all"
            >
              <LayoutGrid size={15} />
              Templates
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("composer")}
              className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#03045e] text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-[#0077b6]/20 text-xs font-black transition-all"
            >
              <Plus size={15} />
              New Campaign
            </button>
          </div>
        }
      />

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard title="Sent Today"        value={stats.sentToday.toLocaleString()} icon={Send}          color="#0077b6" bg="#caf0f8" changeText="Messages dispatched" changeDirection="up" badgeText="Active"     badgeType="info"    />
        <AdminStatCard title="Pending Campaigns" value={stats.pending}                    icon={Clock}         color="#8b5cf6" bg="#ede9fe" badgeText="Scheduled"           badgeType="neutral" />
        <AdminStatCard title="Delivery Rate"     value={`${stats.deliveryRate}%`}         icon={TrendingUp}    color="#10b981" bg="#d1fae5" changeText="Excellent"          changeDirection="up" badgeText="Health"    badgeType="success" />
        <AdminStatCard title="SMS Credits"       value={stats.smsCredits.toLocaleString()} icon={Radio}        color="#f59e0b" bg="#fef3c7" badgeText="Remaining"           badgeType="warning" />
        <AdminStatCard title="Failed Deliveries" value={stats.failed}                     icon={AlertTriangle} color="#ef4444" bg="#fee2e2" badgeText="Review"              badgeType="warning" />
      </div>

      {/* ── Section Nav ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-1 bg-[#caf0f8]/20 rounded-2xl p-1">
          {SECTION_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeSection === id
                  ? "bg-[#03045e] text-white shadow-lg"
                  : "text-gray-500 hover:text-[#03045e] hover:bg-white/60"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">
          {activeSection === "composer"  && "Active outbound communication workspace"}
          {activeSection === "history"   && "All campaign history & delivery analytics"}
          {activeSection === "templates" && "Reusable communication templates library"}
        </span>
      </div>

      {/* ── Sections ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >

          {/* ══ COMPOSER ══════════════════════════════════════════════════ */}
          {activeSection === "composer" && (
            <div className="max-w-5xl mx-auto space-y-6">

              {/* Audience groups */}
              <MainCard className="p-5 border border-[#caf0f8]/60">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target Audience</h3>
                <AudienceSelector value={audienceObj} onChange={setAudienceObj} />
              </MainCard>

              {/* Subject */}
              <MainCard className="p-5 border border-[#caf0f8]/60">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Campaign Subject / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. PTM Reminder – Grade 10 Parents"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#caf0f8] text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors placeholder:font-normal placeholder:text-gray-300"
                />
              </MainCard>

              {/* Settings Row (Priority + Channels) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority */}
                <MainCard className="p-5 border border-[#caf0f8]/60">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Priority Level</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PRIORITIES.map(({ value, label, cls }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPriority(value)}
                        className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                          priority === value ? cls : "border-[#caf0f8] text-gray-400 hover:border-[#0077b6]/40"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </MainCard>

                {/* Delivery channels */}
                <MainCard className="p-5 border border-[#caf0f8]/60">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Delivery Channels</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "portal",   label: "Portal Notification", icon: Bell         },
                      { id: "email",    label: "Email",               icon: Mail         },
                      { id: "sms",      label: "SMS",                 icon: Phone        },
                      { id: "whatsapp", label: "WhatsApp",            icon: MessageSquare },
                    ].map(({ id, label, icon: Icon }) => (
                      <div
                        key={id}
                        onClick={() => toggleDeliveryChannel(id)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                          deliveryChannels.includes(id)
                            ? "bg-[#0077b6] border-[#0077b6]"
                            : "border-gray-300 group-hover:border-[#0077b6]"
                        }`}>
                          {deliveryChannels.includes(id) && <CheckCircle size={12} className="text-white" />}
                        </div>
                        <Icon size={14} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">{label}</span>
                      </div>
                    ))}
                  </div>
                </MainCard>
              </div>

              {/* Message body */}
              <MainCard className="p-5 border border-[#caf0f8]/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Body</label>
                    <span className="text-[9px] font-black text-gray-300 uppercase">{messageBody.length} chars</span>
                  </div>

                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 bg-[#caf0f8]/20 rounded-xl border border-[#caf0f8]/40 flex-wrap">
                    {[{ icon: Bold, label: "Bold" }, { icon: Italic, label: "Italic" }, { icon: List, label: "List" }].map(({ icon: Icon, label }) => (
                      <button key={label} type="button" title={label} className="p-1.5 rounded-lg hover:bg-white text-gray-500 hover:text-[#0077b6] transition-colors">
                        <Icon size={14} />
                      </button>
                    ))}
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button type="button" title="Attachment" className="p-1.5 rounded-lg hover:bg-white text-gray-500 hover:text-[#0077b6] transition-colors"><Paperclip size={14} /></button>
                    <button type="button" title="Emoji"      className="p-1.5 rounded-lg hover:bg-white text-gray-500 hover:text-[#0077b6] transition-colors"><Smile size={14} /></button>
                    <div className="ml-auto flex items-center gap-1">
                      <Tag size={12} className="text-[#0077b6]" />
                      <span className="text-[9px] font-black text-[#0077b6] uppercase tracking-wider">Merge Tags</span>
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    placeholder="Write your message here…"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#caf0f8] text-sm font-medium text-[#03045e] outline-none focus:border-[#0077b6] transition-colors placeholder:font-normal placeholder:text-gray-300 resize-none leading-relaxed"
                  />

                  {/* Merge tags */}
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Insert Merge Tag</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MERGE_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => insertMergeTag(tag)}
                          className="px-2.5 py-1 rounded-lg bg-[#caf0f8]/30 border border-[#caf0f8] text-[#0077b6] text-[9px] font-black hover:bg-[#0077b6] hover:text-white hover:border-[#0077b6] transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attachments */}
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Attachments</p>
                    <div className="flex gap-2 flex-wrap">
                      {[{ label: "PDF Circular", icon: "📄" }, { label: "Image", icon: "🖼️" }, { label: "Report Card", icon: "📋" }].map(({ label, icon }) => (
                        <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-dashed border-[#caf0f8] text-[10px] font-black text-gray-400 hover:border-[#0077b6]/40 hover:text-[#0077b6] cursor-pointer transition-all">
                          <span>{icon}</span><span>{label}</span><Plus size={10} />
                        </div>
                      ))}
                    </div>
                  </div>
                </MainCard>

                {/* Send timing */}
                <MainCard className="p-5 border border-[#caf0f8]/60">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Send Timing</h3>
                  <div className="flex gap-2 mb-5 flex-wrap">
                    {[
                      { id: "now",      label: "Send Now",      icon: Zap      },
                      { id: "schedule", label: "Schedule Later", icon: Clock    },
                      { id: "draft",    label: "Save as Draft",  icon: FileText },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSendTiming(id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${
                          sendTiming === id
                            ? "bg-[#03045e] text-white border-[#03045e]"
                            : "border-[#caf0f8] text-gray-500 hover:border-[#0077b6]"
                        }`}
                      >
                        <Icon size={13} />{label}
                      </button>
                    ))}
                  </div>

                  {sendTiming === "schedule" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4">
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors"
                      />
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={handleSendCampaign}
                      className="flex items-center gap-2 px-6 py-3 bg-[#0077b6] hover:bg-[#03045e] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#0077b6]/25 transition-all"
                    >
                      <Send size={14} />
                      {sendTiming === "now" ? "Send Campaign" : sendTiming === "schedule" ? "Schedule Campaign" : "Save Draft"}
                    </motion.button>
                    <p className="text-[9px] text-gray-400 font-bold">
                      {Object.values(audienceObj).some(arr => arr.length > 0)
                        ? "Audience selected."
                        : "Select an audience group to continue"}
                    </p>
                  </div>
                </MainCard>
            </div>
          )}

          {/* ══ HISTORY ═══════════════════════════════════════════════════ */}
          {activeSection === "history" && (
            <MainCard className="overflow-hidden border border-[#caf0f8]/60">
              <div className="p-5 border-b border-[#caf0f8]/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors w-56"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors bg-white"
                  >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {filteredCampaigns.length} campaigns
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#caf0f8]/20">
                    <tr>
                      {["Campaign", "Audience", "Channels", "Status", "Sent By", "Delivery Rate", "Created", "Actions"].map((col) => (
                        <th key={col} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#caf0f8]/30">
                    {filteredCampaigns.map((camp, idx) => {
                      const sc = STATUS_CONFIG[camp.status] || STATUS_CONFIG.draft;
                      return (
                        <motion.tr
                          key={camp.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="hover:bg-[#caf0f8]/10 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-black text-[#03045e] max-w-[200px] truncate">{camp.name}</p>
                            <p className="text-[9px] text-gray-400 font-semibold">{camp.id}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {camp.audience.map((a) => (
                                <span key={a} className="px-2 py-0.5 rounded-full bg-[#caf0f8]/40 text-[#0077b6] text-[9px] font-black">{a}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {camp.channels.map((ch) => { const Icon = CHANNEL_ICON_MAP[ch] || Mail; return <Icon key={ch} size={13} className="text-gray-400" title={ch} />; })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${sc.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-600 whitespace-nowrap">{camp.sentBy}</td>
                          <td className="px-4 py-3">
                            {camp.deliveryRate > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-[#caf0f8]/40 rounded-full h-1.5">
                                  <div className="bg-[#0077b6] h-1.5 rounded-full" style={{ width: `${camp.deliveryRate}%` }} />
                                </div>
                                <span className="text-[10px] font-black text-[#0077b6]">{camp.deliveryRate}%</span>
                              </div>
                            ) : <span className="text-[10px] font-bold text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-[10px] text-gray-500 font-semibold whitespace-nowrap">{camp.created}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => setPreviewCampaign(camp)} className="p-1.5 rounded-lg bg-[#caf0f8]/20 text-[#0077b6] hover:bg-[#0077b6] hover:text-white transition-colors" title="Preview"><Eye size={13} /></button>
                              <button type="button" onClick={() => handleDuplicate(camp)} className="p-1.5 rounded-lg bg-[#caf0f8]/20 text-[#0077b6] hover:bg-[#0077b6] hover:text-white transition-colors" title="Duplicate"><Copy size={13} /></button>
                              <button type="button" onClick={() => handleArchive(camp.id)} className="p-1.5 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors" title="Archive"><Archive size={13} /></button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredCampaigns.length === 0 && (
                  <div className="py-16 text-center">
                    <Radio size={40} className="mx-auto text-[#caf0f8] mb-3" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No campaigns match your filters</p>
                  </div>
                )}
              </div>
            </MainCard>
          )}

          {/* ══ TEMPLATES ═════════════════════════════════════════════════ */}
          {activeSection === "templates" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((tpl, idx) => (
                <motion.div
                  key={tpl.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <MainCard className="p-5 border border-[#caf0f8]/60 hover:border-[#0077b6]/40 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">{tpl.icon}</div>
                      <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                        <Star size={10} className="text-amber-400" />{tpl.uses} uses
                      </div>
                    </div>
                    <h4 className="text-sm font-black text-[#03045e] mb-1">{tpl.name}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mb-3">{tpl.type}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tpl.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-[#caf0f8]/40 text-[#0077b6] text-[8px] font-black uppercase tracking-wider">{tag}</span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadTemplate(tpl)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#caf0f8]/30 border border-[#caf0f8] text-[#0077b6] text-[10px] font-black hover:bg-[#0077b6] hover:text-white hover:border-[#0077b6] group-hover:bg-[#0077b6] group-hover:text-white group-hover:border-[#0077b6] transition-all"
                    >
                      <ChevronRight size={13} />Use Template
                    </button>
                  </MainCard>
                </motion.div>
              ))}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── Preview Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {previewCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(3,4,94,0.35)", backdropFilter: "blur(6px)" }}
            onClick={(e) => e.target === e.currentTarget && setPreviewCampaign(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Campaign Preview</p>
                  <h3 className="text-lg font-black text-[#03045e]">{previewCampaign.name}</h3>
                </div>
                <button type="button" onClick={() => setPreviewCampaign(null)} className="p-2 rounded-xl hover:bg-[#caf0f8]/20 text-gray-400 hover:text-[#03045e] transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Status",        value: <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${STATUS_CONFIG[previewCampaign.status]?.color}`}>{STATUS_CONFIG[previewCampaign.status]?.label}</span> },
                  { label: "Audience",      value: previewCampaign.audience.join(", ") },
                  { label: "Channels",      value: previewCampaign.channels.join(" • ") },
                  { label: "Sent By",       value: previewCampaign.sentBy },
                  { label: "Delivery Rate", value: `${previewCampaign.deliveryRate}%` },
                  { label: "Created",       value: previewCampaign.created },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</span>
                    {typeof value === "string"
                      ? <span className="text-xs font-black text-[#03045e]">{value}</span>
                      : value}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => { handleDuplicate(previewCampaign); setPreviewCampaign(null); }}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0077b6] text-white text-xs font-black hover:bg-[#03045e] transition-colors"
              >
                <Copy size={14} />Duplicate Campaign
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default CommunicationCenterPage;
