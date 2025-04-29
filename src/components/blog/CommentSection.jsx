'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDistance } from 'date-fns';
import {
    PaperAirplaneIcon,
    TrashIcon,
    PencilIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CommentSection({ blogId, initialComments = [] }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Reset state if initial comments change (e.g., when router.refresh() happens)
        setComments(initialComments);
    }, [initialComments]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!session) {
            router.push(`/auth/login?redirect=/blog/${blogId}`);
            return;
        }

        if (!newComment.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    blog: blogId,
                    content: newComment,
                    parentComment: replyingTo,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to post comment');
            }

            const newCommentData = await response.json();

            if (replyingTo) {
                // Add reply to the parent comment's replies array
                setComments(prev => prev.map(comment => {
                    if (comment._id === replyingTo) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newCommentData],
                        };
                    }
                    return comment;
                }));
            } else {
                // Add new top-level comment
                setComments(prev => [...prev, newCommentData]);
            }

            setNewComment('');
            setReplyingTo(null);
            router.refresh(); // Refresh the page to update comment counts
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = (commentId) => {
        if (!session) {
            router.push(`/auth/login?redirect=/blog/${blogId}`);
            return;
        }
        setReplyingTo(commentId);
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditText(comment.content);
    };

    const cancelEdit = () => {
        setEditingCommentId(null);
        setEditText('');
    };

    const submitEdit = async (commentId) => {
        if (!editText.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editText,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update comment');
            }

            // Update the comment in the state
            setComments(prev => prev.map(comment => {
                if (comment._id === commentId) {
                    return { ...comment, content: editText };
                }

                // Also check nested replies
                if (comment.replies && comment.replies.length > 0) {
                    return {
                        ...comment,
                        replies: comment.replies.map(reply =>
                            reply._id === commentId ? { ...reply, content: editText } : reply
                        )
                    };
                }

                return comment;
            }));

            cancelEdit();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
        if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete comment');
            }

            if (isReply && parentId) {
                // Remove the reply from the parent comment
                setComments(prev => prev.map(comment => {
                    if (comment._id === parentId) {
                        return {
                            ...comment,
                            replies: (comment.replies || []).filter(reply => reply._id !== commentId)
                        };
                    }
                    return comment;
                }));
            } else {
                // Remove the top-level comment
                setComments(prev => prev.filter(comment => comment._id !== commentId));
            }

            router.refresh(); // Refresh the page to update comment counts
        } catch (err) {
            setError(err.message);
        }
    };

    const renderCommentActions = (comment, isReply = false, parentId = null) => {
        const isAuthor = session?.user?.id === comment.author?._id;

        return (
            <div className="flex items-center space-x-2 text-xs">
                {!isReply && (
                    <button
                        onClick={() => handleReply(comment._id)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Reply
                    </button>
                )}

                {isAuthor && (
                    <>
                        <button
                            onClick={() => handleEditComment(comment)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <PencilIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                        </button>

                        <button
                            onClick={() => handleDeleteComment(comment._id, isReply, parentId)}
                            className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        >
                            <TrashIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                        </button>
                    </>
                )}
            </div>
        );
    };

    const renderComment = (comment, isReply = false, parentId = null) => {
        const isEditing = editingCommentId === comment._id;

        return (
            <div key={comment._id} className={`${isReply ? 'ml-12 mt-3' : 'border-b border-gray-200 dark:border-gray-800 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0'}`}>
                <div className="flex items-start space-x-3">
                    <Link href={`/profile/${comment.author?.username || 'unknown'}`} className="flex-shrink-0">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            {comment.author?.avatar && (
                                <Image
                                    src={comment.author.avatar}
                                    alt={comment.author.name || 'User'}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <Link
                                    href={`/profile/${comment.author?.username || 'unknown'}`}
                                    className="font-medium hover:underline"
                                >
                                    {comment.author?.name || 'Anonymous User'}
                                </Link>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
                                </span>
                            </div>

                            {renderCommentActions(comment, isReply, parentId)}
                        </div>

                        {isEditing ? (
                            <div className="mt-2">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="input resize-none w-full"
                                    rows={3}
                                    disabled={isSubmitting}
                                ></textarea>

                                <div className="flex justify-end space-x-2 mt-2">
                                    <button
                                        onClick={cancelEdit}
                                        className="btn-text"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => submitEdit(comment._id)}
                                        className="btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm mt-1">
                                {comment.content}
                            </p>
                        )}
                    </div>
                </div>

                {/* Render replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3">
                        {comment.replies.map(reply => renderComment(reply, true, comment._id))}
                    </div>
                )}

                {/* Reply form */}
                {replyingTo === comment._id && (
                    <div className="mt-3 ml-12">
                        <CommentForm
                            value={newComment}
                            onChange={setNewComment}
                            onSubmit={handleSubmitComment}
                            onCancel={cancelReply}
                            isSubmitting={isSubmitting}
                            placeholder="Write a reply..."
                            buttonText="Reply"
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6">
                Comments {comments.length > 0 && `(${comments.length})`}
            </h2>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-md mb-4">
                    {error}
                </div>
            )}

            {/* New comment form */}
            <div className="mb-8">
                <CommentForm
                    value={newComment}
                    onChange={setNewComment}
                    onSubmit={handleSubmitComment}
                    isSubmitting={isSubmitting}
                    placeholder="Add a comment..."
                    buttonText="Comment"
                />
            </div>

            {/* Comment list */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map(comment => renderComment(comment))
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No comments yet. Be the first to comment!
                    </p>
                )}
            </div>
        </div>
    );
}

function CommentForm({ value, onChange, onSubmit, onCancel, isSubmitting, placeholder, buttonText }) {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <form onSubmit={onSubmit} className="flex items-start space-x-3">
            <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                {session?.user?.image && (
                    <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        fill
                        className="object-cover"
                    />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={isSubmitting || !session}
                    placeholder={session ? placeholder : "Sign in to comment"}
                    rows={3}
                    className="input resize-none w-full"
                    onClick={() => {
                        if (!session) {
                            router.push('/auth/login');
                        }
                    }}
                ></textarea>

                <div className="flex justify-end mt-2 space-x-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-text"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !value.trim() || !session}
                        className="btn-primary flex items-center"
                    >
                        {isSubmitting ? (
                            'Posting...'
                        ) : (
                            <>
                                <PaperAirplaneIcon className="h-4 w-4 mr-1.5" />
                                {buttonText}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}