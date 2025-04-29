'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CommentForm({ blogId, parentId = null, onSuccess, placeholder = 'Add a comment...', autoFocus = false, onCancel }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!session) {
            router.push(`/auth/login?redirect=/blog/${blogId}`);
            return;
        }

        if (!comment.trim()) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    blogId,
                    parentId,
                    content: comment.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add comment');
            }

            setComment('');
            if (onSuccess) {
                onSuccess(data.comment);
            }
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setComment('');
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-4">
                <div className="flex-shrink-0">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {session?.user?.image && (
                            <Image
                                src={session.user.image}
                                alt={session.user.name || 'User avatar'}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                </div>
                <div className="flex-grow">
                    <textarea
                        value={comment}
                        onChange={handleCommentChange}
                        placeholder={placeholder}
                        rows={3}
                        className="input w-full resize-none"
                        disabled={isSubmitting}
                        autoFocus={autoFocus}
                    />
                    {error && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-secondary"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={!comment.trim() || isSubmitting}
                >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
            </div>
        </form>
    );
}