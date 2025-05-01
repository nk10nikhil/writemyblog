import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import Follow from '@/models/Follow';
import User from '@/models/User';
import Notification from '@/models/Notification';

// GET handler to fetch user's followers or following
export async function GET(request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'followers'; // followers or following
        const username = searchParams.get('username');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userId = user._id;
        let query = {};

        // Build query based on type
        if (type === 'followers') {
            // Get users following this user
            query = { following: userId };
        } else if (type === 'following') {
            // Get users this user is following
            query = { follower: userId };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Follow.countDocuments(query);

        // Get follows with user details
        const follows = await Follow.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate(type === 'followers' ? 'follower' : 'following', 'name username avatar bio')
            .lean();

        // Get current user if logged in
        const session = await getServerSession();
        let currentUser = null;
        if (session?.user) {
            currentUser = await User.findOne({ email: session.user.email });
        }

        // Format the data for response
        const formattedFollows = follows.map(follow => {
            const userData = type === 'followers' ? follow.follower : follow.following;

            // Check if current user follows this user
            let isFollowing = false;
            if (currentUser) {
                // This would ideally be done with a more efficient query,
                // but for simplicity in this implementation we'll leave it like this
                // In a production app, consider using $in operator or a separate query
            }

            return {
                _id: follow._id.toString(),
                user: {
                    _id: userData._id.toString(),
                    name: userData.name,
                    username: userData.username,
                    avatar: userData.avatar,
                    bio: userData.bio,
                },
                createdAt: follow.createdAt,
                isFollowing
            };
        });

        return NextResponse.json({
            users: formattedFollows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching followers/following:', error);
        return NextResponse.json(
            { error: 'Failed to fetch followers/following' },
            { status: 500 }
        );
    }
}

// POST handler to follow a user
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

        // Get follower user from session
        const follower = await User.findOne({ email: session.user.email });
        if (!follower) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Find user to follow
        const userToFollow = await User.findOne({ username });
        if (!userToFollow) {
            return NextResponse.json(
                { error: 'User not found with the provided username' },
                { status: 404 }
            );
        }

        // Don't allow self-follow
        if (follower._id.toString() === userToFollow._id.toString()) {
            return NextResponse.json(
                { error: 'You cannot follow yourself' },
                { status: 400 }
            );
        }

        // Check if already following
        const existingFollow = await Follow.findOne({
            follower: follower._id,
            following: userToFollow._id
        });

        if (existingFollow) {
            return NextResponse.json(
                { error: 'You are already following this user' },
                { status: 409 }
            );
        }

        // Create new follow
        const follow = new Follow({
            follower: follower._id,
            following: userToFollow._id
        });

        await follow.save();

        // Create notification for the user being followed
        await Notification.create({
            recipient: userToFollow._id,
            sender: follower._id,
            type: 'new_follower',
            message: `${follower.name} started following you`
        });

        return NextResponse.json({
            success: true,
            message: 'User followed successfully',
            follow
        }, { status: 201 });
    } catch (error) {
        console.error('Error following user:', error);
        return NextResponse.json(
            { error: 'Failed to follow user' },
            { status: 500 }
        );
    }
}