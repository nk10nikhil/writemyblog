import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';

export async function GET() {
    try {
        // Make sure to properly await the database connection
        await connectToDatabase();

        // Get featured blogs - using a combination of likes, comments, and recency
        const featuredBlogs = await Blog.find({ privacy: 'public' })
            .sort({
                featured: -1,  // Featured blogs first
                likes: -1,     // Then by number of likes (array length)
                viewCount: -1, // Then by view count
                createdAt: -1  // Then by recency
            })
            .limit(6)
            .populate('author', 'name username avatar')
            .lean();

        // Format blogs for response
        const formattedBlogs = featuredBlogs.map(blog => ({
            ...blog,
            _id: blog._id.toString(),
            author: {
                ...blog.author,
                _id: blog.author._id.toString()
            },
            likesCount: blog.likes ? blog.likes.length : 0,
            createdAt: blog.createdAt.toISOString(),
            updatedAt: blog.updatedAt.toISOString(),
        }));

        return NextResponse.json({
            success: true,
            blogs: formattedBlogs
        });
    } catch (error) {
        console.error('Error fetching featured blogs:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch featured blogs',
                blogs: [] // Return empty array to avoid breaking UI
            },
            { status: 500 }
        );
    }
}