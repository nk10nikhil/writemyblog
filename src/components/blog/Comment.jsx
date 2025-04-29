import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function Comment({ comment, onDelete }) {
    const { data: session } = useSession();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const isAuthor = session?.user?.id === comment.author._id;
    const isAdmin = session?.user?.role === 'admin';
    const canDelete = isAuthor || isAdmin;

    const formattedDate = format(new Date(comment.createdAt), 'MMM d, yyyy');
    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

    const handleDelete = async () => {
        if (!canDelete || !confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            const response = await fetch(`/api/blogs/${comment.blog}/comments`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ commentId: comment._id }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete comment');
            }

            // Notify parent component about deletion
            onDelete?.(comment._id);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-2 rounded-md mb-3 text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                    <Link href={`/profile/${comment.author.username}`}>
                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                            <Image
                                src={comment.author.avatar || '/images/default-avatar.png'}
                                alt={comment.author.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </Link>
                    <div>
                        <Link
                            href={`/profile/${comment.author.username}`}
                            className="font-medium hover:underline"
                        >
                            {comment.author.name}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400" title={formattedDate}>
                            {timeAgo}
                        </p>
                    </div>
                </div>

                {canDelete && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        aria-label="Delete comment"
                        title="Delete comment"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {comment.content}
            </div>
        </div>
    );
}