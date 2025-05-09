import connectToDatabase from './mongodb';
import mongoose from 'mongoose';

// Import models
import BlogModel from '../models/Blog';
import UserModel from '../models/User';
import CommentModel from '../models/Comment';
import ConnectionModel from '../models/Connection';
import FollowModel from '../models/Follow';
import NotificationModel from '../models/Notification';

// Define Models interface for better type checking
export interface Models {
    Blog: typeof BlogModel;
    User: typeof UserModel;
    Comment: typeof CommentModel;
    Connection: typeof ConnectionModel;
    Follow: typeof FollowModel;
    Notification: typeof NotificationModel;
}

// Utility function to ensure DB connection before operations
export async function getModels(): Promise<Models> {
    await connectToDatabase();
    return {
        Blog: BlogModel,
        User: UserModel,
        Comment: CommentModel,
        Connection: ConnectionModel,
        Follow: FollowModel,
        Notification: NotificationModel
    };
}

// ===== BLOG OPERATIONS =====

export async function getBlogById(id: string) {
    const { Blog } = await getModels();
    return Blog.findById(id).populate('author');
}

export async function getBlogBySlug(slug: string) {
    const { Blog } = await getModels();
    return Blog.findOne({ slug }).populate('author');
}

export async function getFeaturedBlogs(limit = 5) {
    const { Blog } = await getModels();
    return Blog.find({ featured: true, privacy: 'public' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author');
}

export async function getTrendingBlogs(limit = 10) {
    const { Blog } = await getModels();
    return Blog.find({ privacy: 'public' })
        .sort({ viewCount: -1, likes: -1 })
        .limit(limit)
        .populate('author');
}

export async function getBlogsByAuthor(authorId: string, limit = 10) {
    const { Blog } = await getModels();
    return Blog.find({ author: authorId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author');
}

export async function getBlogsByTag(tag: string, limit = 10) {
    const { Blog } = await getModels();
    return Blog.find({ tags: tag, privacy: 'public' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author');
}

export async function incrementBlogViews(blogId: string) {
    const { Blog } = await getModels();
    return Blog.findByIdAndUpdate(blogId, { $inc: { viewCount: 1 } });
}

export async function searchBlogs(query: string, limit = 20) {
    const { Blog } = await getModels();
    return Blog.find(
        {
            $text: { $search: query },
            privacy: 'public'
        },
        { score: { $meta: "textScore" } }
    )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .populate('author');
}

// ===== USER OPERATIONS =====

export async function getUserById(id: string) {
    const { User } = await getModels();
    return User.findById(id);
}

export async function getUserByUsername(username: string) {
    const { User } = await getModels();
    return User.findOne({ username });
}

export async function getUserByEmail(email: string) {
    const { User } = await getModels();
    return User.findOne({ email });
}

export async function searchUsers(query: string, limit = 20) {
    const { User } = await getModels();
    return User.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
    )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit);
}

// ===== COMMENT OPERATIONS =====

export async function getCommentsByBlogId(blogId: string) {
    const { Comment } = await getModels();
    return Comment.find({ blog: blogId })
        .sort({ createdAt: -1 })
        .populate('author');
}

// ===== CONNECTION OPERATIONS =====

export async function getConnectionsByUserId(userId: string) {
    const { Connection } = await getModels();
    return Connection.find({
        $or: [{ user: userId }, { connectedUser: userId }],
        status: 'accepted'
    }).populate('user connectedUser');
}

export async function getPendingConnectionRequests(userId: string) {
    const { Connection } = await getModels();
    return Connection.find({
        connectedUser: userId,
        status: 'pending'
    }).populate('user');
}

// ===== FOLLOW OPERATIONS =====

export async function getFollowersByUserId(userId: string) {
    const { Follow } = await getModels();
    return Follow.find({ following: userId })
        .populate('follower');
}

export async function getFollowingByUserId(userId: string) {
    const { Follow } = await getModels();
    return Follow.find({ follower: userId })
        .populate('following');
}

// ===== NOTIFICATION OPERATIONS =====

export async function getNotificationsByUserId(userId: string, limit = 20) {
    const { Notification } = await getModels();
    return Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('sender');
}

export async function markNotificationsAsRead(userId: string) {
    const { Notification } = await getModels();
    return Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
    );
}

// ===== TRANSACTION SUPPORT =====

export async function withTransaction<T>(
    callback: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
    await connectToDatabase();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await callback(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

// Create a named export object to avoid ESLint warning
const dbUtils = {
    getModels,

    // Blog operations
    getBlogById,
    getBlogBySlug,
    getFeaturedBlogs,
    getTrendingBlogs,
    getBlogsByAuthor,
    getBlogsByTag,
    incrementBlogViews,
    searchBlogs,

    // User operations
    getUserById,
    getUserByUsername,
    getUserByEmail,
    searchUsers,

    // Comment operations
    getCommentsByBlogId,

    // Connection operations
    getConnectionsByUserId,
    getPendingConnectionRequests,

    // Follow operations
    getFollowersByUserId,
    getFollowingByUserId,

    // Notification operations
    getNotificationsByUserId,
    markNotificationsAsRead,

    // Transaction support
    withTransaction
};

export default dbUtils;