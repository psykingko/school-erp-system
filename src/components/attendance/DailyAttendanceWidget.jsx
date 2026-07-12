import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { getAttendanceByDate } from '../../services/attendanceService';
import MainCard from '../MainCard';

const DailyAttendanceWidget = () => {
  const { activeStudentId } = useStudent();
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [status, setStatus] = useState("UNMARKED"); // PRESENT, ABSENT, UNMARKED
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeStudentId) return;
    
    let isMounted = true;
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const dateStr = currentDate.toISOString().split('T')[0];
        const record = await getAttendanceByDate(activeStudentId, dateStr);
        if (isMounted) {
          setStatus(record ? record.status : "UNMARKED");
        }
      } catch (err) {
        console.error("Failed to fetch daily attendance:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchStatus();
    return () => { isMounted = false; };
  }, [activeStudentId, currentDate]);

  const handlePrevDay = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNextDay = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const isFuture = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const curr = new Date(currentDate);
    curr.setHours(0, 0, 0, 0);
    return curr > today;
  };

  const displayStatus = isFuture() ? "UNMARKED" : status;

  return (
    <MainCard className="p-6 overflow-hidden relative group h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-[#03045e]">{t("attendance.dailyAttendance")}</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{t("attendance.statusTimeline")}</p>
        </div>
        <div className="flex items-center gap-2 bg-[#caf0f8]/30 px-2 py-1 rounded-xl">
          <button onClick={handlePrevDay} className="p-1.5 hover:bg-[#caf0f8] rounded-lg transition-colors text-[#0077b6]">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold text-[#03045e] min-w-[100px] text-center">
            {currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button onClick={handleNextDay} className="p-1.5 hover:bg-[#caf0f8] rounded-lg transition-colors text-[#0077b6]">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100/50">
        {loading ? (
          <div className="w-8 h-8 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="flex items-center gap-4">
            {displayStatus === "PRESENT" && (
              <>
                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-emerald-600">{t("attendance.present")}</h3>
                  <p className="text-sm font-semibold text-emerald-600/70">{t("attendance.markedByTeacher")}</p>
                </div>
              </>
            )}
            {displayStatus === "ABSENT" && (
              <>
                <div className="w-16 h-16 rounded-[1.5rem] bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                  <XCircle size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-rose-600">{t("attendance.absent")}</h3>
                  <p className="text-sm font-semibold text-rose-600/70">{t("attendance.markedByTeacher")}</p>
                </div>
              </>
            )}
            {displayStatus === "UNMARKED" && (
              <>
                <div className="w-16 h-16 rounded-[1.5rem] bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                  <Clock size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-amber-600">{t("attendance.notMarkedYet")}</h3>
                  <p className="text-sm font-semibold text-amber-600/70">{t("attendance.pendingSubmission")}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </MainCard>
  );
};

export default DailyAttendanceWidget;
