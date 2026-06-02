import React, { useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  Superscript, Subscript,
  Eraser
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, disabled }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, cmdValue = null) => {
    document.execCommand(command, false, cmdValue);
    handleInput();
    editorRef.current?.focus();
  };

  const ActionButton = ({ icon: Icon, command, title }) => (
    <button
      type="button"
      onClick={() => execCommand(command)}
      disabled={disabled}
      className="p-1.5 md:p-2 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className={`w-full rounded-xl border border-gray-200 overflow-hidden bg-white focus-within:border-[#00b4d8] focus-within:ring-4 focus-within:ring-[#00b4d8]/10 transition-all ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/80 border-b border-gray-200">
        <ActionButton icon={Bold} command="bold" title="Bold" />
        <ActionButton icon={Italic} command="italic" title="Italic" />
        <ActionButton icon={Underline} command="underline" title="Underline" />
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <ActionButton icon={Superscript} command="superscript" title="Superscript" />
        <ActionButton icon={Subscript} command="subscript" title="Subscript" />
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <ActionButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        <ActionButton icon={List} command="insertUnorderedList" title="Bulleted List" />
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <ActionButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
        <ActionButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
        <ActionButton icon={AlignRight} command="justifyRight" title="Align Right" />
        <ActionButton icon={AlignJustify} command="justifyFull" title="Justify" />
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <ActionButton icon={Eraser} command="removeFormat" title="Clear Formatting" />
      </div>
      
      {/* Editable Content */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onBlur={handleInput}
        className="w-full min-h-[16rem] max-h-[32rem] overflow-y-auto p-4 outline-none prose prose-sm max-w-none text-[#03045e] text-sm"
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
};

export default RichTextEditor;
