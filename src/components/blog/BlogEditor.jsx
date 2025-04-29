'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import dynamic from 'next/dynamic';

// Import Quill dynamically
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    // We now import the CSS in globals.css instead
    return RQ;
  },
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

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
  const editorRef = useRef(null);

  // Apply theme changes to Quill
  useEffect(() => {
    if (editorRef.current) {
      const editor = document.querySelector('.quill');
      if (editor) {
        if (theme === 'dark') {
          editor.classList.add('dark-theme');
        } else {
          editor.classList.remove('dark-theme');
        }
      }
    }
  }, [theme, editorRef]);

  const handleChange = (content) => {
    setEditorValue(content);
    onChange(content);
  };

  // Custom styles for the editor
  const editorStyle = {
    height: '350px',
    marginBottom: '20px',
  };

  return (
    <div className="blog-editor">
      <style jsx global>{`
        .quill {
          border-radius: 0.375rem;
          border: 1px solid rgb(209, 213, 219);
        }
        
        .dark-theme .ql-toolbar {
          border-color: rgb(75, 85, 99);
          background-color: rgb(55, 65, 81);
        }
        
        .dark-theme .ql-container {
          border-color: rgb(75, 85, 99);
          background-color: rgb(31, 41, 55);
          color: rgb(229, 231, 235);
        }
        
        .dark-theme .ql-editor.ql-blank::before {
          color: rgb(156, 163, 175);
        }
        
        .dark-theme .ql-picker {
          color: rgb(229, 231, 235);
        }
        
        .dark-theme .ql-stroke {
          stroke: rgb(229, 231, 235);
        }
        
        .dark-theme .ql-fill {
          fill: rgb(229, 231, 235);
        }
        
        .dark-theme .ql-picker-options {
          background-color: rgb(55, 65, 81);
        }
        
        .dark-theme .ql-tooltip {
          background-color: rgb(55, 65, 81);
          color: rgb(229, 231, 235);
          border-color: rgb(75, 85, 99);
        }
        
        .dark-theme .ql-tooltip input[type=text] {
          background-color: rgb(31, 41, 55);
          color: rgb(229, 231, 235);
          border-color: rgb(75, 85, 99);
        }
      `}</style>
      {typeof window !== 'undefined' && (
        <ReactQuill
          ref={editorRef}
          theme="snow"
          modules={modules}
          formats={formats}
          value={editorValue}
          onChange={handleChange}
          style={editorStyle}
          placeholder="Write your blog content here..."
        />
      )}
    </div>
  );
}