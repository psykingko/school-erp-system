import { questionPaperMigrationService } from "./questionPaperMigrationService";

/**
 * Question Paper Editor Adapter
 * 
 * An isolation layer that ensures the rest of EduDash doesn't tightly couple
 * to Lexical. It translates directly between Lexical JSON State and the canonical 
 * paperContent schema, completely bypassing HTML.
 */
class QuestionPaperEditorAdapter {
  
  /**
   * Helper to extract plain text from a Lexical node tree
   */
  _extractTextFromNode(node) {
    if (node.type === "text") return node.text;
    if (node.children) {
      return node.children.map(c => this._extractTextFromNode(c)).join('');
    }
    return "";
  }

  /**
   * Converts pure Lexical JSON State into canonical paperContent blocks.
   * @param {Object} lexicalStateJSON - The JSON object from Lexical.
   * @returns {Object} Canonical paperContent blocks.
   */
  serializeToCanonical(lexicalStateJSON) {
    if (!lexicalStateJSON || !lexicalStateJSON.root || !lexicalStateJSON.root.children) {
      return { version: 1, blocks: [] };
    }

    const blocks = [];

    lexicalStateJSON.root.children.forEach(node => {
      const text = this._extractTextFromNode(node).trim();
      if (!text) return; // Skip empty paragraphs

      // For Phase 6A (Before Custom Plugins), we fallback to the heuristical approach 
      // but without HTML. In Phase 6B, we will detect node.type === 'question' directly here.
      
      const parsed = questionPaperMigrationService.parseContentToBlocks(text);
      if (parsed.blocks && parsed.blocks.length > 0) {
        blocks.push(...parsed.blocks);
      }
    });

    return { version: 1, blocks };
  }

  /**
   * Converts canonical paperContent structured blocks into a Lexical JSON State.
   * @param {Array} blocks - Array of canonical block objects.
   * @returns {Object} Lexical JSON State.
   */
  deserializeFromCanonical(blocks) {
    if (!blocks || !Array.isArray(blocks)) return {};

    const children = blocks
      .filter(block => block.type !== 'metadata')
      .map(block => {
        // Build a basic Lexical Paragraph Node
        return {
          type: "paragraph",
          version: 1,
          children: [
            {
              type: "text",
              version: 1,
              text: block.text,
              format: (block.type === 'section' || block.type === 'heading') ? 1 : 0 // 1 = bold in Lexical format
            }
          ]
        };
      });

    return {
      root: {
        type: "root",
        version: 1,
        children: children.length > 0 ? children : [{ type: "paragraph", version: 1, children: [] }]
      }
    };
  }
}

export const questionPaperEditorAdapter = new QuestionPaperEditorAdapter();
