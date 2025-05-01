import Link from 'next/link';
import React from 'react';

/**
 * BlogTags component displays a list of tags for a blog post
 * @param {Object} props
 * @param {Array<string>} props.tags - Array of tag names
 * @param {string} [props.size="md"] - Size of the tags: "sm", "md", or "lg"
 */
export default function BlogTags({ tags, size = "md" }) {
    if (!tags || tags.length === 0) {
        return null;
    }

    // Determine classes based on size
    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5"
    };

    const baseClasses = "inline-block rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors";
    const tagClass = `${baseClasses} ${sizeClasses[size] || sizeClasses.md} mr-2 mb-2`;

    return (
        <div className="flex flex-wrap">
            {tags.map((tag, index) => (
                <Link
                    href={`/search?tag=${encodeURIComponent(tag)}`}
                    key={index}
                    className={tagClass}
                >
                    #{tag}
                </Link>
            ))}
        </div>
    );
}