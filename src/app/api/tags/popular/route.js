import { NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import connectToDatabase from '@/lib/mongodb';

export async function GET(request) {
    try {
        // Connect to the database - make sure to await the connection
        await connectToDatabase();

        // Get query parameter for limit (default to 10 if not provided)
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Aggregate to find the most popular tags
        const tagAggregation = await Blog.aggregate([
            // Only include public blogs
            { $match: { privacy: 'public' } },
            // Unwind the tags array to separate documents
            { $unwind: '$tags' },
            // Group by tag and count occurrences
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            // Sort by count descending
            { $sort: { count: -1 } },
            // Limit to requested number
            { $limit: limit },
            // Rename _id to name for clarity
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    count: 1
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            data: tagAggregation || [] // Ensure we always return an array
        });

    } catch (error) {
        console.error('Error fetching popular tags:', error);

        // Return an empty array with error details in development
        // Or just empty array in production to avoid breaking the UI
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch popular tags',
                data: [], // Return empty array so UI can handle it gracefully
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}