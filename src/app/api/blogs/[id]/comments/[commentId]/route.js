import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Comment from '@/models/Comment';

// Helper functions
function errorResponse(message, status = 500) {
    return NextResponse.json({ success: false, message }, { status });
}

function successResponse(data, status = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}

// Get a single comment
export async function GET(request, { params }) {
    try {
        const { id: blogId, commentId } = params;

        if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
            return errorResponse('Invalid comment ID', 400);
        }

        await connectToDatabase();

        // Find the comment and populate author details
        const comment = await Comment.findById(commentId)
            .populate('author', 'name username avatar')
            .lean();

        if (!comment) {
            return errorResponse('Comment not found', 404);
        }

        // Ensure the comment belongs to the specified blog
        if (comment.blog.toString() !== blogId) {
            return errorResponse('Comment not found on this blog', 404);
        }

        // Format for response
        const formattedComment = {
            ...comment,
            _id: comment._id.toString(),
            blog: comment.blog.toString(),
            author: {
                ...comment.author,
                _id: comment.author._id.toString()
            },
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString()
        };

        return successResponse({ comment: formattedComment });
    } catch (error) {
        console.error('Error fetching comment:', error);
        return errorResponse('Failed to fetch comment', 500);
    }
}

// Update a comment
export async function PUT(request, { params }) {
    try {
        const { id: blogId, commentId } = params;

        // Validate IDs
        if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
            return errorResponse('Invalid comment ID', 400);
        }

        // Check authentication
        const session = await getServerSession();
        if (!session) {
            return errorResponse('Authentication required', 401);
        }

        await connectToDatabase();

        // Find the comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return errorResponse('Comment not found', 404);
        }

        // Ensure the comment belongs to the specified blog
        if (comment.blog.toString() !== blogId) {
            return errorResponse('Comment not found on this blog', 404);
        }

        // Check if user is the author
        if (comment.author.toString() !== session.user.id) {
            return errorResponse('You do not have permission to edit this comment', 403);
        }

        // Parse request body
        const data = await request.json();

        // Validate content
        if (!data.content || data.content.trim() === '') {
            return errorResponse('Comment content is required', 400);
        }

        // Update the comment
        comment.content = data.content;
        comment.updatedAt = new Date();

        await comment.save();

        // Get updated comment with populated author
        const updatedComment = await Comment.findById(commentId)
            .populate('author', 'name username avatar')
            .lean();

        // Format for response
        const formattedComment = {
            ...updatedComment,
            _id: updatedComment._id.toString(),
            blog: updatedComment.blog.toString(),
            author: {
                ...updatedComment.author,
                _id: updatedComment.author._id.toString()
            },
            createdAt: updatedComment.createdAt.toISOString(),
            updatedAt: updatedComment.updatedAt.toISOString()
        };

        return successResponse({
            message: 'Comment updated successfully',
            comment: formattedComment
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        return errorResponse('Failed to update comment', 500);
    }
}

// Delete a comment
export async function DELETE(request, { params }) {
    try {
        const { id: blogId, commentId } = params;

        // Validate IDs
        if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
            return errorResponse('Invalid comment ID', 400);
        }

        // Check authentication
        const session = await getServerSession();
        if (!session) {
            return errorResponse('Authentication required', 401);
        }

        await connectToDatabase();

        // Find the comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return errorResponse('Comment not found', 404);
        }

        // Ensure the comment belongs to the specified blog
        if (comment.blog.toString() !== blogId) {
            return errorResponse('Comment not found on this blog', 404);
        }

        // Check if user is the author
        if (comment.author.toString() !== session.user.id) {
            return errorResponse('You do not have permission to delete this comment', 403);
        }

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        return successResponse({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return errorResponse('Failed to delete comment', 500);
    }
}