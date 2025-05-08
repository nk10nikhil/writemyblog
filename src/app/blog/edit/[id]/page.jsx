import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import BlogForm from '@/components/blog/BlogForm';
import AuthSessionProvider from '@/components/auth/AuthSessionProvider';

async function getBlog(id, userId) {
    await connectToDatabase();

    const blog = await Blog.findById(id).lean();

    if (!blog) {
        return null;
    }

    // Check if the current user is the author
    if (blog.author.toString() !== userId) {
        return null;
    }

    // Convert MongoDB _id to string
    blog._id = blog._id.toString();
    blog.author = blog.author.toString();

    return blog;
}

export async function generateMetadata({ params }) {
    const session = await getServerSession();

    if (!session) {
        return {
            title: 'Access Denied',
        };
    }

    const blog = await getBlog(params.id, session.user.id);

    if (!blog) {
        return {
            title: 'Blog Not Found',
        };
    }

    return {
        title: `Edit: ${blog.title} | WritemyBlog`,
    };
}

export default async function EditBlogPage({ params }) {
    const session = await getServerSession();

    if (!session) {
        redirect('/auth/login?callbackUrl=/blog/edit/' + params.id);
    }

    const blog = await getBlog(params.id, session.user.id);

    if (!blog) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>

            <AuthSessionProvider session={session}>
                <BlogForm
                    initialData={blog}
                    isEditing={true}
                />
            </AuthSessionProvider>
        </div>
    );
}