'use client';

import { useEffect, useState } from 'react';
import BlogCard from '../blog/BlogCard';
import ProfileCard from '../profile/ProfileCard';
import { TagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchResults({ query, type, tag }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        // Reset state when search changes
        setResults([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);
        setError(null);

        fetchResults();
    }, [query, type, tag]);

    const fetchResults = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const currentPage = isLoadMore ? page + 1 : 1;

            // Build query parameters
            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (tag) params.append('tag', tag);
            params.append('page', currentPage);
            params.append('limit', 10);

            // Get endpoint based on type
            let endpoint = '/api/search';
            if (type === 'blogs') endpoint = '/api/search/blogs';
            if (type === 'people') endpoint = '/api/search/people';
            if (type === 'tags') endpoint = '/api/search/tags';

            const response = await fetch(`${endpoint}?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error fetching search results');
            }

            if (isLoadMore) {
                setResults(prev => [...prev, ...data.results]);
                setPage(currentPage);
            } else {
                setResults(data.results);
            }

            setHasMore(data.pagination?.hasMore || false);
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message || 'Failed to fetch results');
        } finally {
            if (isLoadMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchResults(true);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-400">
                <p>Error: {error}</p>
                <button
                    onClick={() => fetchResults()}
                    className="mt-2 text-sm underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
                <h3 className="mt-4 text-xl font-medium">No results found</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {query
                        ? `We couldn't find any ${type} matching "${query}"`
                        : tag
                            ? `No ${type} found with tag #${tag}`
                            : 'Try a different search term or filter'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {type === 'blogs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map(blog => (
                        <BlogCard key={blog._id} blog={blog} />
                    ))}
                </div>
            )}

            {type === 'people' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.map(user => (
                        <Link
                            key={user._id}
                            href={`/profile/${user.username}`}
                            className="card p-4 flex space-x-4 hover:shadow-md transition-shadow"
                        >
                            <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                    src={user.avatar || '/images/default-avatar.png'}
                                    alt={user.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium">{user.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                                {user.bio && (
                                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                        {user.bio}
                                    </p>
                                )}
                                <div className="mt-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {user.followers} followers · {user.posts} posts
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {type === 'tags' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map(tag => (
                        <Link
                            key={tag.name}
                            href={`/search?tag=${encodeURIComponent(tag.name)}`}
                            className="card p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                    <TagIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-medium text-lg">#{tag.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {tag.count} {tag.count === 1 ? 'post' : 'posts'}
                            </p>
                            {tag.example && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Popular post:</span>
                                    <p className="text-sm font-medium mt-1 line-clamp-1">{tag.example}</p>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}

            {hasMore && (
                <div className="text-center pt-6">
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