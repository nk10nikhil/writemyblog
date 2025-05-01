import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import User from '@/models/User';

// PUT handler to like/unlike a blog post
export async function PUT(request, { params }) {
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
        const { id } = params;

        // Check if the blog post exists
        const blog = await Blog.findById(id);
        if (!blog) {
            return NextResponse.json(
                { error: 'Blog post not found' },
                { status: 404 }
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

        const userId = user._id.toString();
        const hasLiked = blog.likes.includes(userId);

        // Toggle like status
        if (hasLiked) {
            // Unlike the post
            await Blog.findByIdAndUpdate(id, {
                $pull: { likes: userId }
            });
        } else {
            // Like the post
            await Blog.findByIdAndUpdate(id, {
                $addToSet: { likes: userId }
            });
        }

        // Get updated likes count
        const updatedBlog = await Blog.findById(id);
        const likeCount = updatedBlog.likes.length;

        return NextResponse.json({
            success: true,
            liked: !hasLiked,
            likeCount
        });
    } catch (error) {
        console.error('Error toggling like status:', error);
        return NextResponse.json(
            { error: 'Failed to update like status' },
            { status: 500 }
        );
    }
}