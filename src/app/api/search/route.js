import connectToDatabase from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import User from '@/models/User';

// GET handler for search functionality
export async function GET(request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const type = searchParams.get('type') || 'all'; // all, blogs, users, tags
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        // If search query is empty, return empty results
        if (!query.trim()) {
            return NextResponse.json({
                blogs: [],
                users: [],
                tags: [],
                totalResults: 0
            });
        }

        let results = {
            blogs: [],
            users: [],
            tags: [],
            pagination: {
                page,
                limit,
                totalResults: 0,
                totalPages: 0
            }
        };

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Create search regex
        const searchRegex = new RegExp(query, 'i');

        // Search based on type
        if (type === 'all' || type === 'blogs') {
            // Search for blogs
            const blogQuery = {
                $or: [
                    { title: { $regex: searchRegex } },
                    { content: { $regex: searchRegex } },
                    { tags: { $in: [query] } }
                ],
                privacy: 'public'  // Only search public blogs
            };

            const blogs = await Blog.find(blogQuery)
                .sort({ createdAt: -1 })
                .skip(type === 'blogs' ? skip : 0)
                .limit(type === 'blogs' ? limit : 5)  // If searching all, limit to 5 blog results
                .populate('author', 'name username avatar')
                .lean();

            const totalBlogs = await Blog.countDocuments(blogQuery);

            // Format blogs for response
            results.blogs = blogs.map(blog => ({
                _id: blog._id.toString(),
                title: blog.title,
                slug: blog.slug,
                content: blog.content.substring(0, 150).replace(/<[^>]*>/g, ''),
                coverImage: blog.coverImage,
                tags: blog.tags,
                author: {
                    _id: blog.author._id.toString(),
                    name: blog.author.name,
                    username: blog.author.username,
                    avatar: blog.author.avatar
                },
                createdAt: blog.createdAt
            }));

            if (type === 'blogs') {
                results.pagination.totalResults = totalBlogs;
                results.pagination.totalPages = Math.ceil(totalBlogs / limit);
            }
        }

        if (type === 'all' || type === 'users') {
            // Search for users
            const userQuery = {
                $or: [
                    { name: { $regex: searchRegex } },
                    { username: { $regex: searchRegex } },
                    { bio: { $regex: searchRegex } }
                ]
            };

            const users = await User.find(userQuery)
                .sort({ name: 1 })
                .skip(type === 'users' ? skip : 0)
                .limit(type === 'users' ? limit : 5)  // If searching all, limit to 5 user results
                .select('name username avatar bio')
                .lean();

            const totalUsers = await User.countDocuments(userQuery);

            // Format users for response
            results.users = users.map(user => ({
                _id: user._id.toString(),
                name: user.name,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio
            }));

            if (type === 'users') {
                results.pagination.totalResults = totalUsers;
                results.pagination.totalPages = Math.ceil(totalUsers / limit);
            }
        }

        if (type === 'all' || type === 'tags') {
            // Search for tags
            const tags = await Blog.aggregate([
                { $match: { privacy: 'public', tags: { $regex: searchRegex } } },
                { $unwind: '$tags' },
                { $match: { tags: { $regex: searchRegex } } },
                { $group: { _id: '$tags', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: type === 'tags' ? limit : 10 }  // If searching all, limit to 10 tag results
            ]);

            // Format tags for response
            results.tags = tags.map(tag => ({
                name: tag._id,
                count: tag.count
            }));
        }

        // If searching for all types, calculate total results
        if (type === 'all') {
            results.pagination.totalResults =
                (await Blog.countDocuments({
                    $or: [
                        { title: { $regex: searchRegex } },
                        { content: { $regex: searchRegex } },
                        { tags: { $in: [query] } }
                    ],
                    privacy: 'public'
                })) +
                (await User.countDocuments({
                    $or: [
                        { name: { $regex: searchRegex } },
                        { username: { $regex: searchRegex } },
                        { bio: { $regex: searchRegex } }
                    ]
                }));

            results.pagination.totalPages = Math.ceil(results.pagination.totalResults / limit);
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error performing search:', error);
        return NextResponse.json(
            { error: 'Failed to perform search' },
            { status: 500 }
        );
    }
}