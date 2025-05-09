import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import slugify from 'slugify';
import { getCurrentUser } from '@/lib/auth';
import User from '@/models/User'; // Import User model

// Mock data for development when MongoDB isn't available
const MOCK_BLOGS = [
    {
        _id: '1',
        title: 'Getting Started with Next.js',
        slug: 'getting-started-with-nextjs',
        content: '<p>Next.js is a powerful React framework that makes building modern web applications easier...</p>',
        coverImage: '/images/placeholder-blog.jpg',
        privacy: 'public',
        tags: ['nextjs', 'react', 'javascript'],
        author: {
            _id: '101',
            name: 'Jane Smith',
            username: 'janesmith',
            avatar: '/images/placeholder-blog.jpg'
        },
        likes: ['user1', 'user2', 'user3'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 5
    },
    {
        _id: '2',
        title: 'Mastering Tailwind CSS',
        slug: 'mastering-tailwind-css',
        content: '<p>Tailwind CSS is a utility-first CSS framework that allows you to build custom designs without leaving your HTML...</p>',
        coverImage: '/images/placeholder-blog.jpg',
        privacy: 'public',
        tags: ['css', 'tailwind', 'frontend'],
        author: {
            _id: '102',
            name: 'John Doe',
            username: 'johndoe',
            avatar: '/images/placeholder-blog.jpg'
        },
        likes: ['user1', 'user2'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 3
    },
    {
        _id: '3',
        title: 'The Power of TypeScript',
        slug: 'power-of-typescript',
        content: '<p>TypeScript adds static type definitions to JavaScript, making your code more robust and maintainable...</p>',
        coverImage: '/images/placeholder-blog.jpg',
        privacy: 'public',
        tags: ['typescript', 'javascript', 'webdev'],
        author: {
            _id: '103',
            name: 'Alex Johnson',
            username: 'alexj',
            avatar: '/images/placeholder-blog.jpg'
        },
        likes: ['user1', 'user3', 'user4'],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 7
    },
    {
        _id: '4',
        title: 'Modern React Hooks',
        slug: 'modern-react-hooks',
        content: '<p>React Hooks have revolutionized how we write React components...</p>',
        coverImage: '/images/placeholder-blog.jpg',
        privacy: 'public',
        tags: ['react', 'hooks', 'javascript'],
        author: {
            _id: '102',
            name: 'John Doe',
            username: 'johndoe',
            avatar: '/images/placeholder-blog.jpg'
        },
        likes: ['user2', 'user5'],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 2
    },
    {
        _id: '5',
        title: 'Introduction to MongoDB',
        slug: 'introduction-to-mongodb',
        content: '<p>MongoDB is a popular NoSQL database that provides high performance and scalability...</p>',
        coverImage: '/images/placeholder-blog.jpg',
        privacy: 'public',
        tags: ['mongodb', 'database', 'backend'],
        author: {
            _id: '101',
            name: 'Jane Smith',
            username: 'janesmith',
            avatar: '/images/placeholder-blog.jpg'
        },
        likes: ['user1', 'user3'],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 1
    },
    {
        _id: '6',
        title: 'API Development with Node.js',
        slug: 'api-development-with-nodejs',
        content: '<p>Node.js is an excellent platform for building fast and scalable APIs...</p>',
        coverImage: '/images/placeholder-blog.jpg',
        privacy: 'public',
        tags: ['nodejs', 'api', 'backend', 'javascript'],
        author: {
            _id: '103',
            name: 'Alex Johnson',
            username: 'alexj',
            avatar: '/images/placeholder-blog.jpg'
        },
        likes: ['user2', 'user4', 'user5'],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 4
    }
];

// Standardized error response function
function errorResponse(message, status = 500, additionalData = {}) {
    console.error(`API Error (${status}): ${message}`);
    return NextResponse.json(
        {
            success: false,
            message,
            ...additionalData
        },
        { status }
    );
}

// Standardized success response function
function successResponse(data, status = 200) {
    return NextResponse.json(
        {
            success: true,
            ...data
        },
        { status }
    );
}

// Get all blogs (with filtering)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const author = searchParams.get('author');
        const tag = searchParams.get('tag');
        const privacy = searchParams.get('privacy') || 'public';
        const sort = searchParams.get('sort') || '-createdAt'; // Default sort by newest

        // Validate query parameters
        if (page < 1 || limit < 1 || limit > 50) {
            return errorResponse('Invalid pagination parameters', 400);
        }

        const db = await connectToDatabase();

        // If we couldn't connect to DB and we're in development, use mock data
        if (!db && process.env.NODE_ENV === 'development') {
            console.log('Using mock blogs data');

            // Filter mock data based on search params
            let filteredBlogs = [...MOCK_BLOGS];

            // Filter by author if provided
            if (author) {
                filteredBlogs = filteredBlogs.filter(blog => blog.author._id === author);
            }

            // Filter by tag if provided
            if (tag) {
                filteredBlogs = filteredBlogs.filter(blog => blog.tags.includes(tag));
            }

            // Handle pagination
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

            return successResponse({
                blogs: paginatedBlogs,
                pagination: {
                    totalBlogs: filteredBlogs.length,
                    totalPages: Math.ceil(filteredBlogs.length / limit),
                    currentPage: page,
                    limit
                }
            });
        }

        // Get user session
        const session = await getServerSession();
        const userId = session?.user?.id;

        // Build query
        const query = {};

        // Filter by author if provided
        if (author) {
            query.author = author;
        }

        // Filter by tag if provided
        if (tag) {
            query.tags = { $in: [tag] };
        }

        // Handle privacy filtering
        if (privacy === 'public') {
            query.privacy = 'public';
        } else if (privacy === 'all' && userId) {
            // For 'all', return all blogs the user has access to
            // This includes public blogs, user's own blogs, and those shared with them
            query.$or = [
                { privacy: 'public' },
                { author: userId }
                // For connections and followers, additional logic would be needed
            ];
        } else if (privacy === 'own' && userId) {
            // Only user's own blogs
            query.author = userId;
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Get total count
        const total = await Blog.countDocuments(query);

        // Use aggregation to efficiently get blogs with comment counts
        const blogs = await Blog.aggregate([
            { $match: query },
            { $sort: { [sort.startsWith('-') ? sort.substring(1) : sort]: sort.startsWith('-') ? -1 : 1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'blog',
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorDetails'
                }
            },
            {
                $addFields: {
                    commentCount: { $size: '$comments' },
                    author: { $arrayElemAt: ['$authorDetails', 0] }
                }
            },
            {
                $project: {
                    title: 1,
                    slug: 1,
                    content: 1,
                    coverImage: 1,
                    privacy: 1,
                    tags: 1,
                    likes: 1,
                    featured: 1,
                    commentCount: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'author._id': 1,
                    'author.name': 1,
                    'author.username': 1,
                    'author.avatar': 1
                }
            }
        ]);

        // Convert ObjectId to strings for JSON serialization
        const formattedBlogs = blogs.map(blog => ({
            ...blog,
            _id: blog._id.toString(),
            author: {
                ...blog.author,
                _id: blog.author._id.toString(),
            }
        }));

        return successResponse({
            blogs: formattedBlogs,
            pagination: {
                totalBlogs: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            }
        });
    } catch (error) {
        console.error('Error getting blogs:', error);

        // In development mode, return mock data as fallback
        if (process.env.NODE_ENV === 'development') {
            console.log('Error occurred, using mock blogs data');
            return successResponse({
                blogs: MOCK_BLOGS,
                pagination: {
                    totalBlogs: MOCK_BLOGS.length,
                    totalPages: Math.ceil(MOCK_BLOGS.length / 10),
                    currentPage: 1,
                    limit: 10,
                }
            });
        }

        return errorResponse('Failed to fetch blogs', 500, {
            error: error.message
        });
    }
}

// Create blog
export async function POST(request) {
    try {
        // Connect to database first
        await connectToDatabase();

        // Get the session using getServerSession()
        const session = await getServerSession();
        console.log("API - Session exists:", !!session);

        // Check if the user is authenticated at all
        if (!session || !session.user) {
            console.error("API - Authentication failed: No session or user");
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        console.log("API - User in session:", session.user);

        // Special handling for user ID - this is the critical fix
        let userId = session.user.id;

        // If we don't have a user ID but have other user data, try to use an alternative
        if (!userId && session.user.email) {
            console.log("API - No user ID in session, trying to find user by email:", session.user.email);
            // Try to find the user by email as a fallback
            const user = await User.findOne({ email: session.user.email });
            if (user) {
                userId = user._id.toString();
                console.log("API - Found user by email, using ID:", userId);
            }
        }

        // Final check for user ID
        if (!userId) {
            console.error("API - Unable to determine user ID from session or database lookup");
            return NextResponse.json(
                { success: false, message: 'Invalid user session - missing ID' },
                { status: 401 }
            );
        }

        // Parse request body
        const data = await request.json();
        console.log("API - Creating blog with title:", data.title);
        console.log("API - Author ID to be used:", userId);

        // Create new blog post with explicit author ID
        const newBlog = new Blog({
            title: data.title,
            content: data.content,
            author: userId,
            tags: data.tags || [],
            privacy: data.privacy || 'public',
            coverImage: data.coverImage || '',
            slug: slugify(data.title, { lower: true, strict: true })
        });

        // Save blog to database
        const savedBlog = await newBlog.save();
        console.log("API - Blog saved successfully with ID:", savedBlog._id);

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Blog created successfully',
                blog: {
                    _id: savedBlog._id.toString(),
                    title: savedBlog.title,
                    slug: savedBlog.slug
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create blog' },
            { status: 500 }
        );
    }
}