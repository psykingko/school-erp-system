/**
 * Question Paper Migration Service
 * Handles the transition between unstructured legacy content and the new structured paperContent schema.
 */

const SUPPORTED_BLOCKS = ["paragraph", "heading", "question", "section", "instruction", "metadata"];

const processPlainText = (text) => {
  const blocks = [];
  const lines = text.split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Very basic heuristic classification for legacy plain text
    if (trimmed.toUpperCase().startsWith('SECTION')) {
      blocks.push({ type: 'section', text: trimmed });
    } else if (trimmed.toUpperCase().includes('INSTRUCTION') || trimmed.match(/^[0-9]+\.\s+(All|Read|The)/i)) {
      blocks.push({ type: 'instruction', text: trimmed });
    } else if (trimmed.match(/^Q[0-9]+/) || trimmed.match(/^[0-9]+\./)) {
      // Extract optional marks from the end if formatted like (2 Marks) or [5]
      const marksMatch = trimmed.match(/\(([0-9]+)\s*Marks?\)$/i) || trimmed.match(/\[([0-9]+)\]$/);
      const marks = marksMatch ? parseInt(marksMatch[1], 10) : null;
      let textWithoutMarks = trimmed;
      if (marksMatch) {
        textWithoutMarks = trimmed.substring(0, marksMatch.index).trim();
      }
      blocks.push({ type: 'question', text: textWithoutMarks, marks });
    } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 50 && trimmed.length > 3) {
      blocks.push({ type: 'heading', text: trimmed });
    } else {
      blocks.push({ type: 'paragraph', text: trimmed });
    }
  });

  return { version: 1, blocks };
};

export const questionPaperMigrationService = {
  /**
   * Parses unstructured content (plain text, HTML, or future OCR) into structured blocks.
   * @param {string} content - The legacy string content.
   * @returns {Object} Structured paperContent object.
   */
  parseContentToBlocks: (content) => {
    if (!content || typeof content !== 'string') {
      return { version: 1, blocks: [] };
    }

    const hasHTML = /<[a-z][\s\S]*>/i.test(content);

    if (hasHTML) {
      // Basic HTML-to-text approximation to preserve lines
      let cleanText = content
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<[^>]+>/g, '') // Strip remaining tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      
      return processPlainText(cleanText);
    }

    return processPlainText(content);
  },

  /**
   * Converts structured blocks back into a legacy HTML string suitable for RichTextEditor.
   * @param {Array} blocks - Array of structured block objects.
   * @returns {string} HTML string.
   */
  convertBlocksToLegacyText: (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return "";

    return blocks
      .filter(block => block.type !== 'metadata')
      .map(block => {
        const safeText = block.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        switch (block.type) {
          case 'section':
          case 'heading':
            return `<h3><strong>${safeText}</strong></h3>`;
          case 'instruction':
            return `<p><em>${safeText}</em></p>`;
          case 'question':
          case 'paragraph':
          default:
            return `<p>${safeText}</p>`;
        }
      }).join('');
  },

  /**
   * Validates a paperContent structure. Fails gracefully.
   * @param {Object} paperContent 
   * @returns {boolean} True if valid.
   */
  validatePaperContent: (paperContent) => {
    if (!paperContent) return false;
    if (paperContent.version !== 1) return false;
    if (!Array.isArray(paperContent.blocks)) return false;

    // Ensure all blocks are valid types and text is string (or key/value for metadata)
    const allValid = paperContent.blocks.every(block => {
      if (!SUPPORTED_BLOCKS.includes(block.type)) return false;
      if (block.type === 'metadata') {
        // Updated formal metadata schema for Phase 7
        return typeof block.examName === 'string' || typeof block.key === 'string';
      }
      
      if (typeof block.text !== 'string') return false;
      
      if (block.type === 'question' && block.marks !== undefined && block.marks !== null) {
        if (typeof block.marks !== 'number') return false;
      }
      
      return true;
    });

    return allValid;
  },

  /**
   * Lazy Migration: Ensures the paper has a valid paperContent object.
   * Generates it from `content` if it is missing or invalid.
   * @param {Object} paper - The legacy Question Paper object.
   * @returns {Object} A new paper object with normalized `paperContent`.
   */
  normalizePaperContent: (paper) => {
    if (!paper) return null;

    const normalized = { ...paper };

    // If paperContent doesn't exist or is invalid, generate it dynamically
    if (!normalized.paperContent || !questionPaperMigrationService.validatePaperContent(normalized.paperContent)) {
      if (normalized.content) {
        normalized.paperContent = questionPaperMigrationService.parseContentToBlocks(normalized.content);
      } else {
        normalized.paperContent = { version: 1, blocks: [] };
      }
    }

    return normalized;
  }
};
