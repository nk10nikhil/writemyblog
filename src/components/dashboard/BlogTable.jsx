'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    ChartBarIcon,
    ChatBubbleLeftIcon,
    HeartIcon
} from '@heroicons/react/24/outline';

export default function BlogTable({ blogs }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(null);

    if (!blogs || blogs.length === 0) {
        return (
            <div className="card p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No blogs found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    You don't have any blogs yet. Start writing your first blog post!
                </p>
                <Link href="/blog/create" className="btn-primary inline-block">
                    Create New Blog
                </Link>
            </div>
        );
    }

    const handleDelete = async (blogId) => {
        if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
            return;
        }

        setDeleting(blogId);

        try {
            const response = await fetch(`/api/blogs/${blogId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete blog');
            }

            // Refresh the page to update the list
            router.refresh();
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Failed to delete blog');
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Function to get privacy badge
    const getPrivacyBadge = (privacy) => {
        switch (privacy) {
            case 'public':
                return (
                    <span className="flex items-center text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1">
                        <EyeIcon className="w-3 h-3 mr-1" />
                        Public
                    </span>
                );
            case 'followers':
                return (
                    <span className="flex items-center text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1">
                        <UserGroupIcon className="w-3 h-3 mr-1" />
                        Followers
                    </span>
                );
            case 'connections':
                return (
                    <span className="flex items-center text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1">
                        <UsersIcon className="w-3 h-3 mr-1" />
                        Connections
                    </span>
                );
            case 'private':
                return (
                    <span className="flex items-center text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 px-2 py-1">
                        <EyeSlashIcon className="w-3 h-3 mr-1" />
                        Private
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Blog
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Stats
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {blogs.map((blog) => (
                        <tr key={blog._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 relative bg-gray-200 dark:bg-gray-800 rounded">
                                        {blog.coverImage && (
                                            <Image
                                                src={blog.coverImage}
                                                alt={blog.title}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        )}
                                    </div>
                                    <div className="ml-4 max-w-xs">
                                        <Link href={`/blog/${blog._id}`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline">
                                            {blog.title.length > 50 ? `${blog.title.substring(0, 50)}...` : blog.title}
                                        </Link>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {blog.tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="inline-block mr-2">#{tag}</span>
                                            ))}
                                            {blog.tags.length > 3 && <span>+{blog.tags.length - 3}</span>}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-3 text-sm text-gray-600 dark:text-gray-400">
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
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(blog.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                    {getPrivacyBadge(blog.privacy)}
                                    {blog.status === 'draft' && (
                                        <span className="flex items-center text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1">
                                            Draft
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={`/blog/${blog._id}`}
                                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                                        title="View"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                        <span className="sr-only">View</span>
                                    </Link>
                                    <Link
                                        href={`/blog/analytics/${blog._id}`}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                        title="Analytics"
                                    >
                                        <ChartBarIcon className="h-5 w-5" />
                                        <span className="sr-only">Analytics</span>
                                    </Link>
                                    <Link
                                        href={`/blog/edit/${blog._id}`}
                                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                                        title="Edit"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                        <span className="sr-only">Edit</span>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(blog._id)}
                                        disabled={deleting === blog._id}
                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
                                        title="Delete"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                        <span className="sr-only">Delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}