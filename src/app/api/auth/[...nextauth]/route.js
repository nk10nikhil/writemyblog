import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                await connectToDatabase();

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error('No user found with this email');
                }

                const isValid = await user.comparePassword(credentials.password);

                if (!isValid) {
                    throw new Error('Invalid password');
                }

                // Make sure we explicitly convert ObjectId to string format
                const userId = user._id.toString();

                console.log('User authenticated successfully:', {
                    id: userId,
                    email: user.email,
                    name: user.name
                });

                // Return user data with explicit id property
                return {
                    id: userId,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    avatar: user.avatar,
                    role: user.role,
                };
            }
        })
    ],
    // Explicitly configure the JWT callback to include the user ID
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // When a user signs in, add their data to the token
                token.id = user.id; // Use the explicit ID we set in authorize
                token.username = user.username;
                token.avatar = user.avatar;
                token.role = user.role;

                console.log('JWT callback - token ID set to:', token.id);
            }
            return token;
        },
        async session({ session, token }) {
            // Ensure user object exists in the session
            if (!session.user) {
                session.user = {};
            }

            // Add required user properties from token
            session.user.id = token.id; // Add the ID to the session
            session.user.username = token.username;
            session.user.avatar = token.avatar;
            session.user.role = token.role;

            console.log('Session callback - user ID in session:', session.user.id);

            return session;
        }
    },
    pages: {
        signIn: '/auth/login',
        signOut: '/',
        error: '/auth/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };