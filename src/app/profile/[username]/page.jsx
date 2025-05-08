import { redirect, notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Blog from '@/models/Blog';
import { getServerSession } from 'next-auth/next';
import ProfileCard from '@/components/profile/ProfileCard';
import BlogTabs from '@/components/profile/BlogTabs';

async function getUserProfile(username) {
    await connectToDatabase();

    // Find user by username
    const user = await User.findOne({ username }).lean();

    if (!user) {
        return null;
    }

    // Format user data
    return {
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString()
    };
}

async function getUserBlogs(userId) {
    // Get published blogs by user
    const blogs = await Blog.find({
        author: userId,
        privacy: 'public'
    })
        .sort({ createdAt: -1 })
        .lean();

    // Format blogs for response
    return blogs.map(blog => ({
        ...blog,
        _id: blog._id.toString(),
        author: blog.author.toString(),
        createdAt: blog.createdAt?.toISOString(),
        updatedAt: blog.updatedAt?.toISOString()
    }));
}

export async function generateMetadata({ params }) {
    const user = await getUserProfile(params.username);

    if (!user) {
        return {
            title: 'User Not Found'
        };
    }

    return {
        title: `${user.name} (@${user.username}) | WritemyBlog`,
        description: user.bio || `Check out ${user.name}'s profile on WritemyBlog`
    };
}

export default async function ProfilePage({ params }) {
    const session = await getServerSession();
    const user = await getUserProfile(params.username);

    if (!user) {
        notFound();
    }

    // Check if viewing own profile
    const isOwnProfile = session?.user?.id === user._id;

    // Get user's public blogs
    const blogs = await getUserBlogs(user._id);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <ProfileCard
                user={user}
                isOwnProfile={isOwnProfile}
            />

            <div className="mt-8">
                <BlogTabs
                    blogs={blogs}
                    username={user.username}
                    isOwnProfile={isOwnProfile}
                />
            </div>
        </div>
    );
}