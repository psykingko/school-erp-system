import { getDataProvider } from "../data";
import { getAssessmentGovernance } from "./assessmentGovernanceService";
import { getExams } from "./examService";

/**
 * Helper to determine grade based on boundaries
 */
const getGradeFromPercentage = (percentage, gradeBoundaries = []) => {
  if (!gradeBoundaries || gradeBoundaries.length === 0) return { grade: "N/A" };
  // Sort descending by min
  const sorted = [...gradeBoundaries].sort((a, b) => b.min - a.min);
  const matched = sorted.find(b => percentage >= b.min);
  return { grade: matched ? matched.name : "F" };
};

export const validateGovernanceCompleteness = async (selectedExamIds) => {
  const governance = await getAssessmentGovernance();
  const allExams = await getExams();
  
  const selectedExams = allExams.filter(e => selectedExamIds.includes(e.id));
  const activeCats = (governance.categories || []).filter(c => c.isActive);
  const weightages = governance.weightages || [];
  
  const selectedCatIds = new Set(selectedExams.map(e => e.assessmentCategoryId));
  
  let appliedWeightage = 0;
  let requiredWeightage = 0;
  const missingCategories = [];
  
  for (const cat of activeCats) {
    const w = weightages.find(w => w.categoryId === cat.id)?.weightage || 0;
    if (w > 0) {
      requiredWeightage += w;
      if (selectedCatIds.has(cat.id)) {
        appliedWeightage += w;
      } else {
        missingCategories.push(cat.name);
      }
    }
  }
  
  return {
    isComplete: appliedWeightage >= requiredWeightage,
    appliedWeightage,
    requiredWeightage,
    missingCategories
  };
};

export const previewReportCards = async (classId, sessionId, selectedExamIds, reportType = 'final') => {
  if (!selectedExamIds || selectedExamIds.length === 0) {
    throw new Error("No exam cycles selected. Please select at least one published exam.");
  }

  const provider = getDataProvider();
  
  // 1. Fetch Governance & Validate Completeness
  const governance = await getAssessmentGovernance();
  if (!governance || !governance.categories || !governance.weightages) {
    throw new Error("Assessment Governance is incomplete. Please configure it first.");
  }
  
  const activeCats = governance.categories.filter(c => c.isActive);
  for (const cat of activeCats) {
    if (!governance.weightages.find(w => w.categoryId === cat.id)) {
      throw new Error(`Governance incomplete: Weightage missing for category '${cat.name}'.`);
    }
  }

  const governanceSnapshot = {
    categories: governance.categories,
    weightages: governance.weightages,
    gradeBoundaries: governance.gradeBoundaries,
    passingRules: governance.passingRules
  };

  // 2. Fetch Exams & Validate Session
  const allExams = await getExams();
  const selectedExams = allExams.filter(e => selectedExamIds.includes(e.id));
  
  const sessions = new Set(selectedExams.map(e => e.academicYear));
  if (sessions.size > 1) {
    throw new Error("All selected exams must belong to the same academic session.");
  }

  // 3. Fetch Results & Students
  const allResults = await provider.getResults();
  const relevantResults = allResults.filter(r => selectedExamIds.includes(r.examId) && r.classId === classId);
  const studentsInClass = await provider.getStudentsByClass(classId);
  const classSubjects = await provider.getSubjects();
  
  const classSubjectIds = new Set(relevantResults.map(r => r.subjectId));
  const existingCards = await provider.getReportCardsByClass(classId, sessionId);

  const generatedCards = [];

  for (const student of studentsInClass) {
    const studentResults = relevantResults.filter(r => r.studentId === student.id);
    const subjectMarks = {}; 
    
    // Group by subject and category
    for (const res of studentResults) {
      const exam = selectedExams.find(e => e.id === res.examId);
      const catId = exam.assessmentCategoryId;
      
      if (!subjectMarks[res.subjectId]) {
        subjectMarks[res.subjectId] = { categories: {}, examNames: [] };
      }
      
      if (!subjectMarks[res.subjectId].categories[catId]) {
        subjectMarks[res.subjectId].categories[catId] = { totalPercent: 0, count: 0 };
      }
      
      const maxM = res.maxMarks || 100;
      const percentage = (res.effectiveMarks / maxM) * 100;
      
      subjectMarks[res.subjectId].categories[catId].totalPercent += percentage;
      subjectMarks[res.subjectId].categories[catId].count += 1;
      
      if (!subjectMarks[res.subjectId].examNames.includes(exam.name)) {
        subjectMarks[res.subjectId].examNames.push(exam.name);
      }
    }

    // Validation: Missing Subject Data
    for (const reqSubId of classSubjectIds) {
      if (!subjectMarks[reqSubId]) {
        const missingSubName = classSubjects.find(s => s.id === reqSubId)?.name || reqSubId;
        throw new Error(`Generation blocked: Missing data for student ${student.firstName} ${student.lastName} in subject ${missingSubName}.`);
      }
    }

    const finalSubjects = [];
    
    for (const subId of Object.keys(subjectMarks)) {
      let finalSubPercentage = 0;
      let appliedWeightage = 0;
      
      for (const cat of activeCats) {
        const catData = subjectMarks[subId].categories[cat.id];
        if (catData && catData.count > 0) {
          const weightage = governance.weightages.find(w => w.categoryId === cat.id)?.weightage || 0;
          const avgPercent = catData.totalPercent / catData.count;
          finalSubPercentage += (avgPercent * (weightage / 100));
          appliedWeightage += weightage;
        }
      }

      if (appliedWeightage > 0 && appliedWeightage < 100) {
        finalSubPercentage = (finalSubPercentage / appliedWeightage) * 100;
      }
      
      const subName = classSubjects.find(s => s.id === subId)?.name || subId;
      const gradeInfo = getGradeFromPercentage(finalSubPercentage, governance.gradeBoundaries);

      finalSubjects.push({
        subjectId: subId,
        subjectName: subName,
        finalPercentage: finalSubPercentage,
        finalGrade: gradeInfo.grade,
        includedExams: subjectMarks[subId].examNames
      });
    }

    let overallPercentage = 0;
    if (finalSubjects.length > 0) {
      overallPercentage = finalSubjects.reduce((acc, s) => acc + s.finalPercentage, 0) / finalSubjects.length;
    }
    const overallGradeInfo = getGradeFromPercentage(overallPercentage, governance.gradeBoundaries);
    
    const passThreshold = governance.passingRules?.overallPassingPercentage || 33;
    const passFail = overallPercentage >= passThreshold ? "PASS" : "FAIL";

    const examKey = [...selectedExamIds].sort().join('-');
    const existing = existingCards.find(c => 
      c.studentId === student.id && 
      c.reportType === reportType &&
      (reportType === 'final' || [...(c.selectedExamIds || [])].sort().join('-') === examKey)
    );

    if (existing && existing.status === "Frozen") {
      // Do not regenerate if frozen, just return the existing one as-is
      generatedCards.push(existing);
      continue;
    }

    generatedCards.push({
      id: existing ? existing.id : `rc-${Date.now()}-${student.id}`,
      version: existing ? existing.version + 1 : 1,
      studentId: student.id,
      studentName: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student',
      admissionNumber: student.admissionNo || student.admissionNumber || 'N/A',
      rollNumber: student.rollNumber || 'N/A',
      classId: classId,
      sessionId: sessionId,
      reportType: reportType,
      status: "Generated",
      governanceVersion: governance.version || 1,
      governanceSnapshot: governanceSnapshot,
      selectedExamIds: selectedExamIds,
      subjects: finalSubjects,
      overallPercentage: overallPercentage,
      overallGrade: overallGradeInfo.grade,
      resultStatus: passFail,
      generalRemark: existing?.generalRemark || "",
      principalRemark: existing?.principalRemark || "",
      generatedAt: new Date().toISOString()
    });
  }

  return generatedCards;
};

export const commitGeneratedReportCards = async (cards, generatedBy) => {
  const provider = getDataProvider();
  const finalized = cards.map(c => ({
    ...c,
    generatedBy: generatedBy || "admin-001"
  }));
  return await provider.saveReportCards(finalized);
};

export const publishReportCards = async (cardIds, publishedBy) => {
  const provider = getDataProvider();
  for (const id of cardIds) {
    await provider.updateReportCard(id, { 
      status: "Published",
      publishedBy: publishedBy || "admin-001",
      publishedAt: new Date().toISOString()
    });
  }
};

export const freezeReportCards = async (cardIds, frozenBy) => {
  const provider = getDataProvider();
  for (const id of cardIds) {
    await provider.updateReportCard(id, { 
      status: "Frozen",
      frozenBy: frozenBy || "admin-001",
      frozenAt: new Date().toISOString()
    });
  }
};

export const getReportCardsForClass = async (classId, sessionId) => {
  const provider = getDataProvider();
  return await provider.getReportCardsByClass(classId, sessionId);
};

export const getReportCardsForStudent = async (studentId) => {
  const provider = getDataProvider();
  return await provider.getReportCardsByStudent(studentId);
};
