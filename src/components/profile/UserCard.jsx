'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FollowButton from './FollowButton';

export default function UserCard({ user }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            {/* Avatar */}
            <Link href={`/profile/${user.username}`} className="flex-shrink-0">
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <Image
                        src={user.avatar || '/images/placeholder-blog.jpg'}
                        alt={user.name}
                        fill
                        className="object-cover"
                    />
                </div>
            </Link>

            {/* User info */}
            <div className="flex-grow text-center sm:text-left">
                <Link href={`/profile/${user.username}`}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {user.name}
                    </h3>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{user.username}</p>

                {user.bio && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {user.bio}
                    </p>
                )}

                <div className="flex justify-center sm:justify-start">
                    <FollowButton userId={user._id} initialIsFollowing={false} />
                </div>
            </div>
        </div>
    );
}