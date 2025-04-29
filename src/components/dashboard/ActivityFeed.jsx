'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';

export default function ActivityFeed({ activities }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="card p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No recent activity.</p>
            </div>
        );
    }

    // This component expects activity objects with: type, user, blog, createdAt, etc.
    // But since we're passing in comments directly here, we'll treat them all as comments
    // In a real app, you'd have multiple activity types (likes, comments, follows, etc.)
    const renderActivityItem = (activity) => {
        // Since we only have comments in this example
        return (
            <div key={activity._id} className="border-b last:border-b-0 border-gray-200 dark:border-gray-700 py-4 first:pt-0 last:pb-0">
                <div className="flex items-start space-x-3">
                    <Link href={`/profile/${activity.author.username}`}>
                        <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                                src={activity.author.avatar || '/images/default-avatar.png'}
                                alt={activity.author.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </Link>
                    <div>
                        <div className="flex items-center space-x-1">
                            <Link
                                href={`/profile/${activity.author.username}`}
                                className="font-medium hover:underline"
                            >
                                {activity.author.name}
                            </Link>
                            <span className="text-gray-600 dark:text-gray-400">commented on</span>
                            <Link
                                href={`/blog/${activity.blog._id}`}
                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {activity.blog.title}
                            </Link>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {activity.content.length > 100
                                ? `${activity.content.substring(0, 100)}...`
                                : activity.content
                            }
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="card divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium">Recent Activity</h3>
            </div>
            <div className="p-4">
                {activities.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {activities.map(renderActivityItem)}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No recent activity.
                    </p>
                )}
            </div>
        </div>
    );
}