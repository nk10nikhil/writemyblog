'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

export default function LikeButton({ blogId, initialLikeCount = 0, initialLiked = false }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLoading, setIsLoading] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        setLiked(initialLiked);
        setLikeCount(initialLikeCount);
    }, [initialLiked, initialLikeCount]);

    const handleLike = async () => {
        if (status !== 'authenticated') {
            router.push(`/auth/login?redirect=/blog/${blogId}`);
            return;
        }

        setIsLoading(true);
        const originalLiked = liked;
        const originalCount = likeCount;

        // Optimistically update UI
        setLiked(!liked);
        setLikeCount(prevCount => liked ? prevCount - 1 : prevCount + 1);

        if (!liked && !hasAnimated) {
            setHasAnimated(true);
        }

        try {
            const response = await fetch(`/api/blogs/${blogId}/like`, {
                method: liked ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                // Revert to original state if request failed
                setLiked(originalLiked);
                setLikeCount(originalCount);
                throw new Error('Failed to update like status');
            }

            const data = await response.json();
            setLikeCount(data.likesCount);
        } catch (error) {
            console.error('Error updating like status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center space-x-1.5 py-2 px-3 rounded-full transition-colors ${liked
                    ? 'text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
        >
            {liked ? (
                <HeartSolid className={`h-5 w-5 ${hasAnimated ? 'animate-heartbeat' : ''}`} />
            ) : (
                <HeartOutline className="h-5 w-5" />
            )}
            <span>{likeCount || 0}</span>
        </button>
    );
}