'use client';

import { useState } from 'react';
import Link from 'next/link';
import BlogGrid from '@/components/blog/BlogGrid';
import { BookOpenIcon, BookmarkIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function BlogTabs({ blogs, username, isOwnProfile = false }) {
    const [activeTab, setActiveTab] = useState('blogs');

    const tabs = [
        {
            id: 'blogs',
            label: 'Blogs',
            icon: <BookOpenIcon className="h-5 w-5 mr-2" />,
            count: blogs.length,
            condition: true, // Always show
        },
        {
            id: 'liked',
            label: 'Liked',
            icon: <HeartIcon className="h-5 w-5 mr-2" />,
            count: 0, // This would be retrieved from the API
            condition: isOwnProfile, // Only show for own profile
        },
        {
            id: 'bookmarked',
            label: 'Bookmarked',
            icon: <BookmarkIcon className="h-5 w-5 mr-2" />,
            count: 0, // This would be retrieved from the API
            condition: isOwnProfile, // Only show for own profile
        },
    ].filter(tab => tab.condition);

    return (
        <div>
            {/* Tab navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8" aria-label="Blog tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm 
                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
                            onClick={() => setActiveTab(tab.id)}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab content */}
            <div className="mt-6">
                {activeTab === 'blogs' && (
                    <>
                        {blogs.length > 0 ? (
                            <BlogGrid blogs={blogs} />
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No blogs yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    {isOwnProfile
                                        ? "You haven't published any blogs yet."
                                        : `${username} hasn't published any blogs yet.`}
                                </p>

                                {isOwnProfile && (
                                    <Link
                                        href="/blog/create"
                                        className="btn-primary"
                                    >
                                        Create your first blog
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'liked' && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Liked blogs</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Blogs you've liked will appear here.
                        </p>
                    </div>
                )}

                {activeTab === 'bookmarked' && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Bookmarked blogs</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Blogs you've bookmarked will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}