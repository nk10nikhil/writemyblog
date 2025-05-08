import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';

// Helper functions
function errorResponse(message, status = 500) {
    return NextResponse.json({ success: false, message }, { status });
}

function successResponse(data, status = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}

// Toggle like on a blog post
export async function POST(request, { params }) {
    try {
        const { id: blogId } = params;

        // Validate blog ID
        if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
            return errorResponse('Invalid blog ID', 400);
        }

        // Check authentication
        const session = await getServerSession();
        if (!session) {
            return errorResponse('Authentication required', 401);
        }

        const userId = session.user.id;

        await connectToDatabase();

        // Find the blog
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return errorResponse('Blog not found', 404);
        }

        // Check if user has already liked the blog
        const hasLiked = blog.likes.includes(userId);

        // Toggle like
        if (hasLiked) {
            // Unlike: Remove user from likes array
            blog.likes = blog.likes.filter(id => id.toString() !== userId);
        } else {
            // Like: Add user to likes array
            blog.likes.push(userId);
        }

        // Save changes
        await blog.save();

        return successResponse({
            message: hasLiked ? 'Blog unliked successfully' : 'Blog liked successfully',
            liked: !hasLiked,
            likesCount: blog.likes.length
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        return errorResponse('Failed to update like status', 500);
    }
}