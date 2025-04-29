'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function TagInput({ tags, onChange, placeholder, maxTags = 5 }) {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    // Handle tag removal
    const removeTag = (tagToRemove) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        onChange(newTags);
    };

    // Handle input change
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    // Handle adding a new tag
    const addTag = (tag) => {
        const trimmedTag = tag.trim().toLowerCase();

        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
            const newTags = [...tags, trimmedTag];
            onChange(newTags);
            setInputValue('');
        } else if (trimmedTag && tags.includes(trimmedTag)) {
            // Flash the existing tag
            const tagElement = document.getElementById(`tag-${trimmedTag}`);
            if (tagElement) {
                tagElement.classList.add('animate-flash');
                setTimeout(() => {
                    tagElement.classList.remove('animate-flash');
                }, 1000);
            }
            setInputValue('');
        }
    };

    // Handle key down events
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            // Remove the last tag when backspace is pressed and input is empty
            removeTag(tags[tags.length - 1]);
        }
    };

    // Handle blur event
    const handleBlur = () => {
        setIsFocused(false);
        if (inputValue) {
            addTag(inputValue);
        }
    };

    // Focus the input when clicking on the container
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div
            className={`flex flex-wrap gap-2 p-2 border rounded-md transition-all ${isFocused
                    ? 'border-blue-500 ring-1 ring-blue-500 dark:ring-blue-600'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
            onClick={handleContainerClick}
        >
            {tags.map((tag) => (
                <div
                    key={tag}
                    id={`tag-${tag}`}
                    className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md text-sm"
                >
                    <span>#{tag}</span>
                    <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            ))}

            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                placeholder={tags.length === 0 ? placeholder : tags.length >= maxTags ? 'Max tags reached' : 'Add more tags...'}
                className="flex-grow min-w-[120px] bg-transparent border-none focus:outline-none focus:ring-0 p-1 text-sm"
                disabled={tags.length >= maxTags}
            />
        </div>
    );
}