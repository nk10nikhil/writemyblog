import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';

// Mock data for development when MongoDB isn't available
const MOCK_FEATURED_BLOGS = [
    {
        _id: '1',
        title: 'Getting Started with Next.js',
        slug: 'getting-started-with-nextjs',
        content: '<p>Next.js is a powerful React framework that makes building modern web applications easier...</p>',
        coverImage: '/images/placeholder-blog.jpg',
        privacy: 'public',
        tags: ['nextjs', 'react', 'javascript'],
        author: {
            _id: '101',
            name: 'Jane Smith',
            username: 'janesmith',
            avatar: '/images/placeholder-blog.jpg'
        },
        likes: ['user1', 'user2', 'user3'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 5
    },
    {
        _id: '2',
        title: 'Mastering Tailwind CSS',
        slug: 'mastering-tailwind-css',
        content: '<p>Tailwind CSS is a utility-first CSS framework that allows you to build custom designs without leaving your HTML...</p>',
        coverImage: '/images/placeholder-blog.jpg',
        privacy: 'public',
        tags: ['css', 'tailwind', 'frontend'],
        author: {
            _id: '102',
            name: 'John Doe',
            username: 'johndoe',
            avatar: '/images/placeholder-blog.jpg'
        },
        likes: ['user1', 'user2'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 3
    },
    {
        _id: '3',
        title: 'The Power of TypeScript',
        slug: 'power-of-typescript',
        content: '<p>TypeScript adds static type definitions to JavaScript, making your code more robust and maintainable...</p>',
        coverImage: '/images/placeholder-blog.jpg',
        privacy: 'public',
        tags: ['typescript', 'javascript', 'webdev'],
        author: {
            _id: '103',
            name: 'Alex Johnson',
            username: 'alexj',
            avatar: '/images/placeholder-blog.jpg'
        },
        likes: ['user1', 'user3', 'user4'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 7
    }
];

export async function GET() {
    try {
        const db = await connectToDatabase();

        // If we couldn't connect to DB and we're in development, use mock data
        if (!db && process.env.NODE_ENV === 'development') {
            console.log('Using mock featured blogs data');
            return NextResponse.json({
                blogs: MOCK_FEATURED_BLOGS
            });
        }

        // Get featured blogs - using a combination of likes, comments, and recency
        const featuredBlogs = await Blog.find({ privacy: 'public' })
            .sort({ likesCount: -1, commentCount: -1, createdAt: -1 })
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
            createdAt: blog.createdAt.toISOString(),
            updatedAt: blog.updatedAt.toISOString(),
        }));

        return NextResponse.json({
            blogs: formattedBlogs
        });
    } catch (error) {
        console.error('Error fetching featured blogs:', error);

        // In development mode, return mock data as fallback
        if (process.env.NODE_ENV === 'development') {
            console.log('Error occurred, using mock featured blogs data');
            return NextResponse.json({
                blogs: MOCK_FEATURED_BLOGS
            });
        }

        return NextResponse.json(
            { message: 'Failed to fetch featured blogs' },
            { status: 500 }
        );
    }
}