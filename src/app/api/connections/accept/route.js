import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import Connection from '@/models/Connection';
import User from '@/models/User';
import Notification from '@/models/Notification';

// PUT handler to accept a connection request
export async function PUT(request) {
    try {
        const session = await getServerSession();

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        // Parse request body to get connection ID
        const body = await request.json();
        const { connectionId } = body;

        if (!connectionId) {
            return NextResponse.json(
                { error: 'Connection ID is required' },
                { status: 400 }
            );
        }

        // Get user ID from session
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Find the connection request
        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return NextResponse.json(
                { error: 'Connection request not found' },
                { status: 404 }
            );
        }

        // Verify this user is the recipient of the request
        if (connection.recipient.toString() !== user._id.toString()) {
            return NextResponse.json(
                { error: 'You are not authorized to accept this connection request' },
                { status: 403 }
            );
        }

        // Verify the connection is pending
        if (connection.status !== 'pending') {
            return NextResponse.json(
                { error: 'This connection request is no longer pending' },
                { status: 400 }
            );
        }

        // Update connection status to accepted
        connection.status = 'accepted';
        await connection.save();

        // Create notification for requester
        await Notification.create({
            recipient: connection.requester,
            type: 'connection_accepted',
            sender: user._id,
            reference: connection._id,
            message: `${user.name} accepted your connection request`
        });

        return NextResponse.json({
            success: true,
            message: 'Connection request accepted',
            connection
        });
    } catch (error) {
        console.error('Error accepting connection request:', error);
        return NextResponse.json(
            { error: 'Failed to accept connection request' },
            { status: 500 }
        );
    }
}