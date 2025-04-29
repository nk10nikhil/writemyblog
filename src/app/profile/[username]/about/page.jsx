import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Follow from '@/models/Follow';
import Connection from '@/models/Connection';
import Blog from '@/models/Blog';
import ProfileCard from '@/components/profile/ProfileCard';
import TabNavigation from '@/components/common/TabNavigation';
import {
    CalendarIcon,
    MapPinIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    BookOpenIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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

    // Get the user's most popular blogs
    const popularBlogs = await Blog.find({
        author: userId,
        privacy: 'public'  // Only show public blogs
    })
        .sort({ viewCount: -1 })
        .limit(3)
        .select('title _id')
        .lean();

    // Format the popular blogs
    const formattedPopularBlogs = popularBlogs.map(blog => ({
        ...blog,
        _id: blog._id.toString()
    }));

    // Format the join date
    const joinDate = new Date(user.createdAt);
    const joinDateFormatted = joinDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });

    return {
        profile: {
            ...user,
            isFollowing,
            connectionStatus,
            joinDate: joinDateFormatted,
        },
        stats: {
            posts: postCount,
            followers: followerCount,
            following: followingCount,
            connections: connectionCount,
        },
        popularBlogs: formattedPopularBlogs
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
        title: `About ${user.name} | ModernBlog`,
        description: user.bio ? `${user.bio.substring(0, 160)}` : `Learn more about ${user.name} on ModernBlog`,
    };
}

export default async function ProfileAboutPage({ params }) {
    const session = await getServerSession();
    const { username } = params;
    const userData = await getUserProfile(username, session?.user?.id);

    if (!userData) {
        notFound();
    }

    const { profile, stats, popularBlogs } = userData;
    const isOwnProfile = session?.user?.id === profile._id;

    // Define tabs
    const tabs = [
        { id: 'posts', label: 'Posts', href: `/profile/${username}` },
        { id: 'about', label: 'About', href: `/profile/${username}/about` },
    ];

    return (
        <div className="space-y-8">
            <ProfileCard profile={profile} stats={stats} />

            <TabNavigation tabs={tabs} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="card p-6">
                        <h2 className="text-xl font-bold mb-4">About</h2>
                        {profile.bio ? (
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {profile.bio}
                            </p>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                {isOwnProfile
                                    ? "You haven't added a bio yet. Add one to tell people about yourself."
                                    : `${profile.name} hasn't added a bio yet.`
                                }
                            </p>
                        )}
                    </div>

                    {isOwnProfile && !profile.bio && (
                        <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <h3 className="font-medium mb-2">Complete your profile</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Help others learn more about you by adding a bio to your profile.
                            </p>
                            <Link href="/profile/settings" className="btn-primary text-sm">
                                Update Profile
                            </Link>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4">Details</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <span className="block text-sm text-gray-500 dark:text-gray-400">Joined</span>
                                    <span>{profile.joinDate}</span>
                                </div>
                            </li>

                            {profile.location && (
                                <li className="flex items-start">
                                    <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <span className="block text-sm text-gray-500 dark:text-gray-400">Location</span>
                                        <span>{profile.location}</span>
                                    </div>
                                </li>
                            )}

                            {profile.website && (
                                <li className="flex items-start">
                                    <GlobeAltIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <span className="block text-sm text-gray-500 dark:text-gray-400">Website</span>
                                        <a
                                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {profile.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                </li>
                            )}

                            <li className="flex items-start">
                                <DocumentTextIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <span className="block text-sm text-gray-500 dark:text-gray-400">Posts</span>
                                    <span>{stats.posts} blog {stats.posts === 1 ? 'post' : 'posts'}</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {popularBlogs.length > 0 && (
                        <div className="card p-6">
                            <h3 className="font-semibold mb-4">Popular Posts</h3>
                            <ul className="space-y-3">
                                {popularBlogs.map((blog) => (
                                    <li key={blog._id}>
                                        <Link
                                            href={`/blog/${blog._id}`}
                                            className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
                                        >
                                            <BookOpenIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span className="line-clamp-1">{blog.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}