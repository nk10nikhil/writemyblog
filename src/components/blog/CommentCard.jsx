'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ReplyIcon, TrashIcon, FlagIcon } from '@heroicons/react/outline';
import CommentForm from './CommentForm';

export default function CommentCard({ comment, blogId, blogAuthorId, onReplySuccess, onDelete }) {
    const { data: session } = useSession();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    // Check if the current user can delete this comment (author of comment or blog)
    const canDelete = session?.user?.id === comment.author._id ||
        session?.user?.id === blogAuthorId;

    const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

    const handleReplyClick = () => {
        setShowReplyForm(prev => !prev);
    };

    const handleReplySubmitted = (newComment) => {
        setShowReplyForm(false);
        if (onReplySuccess) {
            onReplySuccess(newComment);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            const response = await fetch(`/api/comments/${comment._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete comment');
            }

            if (onDelete) {
                onDelete(comment._id);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReport = () => {
        // Implement report functionality
        alert('Comment reported');
    };

    return (
        <div className="card">
            <div className="p-4">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
                        {error}
                    </div>
                )}
                <div className="flex space-x-3">
                    <Link href={`/profile/${comment.author.username}`} className="flex-shrink-0">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            {comment.author.avatar && (
                                <Image
                                    src={comment.author.avatar}
                                    alt={comment.author.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                    </Link>
                    <div className="flex-grow">
                        <div className="flex items-center">
                            <Link href={`/profile/${comment.author.username}`} className="font-medium hover:underline mr-2">
                                {comment.author.name}
                            </Link>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formattedDate}
                            </span>
                        </div>
                        <div className="mt-2 text-gray-800 dark:text-gray-200">
                            {comment.content}
                        </div>
                        <div className="mt-3 flex items-center space-x-4">
                            <button
                                onClick={handleReplyClick}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
                            >
                                <ReplyIcon className="h-4 w-4 mr-1" />
                                Reply
                            </button>
                            {!canDelete && (
                                <button
                                    onClick={handleReport}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
                                >
                                    <FlagIcon className="h-4 w-4 mr-1" />
                                    Report
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
                                >
                                    <TrashIcon className="h-4 w-4 mr-1" />
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            )}
                        </div>
                        {showReplyForm && (
                            <div className="mt-4">
                                <CommentForm
                                    blogId={blogId}
                                    parentId={comment._id}
                                    onSuccess={handleReplySubmitted}
                                    onCancel={() => setShowReplyForm(false)}
                                    placeholder={`Reply to ${comment.author.name}...`}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}