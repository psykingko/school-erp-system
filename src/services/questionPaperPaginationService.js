/**
 * Question Paper Pagination Service
 * Provides estimation of pages and generates layout warnings.
 * Note: Does not perform actual page splitting.
 */
class QuestionPaperPaginationService {
  /**
   * Estimates the pagination data and generates warnings.
   * @param {Object} paperContent - The canonical paperContent model.
   * @returns {{ estimatedPages: number, warnings: string[] }}
   */
  estimatePagination(paperContent) {
    const result = {
      estimatedPages: 1,
      warnings: []
    };

    if (!paperContent || !paperContent.blocks || paperContent.blocks.length === 0) {
      return result;
    }

    let currentChars = 0;
    const CHARS_PER_PAGE = 3000; // Rough estimate of chars per A4 page

    paperContent.blocks.forEach((block) => {
      // 1. Check for explicit page breaks
      if (block.pageBreakBefore) {
        result.estimatedPages++;
        currentChars = 0;
      }

      // 2. Add characters to current page
      if (block.text) {
        currentChars += block.text.length;
        
        // Warnings generation
        if (block.type === 'question' && block.text.length > 500) {
          result.warnings.push("Long question detected. May span across pages awkwardly.");
        }
        if (block.type === 'instruction' && block.text.length > 800) {
          result.warnings.push("Large instruction block detected. Consider breaking it down.");
        }
      }

      // 3. Overflow triggers a new page
      if (currentChars > CHARS_PER_PAGE) {
        result.estimatedPages++;
        currentChars = 0;
      }
    });

    if (result.estimatedPages > 5) {
      result.warnings.push(`Estimated to exceed 5 pages (${result.estimatedPages} pages). Check formatting.`);
    }

    return result;
  }
}

export const questionPaperPaginationService = new QuestionPaperPaginationService();
