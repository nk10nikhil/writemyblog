import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Blog from '@/models/Blog';
import Follow from '@/models/Follow';
import Connection from '@/models/Connection';
import ProfileCard from '@/components/profile/ProfileCard';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogCardSkeleton from '@/components/blog/BlogCardSkeleton';
import TabNavigation from '@/components/common/TabNavigation';

async function getUserProfile(username, currentUserId) {
    await connectToDatabase();

    // Get user data
    const user = await User.findOne({ username: username.toLowerCase() }).lean();

    if (!user) {
        return null;
    }

    // Convert MongoDB _id to string
    const userId = user._id.toString();
    user._id = userId;

    // Get user stats
    const [postCount, followerCount, followingCount, connectionCount] = await Promise.all([
        Blog.countDocuments({ author: userId }),
        Follow.countDocuments({ following: userId }),
        Follow.countDocuments({ follower: userId }),
        Connection.countDocuments({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' },
            ],
        }),
    ]);

    // Check relationship with current user
    let isFollowing = false;
    let connectionStatus = null;

    if (currentUserId) {
        // Check if current user is following this profile
        const followRelationship = await Follow.findOne({
            follower: currentUserId,
            following: userId
        });

        isFollowing = !!followRelationship;

        // Check connection status
        const connectionRelationship = await Connection.findOne({
            $or: [
                { requester: currentUserId, recipient: userId },
                { requester: userId, recipient: currentUserId },
            ]
        });

        if (connectionRelationship) {
            if (connectionRelationship.status === 'pending') {
                connectionStatus = connectionRelationship.requester.toString() === currentUserId
                    ? 'pending'  // Current user sent the request
                    : 'received';  // Current user received the request
            } else {
                connectionStatus = connectionRelationship.status;
            }
        }
    }

    return {
        profile: {
            ...user,
            isFollowing,
            connectionStatus,
        },
        stats: {
            posts: postCount,
            followers: followerCount,
            following: followingCount,
            connections: connectionCount,
        },
    };
}

export async function generateMetadata({ params }) {
    const { username } = params;
    await connectToDatabase();
    const user = await User.findOne({ username: username.toLowerCase() }).select('name bio').lean();

    if (!user) {
        return {
            title: 'Profile Not Found',
        };
    }

    return {
        title: `${user.name} | ModernBlog`,
        description: user.bio ? `${user.bio.substring(0, 160)}` : `Check out ${user.name}'s profile on ModernBlog`,
    };
}

export default async function ProfilePage({ params }) {
    const session = await getServerSession();
    const { username } = params;
    const userData = await getUserProfile(username, session?.user?.id);

    if (!userData) {
        notFound();
    }

    const { profile, stats } = userData;
    const currentUserId = session?.user?.id;
    const isOwnProfile = currentUserId === profile._id;

    // Define tabs based on whether it's the user's own profile or someone else's
    const tabs = [
        { id: 'posts', label: 'Posts', href: `/profile/${username}` },
        { id: 'about', label: 'About', href: `/profile/${username}/about` },
    ];

    // Users can see their own private content
    const visibilityQuery = isOwnProfile
        ? { author: profile._id }
        : {
            author: profile._id,
            $or: [
                { privacy: 'public' },
                // If the current user is connected to this profile, they can see 'connections' content
                ...(profile.connectionStatus === 'accepted' ? [{ privacy: 'connections' }] : []),
                // If the current user follows this profile, they can see 'followers' content
                ...(profile.isFollowing ? [{ privacy: 'followers' }] : []),
            ]
        };

    return (
        <div className="space-y-8">
            <ProfileCard profile={profile} stats={stats} />

            <TabNavigation tabs={tabs} />

            <h2 className="text-2xl font-bold">
                {isOwnProfile ? 'My Posts' : `${profile.name}'s Posts`}
            </h2>

            <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <BlogCardSkeleton key={i} />
                    ))}
                </div>
            }>
                <BlogGrid authorId={profile._id} />
            </Suspense>
        </div>
    );
}