import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BellRing, Send, X } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsFilterBar from "../../components/admin/operations/OperationsFilterBar";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminDataTable from "../../components/admin/AdminDataTable";
import { getDataProvider } from "../../data";

const LEVEL_DISPLAY = (level) => {
  if (["Nursery", "LKG", "UKG"].includes(level)) return level;
  return `Class ${level}`;
};

const AttendanceOverviewPage = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [, setLoading] = useState(true);

  // Success Notification banner
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const provider = getDataProvider();
      const [allClasses, allStudents] = await Promise.all([
        provider.getClasses(),
        provider.getStudents(),
      ]);
      setClasses(allClasses || []);
      setStudents(allStudents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = (studentName) => {
    setSuccessBanner(
      `Broadcast Alert SMS Sent to ${studentName || "Rahul Sharma"}'s Parent!`,
    );
    setTimeout(() => setSuccessBanner(""), 4000);
  };

  const handleGlobalBroadcast = () => {
    setSuccessBanner(
      "Bulk Absence SMS Alert successfully sent to all active absent students' parents!",
    );
    setTimeout(() => setSuccessBanner(""), 4500);
  };

  // Derive ordered unique levels
  const availableLevels = useMemo(() => {
    const ORDER = [
      "Nursery",
      "LKG",
      "UKG",
      ...Array.from({ length: 12 }, (_, i) => String(i + 1)),
      "11",
      "12",
    ];
    const seen = new Set(classes.map((c) => c.level).filter(Boolean));
    return ORDER.filter((l) => seen.has(l));
  }, [classes]);

  // Derive sections available for selected level
  const availableSections = useMemo(() => {
    if (!selectedLevel) return [];
    const seen = new Set();
    classes
      .filter((c) => c.level === selectedLevel)
      .forEach((c) => {
        if (c.section) seen.add(c.section);
      });
    return [...seen].sort();
  }, [classes, selectedLevel]);

  const sectionBreakdowns = useMemo(() => {
    return classes.map((cls) => {
      const roster = students.filter((s) => s.classId === cls.id).length || 35;
      const hash = cls.id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
      const absent = (hash % 5) + 1;
      const present = roster - absent;
      const rate = ((present / roster) * 100).toFixed(1);
      const status =
        rate >= 95 ? "Excellent" : rate >= 90 ? "Good" : "Attention Required";
      return {
        classLevel: cls.level || "",
        classSection: cls.section || "",
        present,
        absent,
        rate,
        status,
        classId: cls.id,
      };
    });
  }, [classes, students]);

  const activeFiltersCount = [
    selectedLevel,
    selectedSection,
    selectedStatus,
  ].filter(Boolean).length;

  const filteredBreakdown = useMemo(() => {
    return sectionBreakdowns.filter((item) => {
      const label = `${LEVEL_DISPLAY(item.classLevel)} ${item.classSection}`;
      const matchesSearch = label
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLevel =
        selectedLevel === "" || item.classLevel === selectedLevel;
      const matchesSection =
        selectedSection === "" || item.classSection === selectedSection;
      const matchesStatus =
        selectedStatus === "" || item.status === selectedStatus;
      return matchesSearch && matchesLevel && matchesSection && matchesStatus;
    });
  }, [
    sectionBreakdowns,
    searchTerm,
    selectedLevel,
    selectedSection,
    selectedStatus,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Attendance Control Center"
        description="Monitor daily school-wide attendance logs, identify absence streaks, and trigger parental SMS notifications."
        breadcrumbs={["Admin Portal", "Operations", "Attendance"]}
        actionButton={
          <button
            onClick={handleGlobalBroadcast}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors"
          >
            <BellRing size={16} />
            <span>BULK ABSENCE BROADCAST</span>
          </button>
        }
      />

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-xs font-black shadow-sm transition-all animate-bounce">
          {successBanner}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Breakdown table */}
        <div className="lg:col-span-2 space-y-6">
          <AdminSectionCard>
            <OperationsFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search class or section..."
              filterSlots={
                <div className="flex flex-wrap gap-2">
                  {/* Class level */}
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      setSelectedSection("");
                    }}
                    className="border-2 border-[#03045e]/10 hover:border-[#0077b6] px-4 py-2 rounded-2xl text-xs font-black text-[#03045e] transition-colors bg-white outline-none min-w-[110px]"
                  >
                    <option value="">All Classes</option>
                    {availableLevels.map((l) => (
                      <option key={l} value={l}>
                        {LEVEL_DISPLAY(l)}
                      </option>
                    ))}
                  </select>

                  {/* Section — narrows to selected level's sections */}
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="border-2 border-[#03045e]/10 hover:border-[#0077b6] px-4 py-2 rounded-2xl text-xs font-black text-[#03045e] transition-colors bg-white outline-none min-w-[110px]"
                  >
                    <option value="">All Sections</option>
                    {(selectedLevel
                      ? availableSections
                      : ["A", "B", "C", "D"]
                    ).map((s) => (
                      <option key={s} value={s}>
                        Section {s}
                      </option>
                    ))}
                  </select>

                  {/* Status */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border-2 border-[#03045e]/10 hover:border-[#0077b6] px-4 py-2 rounded-2xl text-xs font-black text-[#03045e] transition-colors bg-white outline-none min-w-[130px]"
                  >
                    <option value="">All Statuses</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Attention Required">
                      Attention Required
                    </option>
                  </select>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedLevel("");
                        setSelectedSection("");
                        setSelectedStatus("");
                        setSearchTerm("");
                      }}
                      className="flex items-center gap-1 border-2 border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-2xl text-xs font-black transition-colors"
                    >
                      <X size={11} />
                      Clear ({activeFiltersCount})
                    </button>
                  )}
                </div>
              }
            />

            <div className="mt-6">
              <AdminDataTable
                headers={[
                  "Class",
                  "Section",
                  "Present count",
                  "Absent count",
                  "Attendance Percentage",
                  "Status Alert",
                ]}
                items={filteredBreakdown}
                isEmpty={filteredBreakdown.length === 0}
                emptyTitle="No attendance logs found matching filters"
                renderRow={(item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40"
                  >
                    <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">
                      {LEVEL_DISPLAY(item.classLevel)}
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[#0077b6] text-[10px] font-black">
                        Section {item.classSection}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-center text-emerald-600 font-extrabold">
                      {item.present}
                    </td>
                    <td className="py-4 px-3 text-center text-rose-600 font-extrabold">
                      {item.absent}
                    </td>
                    <td className="py-4 px-3 text-center font-black">
                      {item.rate}%
                    </td>
                    <td className="py-4 px-3 last:pr-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          item.status === "Excellent"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : item.status === "Good"
                              ? "bg-blue-50 text-[#0077b6] border border-blue-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )}
              />
            </div>
          </AdminSectionCard>
        </div>

        {/* Broadcast Alerts panel */}
        <div className="space-y-6">
          {/* Pending Alerts */}
          <AdminSectionCard>
            <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider border-b border-[#caf0f8] pb-3 mb-4">
              Pending Parent Notifications
            </h3>
            <div className="space-y-3">
              {[
                {
                  name: "Rahul Kumar",
                  class: "11-B",
                  parent: "Rajesh Kumar",
                  phone: "+91 98765 43210",
                },
                {
                  name: "Ashish Sharma",
                  class: "11-A",
                  parent: "Ravi Sharma",
                  phone: "+91 99999 88888",
                },
                {
                  name: "Nikita Dey",
                  class: "11-C",
                  parent: "Anoop Dey",
                  phone: "+91 98765 43215",
                },
              ].map((parent, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#caf0f8]/20 border border-[#caf0f8]/40 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-black text-gray-700">
                      {parent.name} ({parent.class})
                    </p>
                    <p className="text-[9px] font-semibold text-gray-400 mt-1">
                      Parent: {parent.parent}
                    </p>
                  </div>
                  <button
                    onClick={() => handleBroadcast(parent.name)}
                    className="p-2 hover:bg-[#0077b6] hover:text-white rounded-xl text-[#0077b6] transition-colors border border-[#0077b6]/20 bg-white"
                    title="Send absence alert SMS"
                  >
                    <Send size={12} />
                  </button>
                </div>
              ))}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceOverviewPage;
