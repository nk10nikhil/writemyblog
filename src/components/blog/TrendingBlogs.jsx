'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function TrendingBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTrendingBlogs = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch('/api/blogs/trending');

                if (!response.ok) {
                    throw new Error('Failed to fetch trending blogs');
                }

                const data = await response.json();
                setBlogs(data.data || []);
            } catch (error) {
                console.error('Error fetching trending blogs:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingBlogs();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="card animate-pulse">
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                        <div className="p-4">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                            <div className="mt-4 flex justify-between">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                </div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-red-600 dark:text-red-400 text-center">
                <p>Error loading trending blogs. Please try again later.</p>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400">
                    No trending blogs at the moment.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
                <Link href={`/blog/${blog._id}`} key={blog._id} className="group">
                    <div className="card overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                        <div className="relative h-40 bg-gray-100 dark:bg-gray-800">
                            {blog.coverImage ? (
                                <Image
                                    src={blog.coverImage}
                                    alt={blog.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-gray-400 dark:text-gray-500">No cover image</span>
                                </div>
                            )}
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center">
                                <ChartBarIcon className="h-3 w-3 mr-1" />
                                #{index + 1} Trending
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                {blog.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                {blog.excerpt || "No excerpt available"}
                            </p>
                            <div className="mt-auto flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                    <div className="relative h-6 w-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-2">
                                        {blog.author?.avatar && (
                                            <Image
                                                src={blog.author.avatar}
                                                alt={blog.author.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {blog.author?.name || "Anonymous"}
                                    </span>
                                </div>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {blog.createdAt ? formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true }) : "Unknown date"}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}