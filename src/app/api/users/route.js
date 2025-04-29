import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

// GET method to check if username exists or get user details
export async function GET(request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        // If username is provided, check if it exists
        if (username) {
            const user = await User.findOne({ username: username });
            return NextResponse.json({ exists: !!user }, { status: 200 });
        }

        // Otherwise return error
        return NextResponse.json({ message: 'Missing username parameter' }, { status: 400 });
    } catch (error) {
        console.error('Error in users API:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}