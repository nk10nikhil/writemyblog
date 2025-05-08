'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function BlogList({ blogs }) {
    if (!blogs || blogs.length === 0) {
        return null;
    }

    return (
        <div className="space-y-8">
            {blogs.map(blog => (
                <BlogListItem key={blog._id} blog={blog} />
            ))}
        </div>
    );
}

const BlogListItem = ({ blog }) => {
    const formattedDate = blog.createdAt ? format(new Date(blog.createdAt), 'MMM d, yyyy') : '';

    return (
        <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow duration-300 p-4">
            {/* Cover image */}
            <Link href={`/blog/${blog._id}`} className="block relative h-48 md:h-auto md:w-60 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                    src={blog.coverImage || '/images/placeholder-blog.jpg'}
                    alt={blog.title}
                    fill
                    className="object-cover transform hover:scale-105 transition-transform duration-300"
                />
            </Link>

            {/* Content */}
            <div className="flex-grow">
                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap mb-2">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                            <Link
                                key={index}
                                href={`/tags/${tag}`}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-1 mr-2 mb-2"
                            >
                                #{tag}
                            </Link>
                        ))}
                        {blog.tags.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 px-1 py-1">
                                +{blog.tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Title */}
                <Link href={`/blog/${blog._id}`}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {blog.title}
                    </h3>
                </Link>

                {/* Summary/Excerpt */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {blog.content
                        ? blog.content.replace(/<[^>]*>/g, '').substring(0, 180) + (blog.content.length > 180 ? '...' : '')
                        : 'No content provided'}
                </p>

                {/* Author and date */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {blog.author && (
                            <Link href={`/profile/${blog.author.username}`} className="flex items-center group">
                                <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
                                    <Image
                                        src={blog.author.avatar || '/images/placeholder-blog.jpg'}
                                        alt={blog.author.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {blog.author.name}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 mx-2">•</span>
                                    <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            <span>{blog.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center">
                            <HeartIcon className="h-4 w-4 mr-1" />
                            <span>{blog.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center">
                            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                            <span>{blog.commentCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};