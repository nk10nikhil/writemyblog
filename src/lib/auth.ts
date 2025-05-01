import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Configure session and secret for NextAuth
export const authConfig = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    debug: process.env.NODE_ENV === 'development',
};

// Get session on the server side
export async function getAuthSession() {
    return await getServerSession();
}

// Middleware to require authentication for API routes
export async function requireAuth() {
    // Removed unused parameter: req
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json(
            { success: false, message: 'Authentication required' },
            { status: 401 }
        );
    }

    return { session };
}

// Redirect if user is not authenticated (for client components)
export async function requireAuthClient() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('next-auth.session-token');

    if (!sessionToken) {
        redirect('/auth/login');
    }
}

// Define interfaces for type safety - using a type instead of extending Session
interface UserSession {
    user?: {
        id?: string;
        role?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        [key: string]: unknown;
    };
    expires?: string;
}

interface BlogAuthor {
    _id: {
        toString: () => string;
    };
}

interface BlogData {
    privacy: string;
    author: BlogAuthor;
}

// Helper to check if user is authenticated
export function isAuthenticated(session: UserSession): boolean {
    return !!session?.user;
}

// Helper to check if user can modify a resource
export function canModifyResource(session: UserSession, resourceAuthorId: string): boolean {
    if (!session?.user) return false;

    // Check if user is the author or an admin
    return (
        session.user.id === resourceAuthorId ||
        session.user.role === 'admin'
    );
}

// Helper to determine user access level for a blog based on privacy settings
export function canAccessBlog(blog: BlogData, session: UserSession): boolean {
    if (!blog) return false;

    // Public blogs are accessible to everyone
    if (blog.privacy === 'public') return true;

    // If no session, user can't access non-public blogs
    if (!session?.user) return false;

    // Blog author can access their own blog
    if (blog.author._id.toString() === session.user.id) return true;

    // Admin can access any blog
    if (session.user.role === 'admin') return true;

    // For other privacy levels, additional checks would be needed
    // This would require querying followers/connections depending on the privacy setting
    if (blog.privacy === 'followers') {
        // This would need to check if the user follows the author
        // return isFollowing(session.user.id, blog.author._id);
        return false;
    }

    if (blog.privacy === 'connections') {
        // This would need to check if the user is connected with the author
        // return isConnected(session.user.id, blog.author._id);
        return false;
    }

    return false;
}

// Helper to check if the user is an admin
export function isAdmin(session: UserSession): boolean {
    return session?.user?.role === 'admin';
}