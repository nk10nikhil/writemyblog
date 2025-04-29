import { Suspense } from 'react';
import Link from 'next/link';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogCardSkeleton from '@/components/blog/BlogCardSkeleton';
import PopularTags from '@/components/blog/PopularTags';
import TrendingBlogs from '@/components/blog/TrendingBlogs';
import SearchBar from '@/components/search/SearchBar';

export const metadata = {
    title: 'Explore | ModernBlog',
    description: 'Discover trending and popular blog posts on various topics.',
};

export default function ExplorePage() {
    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white rounded-lg p-8">
                <h1 className="text-3xl font-bold mb-4">Explore Content</h1>
                <p className="text-blue-100 mb-6 max-w-2xl">
                    Discover trending topics, connect with writers, and find your next favorite read.
                </p>
                <div className="max-w-lg">
                    <SearchBar
                        large
                        placeholder="Search for blogs, topics, or people..."
                        light
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                <div className="lg:col-span-5 space-y-10">
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Trending Now</h2>
                            <Link href="/explore/trending" className="text-blue-600 dark:text-blue-400 hover:underline">
                                View all
                            </Link>
                        </div>
                        <TrendingBlogs />
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Latest Posts</h2>
                            <Link href="/explore/latest" className="text-blue-600 dark:text-blue-400 hover:underline">
                                View all
                            </Link>
                        </div>
                        <Suspense fallback={
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <BlogCardSkeleton key={i} />
                                ))}
                            </div>
                        }>
                            <BlogGrid limit={6} />
                        </Suspense>
                    </section>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
                        <PopularTags />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 p-6">
                        <h3 className="text-lg font-semibold mb-3">Write Your Own Story</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Join our community and start creating and sharing your own content.
                        </p>
                        <Link href="/blog/create" className="btn-primary block text-center">
                            Create Blog Post
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}