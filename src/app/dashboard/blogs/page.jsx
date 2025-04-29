import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TabNavigation from '@/components/common/TabNavigation';
import BlogTable from '@/components/dashboard/BlogTable';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';

export const metadata = {
    title: 'My Blogs | Dashboard',
    description: 'Manage your blog posts',
};

async function getUserBlogs(userId, status = 'published') {
    await connectToDatabase();

    const query = { author: userId };

    // Filter by status if it's draft or published
    if (status === 'draft') {
        query.status = 'draft';
    } else if (status === 'published') {
        query.status = 'published';
    }

    const blogs = await Blog.find(query)
        .sort({ updatedAt: -1 })
        .populate('author', 'name username avatar')
        .lean();

    return blogs.map(blog => ({
        ...blog,
        _id: blog._id.toString(),
        author: {
            ...blog.author,
            _id: blog.author._id.toString(),
        },
        createdAt: blog.createdAt.toISOString(),
        updatedAt: blog.updatedAt.toISOString(),
    }));
}

export default async function MyBlogsPage({ searchParams }) {
    const session = await getServerSession();

    if (!session) {
        redirect('/auth/login?redirect=/dashboard/blogs');
    }

    const userId = session.user.id;
    const status = searchParams.status || 'published';
    const blogs = await getUserBlogs(userId, status);

    const tabs = [
        {
            id: 'published',
            label: 'Published',
            href: '/dashboard/blogs?status=published'
        },
        {
            id: 'draft',
            label: 'Drafts',
            href: '/dashboard/blogs?status=draft'
        },
        {
            id: 'all',
            label: 'All Blogs',
            href: '/dashboard/blogs?status=all'
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">My Blogs</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage and track all your blog posts
                    </p>
                </div>

                <TabNavigation tabs={tabs} />

                <BlogTable blogs={blogs} />
            </div>
        </DashboardLayout>
    );
}