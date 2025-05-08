'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import dynamic from 'next/dynamic';

// Dynamically import TipTap editor with SSR disabled
const TipTapEditor = dynamic(
  async () => {
    const { useEditor, EditorContent } = await import('@tiptap/react');
    const StarterKit = await import('@tiptap/starter-kit').then(mod => mod.default);
    const Link = await import('@tiptap/extension-link').then(mod => mod.default);

    // Return the editor component
    return function TipTapEditorComponent({ value, onChange }) {
      const editor = useEditor({
        extensions: [
          StarterKit,
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              class: 'text-blue-500 underline',
            },
          }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
          onChange(editor.getHTML());
        },
      });

      // Show toolbar
      return (
        <div className="tiptap-editor border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
          <div className="tiptap-toolbar flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Italic"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="4" x2="10" y2="4"></line>
                <line x1="14" y1="20" x2="5" y2="20"></line>
                <line x1="15" y1="4" x2="9" y2="20"></line>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded ${editor?.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                <line x1="4" y1="21" x2="20" y2="21"></line>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={`p-1 rounded ${editor?.isActive('strike') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Strike"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <path d="M17.5 6.5C15.5 3.5 12.5 3 10 3c-2.5 0-5 1-7 3"></path>
                <path d="M10 21c2.5 0 5-1 7-3"></path>
              </svg>
            </button>
            <div className="border-r border-gray-300 dark:border-gray-700 mx-1 h-8"></div>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Heading 1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h8"></path>
                <path d="M4 18V6"></path>
                <path d="M12 18V6"></path>
                <path d="M15 16l4 2"></path>
                <path d="M15 14l4-2"></path>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Heading 2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h8"></path>
                <path d="M4 18V6"></path>
                <path d="M12 18V6"></path>
                <path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"></path>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-1 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Heading 3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h8"></path>
                <path d="M4 18V6"></path>
                <path d="M12 18V6"></path>
                <path d="M17 10h4"></path>
                <path d="M21 14h-4c0 3 4 2 4 6"></path>
              </svg>
            </button>
            <div className="border-r border-gray-300 dark:border-gray-700 mx-1 h-8"></div>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Bullet List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="9" y1="6" x2="20" y2="6"></line>
                <line x1="9" y1="12" x2="20" y2="12"></line>
                <line x1="9" y1="18" x2="20" y2="18"></line>
                <line x1="5" y1="6" x2="5" y2="6"></line>
                <line x1="5" y1="12" x2="5" y2="12"></line>
                <line x1="5" y1="18" x2="5" y2="18"></line>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-1 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Ordered List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" y1="6" x2="21" y2="6"></line>
                <line x1="10" y1="12" x2="21" y2="12"></line>
                <line x1="10" y1="18" x2="21" y2="18"></line>
                <path d="M4 6h1v4"></path>
                <path d="M4 10h2"></path>
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const url = window.prompt('Enter URL');
                if (url) {
                  editor?.chain().focus().setLink({ href: url }).run();
                }
              }}
              className={`p-1 rounded ${editor?.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
          </div>
          <EditorContent editor={editor} className="prose dark:prose-invert max-w-none p-4 min-h-[300px] bg-white dark:bg-gray-900" />
        </div>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="editor-loading p-4 border rounded-md min-h-[350px] flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent dark:border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading editor...</p>
        </div>
      </div>
    )
  }
);

export default function BlogEditor({ value, onChange }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted state on client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper tips for the editor
  const EditorTips = () => (
    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm p-3 rounded-md mt-3">
      <h4 className="font-medium mb-1">Editor Tips:</h4>
      <ul className="list-disc pl-4 space-y-1">
        <li>Use <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs">Ctrl+B</kbd> for bold, <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs">Ctrl+I</kbd> for italic</li>
        <li>Select text and click the link button to add a hyperlink</li>
        <li>Use headings to organize your content for better readability</li>
        <li>Use bullet points or numbered lists for structured content</li>
      </ul>
    </div>
  );

  if (!mounted) {
    return (
      <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800 min-h-[350px] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent dark:border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="blog-editor space-y-1">
      <TipTapEditor value={value} onChange={onChange} />
      <EditorTips />
    </div>
  );
}