'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import dynamic from 'next/dynamic';

// Import Quill with SSR disabled
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="quill-loading p-4 border rounded-md">Loading editor...</div>
});

// Quill modules configuration
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

// Quill formats configuration
const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'script',
  'indent', 'direction',
  'size',
  'color', 'background',
  'font',
  'align',
  'link', 'image', 'video',
];

export default function BlogEditor({ value, onChange }) {
  const { theme } = useTheme();
  const [editorValue, setEditorValue] = useState(value || '');
  const editorWrapperRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted state on client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme changes to Quill
  useEffect(() => {
    if (!editorWrapperRef.current || !mounted) return;

    const wrapper = editorWrapperRef.current;
    const editor = wrapper.querySelector('.ql-container');
    const toolbar = wrapper.querySelector('.ql-toolbar');

    if (editor && toolbar) {
      if (theme === 'dark') {
        editor.classList.add('dark-theme');
        toolbar.classList.add('dark-theme');
      } else {
        editor.classList.remove('dark-theme');
        toolbar.classList.remove('dark-theme');
      }
    }
  }, [theme, mounted]);

  const handleChange = (content) => {
    setEditorValue(content);
    onChange(content);
  };

  return (
    <div className="blog-editor" ref={editorWrapperRef}>
      <style jsx global>{`
        .blog-editor .ql-container, .blog-editor .ql-toolbar {
          border-radius: 0.375rem;
          border: 1px solid rgb(209, 213, 219);
        }
        
        .blog-editor .ql-container {
          min-height: 350px;
        }
        
        .blog-editor .dark-theme.ql-toolbar {
          border-color: rgb(75, 85, 99);
          background-color: rgb(55, 65, 81);
        }
        
        .blog-editor .dark-theme.ql-container {
          border-color: rgb(75, 85, 99);
          background-color: rgb(31, 41, 55);
          color: rgb(229, 231, 235);
        }
        
        .blog-editor .dark-theme .ql-editor.ql-blank::before {
          color: rgb(156, 163, 175);
        }
        
        .blog-editor .dark-theme .ql-picker {
          color: rgb(229, 231, 235);
        }
        
        .blog-editor .dark-theme .ql-stroke {
          stroke: rgb(229, 231, 235);
        }
        
        .blog-editor .dark-theme .ql-fill {
          fill: rgb(229, 231, 235);
        }
        
        .blog-editor .dark-theme .ql-picker-options {
          background-color: rgb(55, 65, 81);
        }
        
        .blog-editor .dark-theme .ql-tooltip {
          background-color: rgb(55, 65, 81);
          color: rgb(229, 231, 235);
          border-color: rgb(75, 85, 99);
        }
        
        .blog-editor .dark-theme .ql-tooltip input[type=text] {
          background-color: rgb(31, 41, 55);
          color: rgb(229, 231, 235);
          border-color: rgb(75, 85, 99);
        }
      `}</style>
      {mounted && (
        <ReactQuill
          theme="snow"
          modules={modules}
          formats={formats}
          value={editorValue}
          onChange={handleChange}
          placeholder="Write your blog content here..."
        />
      )}
    </div>
  );
}