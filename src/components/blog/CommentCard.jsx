'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { PencilIcon, TrashIcon, FlagIcon } from '@heroicons/react/24/outline';

export default function CommentCard({ comment, onAction, isAuthor }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const createdAt = new Date(comment.createdAt);
    const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

    const handleEdit = async () => {
        if (isEditing) {
            if (!editedContent.trim()) {
                return;
            }

            setIsSubmitting(true);
            setError('');

            try {
                const response = await fetch(`/api/blogs/${comment.blog}/comments/${comment._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: editedContent }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to update comment');
                }

                // Exit edit mode
                setIsEditing(false);
            } catch (err) {
                console.error('Error updating comment:', err);
                setError(err.message || 'Failed to update comment. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            // Enter edit mode
            setIsEditing(true);
            setEditedContent(comment.content);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditedContent(comment.content);
        setError('');
    };

    return (
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            {error && (
                <div className="mb-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="flex space-x-3">
                {/* Author avatar */}
                <Link href={`/profile/${comment.author.username}`} className="flex-shrink-0">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                            src={comment.author.avatar || '/images/placeholder-blog.jpg'}
                            alt={comment.author.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                </Link>

                <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <Link
                                href={`/profile/${comment.author.username}`}
                                className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {comment.author.name}
                            </Link>
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                                {timeAgo}
                            </span>
                        </div>

                        {/* Comment actions */}
                        <div className="flex space-x-2">
                            {isAuthor ? (
                                <>
                                    {isEditing ? (
                                        <button
                                            onClick={cancelEdit}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleEdit}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onAction(comment._id, 'delete')}
                                                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => onAction(comment._id, 'report')}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    title="Report comment"
                                >
                                    <FlagIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Comment content */}
                    {isEditing ? (
                        <div className="mt-2">
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-gray-100 text-sm"
                                rows={3}
                                disabled={isSubmitting}
                            />
                            <div className="mt-2 flex justify-end">
                                <button
                                    onClick={handleEdit}
                                    disabled={isSubmitting || !editedContent.trim()}
                                    className="btn-primary btn-sm disabled:opacity-60"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line break-words">
                            {comment.content}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}