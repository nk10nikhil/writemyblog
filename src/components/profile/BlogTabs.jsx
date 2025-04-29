'use client';

import { useState, useEffect } from 'react';
import BlogList from '@/components/blog/BlogList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function BlogTabs({ userId, privacyFilter, isOwnProfile }) {
    const [activeTab, setActiveTab] = useState('posts');
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [privacyFilterExpanded, setPrivacyFilterExpanded] = useState(false);
    const [selectedPrivacy, setSelectedPrivacy] = useState(isOwnProfile ? 'all' : 'public');

    const fetchBlogs = async (reset = false) => {
        const newPage = reset ? 1 : page;
        setLoading(true);
        setError(null);

        try {
            // Build the query string
            let queryParams = new URLSearchParams({
                author: userId,
                page: newPage,
                limit: 10,
            });

            // Add privacy filter if not "all"
            if (selectedPrivacy !== 'all') {
                queryParams.append('privacy', selectedPrivacy);
            }

            // Add more filters based on active tab
            if (activeTab === 'trending') {
                queryParams.append('sort', '-likes');
            }

            // Fetch the blogs
            const response = await fetch(`/api/blogs?${queryParams}`);

            if (!response.ok) {
                throw new Error('Failed to fetch blogs');
            }

            const data = await response.json();

            if (reset) {
                setBlogs(data.blogs);
            } else {
                setBlogs(prev => [...prev, ...data.blogs]);
            }

            setHasMore(newPage < data.pagination.totalPages);
            setPage(newPage + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch blogs when tab or privacy filter changes
    useEffect(() => {
        fetchBlogs(true);
    }, [activeTab, selectedPrivacy, userId]);

    const handleLoadMore = () => {
        fetchBlogs();
    };

    const handleTabChange = (value) => {
        setActiveTab(value);
        setPage(1);
    };

    const handlePrivacyChange = (privacy) => {
        setSelectedPrivacy(privacy);
        setPrivacyFilterExpanded(false);
    };

    // Get the tab content
    const renderContent = () => {
        if (error) {
            return (
                <div className="text-center py-10">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => fetchBlogs(true)}
                        className="btn-secondary"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (blogs.length === 0 && !loading) {
            return (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">
                        {activeTab === 'posts'
                            ? 'No posts found.'
                            : activeTab === 'trending'
                                ? 'No trending posts found.'
                                : 'No saved posts found.'}
                    </p>
                </div>
            );
        }

        return (
            <>
                <BlogList blogs={blogs} />

                {hasMore && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="btn-secondary"
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
                    <TabsList>
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="trending">Trending</TabsTrigger>
                        {isOwnProfile && (
                            <TabsTrigger value="saved">Saved</TabsTrigger>
                        )}
                    </TabsList>
                </Tabs>

                {isOwnProfile && (
                    <div className="relative mt-4 sm:mt-0">
                        <button
                            onClick={() => setPrivacyFilterExpanded(!privacyFilterExpanded)}
                            className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                        >
                            <span>Show: {selectedPrivacy.charAt(0).toUpperCase() + selectedPrivacy.slice(1)}</span>
                            <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </button>

                        {privacyFilterExpanded && (
                            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                                <ul>
                                    <li>
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                            onClick={() => handlePrivacyChange('all')}
                                        >
                                            All
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                            onClick={() => handlePrivacyChange('public')}
                                        >
                                            Public
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                            onClick={() => handlePrivacyChange('followers')}
                                        >
                                            Followers
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                            onClick={() => handlePrivacyChange('connections')}
                                        >
                                            Connections
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                            onClick={() => handlePrivacyChange('private')}
                                        >
                                            Private
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div>
                {loading && blogs.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    renderContent()
                )}
            </div>
        </div>
    );
}