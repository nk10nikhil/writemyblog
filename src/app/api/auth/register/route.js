import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
    try {
        const { name, username, email, password } = await request.json();

        // Validate input
        if (!name || !username || !email || !password) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Username validation
        if (username.length < 3) {
            return NextResponse.json(
                { message: 'Username must be at least 3 characters long' },
                { status: 400 }
            );
        }

        // Password validation
        if (password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    message: existingUser.email === email.toLowerCase() ?
                        'Email already in use' : 'Username already taken'
                },
                { status: 409 }
            );
        }

        // Create user
        const user = new User({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            avatar: '/images/default-avatar.png',
        });

        await user.save();

        // Don't include password in response
        const userWithoutPassword = {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            role: user.role,
            createdAt: user.createdAt,
        };

        return NextResponse.json(
            { message: 'User registered successfully', user: userWithoutPassword },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);

        return NextResponse.json(
            { message: 'Registration failed' },
            { status: 500 }
        );
    }
}