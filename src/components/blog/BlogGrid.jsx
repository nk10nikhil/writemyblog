'use client';

import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function BlogGrid({ blogs }) {
    if (!blogs || blogs.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
            ))}
        </div>
    );
}

const BlogCard = ({ blog }) => {
    const formattedDate = blog.createdAt ? format(new Date(blog.createdAt), 'MMM d, yyyy') : '';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow duration-300">
            {/* Cover image */}
            <Link href={`/blog/${blog._id}`} className="block relative h-48 overflow-hidden">
                <Image
                    src={blog.coverImage || '/images/placeholder-blog.jpg'}
                    alt={blog.title}
                    fill
                    className="object-cover transform hover:scale-105 transition-transform duration-300"
                />
            </Link>

            {/* Content */}
            <div className="p-5">
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                        {blog.title}
                    </h3>
                </Link>

                {/* Summary/Excerpt */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {blog.content
                        ? blog.content.replace(/<[^>]*>/g, '').substring(0, 120) + (blog.content.length > 120 ? '...' : '')
                        : 'No content provided'}
                </p>

                {/* Date and stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div>{formattedDate}</div>

                    <div className="flex items-center space-x-3">
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