'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TagIcon } from '@heroicons/react/24/outline';

export default function PopularTags({ limit = 10 }) {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);
            setError('');

            try {
                // Add timestamp to prevent caching issues
                const response = await fetch(`/api/tags/popular?limit=${limit}&t=${Date.now()}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch popular tags');
                }

                const result = await response.json();
                // We updated the API to always return data array, even if empty
                setTags(result.data || []);
            } catch (error) {
                console.error('Error fetching popular tags:', error);
                setError(error.message);
                // Set empty tags array to prevent UI issues
                setTags([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, [limit]);

    if (loading) {
        return (
            <div className="space-y-3 animate-pulse">
                {[...Array(limit)].map((_, index) => (
                    <div key={index} className="flex items-center">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="ml-auto h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <p className="text-red-600 dark:text-red-400 text-center text-sm">
                Failed to load popular tags
            </p>
        );
    }

    if (tags.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-400 text-center">
                No tags found
            </p>
        );
    }

    return (
        <ul className="space-y-3">
            {tags.map((tag) => (
                <li key={tag.name} className="flex items-center">
                    <Link
                        href={`/search?tag=${encodeURIComponent(tag.name)}`}
                        className="flex items-center flex-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                            <TagIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <span className="font-medium">#{tag.name}</span>
                        <span className="ml-auto text-gray-500 dark:text-gray-400 text-sm">
                            {tag.count}
                        </span>
                    </Link>
                </li>
            ))}
            <li className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link
                    href="/explore/tags"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                    View all tags
                </Link>
            </li>
        </ul>
    );
}