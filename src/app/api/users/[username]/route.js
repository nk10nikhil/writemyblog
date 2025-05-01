import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import Follow from '@/models/Follow';
import Blog from '@/models/Blog';
import Connection from '@/models/Connection';

// GET handler to fetch user profile data
export async function GET(request, { params }) {
    try {
        await connectToDatabase();
        const { username } = params;

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // Get user data
        const user = await User.findOne({ username }).lean();

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get follower and following counts
        const followersCount = await Follow.countDocuments({ following: user._id });
        const followingCount = await Follow.countDocuments({ follower: user._id });

        // Get connection count
        const connectionsCount = await Connection.countDocuments({
            $or: [
                { requester: user._id, status: 'accepted' },
                { recipient: user._id, status: 'accepted' }
            ]
        });

        // Get blog count (public only for non-self view)
        const blogCount = await Blog.countDocuments({ author: user._id, privacy: 'public' });

        // Check if current user is following this user
        const session = await getServerSession();
        let isFollowing = false;
        let connectionStatus = null;

        if (session?.user) {
            const currentUser = await User.findOne({ email: session.user.email });
            if (currentUser) {
                // Check follow status
                const followRecord = await Follow.findOne({
                    follower: currentUser._id,
                    following: user._id
                });
                isFollowing = !!followRecord;

                // Check connection status
                const connection = await Connection.findOne({
                    $or: [
                        { requester: currentUser._id, recipient: user._id },
                        { requester: user._id, recipient: currentUser._id }
                    ]
                });

                if (connection) {
                    connectionStatus = {
                        status: connection.status,
                        isRequester: connection.requester.toString() === currentUser._id.toString(),
                        _id: connection._id.toString()
                    };
                }
            }
        }

        // Prepare the response data
        const profileData = {
            _id: user._id.toString(),
            name: user.name,
            username: user.username,
            email: undefined, // Don't expose email
            avatar: user.avatar,
            bio: user.bio,
            joinedDate: user.createdAt,
            location: user.location,
            website: user.website,
            social: user.social,
            stats: {
                followers: followersCount,
                following: followingCount,
                blogs: blogCount,
                connections: connectionsCount
            },
            isFollowing,
            connectionStatus
        };

        // If the profile is for the current user, include private info
        if (session?.user && user.email === session.user.email) {
            profileData.email = user.email;
            // Include any other private fields here
        }

        return NextResponse.json(profileData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        );
    }
}