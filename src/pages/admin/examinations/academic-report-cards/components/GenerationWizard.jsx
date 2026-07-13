import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Play, Filter } from 'lucide-react';
import { getExams } from '../../../../../services/examService';
import { getDataProvider } from '../../../../../data';
import MainCard from '../../../../../components/MainCard';
import { getAssessmentGovernance } from '../../../../../services/assessmentGovernanceService';

const generateAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 2; y <= currentYear + 3; y++) {
    const short = String(y + 1).slice(-2);
    years.push(`${y}-${short}`);
  }
  return years;
};

const GenerationWizard = ({ onGenerate, onViewExisting }) => {
  const [academicYear, setAcademicYear] = useState(generateAcademicYears().find(y => y.startsWith(String(new Date().getFullYear()))) || "2024-25");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [allExams, setAllExams] = useState([]);
  const [selectedExamIds, setSelectedExamIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reportType, setReportType] = useState('final');
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      const provider = getDataProvider();
      const fetchedClasses = await provider.getClasses();
      setClasses(fetchedClasses);
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchExamsAndGovernance = async () => {
      const [exams, governance] = await Promise.all([
        getExams(),
        getAssessmentGovernance()
      ]);
      // Only show published exams for the report card generator
      setAllExams(exams.filter(e => e.status === 'published'));
      if (governance && governance.categories) {
        setCategories(governance.categories);
      }
    };
    fetchExamsAndGovernance();
  }, []);

  const availableExams = useMemo(() => {
    if (!selectedClassId) return [];
    return allExams.filter(e => {
      if (e.academicYear !== academicYear) return false;
      const targetClasses = e.targetClasses || {};
      const classTarget = targetClasses[selectedClassId];
      return classTarget && classTarget.selected;
    });
  }, [allExams, academicYear, selectedClassId]);

  const toggleExam = (id) => {
    setSelectedExamIds(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!selectedClassId || selectedExamIds.length === 0) return;
    setIsGenerating(true);
    try {
      await onGenerate(selectedClassId, academicYear, selectedExamIds, reportType);
    } catch (e) {
      alert(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <MainCard className="p-6">
        <div className="flex items-center gap-2 mb-6 text-[#03045e]">
          <Filter size={20} />
          <h2 className="text-xl font-bold">1. Select Target Class & Session</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Academic Session</label>
            <select
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(e.target.value);
                setSelectedExamIds([]);
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none"
            >
              {generateAcademicYears().map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedExamIds([]);
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none"
            >
              <option value="">Select a Class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </MainCard>

      {selectedClassId && (
        <MainCard className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#03045e]">2. Include Published Examinations</h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md font-bold">
              {availableExams.length} Exams Available
            </span>
          </div>
          
          {availableExams.length === 0 ? (
            <div className="p-6 bg-gray-50 text-center rounded-xl text-gray-500">
              No published examinations found for this class and session.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableExams.map(exam => {
                const isSelected = selectedExamIds.includes(exam.id);
                return (
                  <label 
                    key={exam.id} 
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleExam(exam.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <div className="font-bold text-[#03045e] flex items-center gap-2">
                        {exam.name}
                        {exam.assessmentCategoryId && (
                          <span className="bg-[#caf0f8] text-[#0077b6] text-[10px] px-2 py-0.5 rounded border border-[#00b4d8]/20 font-bold uppercase tracking-wider">
                            {categories.find(c => c.id === exam.assessmentCategoryId)?.name || 'Unknown Category'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-[#03045e]">
              <h2 className="text-xl font-bold">3. Report Generation Mode</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${reportType === 'progress' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <input 
                  type="radio"
                  name="reportType"
                  value="progress"
                  checked={reportType === 'progress'}
                  onChange={() => setReportType('progress')}
                  className="mt-1 w-5 h-5 text-blue-600 rounded-full"
                />
                <div>
                  <div className="font-bold text-[#03045e]">Progress Report</div>
                  <div className="text-xs text-gray-500 mt-1">Represents academic performance based only on the selected examinations. Intended for interim reporting.</div>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${reportType === 'final' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <input 
                  type="radio"
                  name="reportType"
                  value="final"
                  checked={reportType === 'final'}
                  onChange={() => setReportType('final')}
                  className="mt-1 w-5 h-5 text-blue-600 rounded-full"
                />
                <div>
                  <div className="font-bold text-[#03045e]">Final Academic Report</div>
                  <div className="text-xs text-gray-500 mt-1">Represents the institutional final report card. Subject to governance validation in future phases.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => {
                if (selectedClassId && onViewExisting) {
                  onViewExisting(selectedClassId, academicYear);
                } else if (!selectedClassId) {
                  alert("Please select a target class first.");
                }
              }}
              className="bg-gray-100 hover:bg-gray-200 text-[#03045e] px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              View Saved Reports
            </button>
            <button
              onClick={handleGenerate}
              disabled={selectedExamIds.length === 0 || isGenerating}
              className="bg-[#03045e] disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#0077b6] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
              Generate Report Cards
            </button>
          </div>
        </MainCard>
      )}
    </div>
  );
};

export default GenerationWizard;
