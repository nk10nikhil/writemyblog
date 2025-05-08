'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CommentForm({ blogId, onCommentAdded }) {
    const { data: session } = useSession();
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(`/api/blogs/${blogId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: comment }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to add comment');
            }

            const data = await response.json();

            // Call the callback with the new comment
            if (onCommentAdded && data.comment) {
                onCommentAdded(data.comment);
            }

            // Reset the form
            setComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
            setError(err.message || 'Failed to add comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="comment" className="sr-only">
                    Add a comment
                </label>
                <textarea
                    id="comment"
                    rows={3}
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
            </div>
        </form>
    );
}