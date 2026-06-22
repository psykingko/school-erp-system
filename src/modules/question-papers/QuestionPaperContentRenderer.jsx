import React from "react";
import "./QuestionPaperPrintStyles.css";

const QuestionPaperContentRenderer = ({ paperContent, content }) => {
  // 1. Rendering Priority (Source of Truth): Structured Blocks
  if (paperContent?.blocks?.length > 0) {
    return (
      <div className="qp-content qp-structured-content mt-6">
        {paperContent.blocks.map((block, index) => {
          if (block.type === 'metadata') return null; // Ignored for rendering

          switch (block.type) {
            case 'section':
              return (
                <div 
                  key={index} 
                  className="text-center mt-8 mb-4"
                  style={{ 
                    pageBreakBefore: block.pageBreakBefore ? 'always' : 'auto',
                    breakBefore: block.pageBreakBefore ? 'always' : 'auto' 
                  }}
                >
                  <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-black inline-block pb-1">{block.text}</h3>
                </div>
              );
            case 'heading':
              return <h4 key={index} className="text-md font-bold mt-6 mb-2">{block.text}</h4>;
            case 'instruction':
              return <p key={index} className="text-sm italic mb-4">{block.text}</p>;
            case 'question':
              return <p key={index} className="text-sm font-medium mb-3 pl-5 -indent-5">{block.text}</p>;
            case 'paragraph':
            default:
              return <p key={index} className="text-sm mb-2">{block.text}</p>;
          }
        })}
      </div>
    );
  }

  // 2. Fallback: Legacy Rendering
  if (!content) return <div className="qp-content">No content provided.</div>;

  // Simple heuristic to detect if the content string contains HTML tags
  const hasHTML = /<[a-z][\s\S]*>/i.test(content);

  if (hasHTML) {
    // Risk accepted for Phase 1/2 legacy fallback
    return (
      <div 
        className="qp-content" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  return (
    <div className="qp-content">
      {content}
    </div>
  );
};

export default QuestionPaperContentRenderer;
