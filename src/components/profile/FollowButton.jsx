'use client';

import { useState } from 'react';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function FollowButton({ userId, initialIsFollowing = false }) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const toggleFollow = async () => {
        // If not logged in, redirect to login
        if (!session) {
            router.push(`/auth/login?callbackUrl=/profile/${userId}`);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/users/${userId}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to update follow status');
            }

            // Toggle following state
            setIsFollowing(!isFollowing);

            // Refresh profile data to update follower counts
            router.refresh();
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFollow}
            disabled={isLoading}
            className={`
        flex items-center rounded-full px-4 py-2 font-medium transition
        ${isFollowing
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'}
        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
      `}
        >
            {isFollowing ? (
                <>
                    <UserMinusIcon className="h-5 w-5 mr-1" />
                    <span>Following</span>
                </>
            ) : (
                <>
                    <UserPlusIcon className="h-5 w-5 mr-1" />
                    <span>Follow</span>
                </>
            )}
        </button>
    );
}