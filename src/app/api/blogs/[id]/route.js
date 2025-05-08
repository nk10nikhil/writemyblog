import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';

// Helper functions for response standardization
function errorResponse(message, status = 500) {
    return NextResponse.json({ success: false, message }, { status });
}

function successResponse(data, status = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}

// Get a specific blog post
export async function GET(request, { params }) {
    try {
        const { id } = params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse('Invalid blog ID', 400);
        }

        await connectToDatabase();

        // Find the blog and populate author details
        const blog = await Blog.findById(id)
            .populate('author', 'name username avatar')
            .lean();

        if (!blog) {
            return errorResponse('Blog not found', 404);
        }

        // Check privacy settings
        const session = await getServerSession();
        const userId = session?.user?.id;

        if (blog.privacy !== 'public') {
            // For private blogs, only author can view
            if (blog.privacy === 'private' && blog.author._id.toString() !== userId) {
                return errorResponse('You do not have permission to view this blog', 403);
            }

            // For followers/connections blogs, additional checks would go here
            // For simplicity, this implementation just checks author
            if (blog.author._id.toString() !== userId) {
                return errorResponse('You do not have permission to view this blog', 403);
            }
        }

        // Format the blog for response
        const formattedBlog = {
            ...blog,
            _id: blog._id.toString(),
            author: {
                ...blog.author,
                _id: blog.author._id.toString()
            }
        };

        // Increment view count
        await Blog.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

        return successResponse({ blog: formattedBlog });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return errorResponse('Failed to fetch blog', 500);
    }
}

// Update a blog post
export async function PUT(request, { params }) {
    try {
        const { id } = params;

        // Validate blog ID
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse('Invalid blog ID', 400);
        }

        // Check authentication
        const session = await getServerSession();
        if (!session) {
            return errorResponse('Authentication required', 401);
        }

        await connectToDatabase();

        // Find the blog
        const blog = await Blog.findById(id);

        if (!blog) {
            return errorResponse('Blog not found', 404);
        }

        // Check if user is the author
        if (blog.author.toString() !== session.user.id) {
            return errorResponse('You do not have permission to edit this blog', 403);
        }

        // Parse request body
        const data = await request.json();

        // Validate required fields
        if (!data.title || !data.title.trim() === '') {
            return errorResponse('Title is required', 400);
        }

        if (!data.content || data.content.trim() === '' || data.content === '<p><br></p>') {
            return errorResponse('Content is required', 400);
        }

        // Update the blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            {
                title: data.title,
                content: data.content,
                tags: data.tags || [],
                privacy: data.privacy || 'public',
                coverImage: data.coverImage || '',
                updatedAt: new Date()
            },
            { new: true }
        ).lean();

        // Format for response
        const formattedBlog = {
            ...updatedBlog,
            _id: updatedBlog._id.toString(),
            author: updatedBlog.author.toString()
        };

        return successResponse({
            message: 'Blog updated successfully',
            blog: formattedBlog
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        return errorResponse('Failed to update blog', 500);
    }
}

// Delete a blog post
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Validate blog ID
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse('Invalid blog ID', 400);
        }

        // Check authentication
        const session = await getServerSession();
        if (!session) {
            return errorResponse('Authentication required', 401);
        }

        await connectToDatabase();

        // Find the blog
        const blog = await Blog.findById(id);

        if (!blog) {
            return errorResponse('Blog not found', 404);
        }

        // Check if user is the author
        if (blog.author.toString() !== session.user.id) {
            return errorResponse('You do not have permission to delete this blog', 403);
        }

        // Delete the blog
        await Blog.findByIdAndDelete(id);

        // In a production app, you might also want to delete associated data
        // like comments, likes, etc.

        return successResponse({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return errorResponse('Failed to delete blog', 500);
    }
}