'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import BlogList from '@/components/blog/BlogList';
import UserCard from '@/components/profile/UserCard';
import Link from 'next/link';

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialType = searchParams.get('type') || 'blogs';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [searchType, setSearchType] = useState(initialType);
    const [results, setResults] = useState({ blogs: [], tags: [], users: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalResults: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    // Update search when query changes
    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery, initialType, 1);
        }
    }, [initialQuery, initialType]);

    const performSearch = async (query, type, pageNum) => {
        if (!query || query.length < 2) {
            setResults({ blogs: [], tags: [], users: [] });
            setPagination({
                totalResults: 0,
                totalPages: 0,
                currentPage: 1,
                limit: 10
            });
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(
                `/api/search?q=${encodeURIComponent(query)}&type=${type}&page=${pageNum}&limit=10`
            );

            if (!response.ok) {
                throw new Error('Search failed. Please try again.');
            }

            const data = await response.json();

            if (data.success) {
                setResults({
                    blogs: data.blogs || [],
                    tags: data.tags || [],
                    users: data.users || []
                });
                setPagination(data.pagination || {
                    totalResults: 0,
                    totalPages: 0,
                    currentPage: pageNum,
                    limit: 10
                });
            } else {
                throw new Error(data.message || 'Search failed. Please try again.');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        // Update URL
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (searchType !== 'blogs') params.set('type', searchType);

        router.push(`/search?${params.toString()}`);

        // Perform the search
        performSearch(searchQuery, searchType, 1);
        setPage(1);
    };

    const handleTypeChange = (type) => {
        setSearchType(type);

        // Update URL and search results
        if (searchQuery) {
            const params = new URLSearchParams();
            params.set('q', searchQuery);
            if (type !== 'blogs') params.set('type', type);

            router.push(`/search?${params.toString()}`);
            performSearch(searchQuery, type, 1);
            setPage(1);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        performSearch(searchQuery, searchType, newPage);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        router.push('/search');
    };

    // Function to generate pagination controls
    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const pageNumbers = [];
        const maxPagesToShow = 5;

        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1 rounded-md border text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700
                    disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Previous
                    </button>

                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => handlePageChange(1)}
                                className="px-3 py-1 rounded-md border text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                1
                            </button>
                            {startPage > 2 && (
                                <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                            )}
                        </>
                    )}

                    {pageNumbers.map(num => (
                        <button
                            key={num}
                            onClick={() => handlePageChange(num)}
                            className={`px-3 py-1 rounded-md border 
                ${pagination.currentPage === num
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            {num}
                        </button>
                    ))}

                    {endPage < pagination.totalPages && (
                        <>
                            {endPage < pagination.totalPages - 1 && (
                                <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                            )}
                            <button
                                onClick={() => handlePageChange(pagination.totalPages)}
                                className="px-3 py-1 rounded-md border text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                {pagination.totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-1 rounded-md border text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700
                    disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Search</h1>

            {/* Search form */}
            <div className="mb-8">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800
                       focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search blogs, tags, or users..."
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="btn-primary py-2 px-6"
                        disabled={!searchQuery || searchQuery.length < 2}
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Search type tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => handleTypeChange('blogs')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${searchType === 'blogs'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Blogs
                    </button>
                    <button
                        onClick={() => handleTypeChange('tags')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${searchType === 'tags'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Tags
                    </button>
                    <button
                        onClick={() => handleTypeChange('users')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${searchType === 'users'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Users
                    </button>
                </nav>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="flex justify-center my-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md p-4 mb-6">
                    {error}
                </div>
            )}

            {/* Search results */}
            {!isLoading && !error && searchQuery && (
                <div>
                    {/* Result count */}
                    {pagination.totalResults > 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Found {pagination.totalResults} results for &quot;{searchQuery}&quot;
                        </p>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No results found</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                We couldn&apos;t find any matching results for &quot;{searchQuery}&quot;
                            </p>
                        </div>
                    )}

                    {/* Blog results */}
                    {searchType === 'blogs' && results.blogs.length > 0 && (
                        <div>
                            <BlogList blogs={results.blogs} />
                            {renderPagination()}
                        </div>
                    )}

                    {/* Tags results */}
                    {searchType === 'tags' && results.tags.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                {results.tags.map((tag) => (
                                    <Link
                                        key={tag}
                                        href={`/tags/${tag}`}
                                        className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                            {renderPagination()}
                        </div>
                    )}

                    {/* User results */}
                    {searchType === 'users' && results.users.length > 0 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.users.map((user) => (
                                    <UserCard key={user._id} user={user} />
                                ))}
                            </div>
                            {renderPagination()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}