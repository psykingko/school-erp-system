import React from "react";
import { UserCheck, Users, Calendar, BookOpen, Layers, CheckCircle2, Clock, Landmark } from "lucide-react";
import MainCard from "../MainCard";
import { useLanguage } from "../../context/LanguageContext";

export default function TeacherIdentityCard({ identity }) {
  const { t } = useLanguage();
  if (!identity) return null;

  const {
    name,
    designation,
    department,
    isClassTeacher,
    className,
    totalStudents,
    attendanceMarked,
    presentStudents,
    pendingLeavesCount,
    subjectsTaught = [],
    classesAssigned = [],
    lecturesTodayCount
  } = identity;

  return (
    <MainCard className="p-6 border border-indigo-100 bg-gradient-to-br from-indigo-900 via-slate-950 to-indigo-950 text-white relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Bio info */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 flex-shrink-0 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black tracking-tight">{name}</h2>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${
                isClassTeacher 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}>
                {isClassTeacher ? t("teacherDashboard.classTeacher", { fallback: "Class Teacher" }) : t("teacherDashboard.subjectTeacher", { fallback: "Subject Teacher" })}
              </span>
            </div>
            <p className="text-xs text-indigo-300 font-bold mt-0.5">{designation} • <span className="text-indigo-200">{department}</span></p>
            
            <h3 className="text-sm font-black text-white mt-3 flex items-center gap-2">
              {isClassTeacher ? (
                <>
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  <span>{t("teacherDashboard.classTeacherOf", { fallback: "You are the Class Teacher of" })} <span className="text-emerald-400 font-extrabold underline decoration-wavy underline-offset-4">{className}</span></span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>{t("teacherDashboard.youAreA", { fallback: "You are a" })} <span className="text-blue-400 font-extrabold">{t("teacherDashboard.subjectTeacher", { fallback: "Subject Teacher" })}</span></span>
                </>
              )}
            </h3>
          </div>
        </div>

        {/* Right: Quick metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 bg-slate-900/50 p-4 rounded-2xl border border-indigo-500/10 backdrop-blur-sm">
          
          {isClassTeacher ? (
            <>
              {/* Class Teacher Metrics */}
              <div className="text-center sm:text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300">{t("teacherDashboard.classRoll", { fallback: "Class Roll" })}</span>
                <p className="text-base font-black text-white mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                  <Users className="w-4 h-4 text-indigo-400" />
                  {totalStudents} {t("teacherDashboard.students", { fallback: "Students" })}
                </p>
              </div>

              <div className="text-center sm:text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300">{t("teacherDashboard.attendance", { fallback: "Attendance" })}</span>
                <p className="text-base font-black mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                  <CheckCircle2 className={`w-4 h-4 ${attendanceMarked ? "text-emerald-400" : "text-amber-400 animate-pulse"}`} />
                  <span className={attendanceMarked ? "text-emerald-400" : "text-amber-400"}>
                    {attendanceMarked ? t("teacherDashboard.marked", { fallback: "Marked" }) : t("teacherDashboard.pending", { fallback: "Pending" })}
                  </span>
                </p>
              </div>

              <div className="text-center sm:text-left col-span-2 sm:col-span-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300">{t("teacherDashboard.leavesToday", { fallback: "Leaves Today" })}</span>
                <p className="text-base font-black text-white mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {pendingLeavesCount} {t("teacherDashboard.pending", { fallback: "Pending" })}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Subject Teacher Metrics */}
              <div className="text-center sm:text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300">{t("nav.admin_subjects", { fallback: "Subjects" })}</span>
                <div className="text-[10px] font-black text-white mt-1.5 flex items-center justify-center sm:justify-start gap-1 flex-wrap">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{subjectsTaught.length} {t("teacherDashboard.assigned", { fallback: "Assigned" })}</span>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300">{t("nav.admin_classes", { fallback: "Classes" })}</span>
                <div className="text-[10px] font-black text-white mt-1.5 flex items-center justify-center sm:justify-start gap-1 flex-wrap">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{classesAssigned.length} {t("teacherDashboard.assigned", { fallback: "Assigned" })}</span>
                </div>
              </div>

              <div className="text-center sm:text-left col-span-2 sm:col-span-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300">{t("teacherDashboard.lecturesToday", { fallback: "Lectures Today" })}</span>
                <div className="text-[10px] font-black text-indigo-300 mt-1.5 flex items-center justify-center sm:justify-start gap-1 flex-wrap">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lecturesTodayCount} {t("teacherDashboard.periods", { fallback: "Periods" })}</span>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </MainCard>
  );
}
