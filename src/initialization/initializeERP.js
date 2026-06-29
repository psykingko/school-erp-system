/**
 * initialization/initializeERP.js
 * Central orchestrator and single application startup authority.
 * Coordinates system startup checks, automatic repair logic,
 * structural validation diagnostics, and safe demo resets.
 */

import { bootstrapState } from "./bootstrapState";
import { initializeStorage } from "./initializeStorage";
import { clearAllData, setItem, getItem } from "../persistence/storage";
import { STORAGE_KEYS } from "../persistence/storageKeys";
import {
  studentsSeed,
  teachersSeed,
  classesSeed,
  timetableSeed,
  noticesSeed,
  assignmentsSeed,
  submissionsSeed,
  examsSeed,
  attendanceSeed,
  feesSeed,
  parentsSeed,
  subjectsSeed,
  teacherSubjectAssignmentsSeed,
  questionPapersSeed,
} from "../data/mockDB";
import { ROLES } from "../auth/roles";
import { generateMissingMockData } from "./generateMockData";
import { runGenderMigration } from "../services/profileMigrationService";
import { runLeavePortfolioMigration } from "../services/leavePortfolioMigrationService";
import { runTeacherMigrationIfNeeded } from "../services/teacherMigrationService";


/**
 * Executes startup checks synchronously to block rendering and
 * guarantee absolute storage consistency before React mounts.
 */
export const initializeERP = () => {
  if (bootstrapState.isInitialized) {
    return;
  }

  bootstrapState.isInitializing = true;
  bootstrapState.error = null;
  console.log(
    "[InitializationEngine] Starting Centralized ERP Initialization sequence...",
  );

  try {
    // 1. Storage Layout setup
    initializeStorage.ensureRequiredKeys();

    // ── Gender Migration (Phase 1) ──────────────────────────────────────────────
    runGenderMigration();

    // ── Leave Portfolio Migration (Phase 2) ─────────────────────────────────────
    runLeavePortfolioMigration();

    // ── Teacher Profile Migration (Phase 12.5) ──────────────────────────────────
    runTeacherMigrationIfNeeded();

    // ── Schema Version Check (Phase 9: Student normalization) ──────────────────
    // If student records are from schema v1 (missing id/classId/streamId fields),
    // force a re-seed so all services work correctly.
    const CURRENT_STUDENTS_SCHEMA = 2;
    const storedStudentsSchema = parseInt(getItem(STORAGE_KEYS.STUDENTS_SCHEMA_VERSION) || "1", 10);
    if (storedStudentsSchema < CURRENT_STUDENTS_SCHEMA) {
      console.log("[InitializationEngine] Upgrading student schema v1 → v2 (adding id, classId, streamId, admissionNo)");
      setItem(STORAGE_KEYS.STUDENTS, studentsSeed);
      setItem(STORAGE_KEYS.PARENTS, parentsSeed);
      setItem(STORAGE_KEYS.STUDENTS_SCHEMA_VERSION, CURRENT_STUDENTS_SCHEMA);
    }

    // ── Schema Version Check (Phase 9: Teacher normalization) ──────────────────
    const CURRENT_TEACHERS_SCHEMA = 2;
    const storedTeachersSchema = parseInt(getItem("erp_teachers_schema_version") || "1", 10);
    if (storedTeachersSchema < CURRENT_TEACHERS_SCHEMA) {
      console.log("[InitializationEngine] Upgrading teacher schema v1 → v2 (adding id field)");
      setItem(STORAGE_KEYS.TEACHERS, teachersSeed);
      setItem("erp_teachers_schema_version", CURRENT_TEACHERS_SCHEMA);
    }

    // ── Always Reload Assignments ───────────────────────────────────────────────
    // Force reload assignments and submissions to apply new generation logic
    const CURRENT_ASGN_SCHEMA = 2;
    const storedAsgnSchema = parseInt(getItem("erp_assignments_schema_version") || "1", 10);
    if (storedAsgnSchema < CURRENT_ASGN_SCHEMA) {
      console.log("[InitializationEngine] Upgrading assignments schema v1 → v2 (aligning storage keys)");
      setItem(STORAGE_KEYS.ASSIGNMENTS, assignmentsSeed);
      setItem(STORAGE_KEYS.SUBMISSIONS, submissionsSeed);
      setItem("erp_assignments_schema_version", CURRENT_ASGN_SCHEMA);
    }

    // ── Teacher Subject Assignments Initial Seed ────────────────────────────────
    const CURRENT_TSA_SCHEMA = 2;
    const storedTsaSchema = parseInt(getItem("erp_tsa_schema_version") || "1", 10);
    if (storedTsaSchema < CURRENT_TSA_SCHEMA) {
      console.log("[InitializationEngine] Upgrading TSA schema v1 → v2 (seeding all classes)");
      setItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS, teacherSubjectAssignmentsSeed);
      setItem("erp_tsa_schema_version", CURRENT_TSA_SCHEMA);
    }

    // 2. First-load seeding if empty
    const seedIfEmpty = (key, data, name) => {
      const existing = getItem(key);
      if (!existing || existing.length === 0) {
        setItem(key, data);
        console.log(`[InitializationEngine] Seeded ${name}`);
        return true;
      }
      return false;
    };

    seedIfEmpty(STORAGE_KEYS.STUDENTS, studentsSeed, "students");
    seedIfEmpty(STORAGE_KEYS.TEACHERS, teachersSeed, "teachers");
    seedIfEmpty(STORAGE_KEYS.CLASSES, classesSeed, "classes");
    seedIfEmpty(STORAGE_KEYS.SUBJECTS, subjectsSeed, "subjects");
    seedIfEmpty(STORAGE_KEYS.TIMETABLES, timetableSeed, "timetables");
    seedIfEmpty(STORAGE_KEYS.NOTICES, noticesSeed, "notices");
    seedIfEmpty(STORAGE_KEYS.ASSIGNMENTS, assignmentsSeed, "assignments");
    seedIfEmpty(STORAGE_KEYS.SUBMISSIONS, submissionsSeed, "submissions");
    seedIfEmpty(STORAGE_KEYS.EXAMS, examsSeed, "exams");
    seedIfEmpty(STORAGE_KEYS.DAILY_ATTENDANCE, attendanceSeed, "attendance");
    seedIfEmpty(STORAGE_KEYS.FEES, feesSeed, "fees");
    seedIfEmpty(STORAGE_KEYS.PARENTS, parentsSeed, "parents");
    seedIfEmpty(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS, teacherSubjectAssignmentsSeed, "teacher subject assignments");
    seedIfEmpty(STORAGE_KEYS.QUESTION_PAPERS, questionPapersSeed, "question papers");

    // Dynamically generate missing complex entities (Invoices, Clubs, etc.)
    generateMissingMockData();

    // Generate auth users for demo accounts if empty
    const existingAuthUsers = getItem(STORAGE_KEYS.AUTH_USERS);
    if (!existingAuthUsers || existingAuthUsers.length === 0) {
      const authUsers = [];

      // Admin users (Department Heads)
      const nowStr = new Date().toISOString();
      const adminAccounts = [
        { id: "auth-admin-001", username: "deepak.joshi", password: "password123", role: ROLES.ADMIN, employeeId: "EMP-001", isSuperAdmin: true, status: "ACTIVE", manualOverrides: [], createdAt: nowStr, updatedAt: nowStr },
        { id: "auth-admin-002", username: "amit.verma", password: "password123", role: ROLES.ADMIN, employeeId: "EMP-002", isSuperAdmin: false, status: "ACTIVE", manualOverrides: [], createdAt: nowStr, updatedAt: nowStr },
        { id: "auth-admin-003", username: "neha.sharma", password: "password123", role: ROLES.ADMIN, employeeId: "EMP-003", isSuperAdmin: false, status: "ACTIVE", manualOverrides: [], createdAt: nowStr, updatedAt: nowStr },
        { id: "auth-admin-004", username: "vijay.patel", password: "password123", role: ROLES.ADMIN, employeeId: "EMP-004", isSuperAdmin: false, status: "ACTIVE", manualOverrides: [], createdAt: nowStr, updatedAt: nowStr },
        { id: "auth-admin-007", username: "priya.gupta", password: "password123", role: ROLES.ADMIN, employeeId: "EMP-007", isSuperAdmin: false, status: "ACTIVE", manualOverrides: [], createdAt: nowStr, updatedAt: nowStr },
        { id: "auth-admin-008", username: "lakshmi.mehta", password: "password123", role: ROLES.ADMIN, employeeId: "EMP-008", isSuperAdmin: false, status: "ACTIVE", manualOverrides: [], createdAt: nowStr, updatedAt: nowStr },
        { id: "auth-admin-009", username: "krishna.reddy", password: "password123", role: ROLES.ADMIN, employeeId: "EMP-009", isSuperAdmin: true, status: "ACTIVE", manualOverrides: [], createdAt: nowStr, updatedAt: nowStr },
        { id: "auth-admin-010", username: "admin", password: "admin123", role: ROLES.ADMIN, employeeId: "EMP-010", isSuperAdmin: true, status: "ACTIVE", manualOverrides: [], createdAt: nowStr, updatedAt: nowStr },
      ];
      authUsers.push(...adminAccounts);

      // Student auth users (16 students)
      studentsSeed.forEach((student, index) => {
        authUsers.push({
          id: `auth-stud-${String(index + 1).padStart(3, "0")}`,
          username: student.studentId,
          password: "student123",
          role: ROLES.STUDENT,
          linkedEntityId: student.studentId,
          active: true,
        });
      });

      // Teacher auth users (18 teachers - 1 per subject)
      teachersSeed.forEach((teacher, index) => {
        authUsers.push({
          id: `auth-teach-${String(index + 1).padStart(3, "0")}`,
          username: teacher.teacherId,
          password: "teacher123",
          role: ROLES.TEACHER,
          linkedEntityId: teacher.teacherId,
          active: true,
        });
      });

      // Parent auth users (linked to students)
      parentsSeed.forEach((parent, index) => {
        authUsers.push({
          id: `auth-parent-${String(index + 1).padStart(3, "0")}`,
          username: parent.parentId,
          password: "parent123",
          role: ROLES.PARENT,
          linkedEntityId: parent.parentId,
          active: true,
        });
      });

      setItem(STORAGE_KEYS.AUTH_USERS, authUsers);
      console.log(
        `[InitializationEngine] Seeded ${authUsers.length} auth users`,
      );
    }

    bootstrapState.isInitialized = true;
    bootstrapState.isInitializing = false;
    console.log(
      "[InitializationEngine] ERP Initialization completed successfully.",
    );
  } catch (error) {
    bootstrapState.error = error.message;
    bootstrapState.isInitializing = false;
    console.error("[InitializationEngine] CRITICAL BOOT ERROR:", error);
  }
};

/**
 * Triggers a safe, targeted demo reset and complete data re-seed
 * without invoking full browser reload chaos.
 * @returns {boolean} Success status
 */
export const resetERPData = () => {
  console.warn("[InitializationEngine] Re-seeding ERP Demo Data...");

  try {
    // 4. Run Legacy System Schema Migrations
    runGenderMigration();
    runLeavePortfolioMigration();

    // Clear all existing ERP collections
    clearAllData();

    // Reset initialization status
    bootstrapState.isInitialized = false;

    // Force seed database with static data
    setItem(STORAGE_KEYS.STUDENTS, studentsSeed);
    setItem(STORAGE_KEYS.TEACHERS, teachersSeed);
    setItem(STORAGE_KEYS.CLASSES, classesSeed);
    setItem(STORAGE_KEYS.TIMETABLES, timetableSeed);
    setItem(STORAGE_KEYS.NOTICES, noticesSeed);
    setItem(STORAGE_KEYS.ASSIGNMENTS, assignmentsSeed);
    setItem(STORAGE_KEYS.SUBMISSIONS, submissionsSeed);
    setItem(STORAGE_KEYS.EXAMS, examsSeed);
    setItem(STORAGE_KEYS.DAILY_ATTENDANCE, attendanceSeed);
    setItem(STORAGE_KEYS.FEES, feesSeed);
    setItem(STORAGE_KEYS.PARENTS, parentsSeed);
    setItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS, teacherSubjectAssignmentsSeed);
    setItem(STORAGE_KEYS.QUESTION_PAPERS, questionPapersSeed);
    console.log("[InitializationEngine] Demo data reset complete");

    // Auth users will be regenerated by initializeERP

    // Re-run initialization
    initializeERP();

    if (bootstrapState.isInitialized) {
      window.dispatchEvent(new Event("erp-reset-event"));
      window.location.reload();
    }

    return bootstrapState.isInitialized;
  } catch (error) {
    console.error("[InitializationEngine] Demo Reset Failure:", error);
    return false;
  }
};

export default {
  initializeERP,
  resetERPData,
};
