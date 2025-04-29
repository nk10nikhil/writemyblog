'use client';

import {
    DocumentTextIcon,
    UserGroupIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function DashboardStats({ stats }) {
    const statItems = [
        {
            name: 'Total Posts',
            value: stats?.posts || 0,
            icon: DocumentTextIcon,
            color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        },
        {
            name: 'Followers',
            value: stats?.followers || 0,
            icon: UserGroupIcon,
            color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        },
        {
            name: 'Following',
            value: stats?.following || 0,
            icon: UserGroupIcon,
            color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        },
        {
            name: 'Connections',
            value: stats?.connections || 0,
            icon: UsersIcon,
            color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.name}
                        className="card p-6 flex items-center"
                    >
                        <div className={`p-3 rounded-lg ${item.color}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {item.name}
                            </p>
                            <p className="text-2xl font-semibold">
                                {item.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}