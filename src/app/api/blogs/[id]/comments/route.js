import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Blog from '@/models/Blog';

// Helper functions
function errorResponse(message, status = 500) {
    return NextResponse.json({ success: false, message }, { status });
}

function successResponse(data, status = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}

// Get all comments for a blog
export async function GET(request, { params }) {
    try {
        const { id: blogId } = params;

        if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
            return errorResponse('Invalid blog ID', 400);
        }

        await connectToDatabase();

        // Find all comments for this blog and populate author details
        const comments = await Comment.find({ blog: blogId })
            .sort({ createdAt: -1 }) // Newest first
            .populate('author', 'name username avatar')
            .lean();

        // Format comments for response
        const formattedComments = comments.map(comment => ({
            ...comment,
            _id: comment._id.toString(),
            blog: comment.blog.toString(),
            author: {
                ...comment.author,
                _id: comment.author._id.toString()
            },
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString()
        }));

        return successResponse({ comments: formattedComments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return errorResponse('Failed to fetch comments', 500);
    }
}

// Add a new comment to a blog
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

        await connectToDatabase();

        // Check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return errorResponse('Blog not found', 404);
        }

        // Parse request body
        const data = await request.json();

        // Validate comment content
        if (!data.content || data.content.trim() === '') {
            return errorResponse('Comment content is required', 400);
        }

        // Create new comment
        const newComment = new Comment({
            content: data.content,
            blog: blogId,
            author: session.user.id,
        });

        // Save comment
        await newComment.save();

        // Populate author details for response
        const populatedComment = await Comment.findById(newComment._id)
            .populate('author', 'name username avatar')
            .lean();

        // Format response
        const formattedComment = {
            ...populatedComment,
            _id: populatedComment._id.toString(),
            blog: populatedComment.blog.toString(),
            author: {
                ...populatedComment.author,
                _id: populatedComment.author._id.toString()
            },
            createdAt: populatedComment.createdAt.toISOString(),
            updatedAt: populatedComment.updatedAt.toISOString()
        };

        return successResponse({
            message: 'Comment added successfully',
            comment: formattedComment
        }, 201);
    } catch (error) {
        console.error('Error adding comment:', error);
        return errorResponse('Failed to add comment', 500);
    }
}