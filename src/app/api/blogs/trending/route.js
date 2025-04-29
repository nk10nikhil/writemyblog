import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(request) {
    try {
        await connectToDatabase();

        // Get limit from query params or default to 5
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5');

        // Get trending blogs by combining view count, likes count, and recency
        // Using an aggregation pipeline for more control over sorting logic
        const trendingBlogs = await Blog.aggregate([
            // Include only published blogs
            { $match: { status: 'published' } },
            // Add fields for sorting criteria
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    // Create a trending score - weighted combination of views, likes, and recency
                    trendingScore: {
                        $add: [
                            { $ifNull: ["$viewCount", 0] },
                            { $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 3] }, // Likes have higher weight
                            { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 86400000] } // Recency factor (days since creation)
                        ]
                    }
                }
            },
            // Sort by trending score descending
            { $sort: { trendingScore: -1 } },
            // Limit to requested number of blogs
            { $limit: limit },
            // Get author info
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorDetails"
                }
            },
            { $unwind: "$authorDetails" },
            // Project only needed fields
            {
                $project: {
                    _id: 1,
                    title: 1,
                    slug: 1,
                    excerpt: 1,
                    coverImage: 1,
                    tags: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    viewCount: 1,
                    likesCount: 1,
                    author: {
                        _id: "$authorDetails._id",
                        name: "$authorDetails.name",
                        username: "$authorDetails.username",
                        avatar: "$authorDetails.avatar"
                    }
                }
            }
        ]);

        // Convert ObjectId to string
        const formattedBlogs = trendingBlogs.map(blog => ({
            ...blog,
            _id: blog._id.toString(),
            author: {
                ...blog.author,
                _id: blog.author._id.toString()
            }
        }));

        return NextResponse.json({ success: true, data: formattedBlogs });
    } catch (error) {
        console.error('Error fetching trending blogs:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}