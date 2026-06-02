/**
 * MockDB - Simplified Static Facade
 *
 * Controlled Institutional Sandbox:
 * - Direct exports from seed files
 * - No dynamic generation
 * - No relational engines
 * - Static data only
 */

// Static seed imports
import { classesSeed, getAllClassLevels, getAllSections } from "./seed/classes";
import { studentsSeed, parentsSeed } from "./seed/studentsSeed";
import { teachersSeed } from "./seed/teachersSeed";
import { subjectsSeed } from "./seed/subjects";
import { streamsSeed } from "./seed/streams";
import { timetableSeed } from "./seed/timetable";
import { feeStructuresSeed } from "./seed/feeStructures";
import { examsSeed } from "./seed/examsSeed";
import { attendanceSeed } from "./seed/attendanceSeed";
import { feesSeed } from "./seed/feesSeed";
import { noticesSeed } from "./seed/noticesSeed";
import { assignmentsSeed, submissionsSeed } from "./seed/assignmentsSeed";
import { teacherSubjectAssignmentsSeed } from "./seed/teacherSubjectAssignments";
import { questionPapersSeed } from "./seed/questionPapersSeed";

// Storage integration for persistence
import { getItem, setItem } from "../persistence/storage";
import { STORAGE_KEYS } from "../persistence/storageKeys";

// ============================================================================
// STATIC DATA EXPORTS
// ============================================================================

export { classesSeed, studentsSeed, parentsSeed, teachersSeed, subjectsSeed };
export { streamsSeed, timetableSeed, feeStructuresSeed };
export { examsSeed, attendanceSeed, feesSeed, noticesSeed, assignmentsSeed, submissionsSeed, teacherSubjectAssignmentsSeed, questionPapersSeed };
export { getAllClassLevels, getAllSections };

// ============================================================================
// STORAGE-BACKED COLLECTIONS
// ============================================================================

const getCollection = (key, fallback = []) => getItem(key) || fallback;

export const MockDB = {
  // Static collections (from seed)
  classes: {
    all: () => Promise.resolve(classesSeed),
    findById: (id) => Promise.resolve(classesSeed.find((c) => c.id === id)),
  },

  // Exams - Static with pre-calculated results
  exams: {
    all: () => Promise.resolve(examsSeed),
    findById: (id) => Promise.resolve(examsSeed.find((e) => e.examId === id)),
    findByClass: (classId) => {
      return Promise.resolve(
        examsSeed
          .map((exam) => {
            const cls = exam.classes.find((c) => c.classId === classId);
            return cls
              ? { examId: exam.examId, examName: exam.examName, ...cls }
              : null;
          })
          .filter(Boolean),
      );
    },
    getStudentResult: (examId, studentId) => {
      const exam = examsSeed.find((e) => e.examId === examId);
      if (!exam) return Promise.resolve(null);
      for (const cls of exam.classes) {
        const result = cls.studentResults.find(
          (r) => r.studentId === studentId,
        );
        if (result)
          return Promise.resolve({
            ...result,
            classId: cls.classId,
            className: cls.className,
          });
      }
      return Promise.resolve(null);
    },
  },

  // Attendance - Static records
  attendance: {
    all: () => Promise.resolve(attendanceSeed),
    findById: (studentId) =>
      Promise.resolve(attendanceSeed.find((a) => a.studentId === studentId)),
    findByClass: (className) =>
      Promise.resolve(attendanceSeed.filter((a) => a.className === className)),
    update: async (studentId, updates) => {
      const list = getCollection(STORAGE_KEYS.ATTENDANCE, attendanceSeed);
      const idx = list.findIndex((a) => a.studentId === studentId);
      if (idx === -1) throw new Error("Attendance record not found");
      list[idx] = {
        ...list[idx],
        ...updates,
        lastUpdated: new Date().toISOString().split("T")[0],
      };
      setItem(STORAGE_KEYS.ATTENDANCE, list);
      return list[idx];
    },
  },

  // Fees - Static records
  fees: {
    all: () => Promise.resolve(feesSeed),
    findById: (studentId) =>
      Promise.resolve(feesSeed.find((f) => f.studentId === studentId)),
    findByClass: (className) =>
      Promise.resolve(feesSeed.filter((f) => f.className === className)),
    update: async (studentId, updates) => {
      const list = getCollection(STORAGE_KEYS.FEES, feesSeed);
      const idx = list.findIndex((f) => f.studentId === studentId);
      if (idx === -1) throw new Error("Fee record not found");
      list[idx] = { ...list[idx], ...updates };
      setItem(STORAGE_KEYS.FEES, list);
      return list[idx];
    },
  },

  // Notices - Static for portal feeds
  notices: {
    all: () => Promise.resolve(noticesSeed),
    findById: (id) =>
      Promise.resolve(noticesSeed.find((n) => n.noticeId === id)),
    findByAudience: (audience) =>
      Promise.resolve(
        noticesSeed.filter(
          (n) => n.targetAudience === audience || n.targetAudience === "all",
        ),
      ),
    findByClass: (className) =>
      Promise.resolve(
        noticesSeed.filter(
          (n) =>
            n.targetClasses.includes(className) || n.targetClasses.length === 0,
        ),
      ),
    getActive: () =>
      Promise.resolve(noticesSeed.filter((n) => n.status === "active")),
    getHighPriority: () =>
      Promise.resolve(
        noticesSeed.filter(
          (n) => n.priority === "high" && n.status === "active",
        ),
      ),
    insert: async (record) => {
      const list = getCollection(STORAGE_KEYS.NOTICES, noticesSeed);
      const newRecord = {
        ...record,
        noticeId: record.noticeId || `notice-${Date.now()}`,
      };
      list.push(newRecord);
      setItem(STORAGE_KEYS.NOTICES, list);
      return newRecord;
    },
    update: async (id, updates) => {
      const list = getCollection(STORAGE_KEYS.NOTICES, noticesSeed);
      const idx = list.findIndex((n) => n.noticeId === id);
      if (idx === -1) throw new Error("Notice not found");
      list[idx] = { ...list[idx], ...updates };
      setItem(STORAGE_KEYS.NOTICES, list);
      return list[idx];
    },
  },

  // Assignments - Static with embedded submissions
  assignments: {
    all: () =>
      Promise.resolve(getCollection(STORAGE_KEYS.ASSIGNMENTS, assignmentsSeed)),
    findById: (id) => {
      const list = getCollection(STORAGE_KEYS.ASSIGNMENTS, assignmentsSeed);
      return Promise.resolve(list.find((a) => a.assignmentId === id));
    },
    findByStudent: (studentId) => {
      const list = getCollection(STORAGE_KEYS.ASSIGNMENTS, assignmentsSeed);
      const subs = getCollection(STORAGE_KEYS.SUBMISSIONS, submissionsSeed);
      return Promise.resolve(
        list.filter((a) =>
          subs.some((s) => s.assignmentId === a.assignmentId && s.studentId === studentId),
        ),
      );
    },
    findByClass: (className) => {
      const list = getCollection(STORAGE_KEYS.ASSIGNMENTS, assignmentsSeed);
      return Promise.resolve(
        list.filter(
          (a) => a.className === className || a.className?.includes(className),
        ),
      );
    },
    findByTeacher: (teacherId) => {
      const list = getCollection(STORAGE_KEYS.ASSIGNMENTS, assignmentsSeed);
      return Promise.resolve(list.filter((a) => a.teacherId === teacherId));
    },
    getStudentSubmission: (assignmentId, studentId) => {
      const subs = getCollection(STORAGE_KEYS.SUBMISSIONS, submissionsSeed);
      return Promise.resolve(
        subs.find((s) => s.assignmentId === assignmentId && s.studentId === studentId),
      );
    },
    updateSubmission: async (assignmentId, studentId, updates) => {
      const subs = getCollection(STORAGE_KEYS.SUBMISSIONS, submissionsSeed);
      const submissionIdx = subs.findIndex(
        (s) => s.assignmentId === assignmentId && s.studentId === studentId,
      );
      if (submissionIdx === -1) throw new Error("Submission not found");
      subs[submissionIdx] = {
        ...subs[submissionIdx],
        ...updates,
      };
      setItem(STORAGE_KEYS.SUBMISSIONS, subs);
      return subs[submissionIdx];
    },
    insert: async (record) => {
      const list = getCollection(STORAGE_KEYS.ASSIGNMENTS, []);
      const newRecord = {
        ...record,
        assignmentId: record.assignmentId || `asgn-${Date.now()}`,
      };
      list.push(newRecord);
      setItem(STORAGE_KEYS.ASSIGNMENTS, list);
      return newRecord;
    },
    update: async (id, updates) => {
      const list = getCollection(STORAGE_KEYS.ASSIGNMENTS, assignmentsSeed);
      const idx = list.findIndex((a) => a.assignmentId === id);
      if (idx === -1) throw new Error("Assignment not found");
      list[idx] = { ...list[idx], ...updates };
      setItem(STORAGE_KEYS.ASSIGNMENTS, list);
      return list[idx];
    },
    delete: async (id) => {
      const list = getCollection(STORAGE_KEYS.ASSIGNMENTS, assignmentsSeed);
      const idx = list.findIndex((a) => a.assignmentId === id);
      if (idx === -1) return false;
      list.splice(idx, 1);
      setItem(STORAGE_KEYS.ASSIGNMENTS, list);
      return true;
    },
  },

  // Question Papers - Static with CRUD simulation
  questionPapers: {
    all: () => Promise.resolve(getCollection(STORAGE_KEYS.QUESTION_PAPERS, questionPapersSeed)),
    findById: (id) => {
      const list = getCollection(STORAGE_KEYS.QUESTION_PAPERS, questionPapersSeed);
      return Promise.resolve(list.find((qp) => qp.id === id));
    },
    findByTeacher: (teacherId) => {
      const list = getCollection(STORAGE_KEYS.QUESTION_PAPERS, questionPapersSeed);
      return Promise.resolve(list.filter((qp) => qp.teacherId === teacherId));
    },
    insert: async (record) => {
      const list = getCollection(STORAGE_KEYS.QUESTION_PAPERS, questionPapersSeed);
      const newRecord = {
        ...record,
        id: record.id || `qp-${Date.now()}`,
        createdAt: record.createdAt || new Date().toISOString(),
        updatedAt: record.updatedAt || new Date().toISOString(),
      };
      list.push(newRecord);
      setItem(STORAGE_KEYS.QUESTION_PAPERS, list);
      return newRecord;
    },
    update: async (id, updates) => {
      const list = getCollection(STORAGE_KEYS.QUESTION_PAPERS, questionPapersSeed);
      const idx = list.findIndex((qp) => qp.id === id);
      if (idx === -1) throw new Error("Question paper not found");
      list[idx] = { 
        ...list[idx], 
        ...updates,
        updatedAt: new Date().toISOString() 
      };
      setItem(STORAGE_KEYS.QUESTION_PAPERS, list);
      return list[idx];
    },
    delete: async (id) => {
      const list = getCollection(STORAGE_KEYS.QUESTION_PAPERS, questionPapersSeed);
      const idx = list.findIndex((qp) => qp.id === id);
      if (idx === -1) return false;
      list.splice(idx, 1);
      setItem(STORAGE_KEYS.QUESTION_PAPERS, list);
      return true;
    },
  },

  subjects: {
    all: () => Promise.resolve(subjectsSeed),
    findById: (id) =>
      Promise.resolve(
        subjectsSeed.find((s) => s.subjectId === id || s.id === id),
      ),
    find: (query) =>
      Promise.resolve(
        subjectsSeed.filter((s) => {
          if (query.subjectType) return s.subjectType === query.subjectType;
          if (query.applicableClasses)
            return s.applicableClasses?.some((c) =>
              query.applicableClasses.includes(c),
            );
          return true;
        }),
      ),
  },

  streams: {
    all: () => Promise.resolve(streamsSeed),
    findById: (id) =>
      Promise.resolve(
        streamsSeed.find((s) => s.streamId === id || s.id === id),
      ),
  },

  // Persisted collections (from localStorage with seed fallback)
  students: {
    all: () =>
      Promise.resolve(getCollection(STORAGE_KEYS.STUDENTS, studentsSeed)),
    findById: (id) => {
      const list = getCollection(STORAGE_KEYS.STUDENTS, studentsSeed);
      return Promise.resolve(
        list.find((s) => s.id === id || s.studentId === id),
      );
    },
    find: (query) => {
      const list = getCollection(STORAGE_KEYS.STUDENTS, studentsSeed);
      return Promise.resolve(
        list.filter((s) => {
          if (query.classId) return s.classId === query.classId;
          if (query.classLevel) return s.classLevel === query.classLevel;
          return true;
        }),
      );
    },
    update: async (id, updates) => {
      const list = getCollection(STORAGE_KEYS.STUDENTS, studentsSeed);
      const idx = list.findIndex((s) => s.id === id || s.studentId === id);
      if (idx === -1) throw new Error("Student not found");
      list[idx] = { ...list[idx], ...updates };
      setItem(STORAGE_KEYS.STUDENTS, list);
      return list[idx];
    },
  },

  parents: {
    all: () =>
      Promise.resolve(getCollection(STORAGE_KEYS.PARENTS, parentsSeed)),
    findById: (id) => {
      const list = getCollection(STORAGE_KEYS.PARENTS, parentsSeed);
      return Promise.resolve(
        list.find((p) => p.id === id || p.parentId === id),
      );
    },
    find: (query) => {
      const list = getCollection(STORAGE_KEYS.PARENTS, parentsSeed);
      return Promise.resolve(
        list.filter((p) => {
          if (query.childIds)
            return p.childIds?.some((cid) => query.childIds.includes(cid));
          return true;
        }),
      );
    },
    update: async (id, updates) => {
      const list = getCollection(STORAGE_KEYS.PARENTS, parentsSeed);
      const idx = list.findIndex((p) => p.id === id || p.parentId === id);
      if (idx === -1) throw new Error("Parent not found");
      list[idx] = { ...list[idx], ...updates };
      setItem(STORAGE_KEYS.PARENTS, list);
      return list[idx];
    },
  },

  teachers: {
    all: () =>
      Promise.resolve(getCollection(STORAGE_KEYS.TEACHERS, teachersSeed)),
    findById: (id) => {
      const list = getCollection(STORAGE_KEYS.TEACHERS, teachersSeed);
      return Promise.resolve(list.find((t) => t.id === id));
    },
    find: (query) => {
      const list = getCollection(STORAGE_KEYS.TEACHERS, teachersSeed);
      return Promise.resolve(
        list.filter((t) => {
          if (query.teacherType) return t.teacherType === query.teacherType;
          if (query.specializationSubjectId)
            return t.specializationSubjectId === query.specializationSubjectId;
          if (query.assignedLevels)
            return t.assignedLevels?.some((l) =>
              query.assignedLevels.includes(l),
            );
          return true;
        }),
      );
    },
    update: async (id, updates) => {
      const list = getCollection(STORAGE_KEYS.TEACHERS, teachersSeed);
      const idx = list.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Teacher not found");
      list[idx] = { ...list[idx], ...updates };
      setItem(STORAGE_KEYS.TEACHERS, list);
      return list[idx];
    },
  },

  timetables: {
    all: () =>
      Promise.resolve(getCollection(STORAGE_KEYS.TIMETABLE, timetableSeed)),
    findById: (id) => {
      const list = getCollection(STORAGE_KEYS.TIMETABLE, timetableSeed);
      return Promise.resolve(list.find((t) => t.id === id));
    },
    findByClass: (classId) => {
      const list = getCollection(STORAGE_KEYS.TIMETABLE, timetableSeed);
      return Promise.resolve(list.find((t) => t.classId === classId));
    },
    update: async (id, updates) => {
      const list = getCollection(STORAGE_KEYS.TIMETABLE, timetableSeed);
      const idx = list.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Timetable not found");
      list[idx] = { ...list[idx], ...updates };
      setItem(STORAGE_KEYS.TIMETABLE, list);
      return list[idx];
    },
  },

  feeStructures: {
    all: () =>
      Promise.resolve(
        getCollection(STORAGE_KEYS.FEE_STRUCTURES, feeStructuresSeed),
      ),
    findById: (id) => {
      const list = getCollection(
        STORAGE_KEYS.FEE_STRUCTURES,
        feeStructuresSeed,
      );
      return Promise.resolve(list.find((f) => f.id === id));
    },
    findByClass: (level, streamId) => {
      const list = getCollection(
        STORAGE_KEYS.FEE_STRUCTURES,
        feeStructuresSeed,
      );
      return Promise.resolve(
        list.find((f) => {
          if (f.level !== level) return false;
          if (streamId && f.streamId !== streamId) return false;
          return true;
        }),
      );
    },
    update: async (id, updates) => {
      const list = getCollection(
        STORAGE_KEYS.FEE_STRUCTURES,
        feeStructuresSeed,
      );
      const idx = list.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error("Fee structure not found");
      list[idx] = {
        ...list[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setItem(STORAGE_KEYS.FEE_STRUCTURES, list);
      return list[idx];
    },
  },

  // Utility helpers
  helpers: {
    resolveStudentsInClass: (classId) => {
      const list = getCollection(STORAGE_KEYS.STUDENTS, studentsSeed);
      return list.filter((s) => s.classId === classId);
    },
    resolveClassById: (classId) => classesSeed.find((c) => c.id === classId),
    resolveTeacherById: (teacherId) => {
      const list = getCollection(STORAGE_KEYS.TEACHERS, teachersSeed);
      return list.find((t) => t.id === teacherId);
    },
  },
};

export default MockDB;
