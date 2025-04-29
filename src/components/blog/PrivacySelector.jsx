'use client';

import {
    LockClosedIcon,
    UsersIcon,
    HeartIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

const privacyOptions = [
    {
        id: 'private',
        label: 'Private',
        description: 'Only visible to you',
        icon: LockClosedIcon,
    },
    {
        id: 'connections',
        label: 'Connections',
        description: 'Only visible to your accepted connections',
        icon: UsersIcon,
    },
    {
        id: 'followers',
        label: 'Followers',
        description: 'Only visible to users who follow you',
        icon: HeartIcon,
    },
    {
        id: 'public',
        label: 'Public',
        description: 'Visible to everyone',
        icon: GlobeAltIcon,
    },
];

export default function PrivacySelector({ selectedPrivacy, onChange }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {privacyOptions.map((option) => {
                const isSelected = selectedPrivacy === option.id;
                const Icon = option.icon;

                return (
                    <div
                        key={option.id}
                        className={`
              cursor-pointer rounded-lg border p-4
              ${isSelected
                                ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
            `}
                        onClick={() => onChange(option.id)}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`
                flex-shrink-0 rounded-full p-1.5
                ${isSelected
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}
              `}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className={`font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                    {option.label}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {option.description}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}