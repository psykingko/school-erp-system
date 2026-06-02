import React, { useState, useEffect } from "react";
import { getDemoAccounts } from "../../services/authService";
import CredentialCard from "./CredentialCard";
import { ROLES } from "../../auth/roles";
import { Users, GraduationCap, User, ShieldCheck } from "lucide-react";
import { extractLevel, extractSection, formatClassLevel } from "../../utils/classIdentity";

const ROLE_CONFIG = {
  [ROLES.STUDENT]: {
    label: "Students",
    icon: GraduationCap,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  [ROLES.TEACHER]: {
    label: "Teachers",
    icon: User,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  [ROLES.PARENT]: {
    label: "Parents",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  [ROLES.ADMIN]: {
    label: "Admin",
    icon: ShieldCheck,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
};

const CLASS_LEVELS = [
  "nursery",
  "lkg",
  "ukg",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];
const SECTIONS = ["A", "B", "C", "D"];

const selectCls =
  "text-[10px] font-semibold text-gray-600 border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none cursor-pointer";

const DemoAccountsPanel = ({ selectedRole, onSelectAccount }) => {
  const [accounts, setAccounts] = useState(null);
  const [studentFilter, setStudentFilter] = useState({
    level: "",
    section: "",
  });
  const [parentFilter, setParentFilter] = useState({ level: "", section: "" });
  const [teacherType, setTeacherType] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState({
    level: "",
    section: "",
  });

  useEffect(() => {
    getDemoAccounts().then(setAccounts);
  }, []);

  if (!accounts) return null;

  const rolesToRender = !selectedRole
    ? [ROLES.STUDENT, ROLES.TEACHER, ROLES.PARENT, ROLES.ADMIN]
    : [selectedRole];

  const totalAccounts = rolesToRender.reduce(
    (sum, role) => sum + (accounts[role] || []).length,
    0,
  );
  if (totalAccounts === 0) return null;

  const applyFilter = (role) => {
    const list = accounts[role] || [];
    if (role === ROLES.STUDENT) {
      return list.filter(
        (a) =>
          (!studentFilter.level || a.classLevel === studentFilter.level) &&
          (!studentFilter.section || a.section === studentFilter.section),
      );
    }
    if (role === ROLES.PARENT) {
      return list.filter(
        (a) =>
          (!parentFilter.level || a.childClassLevel === parentFilter.level) &&
          (!parentFilter.section || a.childSection === parentFilter.section),
      );
    }
    if (role === ROLES.TEACHER) {
      return list.filter((a) => {
        const typeOk =
          teacherType === "all" ||
          (teacherType === "class" && a.isClassTeacher) ||
          (teacherType === "subject" && !a.isClassTeacher);
        const classOk = (() => {
          if (!teacherFilter.level) return true;
          // For Class Teacher filter: match the class they ARE CT of, not just where they teach
          if (teacherType === "class" && a.isClassTeacher) {
            const ctId = a.classTeacherOfClassId || "";
            if (teacherFilter.section) {
              const target = `class-${teacherFilter.level}${teacherFilter.section.toLowerCase()}`;
              return ctId === target;
            }
            return extractLevel(ctId).toLowerCase() === teacherFilter.level;
          }
          // For Subject Teachers / All: match any class they teach
          const ids = a.assignedClassIds || [];
          if (teacherFilter.section) {
            const target = `class-${teacherFilter.level}${teacherFilter.section.toLowerCase()}`;
            return ids.includes(target);
          }
          return ids.some((id) => {
            return extractLevel(id).toLowerCase() === teacherFilter.level;
          });
        })();
        return typeOk && classOk;
      });
    }
    return list;
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
        Quick Access Demo Accounts
      </h3>

      <div className="space-y-5 max-h-[380px] overflow-y-auto pr-1">
        {rolesToRender.map((role) => {
          const all = accounts[role] || [];
          if (all.length === 0) return null;

          const filtered = applyFilter(role);
          const config = ROLE_CONFIG[role];
          const Icon = config.icon;

          return (
            <div key={role} className="space-y-2">
              {/* Role header */}
              <div className="flex items-center gap-2 px-1">
                <div className={`p-1 rounded-lg ${config.bg} ${config.color}`}>
                  <Icon size={12} />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}
                >
                  {config.label}
                </span>
                <span className="ml-auto text-[9px] font-bold text-gray-300">
                  {filtered.length}/{all.length}
                </span>
              </div>

              {/* Student filter: class + section */}
              {role === ROLES.STUDENT && (
                <div className="flex gap-1.5 px-1">
                  <select
                    value={studentFilter.level}
                    onChange={(e) =>
                      setStudentFilter({ level: e.target.value, section: "" })
                    }
                    className={`flex-1 ${selectCls}`}
                  >
                    <option value="">All Classes</option>
                    {CLASS_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {["nursery", "lkg", "ukg"].includes(l) ? l.toUpperCase() : `Class ${formatClassLevel(l)}`}
                      </option>
                    ))}
                  </select>
                  <select
                    value={studentFilter.section}
                    onChange={(e) =>
                      setStudentFilter((f) => ({
                        ...f,
                        section: e.target.value,
                      }))
                    }
                    disabled={!studentFilter.level}
                    className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <option value="">All</option>
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        Sec {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Parent filter: child's class + section */}
              {role === ROLES.PARENT && (
                <div className="flex gap-1.5 px-1">
                  <select
                    value={parentFilter.level}
                    onChange={(e) =>
                      setParentFilter({ level: e.target.value, section: "" })
                    }
                    className={`flex-1 ${selectCls}`}
                  >
                    <option value="">All Classes</option>
                    {CLASS_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {["nursery", "lkg", "ukg"].includes(l) ? l.toUpperCase() : `Class ${formatClassLevel(l)}`}
                      </option>
                    ))}
                  </select>
                  <select
                    value={parentFilter.section}
                    onChange={(e) =>
                      setParentFilter((f) => ({
                        ...f,
                        section: e.target.value,
                      }))
                    }
                    disabled={!parentFilter.level}
                    className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <option value="">All</option>
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        Sec {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Teacher filter: type toggle + class + section */}
              {role === ROLES.TEACHER && (
                <div className="space-y-1.5 px-1">
                  <div className="flex gap-1">
                    {[
                      { val: "all", label: "All" },
                      { val: "class", label: "Class Teachers" },
                      { val: "subject", label: "Subject Teachers" },
                    ].map(({ val, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTeacherType(val)}
                        className={`text-[9px] font-black px-2.5 py-1 rounded-md transition-colors ${
                          teacherType === val
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <select
                      value={teacherFilter.level}
                      onChange={(e) =>
                        setTeacherFilter({ level: e.target.value, section: "" })
                      }
                      className={`flex-1 ${selectCls}`}
                    >
                      <option value="">All Classes</option>
                      {CLASS_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {["nursery", "lkg", "ukg"].includes(l) ? l.toUpperCase() : `Class ${formatClassLevel(l)}`}
                        </option>
                      ))}
                    </select>
                    <select
                      value={teacherFilter.section}
                      onChange={(e) =>
                        setTeacherFilter((f) => ({
                          ...f,
                          section: e.target.value,
                        }))
                      }
                      disabled={!teacherFilter.level}
                      className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <option value="">All</option>
                      {SECTIONS.map((s) => (
                        <option key={s} value={s}>
                          Sec {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Account cards */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 gap-1.5">
                  {filtered.map((account) => (
                    <CredentialCard
                      key={account.id}
                      account={account}
                      onSelect={onSelectAccount}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 italic px-2 py-1.5">
                  No accounts match this filter.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DemoAccountsPanel;
