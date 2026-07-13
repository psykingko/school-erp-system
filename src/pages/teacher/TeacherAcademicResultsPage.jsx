import React, { useState, useEffect } from 'react';

import { Award, Printer, ShieldAlert, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import MainCard from '../../components/MainCard';
import EmptyState from '../../components/common/EmptyState';
import Drawer from '../../components/common/Drawer';
import StatusBadge from '../../components/common/StatusBadge';
import { getReportCardsForClass } from '../../services/reportCardService';
import { getExams } from '../../services/examService';
import { getClassTeacherResponsibilities } from '../../services/teacherService';
import { getDataProvider } from '../../data';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import PrintableReportCard from '../admin/examinations/academic-report-cards/components/PrintableReportCard';

const ExamResultsLedger = ({ teacherScope }) => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const allExams = await getExams();
        // Allow all published exams across sessions since the teacher selects them from the dropdown
        const published = allExams.filter(e => e.status === 'published' || e.status === 'Published');
        setExams(published);
        if (published.length > 0) {
          setSelectedExamId(published[0].id);
        }
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (teacherScope?.activeSession) {
      fetchExams();
    }
  }, [teacherScope]);

  useEffect(() => {
    const fetchLedgerData = async () => {
      if (!selectedExamId || !teacherScope?.activeClass) return;
      setLoading(true);
      try {
        const provider = getDataProvider();
        const [allStudents, allSubjects, allResults] = await Promise.all([
          provider.getStudentsByClass(teacherScope.activeClass),
          provider.getSubjects(),
          provider.getResults()
        ]);
        
        setStudents(allStudents.sort((a,b) => {
          const rollA = a.rollNumber ? parseInt(a.rollNumber, 10) : 9999;
          const rollB = b.rollNumber ? parseInt(b.rollNumber, 10) : 9999;
          return rollA - rollB;
        }));
        setSubjects(allSubjects);
        setResults(allResults.filter(r => r.classId === teacherScope.activeClass && r.examId === selectedExamId));
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLedgerData();
  }, [selectedExamId, teacherScope]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <MainCard className="h-[300px] flex items-center justify-center bg-white border border-dashed border-gray-300">
        <EmptyState icon={Award} title="No Published Exams" description="No published examinations are available." />
      </MainCard>
    );
  }

  const relevantSubjectIds = new Set(results.map(r => r.subjectId));
  const relevantSubjects = subjects.filter(s => relevantSubjectIds.has(s.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <label className="font-semibold text-gray-700">Exam Cycle:</label>
        <select 
          className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 min-w-[200px]"
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
        >
          {exams.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.academicYear})</option>
          ))}
        </select>
      </div>

      {students.length === 0 ? (
        <MainCard className="h-[300px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState icon={Award} title="No Students" description="No student results found." />
        </MainCard>
      ) : results.length === 0 ? (
        <MainCard className="h-[300px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState icon={Award} title="No Results" description="Results have not been published for this examination." />
        </MainCard>
      ) : (
        <MainCard className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                <th className="p-4 font-semibold">Roll No</th>
                <th className="p-4 font-semibold">Student Name</th>
                {relevantSubjects.map(sub => (
                  <th key={sub.id} className="p-4 font-semibold">{sub.name}</th>
                ))}
                <th className="p-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {students.map(student => {
                const studentResults = results.filter(r => r.studentId === student.id);
                return (
                  <tr key={student.id} className="hover:bg-gray-50/50">
                    <td className="p-4">{student.rollNumber || '-'}</td>
                    <td className="p-4 font-medium text-[#03045e]">{student.name}</td>
                    {relevantSubjects.map(sub => {
                      const res = studentResults.find(r => r.subjectId === sub.id);
                      return (
                        <td key={sub.id} className="p-4">
                          {res ? (
                            <div>
                              <span>{res.effectiveMarks !== undefined ? res.effectiveMarks : res.marksObtained}</span>
                              {res.maxMarks && <span className="text-gray-400 text-xs ml-1">/ {res.maxMarks}</span>}
                              {res.grade && <span className="block text-xs font-semibold mt-0.5">{res.grade}</span>}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4 text-center">
                      {studentResults.length > 0 ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Published</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">No Data</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </MainCard>
      )}
    </div>
  );
};

const TeacherAcademicResultsPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [teacherScope, setTeacherScope] = useState(null);
  const [activeView, setActiveView] = useState('exam_results'); // 'exam_results' | 'progress_reports' | 'final_reports'
  const [loading, setLoading] = useState(true);
  const [reportCards, setReportCards] = useState([]);
  const [publishedExams, setPublishedExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');

  
  // UI state for report cards view
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [previewCard, setPreviewCard] = useState(null);
  const [institutionDetails, setInstitutionDetails] = useState({});

  useEffect(() => {
    setSelectedCardIds([]);
  }, [activeView, selectedExamId]);

  useEffect(() => {
    const resolveScopeAndFetchCards = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const teacherId = user.linkedEntityId || user.id || "teach-001";
        
        // Dynamically resolve Class Teacher responsibilities
        // This is 100% reliable compared to the flat auth object
        const classTeacherData = await getClassTeacherResponsibilities(teacherId);
        const isClassTeacher = !!classTeacherData;
        const activeClass = classTeacherData ? classTeacherData.classId : null;
        
        // Resolve active session from existing exams
        const allExams = await getExams();
        const latestExam = allExams.length > 0 ? allExams[allExams.length - 1] : null;
        const currentYear = new Date().getFullYear();
        const fallbackSession = `${currentYear}-${String(currentYear + 1).slice(2)}`;
        const activeSession = latestExam ? latestExam.academicYear : fallbackSession;
        
        const published = allExams.filter(e => e.status === 'published' || e.status === 'Published');
        setPublishedExams(published);
        if (published.length > 0) {
          setSelectedExamId(published[0].id);
        }
        
        const finalScope = { 
          teacherId, 
          isClassTeacher,
          activeClass,
          activeSession
        };
        
        setTeacherScope(finalScope);

        if (!finalScope.isClassTeacher || !finalScope.activeClass) {
          setLoading(false);
          return;
        }

        if (finalScope.activeClass) {
          // Fetch all report cards for the class, ignoring the strictly derived activeSession so that newly generated reports from any session (e.g. from seeded draft) show up
          const provider = getDataProvider();
          
          const settings = await provider.getInstitutionSettings();
          setInstitutionDetails(settings);
          
          const allCards = await provider.getReportCards();
          const cards = allCards.filter(c => c.classId === finalScope.activeClass);
          
          // Teachers only see Published or Frozen report cards
          setReportCards(cards.filter(c => c.status === 'Published' || c.status === 'Frozen'));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    resolveScopeAndFetchCards();
  }, [user]);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="print:hidden space-y-6">
        <AdminPageHeader
          title={t("teacherExams.results.classTitle")}
          description={t("teacherExams.results.classDesc").replace('{classId}', teacherScope?.activeClass || '')}
          breadcrumbs={[t("nav.home", { fallback: "Dashboard" }), t("teacherExams.results.academicResults")]}
        />

      {teacherScope?.isClassTeacher && teacherScope?.activeClass && teacherScope?.activeSession && (
        <div className="flex justify-center mb-6 print:hidden">
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setActiveView('exam_results')}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${activeView === 'exam_results' ? 'bg-white shadow text-[#03045e]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Exam Results
            </button>
            <button 
              onClick={() => setActiveView('progress_reports')}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${activeView === 'progress_reports' ? 'bg-white shadow text-[#03045e]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Progress Reports
            </button>
            <button 
              onClick={() => setActiveView('final_reports')}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${activeView === 'final_reports' ? 'bg-white shadow text-[#03045e]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Final Academic Reports
            </button>
          </div>
        </div>
      )}

      {teacherScope?.isClassTeacher && (activeView === 'progress_reports' || activeView === 'final_reports') && (
        <div className="flex justify-between items-center mb-4 print:hidden">
          <div>
            {activeView === 'progress_reports' && publishedExams.length > 0 && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                <label className="font-semibold text-gray-700 text-sm">Exam Cycle:</label>
                <select 
                  className="bg-transparent border-none outline-none font-black text-[#03045e] text-sm focus:ring-0 cursor-pointer"
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                >
                  {publishedExams.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            )}
            {activeView === 'final_reports' && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                 <span className="font-bold text-[#03045e] text-sm uppercase tracking-wider">Session: {teacherScope.activeSession}</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => window.print()}
            disabled={reportCards.filter(c => c.reportType === (activeView === 'final_reports' ? 'final' : 'progress') && (activeView !== 'progress_reports' || c.selectedExamIds?.includes(selectedExamId))).length === 0}
            className="bg-[#03045e] hover:bg-[#0077b6] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Printer size={16} /> {selectedCardIds.length > 0 ? `Print Selected (${selectedCardIds.length})` : t("teacherExams.results.printAll")}
          </button>
        </div>
      )}

      {!teacherScope?.isClassTeacher ? (
        <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState 
            icon={ShieldAlert}
            title="Class Teacher Access Required"
            description="Academic Report Cards are available only to teachers assigned as Class Teachers. Subject Teachers can continue managing marks and examinations from the Examination module."
          />
        </MainCard>
      ) : !teacherScope?.activeClass ? (
        <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState 
            icon={Award}
            title="No Class Assigned"
            description="No class assignment found. Please contact administration."
          />
        </MainCard>
      ) : !teacherScope?.activeSession ? (
        <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState 
            icon={Award}
            title="No Academic Session"
            description="No academic session available."
          />
        </MainCard>
      ) : activeView === 'exam_results' ? (
        <ExamResultsLedger teacherScope={teacherScope} />
      ) : reportCards.filter(c => c.reportType === (activeView === 'final_reports' ? 'final' : 'progress') && (activeView !== 'progress_reports' || c.selectedExamIds?.includes(selectedExamId))).length === 0 ? (
        <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState 
            icon={Award}
            title={t("teacherExams.results.noCardsTitle")}
            description={`No published ${activeView === 'final_reports' ? 'final academic reports' : 'progress reports'} available for your assigned class.`}
          />
        </MainCard>
      ) : (
        <MainCard className="p-0 overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={
                        reportCards.filter(c => c.reportType === (activeView === 'final_reports' ? 'final' : 'progress') && (activeView !== 'progress_reports' || c.selectedExamIds?.includes(selectedExamId))).length > 0 && 
                        selectedCardIds.length === reportCards.filter(c => c.reportType === (activeView === 'final_reports' ? 'final' : 'progress') && (activeView !== 'progress_reports' || c.selectedExamIds?.includes(selectedExamId))).length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCardIds(reportCards.filter(c => c.reportType === (activeView === 'final_reports' ? 'final' : 'progress') && (activeView !== 'progress_reports' || c.selectedExamIds?.includes(selectedExamId))).map(c => c.id));
                        } else {
                          setSelectedCardIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Percentage</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reportCards.filter(c => c.reportType === (activeView === 'final_reports' ? 'final' : 'progress') && (activeView !== 'progress_reports' || c.selectedExamIds?.includes(selectedExamId))).map(card => (
                  <tr key={card.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedCardIds.includes(card.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCardIds([...selectedCardIds, card.id]);
                          else setSelectedCardIds(selectedCardIds.filter(id => id !== card.id));
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#03045e]">{card.studentName}</div>
                      <div className="text-xs text-gray-400">Adm: {card.admissionNumber} • Roll: {card.rollNumber}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">
                      {card.overallPercentage ? card.overallPercentage.toFixed(2) : 0}%
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-[10px] font-bold">
                        {card.overallGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {card.resultStatus === 'PASS' ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                          <CheckCircle size={14} /> PASS
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 font-bold text-xs">
                          <AlertCircle size={14} /> FAIL
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={card.status.toLowerCase()} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setPreviewCard(card)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Report Card"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MainCard>
      )}
      </div>

      {/* Print Area - Only visible when printing ALL */}
      {!previewCard && (
        <div className="hidden print:block print-isolate bg-white min-h-screen">
          {reportCards
            .filter(c => c.reportType === (activeView === 'final_reports' ? 'final' : 'progress') && (activeView !== 'progress_reports' || c.selectedExamIds?.includes(selectedExamId)))
            .filter(c => selectedCardIds.length === 0 || selectedCardIds.includes(c.id))
            .map((card, index) => (
              <div key={`print-${card.id}`} className={index > 0 ? "break-before-page" : ""}>
                <PrintableReportCard card={card} institutionDetails={institutionDetails} />
              </div>
            ))}
        </div>
      )}

      {/* Print Area - Only visible when printing SINGLE */}
      {previewCard && (
        <div className="hidden print:block print-isolate bg-white min-h-screen">
          <PrintableReportCard card={previewCard} institutionDetails={institutionDetails} />
        </div>
      )}

      <Drawer
        isOpen={!!previewCard}
        onClose={() => setPreviewCard(null)}
        title="Report Card Preview"
        size="lg"
      >
        {previewCard && (
          <div className="p-6 bg-gray-100 min-h-full">
            <div className="flex justify-end mb-4 print:hidden">
               <button 
                 onClick={() => window.print()}
                 className="bg-[#03045e] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg hover:bg-[#0077b6] transition-colors"
               >
                 <Printer size={16} /> Print Single Card
               </button>
            </div>
            <PrintableReportCard card={previewCard} institutionDetails={institutionDetails} />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TeacherAcademicResultsPage;
