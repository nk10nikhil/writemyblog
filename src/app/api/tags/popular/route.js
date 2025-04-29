import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(request) {
    try {
        await connectDB();

        // Get the limit from query params or default to 10
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Aggregate tags from blogs and count their occurrences
        const tagStats = await Blog.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit },
            { $project: { _id: 0, name: '$_id', count: 1 } }
        ]);

        return NextResponse.json({ success: true, data: tagStats });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}