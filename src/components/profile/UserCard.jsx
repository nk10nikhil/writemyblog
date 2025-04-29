'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import FollowButton from './FollowButton';
import ConnectionButton from './ConnectionButton';

export default function UserCard({ user }) {
    const { data: session } = useSession();
    const isOwnProfile = session?.user?.id === user._id;
    const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
    const [connectionStatus, setConnectionStatus] = useState(user.connectionStatus || null);

    return (
        <div className="card overflow-hidden hover:shadow-md transition-shadow">
            {/* Cover Image */}
            <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-600">
                {user.coverImage && (
                    <Image
                        src={user.coverImage}
                        alt=""
                        fill
                        className="object-cover opacity-70"
                    />
                )}
            </div>

            <div className="p-4 pt-12 text-center relative">
                {/* Avatar */}
                <div className="absolute -top-10 inset-x-0 flex justify-center">
                    <div className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {user.avatar && (
                            <Image
                                src={user.avatar}
                                alt={user.name}
                                width={80}
                                height={80}
                                className="object-cover"
                            />
                        )}
                    </div>
                </div>

                {/* User Info */}
                <h3 className="text-lg font-bold mt-2">
                    <Link
                        href={`/profile/${user.username}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        {user.name}
                    </Link>
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">@{user.username}</p>

                {user.bio && (
                    <p className="text-sm mb-3 line-clamp-2">{user.bio}</p>
                )}

                {/* Stats */}
                <div className="flex justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{user.followerCount || 0}</span> Followers
                    </div>
                    <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{user.blogCount || 0}</span> Posts
                    </div>
                </div>

                {/* Actions */}
                {!isOwnProfile && (
                    <div className="flex justify-center space-x-2">
                        <FollowButton
                            profileId={user._id}
                            isFollowing={isFollowing}
                            onChange={setIsFollowing}
                        />

                        <ConnectionButton
                            profileId={user._id}
                            status={connectionStatus}
                            onChange={setConnectionStatus}
                        />
                    </div>
                )}

                {isOwnProfile && (
                    <Link
                        href="/profile/settings"
                        className="btn-secondary block w-full"
                    >
                        Edit Profile
                    </Link>
                )}
            </div>
        </div>
    );
}