import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import Connection from '@/models/Connection';
import User from '@/models/User';
import Notification from '@/models/Notification';

// GET handler to fetch user connections or requests
export async function GET(request) {
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

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'connections'; // connections, requests, pending
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        // Get user from session
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userId = user._id;
        let query = {};

        // Build query based on type parameter
        if (type === 'connections') {
            // Get established connections (accepted)
            query = {
                $or: [
                    { requester: userId, status: 'accepted' },
                    { recipient: userId, status: 'accepted' }
                ]
            };
        } else if (type === 'requests') {
            // Get connection requests received by the user (pending)
            query = { recipient: userId, status: 'pending' };
        } else if (type === 'pending') {
            // Get pending requests sent by the user
            query = { requester: userId, status: 'pending' };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Connection.countDocuments(query);

        // Get connections based on query with pagination
        const connections = await Connection.find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('requester', 'name username avatar')
            .populate('recipient', 'name username avatar')
            .lean();

        // Format the data for response
        const formattedConnections = connections.map(conn => {
            // Determine the other user in the connection (not the current user)
            const otherUser = conn.requester._id.toString() === userId.toString()
                ? conn.recipient
                : conn.requester;

            return {
                _id: conn._id.toString(),
                user: {
                    _id: otherUser._id.toString(),
                    name: otherUser.name,
                    username: otherUser.username,
                    avatar: otherUser.avatar
                },
                status: conn.status,
                isRequester: conn.requester._id.toString() === userId.toString(),
                createdAt: conn.createdAt,
                updatedAt: conn.updatedAt
            };
        });

        return NextResponse.json({
            connections: formattedConnections,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching connections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch connections' },
            { status: 500 }
        );
    }
}

// POST handler to create a new connection request
export async function POST(request) {
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

        // Parse request body
        const body = await request.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // Get requester user from session
        const requester = await User.findOne({ email: session.user.email });
        if (!requester) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Find recipient by username
        const recipient = await User.findOne({ username });
        if (!recipient) {
            return NextResponse.json(
                { error: 'User not found with the provided username' },
                { status: 404 }
            );
        }

        // Don't allow self-connection
        if (requester._id.toString() === recipient._id.toString()) {
            return NextResponse.json(
                { error: 'You cannot connect with yourself' },
                { status: 400 }
            );
        }

        // Check if a connection already exists in any state
        const existingConnection = await Connection.findOne({
            $or: [
                { requester: requester._id, recipient: recipient._id },
                { requester: recipient._id, recipient: requester._id }
            ]
        });

        if (existingConnection) {
            return NextResponse.json(
                {
                    error: 'A connection already exists',
                    status: existingConnection.status,
                    connection: existingConnection
                },
                { status: 409 }
            );
        }

        // Create new connection request
        const connection = new Connection({
            requester: requester._id,
            recipient: recipient._id,
            status: 'pending'
        });

        await connection.save();

        // Create notification for the recipient
        await Notification.create({
            recipient: recipient._id,
            sender: requester._id,
            type: 'connection_request',
            reference: connection._id,
            message: `${requester.name} wants to connect with you`
        });

        return NextResponse.json({
            success: true,
            message: 'Connection request sent',
            connection
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating connection request:', error);
        return NextResponse.json(
            { error: 'Failed to send connection request' },
            { status: 500 }
        );
    }
}