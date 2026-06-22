import { MockDB } from "../data/mockDB";
import { getItem } from "../persistence/storage";
import { STORAGE_KEYS } from "../persistence/storageKeys";
import { questionPaperMigrationService } from "./questionPaperMigrationService";

/**
 * QuestionPaperService
 * Handles CRUD operations for Question Papers for both Teachers and Admins.
 */
class QuestionPaperService {
  async getTeacherQuestionPapers(teacherId) {
    try {
      const papers = await MockDB.questionPapers.findByTeacher(teacherId);
      const normalizedPapers = papers.map(p => questionPaperMigrationService.normalizePaperContent(p));
      // Sort by updatedAt descending
      return normalizedPapers.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
      console.error("Error fetching teacher question papers:", error);
      throw error;
    }
  }

  async getAllQuestionPapers() {
    try {
      const papers = await MockDB.questionPapers.all();
      const normalizedPapers = papers.map(p => questionPaperMigrationService.normalizePaperContent(p));
      return normalizedPapers.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
      console.error("Error fetching all question papers:", error);
      throw error;
    }
  }

  async getQuestionPaperById(id) {
    try {
      const paper = await MockDB.questionPapers.findById(id);
      return paper ? questionPaperMigrationService.normalizePaperContent(paper) : null;
    } catch (error) {
      console.error("Error fetching question paper by id:", error);
      throw error;
    }
  }

  async saveQuestionPaper(data) {
    try {
      // Data should include teacherId, subjectId, etc. from the UI form
      if (data.id) {
        return await MockDB.questionPapers.update(data.id, data);
      } else {
        return await MockDB.questionPapers.insert(data);
      }
    } catch (error) {
      console.error("Error saving question paper:", error);
      throw error;
    }
  }

  async updateQuestionPaperStatus(id, status, remarks = "") {
    try {
      const updates = { status };
      if (remarks) {
        updates.remarks = remarks;
      }
      return await MockDB.questionPapers.update(id, updates);
    } catch (error) {
      console.error("Error updating question paper status:", error);
      throw error;
    }
  }

  async deleteQuestionPaper(id) {
    try {
      return await MockDB.questionPapers.delete(id);
    } catch (error) {
      console.error("Error deleting question paper:", error);
      throw error;
    }
  }
}

export const questionPaperService = new QuestionPaperService();
