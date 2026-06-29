import React from "react";
import { Users, Calendar, Award, CheckCircle, AlertTriangle, ArrowRight, Sparkles, BellRing } from "lucide-react";
import { Link } from "react-router-dom";
import MainCard from "../MainCard";
import { useLanguage } from "../../context/LanguageContext";

export default function MyClassPanel({ classInfo }) {
  const { t } = useLanguage();
  if (!classInfo) return null;

  const {
    className,
    room,
    displayName,
    totalStudents,
    presentStudents,
    attendanceMarked,
    pendingLeavesCount,
    pendingMentorsCount
  } = classInfo;

  const attendancePercentage = totalStudents > 0 
    ? Math.round((presentStudents / totalStudents) * 100) 
    : 0;

  // Dynamically generate class events based on stream/section for realism
  const classEvents = className.includes("A") 
    ? [
        { title: "Weekly Physics Lab Assessment", date: "Friday, 22nd May", type: "academic" },
        { title: "Inter-House Debate Competition", date: "Monday, 25th May", type: "cultural" }
      ]
    : className.includes("B")
    ? [
        { title: "Biology Slide Preparation Seminar", date: "Thursday, 21st May", type: "academic" },
        { title: "Class Cleanliness Drive", date: "Saturday, 23rd May", type: "co-curricular" }
      ]
    : [
        { title: "Maths Unit Test Revision Session", date: "Wednesday, 20th May", type: "academic" },
        { title: "Parent-Teacher Meeting Pre-Sync", date: "Saturday, 23rd May", type: "parent" }
      ];

  return (
    <MainCard className="p-6 border border-[#caf0f8]/50 bg-gradient-to-br from-white via-white to-[#caf0f8]/10 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-md">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
            {t("teacherDashboard.classTeacherCharge", { fallback: "Class Teacher Charge" })}
          </span>
          <h3 className="text-xl font-black text-[#03045e] mt-2 flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-blue-600" />
            {displayName}
          </h3>
        </div>
        <div className="sm:text-right bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t("teacherDashboard.classRoom", { fallback: "Class Room" })}</p>
          <p className="text-sm font-black text-[#00b4d8] uppercase tracking-wide mt-0.5">{room}</p>
        </div>
      </div>

      {/* Roster & Operations Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        
        {/* Attendance Widget */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-100">
          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            {/* SVG Circle Dial */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-slate-200"
                strokeWidth="4.5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className={attendanceMarked ? "stroke-emerald-500" : "stroke-amber-400"}
                strokeWidth="4.5"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - (attendanceMarked ? presentStudents : 0) / totalStudents)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-[#03045e]">{attendanceMarked ? `${attendancePercentage}%` : "0%"}</span>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("teacherDashboard.attendance", { fallback: "Attendance" })}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${attendanceMarked ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
              <span className="text-xs font-black text-[#03045e]">
                {attendanceMarked ? `${presentStudents}/${totalStudents} ${t("teacherDashboard.present", { fallback: "Present" })}` : t("teacherDashboard.pendingSubmission", { fallback: "Pending Submission" })}
              </span>
            </div>
            <Link 
              to="/teacher/attendance" 
              className="text-[9px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-0.5 mt-2"
            >
              {t("teacherDashboard.takeAttendance", { fallback: "Take Attendance" })} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Leave Requests Widget */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-100">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            pendingLeavesCount > 0 
              ? "bg-rose-50 text-rose-500 border border-rose-100 animate-pulse" 
              : "bg-slate-100 text-slate-400"
          }`}>
            <Calendar className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("teacherDashboard.leaveRequests", { fallback: "Leave Requests" })}</h4>
            <p className="text-xs font-black text-slate-700 mt-1">
              {pendingLeavesCount > 0 ? `${pendingLeavesCount} ${t("teacherDashboard.awaitingReview", { fallback: "Awaiting Review" })}` : t("teacherDashboard.allLeavesApproved", { fallback: "All Leaves Approved" })}
            </p>
            {pendingLeavesCount > 0 && (
              <Link 
                to="/teacher/leave" 
                className="text-[9px] font-black text-rose-600 hover:text-rose-800 transition-colors uppercase tracking-widest flex items-center gap-0.5 mt-2"
              >
                {t("teacherDashboard.approveLeaves", { fallback: "Approve Leaves" })} <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Mentorship Widget */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-100">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            pendingMentorsCount > 0 
              ? "bg-amber-50 text-amber-500 border border-amber-100" 
              : "bg-slate-100 text-slate-400"
          }`}>
            <Award className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("teacherDashboard.mentorTasks", { fallback: "Mentor Tasks" })}</h4>
            <p className="text-xs font-black text-slate-700 mt-1">
              {pendingMentorsCount > 0 ? `${pendingMentorsCount} ${t("teacherDashboard.pendingReviews", { fallback: "Pending Reviews" })}` : t("teacherDashboard.allStudentsMentored", { fallback: "All Students Mentored" })}
            </p>
            {pendingMentorsCount > 0 && (
              <Link 
                to="/teacher/mentorship" 
                className="text-[9px] font-black text-amber-600 hover:text-amber-800 transition-colors uppercase tracking-widest flex items-center gap-0.5 mt-2"
              >
                {t("teacherDashboard.openMentorPanel", { fallback: "Open Mentor Panel" })} <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Upcoming Class Events */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BellRing className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wide">{t("teacherDashboard.upcomingEvents", { fallback: "Upcoming Class Events" })}</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 gap-3">
          {classEvents.map((evt, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-3 rounded-xl flex items-start gap-2.5 hover:shadow-xs transition-shadow">
              <div className="w-1.5 h-10 rounded-full bg-blue-500 flex-shrink-0" />
              <div>
                <h5 className="text-xs font-black text-slate-700 line-clamp-1">{evt.title}</h5>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{evt.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </MainCard>
  );
}
