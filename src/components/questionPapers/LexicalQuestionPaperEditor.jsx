import React, { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, UNDO_COMMAND, REDO_COMMAND, CLEAR_EDITOR_COMMAND, $getRoot, $createParagraphNode } from "lexical";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { 
  Bold, Italic, Underline, List as ListIcon, ListOrdered, 
  Superscript, Subscript, AlignLeft, AlignCenter, AlignRight, 
  AlignJustify, Eraser, Undo, Redo 
} from "lucide-react";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

// --- Theme ---
const theme = {
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    subscript: "align-sub text-xs",
    superscript: "align-super text-xs",
  },
  list: {
    ul: "list-disc pl-5 mb-2",
    ol: "list-decimal pl-5 mb-2",
    listitem: "mb-1",
  },
  paragraph: "mb-2",
};

// --- Plugins ---

function ToolbarPlugin({ disabled }) {
  const [editor] = useLexicalComposerContext();
  
  const formatText = (format) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  const formatElement = (format) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  const insertOL = () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  const insertUL = () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  const undo = () => editor.dispatchCommand(UNDO_COMMAND, undefined);
  const redo = () => editor.dispatchCommand(REDO_COMMAND, undefined);
  
  const clearFormatting = () => {
    editor.update(() => {
      // Very basic clear formatting approximation: we clear the editor for now as a placeholder, 
      // full clear formatting requires iterating nodes.
      // We will leave the button to support standard parity.
    });
  };

  const ActionButton = ({ icon: Icon, onClick, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 md:p-2 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/80 border-b border-gray-200">
      <ActionButton icon={Undo} onClick={undo} title="Undo" />
      <ActionButton icon={Redo} onClick={redo} title="Redo" />
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      
      <ActionButton icon={Bold} onClick={() => formatText('bold')} title="Bold" />
      <ActionButton icon={Italic} onClick={() => formatText('italic')} title="Italic" />
      <ActionButton icon={Underline} onClick={() => formatText('underline')} title="Underline" />
      <ActionButton icon={Superscript} onClick={() => formatText('superscript')} title="Superscript" />
      <ActionButton icon={Subscript} onClick={() => formatText('subscript')} title="Subscript" />
      
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      <ActionButton icon={AlignLeft} onClick={() => formatElement('left')} title="Align Left" />
      <ActionButton icon={AlignCenter} onClick={() => formatElement('center')} title="Align Center" />
      <ActionButton icon={AlignRight} onClick={() => formatElement('right')} title="Align Right" />
      <ActionButton icon={AlignJustify} onClick={() => formatElement('justify')} title="Justify" />
      
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      <ActionButton icon={ListOrdered} onClick={insertOL} title="Numbered List" />
      <ActionButton icon={ListIcon} onClick={insertUL} title="Bulleted List" />
    </div>
  );
}

function JSONSyncPlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  
  return (
    <OnChangePlugin onChange={(editorState) => {
      if (onChange) {
        // Emit pure Lexical JSON state (Transient UI State)
        onChange(editorState.toJSON());
      }
    }} />
  );
}

function InitialStatePlugin({ initialJSON }) {
  const [editor] = useLexicalComposerContext();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    if (initialJSON && Object.keys(initialJSON).length > 0) {
      try {
        const editorState = editor.parseEditorState(initialJSON);
        editor.setEditorState(editorState);
      } catch (e) {
        console.error("Failed to parse initial Lexical JSON", e);
      }
    } else {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode());
      });
    }

    setInitialized(true);
  }, [editor, initialJSON, initialized]);

  return null;
}

// --- Main Editor Component ---
const LexicalQuestionPaperEditor = ({ value, onChange, disabled }) => {
  const initialConfig = {
    namespace: "EduDashQuestionPaper",
    theme,
    onError: (error) => console.error("Lexical Error:", error),
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
    ],
    editable: !disabled,
  };

  return (
    <div className={`w-full rounded-xl border border-gray-200 overflow-hidden bg-white focus-within:border-[#00b4d8] focus-within:ring-4 focus-within:ring-[#00b4d8]/10 transition-all ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin disabled={disabled} />
        
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="w-full min-h-[16rem] max-h-[32rem] overflow-y-auto p-4 outline-none prose prose-sm max-w-none text-[#03045e] text-sm" />
            }
            placeholder={<div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-sm">Enter paper content here...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        
        <HistoryPlugin />
        <ListPlugin />
        <JSONSyncPlugin onChange={onChange} />
        <InitialStatePlugin initialJSON={value} />
      </LexicalComposer>
    </div>
  );
};

export default LexicalQuestionPaperEditor;
