import FeaturedBlogs from '@/components/blog/FeaturedBlogs';
import TrendingBlogs from '@/components/blog/TrendingBlogs';
import PopularTags from '@/components/blog/PopularTags';

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="text-center py-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Blogly</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover stories, thinking, and expertise from writers on any topic.
        </p>
      </section>

      <FeaturedBlogs />

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <TrendingBlogs />
        </div>
        <div>
          <PopularTags />
        </div>
      </div>
    </div>
  );
}