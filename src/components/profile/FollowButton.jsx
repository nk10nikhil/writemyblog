'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';

export default function FollowButton({ profileId, isFollowing: initialIsFollowing = false, onChange }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollow = async () => {
        if (status !== 'authenticated') {
            router.push(`/auth/login?redirect=/profile/${profileId}`);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/followers`, {
                method: isFollowing ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    followingId: profileId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update follow status');
            }

            const newFollowState = !isFollowing;
            setIsFollowing(newFollowState);

            // Notify parent component about the change
            if (onChange) {
                onChange(newFollowState);
            }
        } catch (error) {
            console.error('Error updating follow status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isLoading || status === 'loading' || session?.user?.id === profileId}
            className={`flex items-center space-x-1 px-4 py-2 rounded-md transition-colors ${isFollowing
                    ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
        >
            {isFollowing ? (
                <>
                    <UserMinusIcon className="h-5 w-5" />
                    <span>{isLoading ? 'Updating...' : 'Unfollow'}</span>
                </>
            ) : (
                <>
                    <UserPlusIcon className="h-5 w-5" />
                    <span>{isLoading ? 'Updating...' : 'Follow'}</span>
                </>
            )}
        </button>
    );
}