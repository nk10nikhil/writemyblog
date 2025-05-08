'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CommentForm from './CommentForm';
import CommentCard from './CommentCard';

export default function Comments({ blogId, initialComments = [] }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [comments, setComments] = useState(initialComments);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchComments = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await fetch(`/api/blogs/${blogId}/comments`);

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const data = await response.json();
            setComments(data.comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Could not load comments. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialComments.length === 0) {
            fetchComments();
        }
    }, [blogId, initialComments.length]);

    const handleAddComment = (newComment) => {
        setComments(prevComments => [newComment, ...prevComments]);
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            setComments(prevComments =>
                prevComments.filter(comment => comment._id !== commentId)
            );
        } catch (error) {
            console.error('Error deleting comment:', error);
            setError('Failed to delete comment. Please try again.');
        }
    };

    const handleCommentAction = async (commentId, action, data = {}) => {
        if (!session) {
            router.push(`/auth/login?callbackUrl=/blog/${blogId}`);
            return;
        }

        if (action === 'delete') {
            if (window.confirm('Are you sure you want to delete this comment?')) {
                await handleDeleteComment(commentId);
            }
        }
        // Additional actions like edit, reply, etc. can be added here
    };

    return (
        <div className="mt-8 space-y-8">
            <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>

            {session ? (
                <CommentForm blogId={blogId} onCommentAdded={handleAddComment} />
            ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Please{' '}
                        <button
                            onClick={() => router.push(`/auth/login?callbackUrl=/blog/${blogId}`)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            sign in
                        </button>{' '}
                        to leave a comment.
                    </p>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <CommentCard
                            key={comment._id}
                            comment={comment}
                            onAction={handleCommentAction}
                            isAuthor={session?.user?.id === comment.author._id}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        No comments yet. Be the first to share your thoughts!
                    </p>
                </div>
            )}
        </div>
    );
}