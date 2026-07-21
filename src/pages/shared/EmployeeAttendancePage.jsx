import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, Clock, TrendingDown, CheckCircle, AlertTriangle, Users, History, CheckSquare, ChevronLeft, ChevronRight
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import KPIWidget from "../../components/admin/analytics/KPIWidget";
import { useAuth } from "../../context/AuthContext";
import staffAttendanceService from "../../services/staffAttendanceService";

const EmployeeAttendancePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const employeeId = user?.employeeId || user?.linkedEntityId;

  const fetchDashboardData = useCallback(async (month, year) => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const dbData = await staffAttendanceService.getEmployeeAttendanceDashboard(employeeId, month, year);
      setData(dbData);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      fetchDashboardData(currentDate.getMonth(), currentDate.getFullYear());
    }
  }, [employeeId, currentDate, fetchDashboardData]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(year, month, i).toISOString().split('T')[0];
      days.push({
        date: i,
        dateString: dateStr,
        status: data?.calendarData?.[dateStr] || "UNMARKED"
      });
    }
    return days;
  }, [currentDate, data]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077b6]"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "PRESENT": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "ABSENT": return "bg-rose-100 text-rose-700 border-rose-200";
      case "LATE": return "bg-amber-100 text-amber-700 border-amber-200";
      case "HALF_DAY": return "bg-blue-100 text-blue-700 border-blue-200";
      case "ON_LEAVE": return "bg-purple-100 text-purple-700 border-purple-200";
      case "HOLIDAY": return "bg-gray-100 text-gray-500 border-gray-200";
      default: return "bg-white text-gray-400 border-gray-100";
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="My Attendance"
        description="View your personal attendance records, monthly statistics, and leave history."
        breadcrumbs={["Portal", "My Attendance"]}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPIWidget title="Present" value={data?.summary.present || 0} icon={CheckCircle} color="#10b981" bg="#d1fae5" />
        <KPIWidget title="Late" value={data?.summary.late || 0} icon={AlertTriangle} color="#f59e0b" bg="#fef3c7" />
        <KPIWidget title="Absent" value={data?.summary.absent || 0} icon={TrendingDown} color="#ef4444" bg="#fee2e2" />
        <KPIWidget title="Half Day" value={data?.summary.halfDay || 0} icon={Clock} color="#3b82f6" bg="#dbeafe" />
        <KPIWidget title="On Leave" value={data?.summary.leave || 0} icon={Users} color="#8b5cf6" bg="#ede9fe" />
        <KPIWidget title="Attendance %" value={`${data?.summary.percentage || 100}%`} icon={CheckSquare} color="#0077b6" bg="#caf0f8" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AdminSectionCard>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-[#03045e]" size={20} />
                <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">Attendance Calendar</h3>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={20} className="text-[#03045e]" />
                </button>
                <span className="text-sm font-bold text-[#03045e] w-32 text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={20} className="text-[#03045e]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                    day ? getStatusColor(day.status) : "border-transparent"
                  }`}
                >
                  {day && (
                    <>
                      <span className="text-sm font-bold">{day.date}</span>
                      {day.status !== "UNMARKED" && (
                        <span className="text-[8px] font-black uppercase mt-1 tracking-widest hidden md:block">
                          {day.status === "HALF_DAY" ? "HALF" : day.status}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          <AdminSectionCard>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <History className="text-[#03045e]" size={20} />
              <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">Recent History</h3>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {data?.history?.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No attendance records for this month.</p>
              ) : (
                data?.history?.map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-colors">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#03045e]">
                        {new Date(record.attendanceDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {record.attendanceSource} • {new Date(record.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getStatusColor(record.attendanceStatus).split(' ')[0]} ${getStatusColor(record.attendanceStatus).split(' ')[1]}`}>
                      {record.attendanceStatus.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeAttendancePage;
