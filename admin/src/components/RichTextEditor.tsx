'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { LexicalEditor, EditorState, $getSelection, $isRangeSelection } from 'lexical';
import { $getRoot, $insertNodes, $createTextNode, $isParagraphNode } from 'lexical';
import { $isHeadingNode, $createHeadingNode } from '@lexical/rich-text';
import { $isListNode, $createListNode, $createListItemNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode } from 'lexical';
import { COMMAND_PRIORITY_CRITICAL, FORMAT_TEXT_COMMAND } from 'lexical';
import debounce from 'lodash.debounce';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  // Add height prop to allow customization
  height?: string;
}

const theme = {
  text: {
    bold: 'font-bold text-black !important',
    italic: 'italic text-black !important',
    underline: 'underline text-black !important',
    strikethrough: 'line-through text-black !important',
  },
  heading: {
    h2: 'text-2xl font-bold text-black !important',
    h3: 'text-xl font-bold text-black !important',
  },
  paragraph: 'mb-4 text-black',
  list: {
    ul: 'list-disc ml-6 text-black',
    ol: 'list-decimal ml-6 text-black',
  },
  quote: 'text-black',
};

function RichTextEditor({ value, onChange, height = '200px' }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(value);
  const editorRef = useRef<LexicalEditor | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = useCallback(
    debounce((editorState: EditorState, editor: LexicalEditor) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        // Update internal state and immediately trigger onChange
        setInternalValue(htmlString);
        onChange(htmlString);
      });
    }, 500), // Debounce for 500ms
    [onChange]
  );

  const initialConfig = {
    namespace: 'RichTextEditor',
    theme,
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
    ],
    editorState: null, // We'll handle initial content separately
  };

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2 flex-wrap">
          <FormatToolbar />
        </div>
        <div className="relative bg-white">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="px-3 py-2 outline-none text-black" style={{ color: '#000000', minHeight: height }} />
            }
            placeholder={
              <div className="absolute top-2 left-3 text-gray-400 pointer-events-none">
                Enter content...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <InitialContentPlugin html={value} />
        <SyncContentOnValuePlugin html={value} />
        <OnChangePlugin onChange={handleChange} />
        <ListPlugin />
        <LinkPlugin />
        <TextFormatPlugin />
      </LexicalComposer>
      <style jsx global>{`
        .RichTextEditor__contentEditable {
          min-height: ${height};
          color: black !important;
        }
        .RichTextEditor__contentEditable p {
          color: black !important;
        }
        .RichTextEditor__contentEditable ul {
          color: black !important;
        }
        .RichTextEditor__contentEditable ol {
          color: black !important;
        }
        .RichTextEditor__contentEditable li {
          color: black !important;
        }
        .RichTextEditor__contentEditable strong {
          font-weight: bold !important;
        }
        .RichTextEditor__contentEditable b {
          font-weight: bold !important;
        }
      `}</style>
    </div>
  );
}

// Plugin to initialize HTML content (only once on mount)
function InitialContentPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitializedRef = useRef(false);
  
  useEffect(() => {
    // Skip if already initialized
    if (isInitializedRef.current) {
      return;
    }
    
    // Only initialize if we have content
    if (html && html.trim() !== '') {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        const topLevel: any[] = [];
        let textBuffer: any[] = [];
        const flush = () => {
          if (textBuffer.length > 0) {
            const paragraph = $createParagraphNode();
            paragraph.append(...textBuffer);
            topLevel.push(paragraph);
            textBuffer = [];
          }
        };
        for (const n of nodes) {
          if (n.getType && n.getType() === 'text') {
            textBuffer.push(n);
          } else {
            flush();
            topLevel.push(n);
          }
        }
        flush();
        root.append(...topLevel);
      }, { discrete: true });
    }
    
    isInitializedRef.current = true;
  }, [html, editor]);
  
  return null;
}

// Plugin to sync HTML content when value prop updates and editor is empty
function SyncContentOnValuePlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!html || html.trim() === '') return;
    editor.update(() => {
      const root = $getRoot();
      const currentText = root.getTextContent().trim();
      if (!currentText) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        root.clear();
        const topLevel: any[] = [];
        let textBuffer: any[] = [];
        const flush = () => {
          if (textBuffer.length > 0) {
            const paragraph = $createParagraphNode();
            paragraph.append(...textBuffer);
            topLevel.push(paragraph);
            textBuffer = [];
          }
        };
        for (const n of nodes) {
          if (n.getType && n.getType() === 'text') {
            textBuffer.push(n);
          } else {
            flush();
            topLevel.push(n);
          }
        }
        flush();
        root.append(...topLevel);
      }
    }, { discrete: true });
  }, [html, editor]);
  return null;
}

// Plugin to support text formatting commands
function TextFormatPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      FORMAT_TEXT_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        selection.formatText(payload);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  return null;
}

// Format toolbar with full functionality
function FormatToolbar() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<string>('paragraph');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const updateToolbar = () => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text formatting
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root' 
        ? anchorNode 
        : anchorNode.getTopLevelElementOrThrow();

      if ($isHeadingNode(element)) {
        const tag = element.getTag();
        setBlockType(tag); // Set to specific heading tag (h1, h2, etc.)
      } else if ($isListNode(element)) {
        setBlockType('list');
      } else {
        setBlockType('paragraph');
      }
    }
  };

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor]);

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Check if we're already in a heading block
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root' 
          ? anchorNode 
          : anchorNode.getTopLevelElementOrThrow();
        
        if ($isHeadingNode(element) && element.getTag() === 'h2') {
          // If already in h2, convert to paragraph
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          // Otherwise, convert to h2
          $setBlocksType(selection, () => $createHeadingNode('h2'));
        }
      }
    });
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <button 
        className={`px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors ${isBold ? 'bg-amber-100 border-amber-300' : ''}`}
        onClick={formatBold} 
        title="Bold (Ctrl+B)"                      
        style={{ color: 'black' }}
      >
        <strong className="text-black">B</strong>
      </button>
      <button 
        className={`px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors ${isItalic ? 'bg-amber-100 border-amber-300' : ''}`}
        onClick={formatItalic} 
        title="Italic (Ctrl+I)"
        style={{ color: 'black' }}
      >
        <em className="text-black">I</em>
      </button>
      <button 
        className={`px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors ${isUnderline ? 'bg-amber-100 border-amber-300' : ''}`}
        onClick={formatUnderline} 
        title="Underline (Ctrl+U)"
        style={{ color: 'black' }}
      >
        <u className="text-black">U</u>
      </button>
      
      <div className="h-6 w-px bg-gray-300 mx-1"></div>
      
      <button 
        className={`px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors ${blockType === 'h2' ? 'bg-amber-100 border-amber-300' : ''}`}
        onClick={formatHeading}
        title="Heading"
        style={{ color: 'black' }}
      >
        <span className="text-black font-semibold">H</span>
      </button>
      
      <button 
        className={`px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors ${blockType === 'paragraph' ? 'bg-amber-100 border-amber-300' : ''}`}
        onClick={formatParagraph}
        title="Paragraph"
        style={{ color: 'black' }}
      >
        <span className="text-black">¶</span>
      </button>
      
      <div className="h-6 w-px bg-gray-300 mx-1"></div>
      
      <button 
        className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        onClick={formatBulletList}
        title="Bullet List"
        style={{ color: 'black' }}
      >
        <span className="text-black">• List</span>
      </button>
      
      <button 
        className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        onClick={formatNumberedList}
        title="Numbered List"
        style={{ color: 'black' }}
      >
        <span className="text-black">1. List</span>
      </button>
    </div>
  );
}

export default RichTextEditor;
