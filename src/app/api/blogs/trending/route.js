import { NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import User from '@/models/User';  // Add User model import
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
    try {
        // Connect to the database
        await connectToDatabase();

        // Get trending blogs (sorted by view count and likes)
        const blogs = await Blog.find({ privacy: 'public' })
            .sort({ viewCount: -1, 'likes.length': -1, createdAt: -1 }) // Sort by views, likes, and recency
            .limit(6)
            .populate({
                path: 'author',
                select: 'name avatar username' // Select only these fields from the author
            })
            .lean();

        // Format the response data
        const formattedBlogs = blogs.map(blog => ({
            _id: blog._id.toString(),
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.content.substring(0, 150) + (blog.content.length > 150 ? '...' : ''),
            coverImage: blog.coverImage,
            author: blog.author ? {
                _id: blog.author._id.toString(),
                name: blog.author.name,
                avatar: blog.author.avatar,
                username: blog.author.username
            } : null,
            createdAt: blog.createdAt,
            viewCount: blog.viewCount,
            likesCount: blog.likes?.length || 0
        }));

        return NextResponse.json({
            success: true,
            data: formattedBlogs
        });

    } catch (error) {
        console.error('Error fetching trending blogs:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch trending blogs', error: error.message },
            { status: 500 }
        );
    }
}