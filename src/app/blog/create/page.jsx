import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import BlogForm from '@/components/blog/BlogForm';

export const metadata = {
    title: 'Create Blog Post | ModernBlog',
    description: 'Create a new blog post on ModernBlog',
};

export default async function CreateBlogPage() {
    const session = await getServerSession();

    if (!session) {
        redirect('/auth/login?redirect=/blog/create');
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-6">Create New Blog</h1>

            <BlogForm />
        </div>
    );
}