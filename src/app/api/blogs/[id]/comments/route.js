import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import Blog from '@/models/Blog';
import User from '@/models/User';

// GET handler - get comments for a blog post
export async function GET(request, { params }) {
    try {
        await connectToDatabase();
        const { id } = params;

        // Get all comments for this blog post
        const comments = await Comment.find({ blog: id })
            .populate('author', 'name username avatar')
            .sort({ createdAt: -1 });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST handler - add a new comment to a blog post
export async function POST(request, { params }) {
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
        const body = await request.json();
        const { content, parentId } = body;

        // Validate content
        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Comment content cannot be empty' },
                { status: 400 }
            );
        }

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

        // Create the new comment
        const comment = new Comment({
            blog: id,
            author: user._id,
            content,
            parentId: parentId || null,
        });

        await comment.save();

        // Populate author information for response
        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name username avatar');

        return NextResponse.json(populatedComment, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}