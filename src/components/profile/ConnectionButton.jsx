'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UsersIcon, CheckIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ConnectionButton({ profileId, status: initialStatus = null, onChange }) {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [connectionStatus, setConnectionStatus] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    const handleConnection = async () => {
        if (authStatus !== 'authenticated') {
            router.push(`/auth/login?redirect=/profile/${profileId}`);
            return;
        }

        setIsLoading(true);

        try {
            let endpoint = '/api/connections';
            let method = 'POST';

            // If we're already connected or have a pending request, we want to remove the connection
            if (connectionStatus === 'accepted' || connectionStatus === 'pending') {
                method = 'DELETE';
            }

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipientId: profileId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update connection status');
            }

            // Update local state based on action
            const newStatus = (connectionStatus === null || connectionStatus === 'rejected')
                ? 'pending'
                : null;

            setConnectionStatus(newStatus);

            // Notify parent component about the change
            if (onChange) {
                onChange(newStatus);
            }
        } catch (error) {
            console.error('Error updating connection status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonText = () => {
        if (isLoading) return 'Updating...';

        switch (connectionStatus) {
            case 'pending':
                return 'Pending';
            case 'accepted':
                return 'Connected';
            case 'received':
                return 'Accept Request';
            default:
                return 'Connect';
        }
    };

    const getButtonIcon = () => {
        switch (connectionStatus) {
            case 'pending':
                return <ClockIcon className="h-5 w-5" />;
            case 'accepted':
                return <CheckIcon className="h-5 w-5" />;
            case 'received':
                return <CheckIcon className="h-5 w-5" />;
            default:
                return <UsersIcon className="h-5 w-5" />;
        }
    };

    const getButtonStyles = () => {
        switch (connectionStatus) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800';
            case 'accepted':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800';
            case 'received':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600';
        }
    };

    // If it's the user's own profile, don't show the button
    if (session?.user?.id === profileId) {
        return null;
    }

    return (
        <button
            onClick={handleConnection}
            disabled={isLoading || authStatus === 'loading'}
            className={`flex items-center space-x-1 px-4 py-2 rounded-md transition-colors ${getButtonStyles()}`}
        >
            {getButtonIcon()}
            <span>{getButtonText()}</span>
        </button>
    );
}