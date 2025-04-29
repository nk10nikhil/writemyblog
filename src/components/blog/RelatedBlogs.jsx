'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

export default function RelatedBlogs({ currentBlogId, tags = [], authorId }) {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRelatedBlogs = async () => {
            setLoading(true);
            setError('');

            try {
                const params = new URLSearchParams();
                params.append('exclude', currentBlogId);

                if (tags && tags.length > 0) {
                    params.append('tags', tags.join(','));
                }

                if (authorId) {
                    params.append('author', authorId);
                }

                params.append('limit', 3);

                const response = await fetch(`/api/blogs/related?${params.toString()}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch related blogs');
                }

                const data = await response.json();
                setBlogs(data.blogs);
            } catch (error) {
                console.error('Error fetching related blogs:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedBlogs();
    }, [currentBlogId, tags, authorId]);

    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Related Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-200 dark:bg-gray-700 h-40 rounded-lg mb-3"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return null; // Don't show any error, just don't display related blogs
    }

    if (blogs.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <Link key={blog._id} href={`/blog/${blog._id}`} className="group">
                        <article className="card overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-800">
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
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-medium mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {blog.title}
                                </h3>
                                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                                    <span>{blog.author.name}</span>
                                    <span>
                                        {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </div>
    );
}