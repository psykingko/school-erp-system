import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useLanguage } from "../../../../context/LanguageContext";
import { getTeacherProfile } from "../../../../services/teacherService";
import { getExams, getExamPapers } from "../../../../services/examService";
import { getDataProvider } from "../../../../data";
import MainCard from "../../../../components/MainCard";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertCircle, 
  BookOpen,
  Calendar
} from "lucide-react";
import ProgressCard from "../../../../components/common/ProgressCard";
import EmptyState from "../../../../components/common/EmptyState";
import Timeline from "../../../../components/common/Timeline";

const OverviewTab = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ pending: 0, completed: 0, total: 0 });
  const [activeExams, setActiveExams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provider = getDataProvider();
        const [profData, examData, allPapers, allStudents, allResults, allClasses] = await Promise.all([
          getTeacherProfile(user.linkedEntityId),
          getExams(),
          getExamPapers(),
          provider.getStudents(),
          provider.getResults(),
          provider.getClasses()
        ]);
        
        setProfile(profData);
        
        const activeSessions = examData.filter(e => e.status === 'evaluation' || e.status === 'ongoing');
        const activeSessionIds = new Set(activeSessions.map(s => s.id || s.examId));

        const assignedSubjects = profData?.assignedSubjects || [];
        let expected = 0;
        let actual = 0;

        assignedSubjects.forEach(assignment => {
           const classStudentsCount = allStudents.filter(s => s.classId === assignment.classId).length;
           const papers = allPapers.filter(p => p.classId === assignment.classId && p.subjectId === assignment.subjectId && activeSessionIds.has(p.examSessionId));
           
           papers.forEach(p => {
              expected += classStudentsCount;
              const resultsCount = allResults.filter(r => r.classId === p.classId && r.subjectId === p.subjectId && r.examId === p.examSessionId && r.isSubmitted).length;
              actual += resultsCount;
           });
        });

        let classProgress = null;
        if (profData?.id) {
           const myClass = allClasses.find(c => c.classTeacherId === profData.id);
           if (myClass) {
              const myClassStudents = allStudents.filter(s => s.classId === myClass.id).length;
              let classExpected = 0;
              let classActual = 0;
              const myClassPapers = allPapers.filter(p => p.classId === myClass.id && activeSessionIds.has(p.examSessionId));
              myClassPapers.forEach(p => {
                 classExpected += myClassStudents;
                 const resultsCount = allResults.filter(r => r.classId === p.classId && r.subjectId === p.subjectId && r.examId === p.examSessionId && r.isSubmitted).length;
                 classActual += resultsCount;
              });
              classProgress = {
                 className: myClass.name,
                 expected: classExpected,
                 actual: classActual,
                 percent: classExpected === 0 ? 0 : Math.round((classActual / classExpected) * 100)
              };
           }
        }
        
        setProgress({ pending: expected - actual, completed: actual, total: expected, classProgress });
        setActiveExams(activeSessions);
      } catch (err) {
        console.error("Error fetching overview:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.linkedEntityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const assignedSubjects = profile?.assignedSubjects || [];
  const percentComplete = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Class Teacher Overview (If Applicable) */}
      {progress.classProgress && (
        <div className="bg-[#03045e] p-6 rounded-2xl text-white flex items-center justify-between shadow-lg">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-blue-200">{t("teacherExams.overview.classTeacher")}</h3>
            <p className="text-xl font-bold mt-1">{t("common.class")} {progress.classProgress.className}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{t("teacherExams.overview.evalProgress")}</div>
            <div className="text-3xl font-black text-[#00b4d8]">{progress.classProgress.percent}%</div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ProgressCard 
          icon={BookOpen} 
          title={t("teacherExams.overview.assignedSubjects")} 
          value={assignedSubjects.length} 
          colorClass="blue" 
        />
        <ProgressCard 
          icon={CheckCircle} 
          title={t("teacherExams.overview.completedEval")} 
          value={progress.completed} 
          colorClass="emerald" 
        />
        <ProgressCard 
          icon={Clock} 
          title={t("teacherExams.overview.pendingEval")} 
          value={progress.pending} 
          colorClass="amber" 
        />
        <ProgressCard 
          title={t("teacherExams.overview.overallProgress")} 
          value={`${percentComplete}%`} 
          progress={percentComplete} 
          colorClass="blue" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Papers */}
        <MainCard className="p-6">
          <h2 className="text-lg font-black text-[#03045e] mb-4 flex items-center gap-2">
            <FileText size={20} className="text-[#0077b6]" />
            {t("teacherExams.overview.yourSubjects")}
          </h2>
          
          {assignedSubjects.length === 0 ? (
            <EmptyState 
              icon={AlertCircle}
              title={t("teacherExams.overview.noSubjectsTitle")}
              description={t("teacherExams.overview.noSubjectsDesc")}
            />
          ) : (
            <div className="space-y-3">
              {assignedSubjects.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600">
                      {sub.className?.substring(0,2) || "?"}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#03045e]">{t(sub.subjectName)}</h4>
                      <p className="text-xs text-gray-500">{sub.className}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </MainCard>

        {/* Timeline */}
        <MainCard className="p-6">
          <h2 className="text-lg font-black text-[#03045e] mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-[#0077b6]" />
            {t("teacherExams.overview.timelineTitle")}
          </h2>
          
          {activeExams.length === 0 ? (
             <EmptyState 
               icon={Calendar}
               title={t("teacherExams.overview.noExamsTitle")}
               description={t("teacherExams.overview.noExamsDesc")}
             />
          ) : (
            <Timeline 
              items={activeExams.map(exam => ({
                title: t(exam.name),
                subtitle: t("teacherExams.overview.phase") + t(`status.${exam.status}`),
                description: t("teacherExams.overview.timelineDesc"),
                status: exam.status === 'evaluation' ? 'warning' : exam.status === 'ongoing' ? 'success' : 'info'
              }))}
            />
          )}
        </MainCard>
      </div>
    </div>
  );
};

export default OverviewTab;
