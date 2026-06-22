import { createWorker } from 'tesseract.js';

/**
 * Question Paper OCR Service
 * Wraps tesseract.js to isolate OCR logic from UI components.
 * Purely handles image-to-text extraction without AI formatting.
 */
class QuestionPaperOCRService {
  constructor() {
    this.worker = null;
  }

  /**
   * Initializes the Tesseract worker if not already running.
   * @param {Function} onProgress - Callback for OCR progress updates.
   */
  async initWorker(onProgress) {
    if (this.worker) return;
    
    // Create a worker configured for English.
    this.worker = await createWorker('eng', 1, {
      logger: m => {
        // Tesseract logger provides status string and progress (0-1)
        if (onProgress && m.status === 'recognizing text') {
          onProgress(m.progress);
        }
      }
    });
  }

  /**
   * Scans an image file and extracts text.
   * @param {File|string} file - The image file or data URL to scan.
   * @param {Function} onProgress - Progress callback.
   * @returns {Promise<{text: string, confidence: number}>} Extracted text and confidence score.
   */
  async scanImage(file, onProgress) {
    try {
      await this.initWorker(onProgress);
      const result = await this.worker.recognize(file);
      
      return {
        text: this.normalizeOCRText(result.data.text),
        confidence: result.data.confidence || 0
      };
    } catch (error) {
      console.error("OCR Scan Failed:", error);
      throw error;
    }
  }

  /**
   * Performs light structural cleanup without AI auto-correction.
   * @param {string} text - The raw OCR text.
   * @returns {string} Normalized text.
   */
  normalizeOCRText(text) {
    if (!text) return "";
    
    return text
      // Normalize Windows/Mac line endings to \n
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Collapse more than 2 consecutive newlines into exactly 2
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Cleans up the Web Worker to prevent memory leaks.
   */
  async terminateWorker() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const questionPaperOCRService = new QuestionPaperOCRService();
