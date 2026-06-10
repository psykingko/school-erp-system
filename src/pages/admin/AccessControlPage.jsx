import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  Key,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  Filter,
  Check,
  AlertTriangle,
  UserCheck,
  Settings,
  FileText,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MainCard from "../../components/MainCard";
import localProvider from "../../data/providers/localProvider";

// Realistic School ERP Role Structure
const ROLES_SEED = [
  {
    id: "role-super-admin",
    name: "Super Administrator",
    code: "SADMIN",
    description: "Full system access with all permissions",
    level: 1,
    users: 2,
    permissions: 85,
    status: "active",
    isSystem: true,
    created: "2023-01-01",
  },
  {
    id: "role-principal",
    name: "Principal",
    code: "PRINC",
    description: "Top-level administrative access for school leadership",
    level: 2,
    users: 1,
    permissions: 72,
    status: "active",
    isSystem: true,
    created: "2023-01-01",
  },
  {
    id: "role-vice-principal",
    name: "Vice Principal",
    code: "VPRIN",
    description: "Administrative access with academic oversight",
    level: 3,
    users: 2,
    permissions: 65,
    status: "active",
    isSystem: true,
    created: "2023-01-01",
  },
  {
    id: "role-academic-coordinator",
    name: "Academic Coordinator",
    code: "ACOOR",
    description: "Academic planning, curriculum, and timetable management",
    level: 4,
    users: 5,
    permissions: 48,
    status: "active",
    isSystem: false,
    created: "2023-02-15",
  },
  {
    id: "role-exam-controller",
    name: "Examination Controller",
    code: "EXCON",
    description: "Examination scheduling, result processing, and grading",
    level: 4,
    users: 3,
    permissions: 42,
    status: "active",
    isSystem: false,
    created: "2023-02-20",
  },
  {
    id: "role-hr-manager",
    name: "HR Manager",
    code: "HRMGR",
    description: "Staff management, attendance, and payroll oversight",
    level: 4,
    users: 2,
    permissions: 38,
    status: "active",
    isSystem: false,
    created: "2023-03-01",
  },
  {
    id: "role-class-teacher",
    name: "Class Teacher",
    code: "CLTCH",
    description: "Class-specific student management and attendance",
    level: 5,
    users: 45,
    permissions: 28,
    status: "active",
    isSystem: false,
    created: "2023-03-10",
  },
  {
    id: "role-subject-teacher",
    name: "Subject Teacher",
    code: "SUBTCH",
    description: "Subject-specific teaching and assessment",
    level: 5,
    users: 85,
    permissions: 22,
    status: "active",
    isSystem: false,
    created: "2023-03-10",
  },
  {
    id: "role-librarian",
    name: "Librarian",
    code: "LIBRN",
    description: "Library management and resource tracking",
    level: 6,
    users: 3,
    permissions: 18,
    status: "active",
    isSystem: false,
    created: "2023-04-01",
  },
  {
    id: "role-transport-manager",
    name: "Transport Manager",
    code: "TRMGR",
    description: "Transport fleet and route management",
    level: 6,
    users: 2,
    permissions: 20,
    status: "active",
    isSystem: false,
    created: "2023-04-05",
  },
  {
    id: "role-accountant",
    name: "Accountant",
    code: "ACCNT",
    description: "Fee collection and financial reporting",
    level: 6,
    users: 4,
    permissions: 24,
    status: "active",
    isSystem: false,
    created: "2023-04-10",
  },
  {
    id: "role-receptionist",
    name: "Receptionist",
    code: "RCPTN",
    description: "Front desk operations and visitor management",
    level: 7,
    users: 3,
    permissions: 12,
    status: "active",
    isSystem: false,
    created: "2023-05-01",
  },
];

// Permission Categories
const PERMISSION_CATEGORIES = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: Settings,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "students",
    name: "Student Management",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    id: "teachers",
    name: "Teacher Management",
    icon: UserCheck,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    id: "academics",
    name: "Academic Management",
    icon: FileText,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    id: "examinations",
    name: "Examination Management",
    icon: Shield,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    id: "attendance",
    name: "Attendance Management",
    icon: Shield,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    id: "fees",
    name: "Fee Management",
    icon: Key,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "transport",
    name: "Transport Management",
    icon: Lock,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    id: "library",
    name: "Library Management",
    icon: FileText,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    icon: Eye,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    id: "admin",
    name: "Administration",
    icon: Shield,
    color: "text-gray-600",
    bg: "bg-gray-50",
  },
  {
    id: "settings",
    name: "System Settings",
    icon: Settings,
    color: "text-slate-600",
    bg: "bg-slate-50",
  },
];

// Access Logs Sample
const ACCESS_LOGS_SEED = [
  {
    id: 1,
    user: "Dr. R. Sharma",
    role: "Principal",
    action: "Login",
    module: "Dashboard",
    timestamp: "2026-05-25 09:15:23",
    ip: "192.168.1.105",
    status: "success",
  },
  {
    id: 2,
    user: "Mrs. P. Gupta",
    role: "Vice Principal",
    action: "View Report",
    module: "Academic Analytics",
    timestamp: "2026-05-25 09:12:45",
    ip: "192.168.1.108",
    status: "success",
  },
  {
    id: 3,
    user: "Mr. A. Verma",
    role: "Academic Coordinator",
    action: "Edit Timetable",
    module: "Timetable",
    timestamp: "2026-05-25 09:10:12",
    ip: "192.168.1.112",
    status: "success",
  },
  {
    id: 4,
    user: "Unknown User",
    role: "N/A",
    action: "Login Attempt",
    module: "Authentication",
    timestamp: "2026-05-25 09:08:33",
    ip: "192.168.1.200",
    status: "failed",
  },
  {
    id: 5,
    user: "Mr. S. Kumar",
    role: "Transport Manager",
    action: "Update Route",
    module: "Transport",
    timestamp: "2026-05-25 09:05:18",
    ip: "192.168.1.125",
    status: "success",
  },
  {
    id: 6,
    user: "Mrs. L. Mehta",
    role: "Librarian",
    action: "Add Book",
    module: "Library",
    timestamp: "2026-05-25 09:02:44",
    ip: "192.168.1.130",
    status: "success",
  },
  {
    id: 7,
    user: "Dr. R. Sharma",
    role: "Principal",
    action: "Approve Leave",
    module: "Leave Management",
    timestamp: "2026-05-25 08:55:30",
    ip: "192.168.1.105",
    status: "success",
  },
  {
    id: 8,
    user: "Mr. D. Joshi",
    role: "Accountant",
    action: "Generate Invoice",
    module: "Fee Management",
    timestamp: "2026-05-25 08:48:15",
    ip: "192.168.1.140",
    status: "success",
  },
];

const AccessControlPage = () => {
  const [activeTab, setActiveTab] = useState("roles"); // roles | permissions | users | logs
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);

  const [approvalSettings, setApprovalSettings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Fetch approval settings when tab is selected
  useMemo(() => {
    if (activeTab === "approval_settings") {
      setIsLoadingSettings(true);
      Promise.all([
        localProvider.getApprovalSettings(),
        localProvider.getEmployees()
      ]).then(([settings, emps]) => {
        setApprovalSettings(settings);
        setEmployees(emps);
        setIsLoadingSettings(false);
      });
    }
  }, [activeTab]);

  const handleUpdateApprover = async (moduleName, empId) => {
    await localProvider.updateApprovalSetting(moduleName, { approverEmployeeId: empId });
    const settings = await localProvider.getApprovalSettings();
    setApprovalSettings(settings);
    alert("Approval setting updated.");
  };

  const filteredRoles = useMemo(() => {
    return ROLES_SEED.filter((role) => {
      return (
        searchTerm === "" ||
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm]);

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      inactive: "bg-gray-50 text-gray-600 border-gray-200",
      suspended: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles[status] || styles.active}`}
      >
        {status}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const colors = {
      1: "bg-red-50 text-red-700 border-red-200",
      2: "bg-orange-50 text-orange-700 border-orange-200",
      3: "bg-amber-50 text-amber-700 border-amber-200",
      4: "bg-blue-50 text-blue-700 border-blue-200",
      5: "bg-green-50 text-green-700 border-green-200",
      6: "bg-cyan-50 text-cyan-700 border-cyan-200",
      7: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${colors[level] || colors[7]}`}
      >
        L{level}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Access Control Management"
        description="Manage user roles, permissions, and access security"
        breadcrumbs={["Admin Portal", "Security", "Access Control"]}
        actionButton={
          <button
            onClick={() => setShowCreateRoleModal(true)}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#03045e] text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-[#0077b6]/20 text-xs font-black transition-all"
          >
            <Plus size={16} />
            <span>Create Role</span>
          </button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Roles",
            value: ROLES_SEED.length,
            icon: Shield,
            color: "text-[#0077b6]",
          },
          {
            label: "Active Users",
            value: ROLES_SEED.reduce((acc, r) => acc + r.users, 0),
            icon: Users,
            color: "text-emerald-600",
          },
          {
            label: "Permission Categories",
            value: PERMISSION_CATEGORIES.length,
            icon: Key,
            color: "text-[#03045e]",
          },
          {
            label: "System Roles",
            value: ROLES_SEED.filter((r) => r.isSystem).length,
            icon: Lock,
            color: "text-purple-600",
          },
        ].map((stat, i) => (
          <MainCard key={i} className="p-4 border border-[#caf0f8]/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-lg font-black text-[#03045e] mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-[#caf0f8] ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </MainCard>
        ))}
      </div>

      {/* Tab Navigation */}
      <MainCard className="p-2 border border-[#caf0f8]/60">
        <div className="flex items-center gap-1">
          {[
            { id: "roles", label: "Roles", icon: Shield },
            { id: "permissions", label: "Permissions", icon: Key },
            { id: "users", label: "User Assignments", icon: Users },
            { id: "logs", label: "Access Logs", icon: FileText },
            { id: "approval_settings", label: "Approval Settings", icon: Check },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.id
                  ? "bg-[#03045e] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#03045e] hover:bg-gray-50"
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </MainCard>

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <>
          {/* Filters */}
          <MainCard className="p-4 border border-[#caf0f8]/60">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search roles by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors placeholder:font-normal placeholder:text-gray-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] hover:border-[#0077b6] transition-colors bg-white">
                  <Filter size={14} />
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </MainCard>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => (
              <MainCard
                key={role.id}
                className="border border-[#caf0f8]/60 hover:border-[#0077b6]/30 transition-all cursor-pointer group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl ${role.isSystem ? "bg-[#03045e]" : "bg-[#0077b6]"} text-white flex items-center justify-center text-lg font-black`}
                      >
                        {role.code.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-[#03045e]">
                            {role.name}
                          </h3>
                          {role.isSystem && (
                            <Lock size={12} className="text-amber-500" />
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {role.code}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(role.status)}
                  </div>

                  <p className="text-[10px] text-gray-500 mb-4 line-clamp-2">
                    {role.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-gray-50">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                        Level
                      </p>
                      {getLevelBadge(role.level)}
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                        Users
                      </p>
                      <p className="text-sm font-black text-[#03045e]">
                        {role.users}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                        Perms
                      </p>
                      <p className="text-sm font-black text-[#03045e]">
                        {role.permissions}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() =>
                        setExpandedRole(
                          expandedRole === role.id ? null : role.id,
                        )
                      }
                      className="text-[10px] font-black text-[#0077b6] hover:text-[#03045e] transition-colors"
                    >
                      {expandedRole === role.id
                        ? "Hide Details"
                        : "View Permissions"}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-[#caf0f8] text-gray-400 hover:text-[#0077b6] transition-colors">
                        <Edit size={14} />
                      </button>
                      {!role.isSystem && (
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedRole === role.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">
                        Permission Categories
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {PERMISSION_CATEGORIES.slice(0, 6).map((cat, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded-md ${cat.bg} ${cat.color} text-[9px] font-black`}
                          >
                            {cat.name}
                          </span>
                        ))}
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-[9px] font-black">
                          +{PERMISSION_CATEGORIES.length - 6} more
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">
                          Created: {role.created}
                        </span>
                        <span
                          className={`font-black ${role.isSystem ? "text-amber-600" : "text-gray-600"}`}
                        >
                          {role.isSystem ? "System Role" : "Custom Role"}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </MainCard>
            ))}
          </div>
        </>
      )}

      {/* Permissions Tab */}
      {activeTab === "permissions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERMISSION_CATEGORIES.map((category) => (
            <MainCard
              key={category.id}
              className="border border-[#caf0f8]/60 hover:border-[#0077b6]/30 transition-all cursor-pointer"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 rounded-xl ${category.bg} ${category.color}`}
                  >
                    <category.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#03045e]">
                      {category.name}
                    </h3>
                    <p className="text-[10px] text-gray-400">12 permissions</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {["View", "Create", "Edit", "Delete", "Export", "Approve"]
                    .slice(0, 4)
                    .map((perm, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
                      >
                        <span className="text-[10px] font-bold text-gray-600">
                          {perm}
                        </span>
                        <Check size={12} className="text-emerald-500" />
                      </div>
                    ))}
                </div>
                <button className="w-full mt-4 py-2 rounded-lg text-[10px] font-black text-[#0077b6] hover:bg-[#caf0f8] transition-colors">
                  Configure Permissions
                </button>
              </div>
            </MainCard>
          ))}
        </div>
      )}

      {/* User Assignments Tab */}
      {activeTab === "users" && (
        <MainCard className="border border-[#caf0f8]/60 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#03045e]">
                User Role Assignments
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077b6] text-white text-xs font-black hover:bg-[#03045e] transition-colors">
                <Plus size={14} />
                <span>Assign Role</span>
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "Dr. R. Sharma",
                  role: "Principal",
                  dept: "Administration",
                  lastActive: "2 min ago",
                  status: "active",
                },
                {
                  name: "Mrs. P. Gupta",
                  role: "Vice Principal",
                  dept: "Academics",
                  lastActive: "15 min ago",
                  status: "active",
                },
                {
                  name: "Prof. A. Verma",
                  role: "Academic Coordinator",
                  dept: "Academics",
                  lastActive: "1 hour ago",
                  status: "active",
                },
                {
                  name: "Mr. S. Kumar",
                  role: "Transport Manager",
                  dept: "Transport",
                  lastActive: "3 hours ago",
                  status: "active",
                },
                {
                  name: "Mrs. L. Mehta",
                  role: "Librarian",
                  dept: "Library",
                  lastActive: "5 hours ago",
                  status: "inactive",
                },
              ].map((user, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-[#caf0f8]/10 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#03045e] text-white flex items-center justify-center text-sm font-black">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-xs font-black text-[#03045e]">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-md bg-[#caf0f8] text-[#03045e] text-[10px] font-black">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-bold text-gray-600">
                    {user.dept}
                  </td>
                  <td className="py-4 px-4 text-[10px] text-gray-400">
                    {user.lastActive}
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-[#caf0f8] text-gray-400 hover:text-[#0077b6] transition-colors">
                        <Edit size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </MainCard>
      )}

      {/* Access Logs Tab */}
      {activeTab === "logs" && (
        <MainCard className="border border-[#caf0f8]/60 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#03045e]">
                Access Activity Logs
              </h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] hover:border-[#0077b6] transition-colors bg-white">
                  <Filter size={14} />
                  <span>Filter</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] hover:border-[#0077b6] transition-colors bg-white">
                  <FileText size={14} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Module
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {ACCESS_LOGS_SEED.map((log, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-[#caf0f8]/10 transition-colors"
                >
                  <td className="py-3 px-4 text-xs font-bold text-[#03045e]">
                    {log.user}
                  </td>
                  <td className="py-3 px-4 text-[10px] text-gray-400">
                    {log.role}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black ${log.status === "success" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[10px] text-gray-600">
                    {log.module}
                  </td>
                  <td className="py-3 px-4 text-[10px] text-gray-400 font-mono">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 text-[10px] text-gray-400 font-mono">
                    {log.ip}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${log.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                    >
                      {log.status === "success" ? (
                        <Check size={10} />
                      ) : (
                        <AlertTriangle size={10} />
                      )}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </MainCard>
      )}

      {/* Create Role Modal */}
      <AnimatePresence>
        {showCreateRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              backgroundColor: "rgba(3,4,94,0.35)",
              backdropFilter: "blur(4px)",
            }}
            onClick={(e) =>
              e.target === e.currentTarget && setShowCreateRoleModal(false)
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="bg-[#03045e] px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#caf0f8]/70 uppercase tracking-widest">
                    New Role
                  </p>
                  <h3 className="text-base font-black text-white mt-1">
                    Create Custom Role
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateRoleModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lab Incharge"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                      Role Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LABIN"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Role description and responsibilities..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                    Access Level
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors">
                    <option value="">Select Level</option>
                    <option value="4">Level 4 - Coordinator</option>
                    <option value="5">Level 5 - Teacher</option>
                    <option value="6">Level 6 - Staff</option>
                    <option value="7">Level 7 - Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
                    Permission Categories
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSION_CATEGORIES.map((cat, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 p-3 rounded-lg border border-[#caf0f8] hover:border-[#0077b6] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-[#0077b6] focus:ring-[#0077b6]"
                        />
                        <span className="text-[10px] font-bold text-gray-600">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex items-center gap-2">
                <button className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#03045e] text-white hover:bg-[#0077b6] transition-colors">
                  CREATE ROLE
                </button>
                <button
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccessControlPage;
