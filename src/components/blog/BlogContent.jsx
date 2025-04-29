'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import CommentSection from './CommentSection';

export default function BlogContent({ blog, comments: initialComments = [] }) {
    const { data: session } = useSession();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(blog.likes?.length || 0);
    const [saved, setSaved] = useState(false);
    const [comments, setComments] = useState(initialComments);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        // Check if current user has liked the blog
        if (session?.user?.id) {
            setLiked(blog.likes?.includes(session.user.id));

            // In a real app, check if the blog is saved in user's bookmarks
            // This is a placeholder logic
            const checkSaved = localStorage.getItem(`saved_${blog._id}`);
            setSaved(!!checkSaved);
        }
    }, [session, blog]);

    const handleLike = async () => {
        if (!session) {
            // Redirect to login or show login modal
            return;
        }

        try {
            const response = await fetch(`/api/blogs/${blog._id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to like blog');

            const data = await response.json();
            setLiked(data.liked);
            setLikeCount(data.likeCount);
        } catch (error) {
            console.error('Error liking blog:', error);
        }
    };

    const handleSave = () => {
        if (!session) {
            // Redirect to login or show login modal
            return;
        }

        const newSaved = !saved;
        setSaved(newSaved);

        // In a real app, you would save this to the database
        // This is just a placeholder using localStorage
        if (newSaved) {
            localStorage.setItem(`saved_${blog._id}`, 'true');
        } else {
            localStorage.removeItem(`saved_${blog._id}`);
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    const handleNewComment = (newComment) => {
        setComments([newComment, ...comments]);
    };

    const privacyBadge = () => {
        switch (blog.privacy) {
            case 'private':
                return <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">Private</span>;
            case 'connections':
                return <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">Connections</span>;
            case 'followers':
                return <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">Followers</span>;
            default:
                return <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">Public</span>;
        }
    };

    return (
        <article className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{blog.title}</h1>

                <div className="flex flex-wrap items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Link href={`/profile/${blog.author.username}`}>
                            <div className="flex items-center space-x-2">
                                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                    <Image
                                        src={blog.author.avatar || '/images/default-avatar.png'}
                                        alt={blog.author.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">{blog.author.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <div className="h-8 border-l border-gray-300 dark:border-gray-700"></div>

                        {privacyBadge()}
                    </div>

                    {session?.user?.id === blog.author._id && (
                        <Link
                            href={`/blog/edit/${blog._id}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Edit Blog
                        </Link>
                    )}
                </div>
            </div>

            {blog.coverImage && (
                <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
                    <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            <div
                className="blog-content prose dark:prose-invert lg:prose-lg max-w-none mb-10"
                dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-10">
                    {blog.tags.map((tag, index) => (
                        <Link
                            key={index}
                            href={`/search?tag=${tag}`}
                            className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1 rounded-full transition-colors"
                        >
                            #{tag}
                        </Link>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between py-6 border-t border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-6">
                    <button
                        onClick={handleLike}
                        className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
                    >
                        {liked ? (
                            <HeartSolidIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                        ) : (
                            <HeartIcon className="h-6 w-6" />
                        )}
                        <span className="font-medium">{likeCount}</span>
                    </button>

                    <button
                        onClick={toggleComments}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        {comments.length} Comments
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400"
                >
                    {saved ? (
                        <BookmarkSolidIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                        <BookmarkIcon className="h-6 w-6" />
                    )}
                    <span className="font-medium">Save</span>
                </button>
            </div>

            <div className={`mt-8 ${showComments ? 'block' : 'hidden'}`}>
                <CommentSection
                    blogId={blog._id}
                    comments={comments}
                    onNewComment={handleNewComment}
                />
            </div>
        </article>
    );
}