'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PencilIcon, EnvelopeIcon, LinkIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import FollowButton from './FollowButton';

export default function ProfileCard({ user, isOwnProfile = false }) {
    const joinedDate = user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            {/* Cover photo */}
            <div className="h-40 sm:h-60 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                {user.coverPhoto && (
                    <Image
                        src={user.coverPhoto}
                        alt={`${user.name}'s cover photo`}
                        fill
                        className="object-cover"
                    />
                )}

                {isOwnProfile && (
                    <Link
                        href="/profile/settings"
                        className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        title="Edit profile"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </Link>
                )}
            </div>

            <div className="px-4 sm:px-6 py-5">
                <div className="sm:flex sm:items-start sm:justify-between">
                    <div className="sm:flex sm:space-x-5">
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative -mt-16 sm:-mt-20">
                            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <Image
                                    src={user.avatar || '/images/placeholder-blog.jpg'}
                                    alt={user.name}
                                    width={128}
                                    height={128}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* User info */}
                        <div className="mt-4 sm:mt-0 sm:pt-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>

                            {user.bio && (
                                <p className="mt-2 text-gray-700 dark:text-gray-300">
                                    {user.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Follow button */}
                    {!isOwnProfile && (
                        <div className="mt-5 sm:mt-0">
                            <FollowButton userId={user._id} initialIsFollowing={false} />
                        </div>
                    )}
                </div>

                {/* Additional profile info */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        <span>Joined {joinedDate}</span>
                    </div>

                    {user.location && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MapPinIcon className="h-5 w-5 mr-2" />
                            <span>{user.location}</span>
                        </div>
                    )}

                    {user.website && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <LinkIcon className="h-5 w-5 mr-2" />
                            <a
                                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition"
                            >
                                {user.website.replace(/(https?:\/\/)?(www\.)?/, '')}
                            </a>
                        </div>
                    )}

                    {user.email && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <EnvelopeIcon className="h-5 w-5 mr-2" />
                            <a
                                href={`mailto:${user.email}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition"
                            >
                                {user.email}
                            </a>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-6 flex divide-x divide-gray-200 dark:divide-gray-700">
                    <div className="px-4 py-2 text-center flex-1">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{user.blogsCount || 0}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Blogs</div>
                    </div>
                    <div className="px-4 py-2 text-center flex-1">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{user.followersCount || 0}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                    </div>
                    <div className="px-4 py-2 text-center flex-1">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{user.followingCount || 0}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                    </div>
                </div>
            </div>
        </div>
    );
}