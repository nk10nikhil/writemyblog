'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format, formatDistanceToNow } from 'date-fns';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    UserPlusIcon,
    UserIcon,
    DocumentTextIcon,
    BellAlertIcon
} from '@heroicons/react/24/outline';

export default function NotificationsList({ initialData }) {
    const [notifications, setNotifications] = useState(initialData?.notifications || []);
    const [unreadCount, setUnreadCount] = useState(initialData?.unreadCount || 0);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialData ? initialData.pagination?.hasMore : true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        if (!initialData) {
            fetchNotifications();
        }
    }, [initialData]);

    const fetchNotifications = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setPage(1);
        }

        try {
            const currentPage = isLoadMore ? page + 1 : 1;
            const response = await fetch(`/api/notifications?page=${currentPage}&limit=10`);

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();

            if (isLoadMore) {
                setNotifications(prev => [...prev, ...data.notifications]);
                setPage(currentPage);
            } else {
                setNotifications(data.notifications);
            }

            setUnreadCount(data.unreadCount);
            setHasMore(data.pagination.hasMore);

        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.message);
        } finally {
            if (isLoadMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            // Update local state
            setNotifications(prev =>
                prev.map(notification =>
                    notification._id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );

            setUnreadCount(prev => Math.max(0, prev - 1));

        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ markAllRead: true }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }

            // Update local state
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, read: true }))
            );

            setUnreadCount(0);

        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications?id=${notificationId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            // Update local state
            const deleted = notifications.find(n => n._id === notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));

            if (deleted && !deleted.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const clearAllNotifications = async () => {
        try {
            const response = await fetch('/api/notifications?clearAll=true', {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to clear all notifications');
            }

            // Update local state
            setNotifications([]);
            setUnreadCount(0);

        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return <HeartIcon className="h-5 w-5 text-red-500" />;
            case 'comment':
                return <ChatBubbleLeftIcon className="h-5 w-5 text-blue-500" />;
            case 'follow':
                return <UserIcon className="h-5 w-5 text-green-500" />;
            case 'connection_request':
            case 'connection_accepted':
                return <UserPlusIcon className="h-5 w-5 text-purple-500" />;
            case 'blog_published':
                return <DocumentTextIcon className="h-5 w-5 text-orange-500" />;
            default:
                return <BellAlertIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const renderTimeAgo = (dateString) => {
        try {
            const date = new Date(dateString);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            return 'Unknown date';
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 mb-3">{error}</p>
                <button onClick={() => fetchNotifications()} className="btn-secondary">
                    Try Again
                </button>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="p-10 text-center">
                <div className="inline-block p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <BellAlertIcon className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    When you receive notifications, they'll appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-4 py-2">
                <div>
                    {unreadCount > 0 && (
                        <span className="text-sm">
                            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                        </span>
                    )}
                </div>
                <div className="flex space-x-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            Mark all as read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAllNotifications}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                    <div
                        key={notification._id}
                        className={`flex items-start p-4 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                    >
                        <div className="flex-shrink-0 mr-4">
                            {notification.sender ? (
                                <Link href={`/profile/${notification.sender.username}`}>
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                        <Image
                                            src={notification.sender.avatar || '/images/default-avatar.png'}
                                            alt={notification.sender.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </Link>
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                    {getNotificationIcon(notification.type)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <Link
                                href={notification.link || '#'}
                                onClick={() => !notification.read && markAsRead(notification._id)}
                                className="block"
                            >
                                <p className="text-sm mb-1">
                                    <span dangerouslySetInnerHTML={{ __html: notification.message }} />
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {renderTimeAgo(notification.createdAt)}
                                </p>
                            </Link>
                        </div>

                        <div className="flex-shrink-0 ml-3">
                            <button
                                onClick={() => deleteNotification(notification._id)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                aria-label="Delete notification"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="text-center py-4">
                    <button
                        onClick={() => fetchNotifications(true)}
                        disabled={loadingMore}
                        className="btn-secondary text-sm"
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}