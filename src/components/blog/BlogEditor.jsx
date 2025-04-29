'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import dynamic from 'next/dynamic';

// Import Quill dynamically with React 19 compatibility
const ReactQuill = dynamic(
  async () => {
    // We need to apply some special handling for React 19 compatibility
    if (typeof window !== 'undefined') {
      // Apply a patch for findDOMNode before importing React Quill
      const originalCreateElement = React.createElement;
      const originalCloneElement = React.cloneElement;

      // Override createElement to add a ref to divs if needed for Quill
      React.createElement = function patchedCreateElement(type, props, ...children) {
        if (type === 'div' && props && props.className &&
          typeof props.className === 'string' &&
          props.className.includes('quill')) {
          props = { ...props, suppressHydrationWarning: true };
        }
        return originalCreateElement.call(React, type, props, ...children);
      };

      // Import React Quill after our patch
      const { default: RQ } = await import('react-quill');

      // Restore original React methods
      React.createElement = originalCreateElement;
      React.cloneElement = originalCloneElement;

      // Create a modern wrapper for React Quill
      return function ModernReactQuill(props) {
        const containerRef = useRef(null);
        const [mounted, setMounted] = useState(false);

        useEffect(() => {
          setMounted(true);
        }, []);

        if (!mounted) {
          return <div ref={containerRef} className="quill-loading">Loading editor...</div>;
        }

        return (
          <div ref={containerRef} className="modern-quill-wrapper">
            <RQ {...props} />
          </div>
        );
      };
    }

    // Fallback for SSR
    return () => <div>Editor loading...</div>;
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
  const editorWrapperRef = useRef(null);

  // Apply theme changes to Quill
  useEffect(() => {
    if (!editorWrapperRef.current) return;

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
  }, [theme]);

  const handleChange = (content) => {
    setEditorValue(content);
    onChange(content);
  };

  return (
    <div className="blog-editor" ref={editorWrapperRef}>
      <style jsx global>{`
        .modern-quill-wrapper {
          border-radius: 0.375rem;
          margin-bottom: 20px;
        }
        
        .ql-container, .ql-toolbar {
          border-radius: 0.375rem;
          border: 1px solid rgb(209, 213, 219);
        }
        
        .ql-container {
          min-height: 350px;
        }
        
        .dark-theme.ql-toolbar {
          border-color: rgb(75, 85, 99);
          background-color: rgb(55, 65, 81);
        }
        
        .dark-theme.ql-container {
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