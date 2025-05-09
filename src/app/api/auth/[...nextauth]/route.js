// Define the authOptions configuration separately
const getAuthOptions = () => ({
    providers: [
        {
            id: 'credentials',
            name: 'Credentials',
            type: 'credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Import these dynamically to avoid execution during build
                    const connectToDatabase = (await import('@/lib/mongodb')).default;
                    const User = (await import('@/models/User')).default;
                    const bcrypt = await import('bcryptjs');

                    await connectToDatabase();
                    const user = await User.findOne({ email: credentials.email });

                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        username: user.username,
                        avatar: user.avatar,
                        role: user.role
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
                    return null;
                }
            }
        }
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.avatar = user.avatar;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.avatar = token.avatar;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    debug: process.env.NODE_ENV === 'development',
});

// Use dynamic imports for NextAuth to prevent the code from being executed during build
export async function GET(req) {
    const { NextAuth } = await import('next-auth');
    const handler = await NextAuth(getAuthOptions());
    return handler(req);
}

export async function POST(req) {
    const { NextAuth } = await import('next-auth');
    const handler = await NextAuth(getAuthOptions());
    return handler(req);
}