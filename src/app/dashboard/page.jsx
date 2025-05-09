import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Follow from '@/models/Follow';
import Connection from '@/models/Connection';
import Comment from '@/models/Comment';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import BlogList from '@/components/blog/BlogList';
import { PencilSquareIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';

async function getDashboardData(userId) {
    await connectToDatabase();

    // Get post count
    const postCount = await Blog.countDocuments({ author: userId });

    // Get follower count
    const followerCount = await Follow.countDocuments({ following: userId });

    // Get following count
    const followingCount = await Follow.countDocuments({ follower: userId });

    // Get connection count
    const connectionCount = await Connection.countDocuments({
        $or: [
            { requester: userId, status: 'accepted' },
            { recipient: userId, status: 'accepted' },
        ],
    });

    // Fetch all blogs for analytics
    const allBlogs = await Blog.find({ author: userId }).lean();
    const totalViews = allBlogs.reduce((sum, blog) => sum + (blog.viewCount || 0), 0);
    const totalLikes = allBlogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0);
    // Count total comments across all blogs
    const allBlogIds = allBlogs.map(blog => blog._id);
    const totalComments = await Comment.countDocuments({ blog: { $in: allBlogIds } });

    // Get recent blogs (limit 5)
    const recentBlogs = await Blog.find({ author: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    const formattedBlogs = recentBlogs.map(blog => ({
        ...blog,
        _id: blog._id.toString(),
    }));

    // Get recent activity (comments on user's blogs)
    const recentComments = await Comment.find({ blog: { $in: allBlogIds } })
        .populate('author', 'name username avatar')
        .populate('blog', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    const formattedComments = recentComments.map(comment => ({
        ...comment,
        _id: comment._id.toString(),
        blog: {
            ...comment.blog,
            _id: comment.blog._id.toString(),
        },
        author: {
            ...comment.author,
            _id: comment.author._id.toString(),
        },
    }));

    // Add comment count to each recent blog
    for (const blog of formattedBlogs) {
        blog.commentCount = await Comment.countDocuments({ blog: blog._id });
    }

    return {
        stats: {
            posts: postCount,
            followers: followerCount,
            following: followingCount,
            connections: connectionCount,
            totalViews,
            totalLikes,
            totalComments,
        },
        recentBlogs: formattedBlogs,
        activity: formattedComments,
    };
}

export default async function Dashboard() {
    const session = await getServerSession();

    if (!session) {
        redirect('/auth/login?redirect=/dashboard');
    }

    const data = await getDashboardData(session.user.id);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                    <Link href="/blog/create" className="btn-primary flex items-center space-x-2">
                        <PencilSquareIcon className="h-5 w-5" />
                        <span>New Blog</span>
                    </Link>
                </div>

                <DashboardStats stats={data.stats} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Recent Posts</h2>
                            <Link href="/dashboard/blogs" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                View all
                            </Link>
                        </div>

                        {data.recentBlogs.length > 0 ? (
                            <BlogList blogs={data.recentBlogs} />
                        ) : (
                            <div className="card p-6 text-center">
                                <div className="flex flex-col items-center space-y-4">
                                    <PencilSquareIcon className="h-12 w-12 text-gray-400" />
                                    <h3 className="text-lg font-medium">No posts yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        Start sharing your thoughts with the world.
                                    </p>
                                    <Link href="/blog/create" className="btn-primary">
                                        Create Your First Blog
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Analytics</h2>
                            </div>
                            <div className="card p-6">
                                <div className="flex flex-col items-center space-y-4">
                                    <ChartBarIcon className="h-12 w-12 text-blue-500" />
                                    <h3 className="text-lg font-medium">Blog Performance</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center">
                                        Track views, likes, and comments on your blogs to understand your audience better.
                                    </p>
                                    {data.recentBlogs.length > 0 ? (
                                        <div className="w-full grid grid-cols-2 gap-4 mt-4">
                                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
                                                <p className="text-2xl font-bold">
                                                    {data.stats.totalViews}
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-md">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Likes</p>
                                                <p className="text-2xl font-bold">
                                                    {data.stats.totalLikes}
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Comments</p>
                                                <p className="text-2xl font-bold">
                                                    {data.stats.totalComments}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Create blogs to start seeing analytics.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Activity</h2>
                        </div>

                        <ActivityFeed activities={data.activity} />

                        <div className="card p-6">
                            <div className="flex flex-col items-center space-y-4">
                                <UsersIcon className="h-12 w-12 text-green-500" />
                                <h3 className="text-lg font-medium">Network</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-center">
                                    Build your network by connecting with other writers and readers.
                                </p>
                                <div className="grid grid-cols-2 w-full gap-3">
                                    <Link href="/dashboard/connections" className="btn-secondary text-center text-sm">
                                        Connections
                                    </Link>
                                    <Link href="/dashboard/followers" className="btn-secondary text-center text-sm">
                                        Followers
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}