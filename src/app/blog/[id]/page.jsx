import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';
import Comment from '@/models/Comment';
import Follow from '@/models/Follow';
import Connection from '@/models/Connection';
import Comments from '@/components/blog/Comments';
import BlogActions from '@/components/blog/BlogActions';
import BlogTags from '@/components/blog/BlogTags';
import RelatedBlogs from '@/components/blog/RelatedBlogs';

export async function generateMetadata({ params }) {
    // Await the params object to get access to its properties
    const resolvedParams = await params;
    const { id } = resolvedParams;

    try {
        await connectToDatabase();
        const blog = await Blog.findById(id).populate('author', 'name').lean();

        if (!blog) {
            return {
                title: 'Blog Not Found',
            };
        }

        return {
            title: `${blog.title} | ModernBlog`,
            description: blog.content.substring(0, 200).replace(/<[^>]*>/g, ''),
            openGraph: {
                title: blog.title,
                description: blog.content.substring(0, 200).replace(/<[^>]*>/g, ''),
                images: blog.coverImage ? [{ url: blog.coverImage }] : [],
            },
            metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Blog | ModernBlog',
        };
    }
}

async function incrementViewCount(blogId, userId) {
    await connectToDatabase();

    // If userId is provided, check if this user has already viewed the blog
    if (userId) {
        const hasViewed = await Blog.findOne({
            _id: blogId,
            'viewedBy.user': userId
        }).lean();

        if (!hasViewed) {
            await Blog.findByIdAndUpdate(blogId, {
                $inc: { viewCount: 1 },
                $push: { viewedBy: { user: userId, timestamp: new Date() } }
            });
        }
    } else {
        // If no userId (not logged in), just increment view count
        await Blog.findByIdAndUpdate(blogId, {
            $inc: { viewCount: 1 }
        });
    }
}

// Check if the current user has access to view this blog based on privacy settings
async function checkBlogAccess(blog, userId) {
    if (!blog) return false;

    // Public blogs are accessible to everyone
    if (blog.privacy === 'public') {
        return true;
    }

    // If not logged in, can only view public blogs
    if (!userId) {
        return false;
    }

    // Blog author can always view their own blogs
    if (blog.author._id.toString() === userId) {
        return true;
    }

    // For other privacy settings, check user relationships
    switch (blog.privacy) {
        case 'followers': {
            // Check if user is following the author
            const isFollowing = await Follow.exists({
                follower: userId,
                following: blog.author._id
            });
            return !!isFollowing;
        }

        case 'connections': {
            // Check if user is connected to the author
            const isConnected = await Connection.exists({
                $or: [
                    { requester: userId, recipient: blog.author._id, status: 'accepted' },
                    { requester: blog.author._id, recipient: userId, status: 'accepted' },
                ]
            });
            return !!isConnected;
        }

        case 'private':
            // Private blogs are only viewable by the author
            return false;

        default:
            return false;
    }
}

export default async function BlogPage({ params }) {
    const session = await getServerSession();
    // Await the params object to get access to its properties
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectToDatabase();

    try {
        // Get the blog post with author details
        const blog = await Blog.findById(id)
            .populate('author', 'name username avatar bio')
            .lean();

        if (!blog) {
            notFound();
        }

        // Convert MongoDB _id to string
        blog._id = blog._id.toString();
        blog.author._id = blog.author._id.toString();

        // Check if user can access this blog
        const hasAccess = await checkBlogAccess(blog, session?.user?.id);

        if (!hasAccess) {
            if (session) {
                // User is logged in but doesn't have access
                redirect('/unauthorized');
            } else {
                // User is not logged in
                redirect(`/auth/login?redirect=/blog/${id}`);
            }
        }

        // Get comments
        const comments = await Comment.find({ blog: id, parentId: null })
            .populate('author', 'name username avatar')
            .lean();

        // Format comments
        const formattedComments = comments.map(comment => ({
            ...comment,
            _id: comment._id.toString(),
            author: {
                ...comment.author,
                _id: comment.author._id.toString(),
            },
            blog: comment.blog.toString(),
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString(),
        }));

        // Get replies to comments
        const replies = await Comment.find({ blog: id, parentId: { $ne: null } })
            .populate('author', 'name username avatar')
            .lean();

        // Format replies
        const formattedReplies = replies.map(reply => ({
            ...reply,
            _id: reply._id.toString(),
            author: {
                ...reply.author,
                _id: reply.author._id.toString(),
            },
            blog: reply.blog.toString(),
            parentId: reply.parentId.toString(),
            createdAt: reply.createdAt.toISOString(),
            updatedAt: reply.updatedAt.toISOString(),
        }));

        // Combine comments and replies
        const allComments = [...formattedComments, ...formattedReplies];

        // Get likes count
        const likesCount = blog.likes?.length || 0;

        // Check if current user has liked the post
        const hasLiked = session?.user?.id
            ? blog.likes?.includes(session.user.id)
            : false;

        // Increment view count
        await incrementViewCount(id, session?.user?.id);

        // Format date
        const publishedDate = formatDistance(
            new Date(blog.createdAt),
            new Date(),
            { addSuffix: true }
        );

        // Prepare blog data for the client
        const blogData = {
            ...blog,
            likesCount,
            hasLiked,
            publishedDate,
            isOwnBlog: session?.user?.id === blog.author._id,
        };

        return (
            <div className="max-w-4xl mx-auto">
                <article className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
                    {/* Cover Image */}
                    {blog.coverImage && (
                        <div className="relative h-64 md:h-96 w-full">
                            <Image
                                src={blog.coverImage}
                                alt={blog.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <div className="p-6 md:p-8">
                        {/* Privacy Badge */}
                        {blog.privacy !== 'public' && (
                            <div className="mb-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${blog.privacy === 'private'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    : blog.privacy === 'connections'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}>
                                    {blog.privacy === 'private'
                                        ? 'Private'
                                        : blog.privacy === 'connections'
                                            ? 'Connections Only'
                                            : 'Followers Only'
                                    }
                                </span>
                            </div>
                        )}

                        {/* Blog Title */}
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="mb-6">
                                <BlogTags tags={blog.tags} />
                            </div>
                        )}

                        {/* Author & Date */}
                        <div className="flex items-center mb-8">
                            <Link href={`/profile/${blog.author.username}`} className="flex items-center group">
                                <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700">
                                    {blog.author.avatar && (
                                        <Image
                                            src={blog.author.avatar}
                                            alt={blog.author.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {blog.author.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Published {publishedDate}
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Blog Content */}
                        <div
                            className="prose dark:prose-invert prose-lg max-w-none mb-10"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Blog Actions (Like, Share, etc.) */}
                        <BlogActions blog={blogData} />
                    </div>
                </article>

                {/* Comments Section */}
                <div className="mt-10">
                    <Comments
                        comments={allComments}
                        blogId={id}
                        blogAuthorId={blog.author._id}
                    />
                </div>

                {/* Related Blogs */}
                <div className="mt-12">
                    <RelatedBlogs
                        currentBlogId={id}
                        tags={blog.tags}
                        authorId={blog.author._id}
                    />
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error fetching blog:', error);
        notFound();
    }
}