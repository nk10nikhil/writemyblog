import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const exclude = searchParams.get('exclude');
        const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
        const author = searchParams.get('author');
        const limit = parseInt(searchParams.get('limit') || '3', 10);

        // Build query for related blogs
        const query = {
            privacy: 'public',
            _id: { $ne: exclude },
        };

        // Related by tags or author
        if (tags.length > 0 && author) {
            query.$or = [
                { tags: { $in: tags } },
                { author }
            ];
        } else if (tags.length > 0) {
            query.tags = { $in: tags };
        } else if (author) {
            query.author = author;
        }

        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('author', 'name username avatar')
            .lean();

        const formattedBlogs = blogs.map(blog => ({
            ...blog,
            _id: blog._id.toString(),
            author: blog.author ? {
                ...blog.author,
                _id: blog.author._id.toString(),
            } : null,
            createdAt: blog.createdAt?.toISOString(),
            updatedAt: blog.updatedAt?.toISOString(),
        }));

        return NextResponse.json({ blogs: formattedBlogs });
    } catch (error) {
        console.error('Error fetching related blogs:', error);
        return NextResponse.json({ blogs: [], error: 'Failed to fetch related blogs' }, { status: 500 });
    }
}
