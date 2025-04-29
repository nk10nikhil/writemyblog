import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET a specific blog by ID
export async function GET(request, { params }) {
    try {
        await connectDB();
        const blog = await Blog.findById(params.id)
            .populate('author', 'name username avatar')
            .populate('comments.user', 'name username avatar');

        if (!blog) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: blog });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PUT to update a blog
export async function PUT(request, { params }) {
    try {
        const body = await request.json();
        await connectDB();

        const updatedBlog = await Blog.findByIdAndUpdate(
            params.id,
            { ...body },
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedBlog });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// DELETE a blog
export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const deletedBlog = await Blog.findByIdAndDelete(params.id);

        if (!deletedBlog) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}