'use client';

import { useState, useEffect } from 'react';
import BlogCard from './BlogCard';
import BlogCardSkeleton from './BlogCardSkeleton';

export default function FeaturedBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchFeaturedBlogs() {
            try {
                setLoading(true);
                // Add a small timeout to prevent race conditions
                await new Promise(resolve => setTimeout(resolve, 100));

                // Add a timestamp to prevent caching issues
                const response = await fetch(`/api/blogs/featured?t=${Date.now()}`, {
                    // Add cache control to prevent stale data
                    cache: 'no-store'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch featured blogs');
                }

                const data = await response.json();
                setBlogs(data.blogs || []);
            } catch (err) {
                console.error('Error fetching featured blogs:', err);
                setError(err.message);
                // Always set blogs to an empty array to prevent UI issues
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        }

        fetchFeaturedBlogs();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <BlogCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                Failed to load featured blogs. Please try again later.
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 text-center rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                    No featured blogs available right now.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
            ))}
        </div>
    );
}