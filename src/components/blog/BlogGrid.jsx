'use client';

import { useState, useEffect } from 'react';
import BlogCard from './BlogCard';
import BlogCardSkeleton from './BlogCardSkeleton';

export default function BlogGrid({ tag, authorId, initialBlogs = null, limit = 9 }) {
    const [blogs, setBlogs] = useState(initialBlogs || []);
    const [loading, setLoading] = useState(!initialBlogs);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!initialBlogs) {
            fetchBlogs();
        }
    }, [initialBlogs, tag, authorId]);

    const fetchBlogs = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setPage(1);
            setError(null);
        }

        try {
            // Add a small timeout to prevent race conditions
            await new Promise(resolve => setTimeout(resolve, 100));

            const currentPage = isLoadMore ? page + 1 : 1;

            // Build query parameters
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', limit);

            if (tag) params.append('tag', tag);
            if (authorId) params.append('author', authorId);

            const response = await fetch(`/api/blogs?${params.toString()}`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch blogs: ${response.status}`);
            }

            const data = await response.json();

            if (isLoadMore) {
                setBlogs(prev => [...prev, ...(data.blogs || [])]);
                setPage(currentPage);
            } else {
                setBlogs(data.blogs || []);
            }

            // Check if there are more pages only if we have pagination data
            if (data.pagination) {
                setHasMore(data.pagination.currentPage < data.pagination.totalPages);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setError(error.message);
            if (!isLoadMore) {
                // Only reset blogs if this isn't a load more operation
                setBlogs([]);
            }
        } finally {
            if (isLoadMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore) {
            fetchBlogs(true);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <BlogCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                Failed to load blogs. Please try again later.
                <p className="mt-2 text-sm">{error}</p>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-xl font-medium mb-2">No blogs found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                    {tag ? `No blogs tagged with #${tag} yet.` : 'No blogs available at the moment.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                ))}
            </div>

            {hasMore && (
                <div className="text-center pt-4">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="btn-secondary"
                    >
                        {loadingMore ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading more...
                            </>
                        ) : (
                            'Load More'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}