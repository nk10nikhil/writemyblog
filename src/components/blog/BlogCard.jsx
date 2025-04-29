import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { HeartIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';

// Extract the PrivacyBadge to outside the component
function PrivacyBadge({ privacy }) {
    switch (privacy) {
        case 'private':
            return <span className="absolute top-3 right-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">Private</span>;
        case 'connections':
            return <span className="absolute top-3 right-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">Connections</span>;
        case 'followers':
            return <span className="absolute top-3 right-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">Followers</span>;
        default:
            return null; // No badge for public blogs
    }
}

export default function BlogCard({ blog }) {
    if (!blog) return null;

    // Extract preview text from content - strip HTML tags and trim
    const getPreview = (content) => {
        const strippedContent = content.replace(/<[^>]*>?/gm, '');
        return strippedContent.length > 120
            ? `${strippedContent.substring(0, 120)}...`
            : strippedContent;
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch (error) {
            return 'Invalid date';
        }
    };

    return (
        <div className="card overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
                {/* Cover Image */}
                <Link href={`/blog/${blog._id}`} className="block relative h-48 w-full bg-gray-100 dark:bg-gray-800">
                    {blog.coverImage ? (
                        <Image
                            src={blog.coverImage}
                            alt={blog.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-gray-400 dark:text-gray-500">No cover image</span>
                        </div>
                    )}
                </Link>

                <PrivacyBadge privacy={blog.privacy} />
            </div>

            <div className="p-5">
                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                            <Link
                                key={index}
                                href={`/explore?tag=${encodeURIComponent(tag)}`}
                                className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full transition-colors"
                            >
                                #{tag}
                            </Link>
                        ))}
                        {blog.tags.length > 3 && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                +{blog.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Title */}
                <Link href={`/blog/${blog._id}`}>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{blog.title}</h3>
                </Link>

                {/* Preview text */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{getPreview(blog.content)}</p>

                {/* Author and date */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link href={`/profile/${blog.author.username}`} className="flex items-center space-x-2">
                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
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
                                <p className="text-sm font-medium line-clamp-1">{blog.author.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(blog.createdAt)}</p>
                            </div>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                            <HeartIcon className="h-4 w-4 mr-1" />
                            <span>{blog.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center">
                            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                            <span>{blog.commentCount || 0}</span>
                        </div>
                        <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            <span>{blog.viewCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}