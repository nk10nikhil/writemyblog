import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedPaths = [
    '/dashboard',
    '/blog/create',
    '/blog/edit',
    '/profile/settings',
];

export async function middleware(request) {
    const path = request.nextUrl.pathname;

    // Check if the path is protected
    const isProtectedPath = protectedPaths.some(prefix =>
        path === prefix || path.startsWith(`${prefix}/`)
    );

    if (!isProtectedPath) {
        return NextResponse.next();
    }

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // If there's no token and this is a protected route, redirect to login
    if (!token) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Configure the paths that should invoke this middleware
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/blog/create',
        '/blog/edit/:path*',
        '/profile/settings',
    ],
};