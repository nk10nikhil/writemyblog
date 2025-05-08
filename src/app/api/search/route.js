import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';

// Helper functions
function errorResponse(message, status = 500) {
    return NextResponse.json({ success: false, message }, { status });
}

function successResponse(data, status = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const type = searchParams.get('type') || 'all';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        // Validate parameters
        if (page < 1 || limit < 1 || limit > 50) {
            return errorResponse('Invalid pagination parameters', 400);
        }

        // Skip if query is too short
        if (query.length < 2) {
            return successResponse({
                blogs: [],
                tags: [],
                users: [],
                pagination: { totalResults: 0, currentPage: page, totalPages: 0, limit }
            });
        }

        await connectToDatabase();

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Base search object with privacy filter (only public)
        const searchBase = { privacy: 'public' };

        // Results placeholder
        let blogs = [];
        let tags = [];
        let users = [];
        let totalResults = 0;

        if (type === 'all' || type === 'blogs') {
            // Search by title, content, or tags
            const blogSearch = {
                ...searchBase,
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { content: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } }
                ]
            };

            // Get total count
            const blogsCount = await Blog.countDocuments(blogSearch);

            // Run search query
            blogs = await Blog.find(blogSearch)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', 'name username avatar')
                .lean();

            // Format blog results
            blogs = blogs.map(blog => ({
                ...blog,
                _id: blog._id.toString(),
                author: {
                    ...blog.author,
                    _id: blog.author._id.toString()
                },
                createdAt: blog.createdAt?.toISOString(),
                updatedAt: blog.updatedAt?.toISOString()
            }));

            totalResults = blogsCount;
        }

        if (type === 'all' || type === 'tags') {
            // Get distinct tags matching query
            tags = await Blog.distinct('tags', {
                tags: { $regex: query, $options: 'i' },
                privacy: 'public'
            });

            // Limit tags results
            tags = tags.slice(0, limit);

            if (type === 'tags') {
                totalResults = tags.length;
            }
        }

        if (type === 'all' || type === 'users') {
            // Search users
            const userSearch = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { username: { $regex: query, $options: 'i' } },
                    { bio: { $regex: query, $options: 'i' } }
                ]
            };

            // Get total count
            const usersCount = await User.countDocuments(userSearch);

            // Run search query
            users = await User.find(userSearch)
                .select('name username avatar bio')
                .skip(skip)
                .limit(limit)
                .lean();

            // Format user results
            users = users.map(user => ({
                ...user,
                _id: user._id.toString()
            }));

            if (type === 'users') {
                totalResults = usersCount;
            }
        }

        return successResponse({
            query,
            blogs,
            tags,
            users,
            pagination: {
                totalResults,
                currentPage: page,
                totalPages: Math.ceil(totalResults / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        return errorResponse('Failed to search', 500);
    }
}