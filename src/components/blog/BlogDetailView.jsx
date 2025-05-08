'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    HeartIcon,
    ChatBubbleLeftIcon,
    ShareIcon,
    BookmarkIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Comments from './Comments';
import ShareButton from '../common/ShareButton';
import LikeButton from './LikeButton';

export default function BlogDetailView({ blog, comments = [] }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(blog.likes?.length || 0);
    const [showComments, setShowComments] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isOwner = session?.user?.id === blog.author._id;

    // Check if the current user has liked the blog
    useEffect(() => {
        if (session?.user?.id && blog.likes) {
            setIsLiked(blog.likes.includes(session.user.id));
        }
    }, [session, blog.likes]);

    const handleEdit = () => {
        router.push(`/blog/edit/${blog._id}`);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/blogs/${blog._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Something went wrong');
            }

            router.push('/dashboard/blogs');
        } catch (error) {
            setErrorMessage(error.message);
            console.error('Error deleting blog:', error);
        }
    };

    const handleLike = async () => {
        if (!session) {
            router.push(`/auth/login?callbackUrl=/blog/${blog._id}`);
            return;
        }

        // Optimistic update
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

        try {
            const response = await fetch(`/api/blogs/${blog._id}/like`, {
                method: 'POST',
            });

            if (!response.ok) {
                // Revert on failure
                setIsLiked(!isLiked);
                setLikesCount(isLiked ? likesCount : likesCount - 1);

                const data = await response.json();
                throw new Error(data.message || 'Failed to like/unlike the blog');
            }
        } catch (error) {
            console.error('Error updating like status:', error);
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {errorMessage && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-md">
                    {errorMessage}
                </div>
            )}

            {/* Privacy indicator */}
            {blog.privacy !== 'public' && (
                <div className="mb-4 flex items-center bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-3 rounded-md">
                    <LockClosedIcon className="h-5 w-5 mr-2" />
                    <p>
                        {blog.privacy === 'private'
                            ? 'This blog is private and only visible to you.'
                            : blog.privacy === 'followers'
                                ? 'This blog is only visible to your followers.'
                                : 'This blog is only visible to your connections.'}
                    </p>
                </div>
            )}

            {/* Cover image */}
            {blog.coverImage && (
                <div className="relative h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden mb-6">
                    <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        priority
                        className="object-cover"
                    />
                </div>
            )}

            {/* Blog info */}
            <div className="mb-8">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>

                {/* Author and date */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Link href={`/profile/${blog.author.username}`} className="flex items-center group">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                                <Image
                                    src={blog.author.avatar || '/images/placeholder-blog.jpg'}
                                    alt={blog.author.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {blog.author.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {format(new Date(blog.createdAt), 'MMMM d, yyyy')}
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Owner actions */}
                    {isOwner && (
                        <div className="flex space-x-2">
                            <button
                                onClick={handleEdit}
                                className="btn-outline-secondary flex items-center text-sm"
                            >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn-outline-danger flex items-center text-sm"
                            >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {blog.tags.map((tag, index) => (
                            <Link
                                key={index}
                                href={`/tags/${tag}`}
                                className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose dark:prose-invert prose-lg max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Blog stats and actions */}
                <div className="flex items-center justify-between py-4 border-t border-b border-gray-200 dark:border-gray-800">
                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                            <EyeIcon className="h-5 w-5 mr-1" />
                            <span>{blog.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center">
                            <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                            <span>{comments.length}</span>
                        </div>
                        <div className="flex items-center">
                            {isLiked ? (
                                <HeartIconSolid className="h-5 w-5 mr-1 text-red-500" />
                            ) : (
                                <HeartIcon className="h-5 w-5 mr-1" />
                            )}
                            <span>{likesCount}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        <LikeButton
                            isLiked={isLiked}
                            onClick={handleLike}
                        />

                        <button
                            onClick={toggleComments}
                            className="btn-outline-secondary flex items-center p-2"
                            aria-label="Comments"
                        >
                            <ChatBubbleLeftIcon className="h-5 w-5" />
                        </button>

                        <ShareButton
                            url={`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/blog/${blog._id}`}
                            title={blog.title}
                        />

                        <button
                            className="btn-outline-secondary flex items-center p-2"
                            aria-label="Bookmark"
                        >
                            <BookmarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments */}
            {showComments && (
                <Comments
                    blogId={blog._id}
                    initialComments={comments}
                />
            )}
        </div>
    );
}