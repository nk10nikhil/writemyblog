import { Suspense } from 'react';
import SearchBar from '@/components/search/SearchBar';
import SearchResults from '@/components/search/SearchResults';
import TabNavigation from '@/components/common/TabNavigation';

export function generateMetadata({ searchParams }) {
    const query = searchParams.q || '';
    return {
        title: query ? `Search results for "${query}" | ModernBlog` : 'Search | ModernBlog',
        description: `Search results for "${query}" on ModernBlog`,
    };
}

export default function SearchPage({ searchParams }) {
    const query = searchParams.q || '';
    const type = searchParams.type || 'blogs';
    const tag = searchParams.tag || '';

    const tabs = [
        { id: 'blogs', label: 'Blogs', href: `/search?q=${encodeURIComponent(query)}&type=blogs${tag ? `&tag=${encodeURIComponent(tag)}` : ''}` },
        { id: 'people', label: 'People', href: `/search?q=${encodeURIComponent(query)}&type=people${tag ? `&tag=${encodeURIComponent(tag)}` : ''}` },
        { id: 'tags', label: 'Tags', href: `/search?q=${encodeURIComponent(query)}&type=tags${tag ? `&tag=${encodeURIComponent(tag)}` : ''}` },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                <h1 className="text-2xl font-bold mb-4">
                    {tag ? `Posts tagged with #${tag}` : 'Search ModernBlog'}
                </h1>

                <div className="max-w-2xl">
                    <SearchBar large placeholder="Search for blogs, people, or tags..." />
                </div>
            </div>

            {(query || tag) && (
                <>
                    <div>
                        {query && (
                            <h2 className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                                Search results for <span className="font-semibold">"{query}"</span>
                                {tag && <span> tagged with <span className="font-semibold">#{tag}</span></span>}
                            </h2>
                        )}

                        {tag && !query && (
                            <h2 className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                                Showing results for tag <span className="font-semibold">#{tag}</span>
                            </h2>
                        )}

                        <TabNavigation tabs={tabs} />
                    </div>

                    <Suspense fallback={<div>Loading results...</div>}>
                        <SearchResults query={query} type={type} tag={tag} />
                    </Suspense>
                </>
            )}

            {!query && !tag && (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-4">Enter a search term to get started</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Search for blogs, people, or topics that interest you
                    </p>
                </div>
            )}
        </div>
    );
}