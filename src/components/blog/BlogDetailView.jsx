'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import ShareButton from './ShareButton';
import FollowButton from '@/components/profile/FollowButton';

export default function BlogDetailView({
    blog,
    comments,
    userLiked,
    isFollowingAuthor,
    relatedBlogs = [],
    currentUserId
}) {
    const { data: session } = useSession();
    const [readingTime, setReadingTime] = useState('');
    const isAuthor = session?.user?.id === blog.author._id;
    const [isFollowing, setIsFollowing] = useState(isFollowingAuthor);
    const [sanitizedContent, setSanitizedContent] = useState('');

    // Sanitize content as soon as the component mounts
    useEffect(() => {
        if (typeof window !== 'undefined' && blog.content) {
            setSanitizedContent(DOMPurify.sanitize(blog.content));
        }
    }, [blog.content]);

    // Calculate reading time
    useEffect(() => {
        const text = blog.content.replace(/<[^>]*>/g, '');
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        const time = Math.ceil(words / wordsPerMinute);
        setReadingTime(`${time} min read`);
    }, [blog.content]);

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMMM d, yyyy');
        } catch (error) {
            return 'Invalid date';
        }
    };

    const handleFollowChange = (newFollowState) => {
        setIsFollowing(newFollowState);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <article className="space-y-8">
                {/* Blog header */}
                <header className="space-y-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {blog.tags.map((tag, index) => (
                            <Link
                                key={index}
                                href={`/explore?tag=${encodeURIComponent(tag)}`}
                                className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full transition-colors"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold">{blog.title}</h1>

                    {/* Author info and meta */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href={`/profile/${blog.author.username}`}>
                                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                    <Image
                                        src={blog.author.avatar || '/images/default-avatar.png'}
                                        alt={blog.author.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/profile/${blog.author.username}`}
                                        className="font-medium hover:underline"
                                    >
                                        {blog.author.name}
                                    </Link>
                                    {!isAuthor && session && (
                                        <FollowButton
                                            profileId={blog.author._id}
                                            isFollowing={isFollowing}
                                            onChange={handleFollowChange}
                                        />
                                    )}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-3">
                                    <span>{formatDate(blog.createdAt)}</span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                        <ClockIcon className="h-4 w-4 mr-1" />
                                        {readingTime}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                        <EyeIcon className="h-4 w-4 mr-1" />
                                        {blog.viewCount || 0} views
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isAuthor && (
                            <Link
                                href={`/blog/edit/${blog._id}`}
                                className="btn-secondary text-sm"
                            >
                                Edit Post
                            </Link>
                        )}
                    </div>
                </header>

                {/* Cover Image */}
                {blog.coverImage && (
                    <div className="relative h-96 w-full rounded-lg overflow-hidden">
                        <Image
                            src={blog.coverImage}
                            alt={blog.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Blog content */}
                <div
                    className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                {/* Action buttons */}
                <div className="border-t border-b border-gray-200 dark:border-gray-800 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <LikeButton
                            blogId={blog._id}
                            initialLikeCount={blog.likes?.length || 0}
                            initialLiked={userLiked}
                        />
                        <button
                            onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center space-x-1.5 py-2 px-3 rounded-full text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                            </svg>
                            <span>{comments.length}</span>
                        </button>
                    </div>
                    <ShareButton title={blog.title} url={`/blog/${blog._id}`} />
                </div>

                {/* Author bio */}
                <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <Link href={`/profile/${blog.author.username}`}>
                        <div className="relative h-20 w-20 rounded-full overflow-hidden">
                            <Image
                                src={blog.author.avatar || '/images/default-avatar.png'}
                                alt={blog.author.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </Link>
                    <div className="flex-1 text-center sm:text-left">
                        <Link
                            href={`/profile/${blog.author.username}`}
                            className="font-bold text-lg hover:underline"
                        >
                            {blog.author.name}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {blog.author.bio || `Writer at ModernBlog`}
                        </p>
                        {!isAuthor && (
                            <div className="mt-4">
                                <FollowButton
                                    profileId={blog.author._id}
                                    isFollowing={isFollowing}
                                    onChange={handleFollowChange}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Posts */}
                {relatedBlogs.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Related Posts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedBlogs.map((relatedBlog) => (
                                <Link
                                    key={relatedBlog._id}
                                    href={`/blog/${relatedBlog._id}`}
                                    className="card p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="relative h-36 w-full rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                                        {relatedBlog.coverImage ? (
                                            <Image
                                                src={relatedBlog.coverImage}
                                                alt={relatedBlog.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-medium leading-snug line-clamp-2 mb-2">
                                        {relatedBlog.title}
                                    </h4>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <div className="relative h-6 w-6 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mr-2">
                                                {relatedBlog.author.avatar && (
                                                    <Image
                                                        src={relatedBlog.author.avatar}
                                                        alt={relatedBlog.author.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <span>{relatedBlog.author.name}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments section */}
                <div id="comments" className="pt-8">
                    <CommentSection
                        blogId={blog._id}
                        comments={comments}
                        currentUserId={currentUserId}
                        blogAuthorId={blog.author._id}
                    />
                </div>
            </article>
        </div>
    );
}