'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    UserIcon,
    PencilIcon,
    UserAddIcon,
    UserRemoveIcon,
    DotsHorizontalIcon,
} from '@heroicons/react/outline';

export default function ProfileCard({ profile, stats }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const isOwnProfile = session?.user?.id === profile._id;

    // Follow / Connection button states
    const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
    const [connectionStatus, setConnectionStatus] = useState(profile.connectionStatus);

    const handleFollowToggle = async () => {
        if (!session) {
            router.push('/auth/login?redirect=/profile/' + profile.username);
            return;
        }

        setIsLoading(true);

        try {
            const action = isFollowing ? 'unfollow' : 'follow';
            const response = await fetch('/api/follows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: profile._id,
                    action,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update follow status');
            }

            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error('Error updating follow status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnectionAction = async (action) => {
        if (!session) {
            router.push('/auth/login?redirect=/profile/' + profile.username);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/connections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: profile._id,
                    action, // 'request', 'accept', 'reject', 'cancel', 'remove'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update connection');
            }

            const data = await response.json();
            setConnectionStatus(data.status);
        } catch (error) {
            console.error('Error updating connection:', error);
        } finally {
            setIsLoading(false);
            setMenuOpen(false);
        }
    };

    const getConnectionButton = () => {
        if (isOwnProfile) return null;

        switch (connectionStatus) {
            case 'accepted':
                return (
                    <button
                        onClick={() => handleConnectionAction('remove')}
                        className="btn-secondary-outline flex items-center"
                        disabled={isLoading}
                    >
                        <UserRemoveIcon className="h-5 w-5 mr-1.5" />
                        Connected
                    </button>
                );
            case 'pending':
                return (
                    <button
                        onClick={() => handleConnectionAction('cancel')}
                        className="btn-secondary-outline flex items-center"
                        disabled={isLoading}
                    >
                        <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
                        Pending
                    </button>
                );
            case 'received':
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleConnectionAction('accept')}
                            className="btn-primary flex items-center"
                            disabled={isLoading}
                        >
                            <UserAddIcon className="h-5 w-5 mr-1.5" />
                            Accept
                        </button>
                        <button
                            onClick={() => handleConnectionAction('reject')}
                            className="btn-secondary-outline"
                            disabled={isLoading}
                        >
                            Ignore
                        </button>
                    </div>
                );
            default:
                return (
                    <button
                        onClick={() => handleConnectionAction('request')}
                        className="btn-secondary flex items-center"
                        disabled={isLoading}
                    >
                        <UserAddIcon className="h-5 w-5 mr-1.5" />
                        Connect
                    </button>
                );
        }
    };

    return (
        <div className="relative">
            {/* Cover Image */}
            <div className="h-40 md:h-60 bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden relative">
                {profile.coverImage ? (
                    <Image
                        src={profile.coverImage}
                        alt={`${profile.name}'s cover`}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500">No cover image</span>
                    </div>
                )}
            </div>

            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-900 rounded-b-lg shadow-sm pb-6">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-20">
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-800 z-10">
                            {profile.avatar ? (
                                <Image
                                    src={profile.avatar}
                                    alt={profile.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <UserIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                </div>
                            )}
                        </div>

                        {/* Name, Username, Stats */}
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex-1 min-w-0">
                            <h1 className="text-2xl font-bold truncate">{profile.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 sm:mt-0 sm:ml-2 flex space-x-2">
                            {isOwnProfile ? (
                                <Link href="/profile/settings" className="btn-secondary flex items-center">
                                    <PencilIcon className="h-5 w-5 mr-1.5" />
                                    Edit Profile
                                </Link>
                            ) : (
                                <>
                                    {getConnectionButton()}
                                    <button
                                        onClick={handleFollowToggle}
                                        className={`${isFollowing
                                                ? 'btn-secondary-outline'
                                                : 'btn-primary'
                                            } flex items-center`}
                                        disabled={isLoading}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setMenuOpen(!menuOpen)}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <DotsHorizontalIcon className="h-5 w-5" />
                                        </button>

                                        {menuOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 shadow-lg rounded-md py-1 z-20 border border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => {
                                                        // Implement report functionality
                                                        alert('Report functionality will be implemented');
                                                        setMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    Report user
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        // Implement block functionality
                                                        alert('Block functionality will be implemented');
                                                        setMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                                                >
                                                    Block user
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className="mt-6">
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {profile.bio}
                            </p>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mt-6 flex flex-wrap gap-6">
                        <Link href={`/profile/${profile.username}`} className="flex flex-col items-center">
                            <span className="font-semibold text-lg">{stats.posts}</span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Posts</span>
                        </Link>

                        <Link href={`/profile/${profile.username}/followers`} className="flex flex-col items-center">
                            <span className="font-semibold text-lg">{stats.followers}</span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Followers</span>
                        </Link>

                        <Link href={`/profile/${profile.username}/following`} className="flex flex-col items-center">
                            <span className="font-semibold text-lg">{stats.following}</span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Following</span>
                        </Link>

                        {isOwnProfile && (
                            <Link href={`/profile/${profile.username}/connections`} className="flex flex-col items-center">
                                <span className="font-semibold text-lg">{stats.connections}</span>
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Connections</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}