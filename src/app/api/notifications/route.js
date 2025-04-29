import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET(request) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const unreadOnly = searchParams.get('unread') === 'true';
        const skip = (page - 1) * limit;

        await connectToDatabase();

        // Build query
        const query = { recipient: userId };

        if (unreadOnly) {
            query.read = false;
        }

        // Get notifications and total count
        const [notifications, totalCount] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('sender', 'name username avatar')
                .populate('blog', 'title slug')
                .lean(),
            Notification.countDocuments(query)
        ]);

        // Count unread notifications
        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            read: false
        });

        // Format response
        const formattedNotifications = notifications.map(notification => ({
            ...notification,
            _id: notification._id.toString(),
            sender: notification.sender ? {
                ...notification.sender,
                _id: notification.sender._id.toString()
            } : null,
            blog: notification.blog ? {
                ...notification.blog,
                _id: notification.blog._id.toString()
            } : null,
            recipient: notification.recipient.toString()
        }));

        // Pagination info
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            notifications: formattedNotifications,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                limit,
                hasMore: page < totalPages
            },
            unreadCount
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { message: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// Mark notifications as read
export async function PUT(request) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const data = await request.json();

        // Check if this is a bulk update or single notification update
        const { notificationId, markAllRead } = data;

        await connectToDatabase();

        if (markAllRead) {
            // Mark all notifications as read
            await Notification.updateMany(
                { recipient: userId, read: false },
                { $set: { read: true, readAt: new Date() } }
            );

            return NextResponse.json({
                message: 'All notifications marked as read',
            });
        } else if (notificationId) {
            // Mark single notification as read
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                { $set: { read: true, readAt: new Date() } },
                { new: true }
            );

            if (!notification) {
                return NextResponse.json(
                    { message: 'Notification not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                message: 'Notification marked as read',
                notification
            });
        } else {
            return NextResponse.json(
                { message: 'Invalid request' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json(
            { message: 'Failed to update notifications' },
            { status: 500 }
        );
    }
}

// Delete notifications
export async function DELETE(request) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const searchParams = request.nextUrl.searchParams;
        const notificationId = searchParams.get('id');
        const clearAll = searchParams.get('clearAll') === 'true';

        await connectToDatabase();

        if (clearAll) {
            // Delete all notifications for this user
            await Notification.deleteMany({ recipient: userId });

            return NextResponse.json({
                message: 'All notifications cleared'
            });
        } else if (notificationId) {
            // Delete a specific notification
            const result = await Notification.deleteOne({
                _id: notificationId,
                recipient: userId
            });

            if (result.deletedCount === 0) {
                return NextResponse.json(
                    { message: 'Notification not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                message: 'Notification deleted'
            });
        } else {
            return NextResponse.json(
                { message: 'Invalid request' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Error deleting notifications:', error);
        return NextResponse.json(
            { message: 'Failed to delete notifications' },
            { status: 500 }
        );
    }
}