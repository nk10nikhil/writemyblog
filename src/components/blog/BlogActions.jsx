'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    HeartIcon,
    ShareIcon,
    BookmarkIcon,
    DotsHorizontalIcon,
    PencilAltIcon,
    TrashIcon
} from '@heroicons/react/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/solid';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/solid';

export default function BlogActions({ blog }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [liked, setLiked] = useState(blog.hasLiked);
    const [likesCount, setLikesCount] = useState(blog.likesCount);
    const [saved, setSaved] = useState(blog.isSaved || false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLike = async () => {
        if (!session) {
            router.push(`/auth/login?redirect=/blog/${blog._id}`);
            return;
        }

        try {
            const action = liked ? 'unlike' : 'like';

            const response = await fetch(`/api/blogs/${blog._id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) {
                throw new Error('Failed to update like status');
            }

            setLiked(!liked);
            setLikesCount(prev => liked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error('Error updating like:', error);
        }
    };

    const handleSave = async () => {
        if (!session) {
            router.push(`/auth/login?redirect=/blog/${blog._id}`);
            return;
        }

        try {
            const action = saved ? 'unsave' : 'save';

            const response = await fetch(`/api/blogs/${blog._id}/bookmark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) {
                throw new Error('Failed to update bookmark status');
            }

            setSaved(!saved);
        } catch (error) {
            console.error('Error updating bookmark:', error);
        }
    };

    const handleShare = async () => {
        setShowShareOptions(!showShareOptions);
    };

    const shareViaService = async (service) => {
        const blogUrl = `${window.location.origin}/blog/${blog._id}`;
        const title = blog.title;

        switch (service) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(blogUrl)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(blogUrl)}&title=${encodeURIComponent(title)}`, '_blank');
                break;
            case 'copy':
                try {
                    await navigator.clipboard.writeText(blogUrl);
                    alert('Link copied to clipboard!');
                } catch (error) {
                    console.error('Failed to copy:', error);
                }
                break;
            default:
                break;
        }

        setShowShareOptions(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/blogs/${blog._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete blog');
            }

            router.push('/profile');
        } catch (error) {
            console.error('Error deleting blog:', error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="border-t border-b border-gray-200 dark:border-gray-800 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-6">
                <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 ${liked
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                >
                    {liked ? (
                        <HeartIconSolid className="h-6 w-6" />
                    ) : (
                        <HeartIcon className="h-6 w-6" />
                    )}
                    <span>{likesCount}</span>
                </button>

                <div className="relative">
                    <button
                        onClick={handleShare}
                        className="flex items-center space-x-1 text-gray-700 dark:text-gray-300"
                    >
                        <ShareIcon className="h-6 w-6" />
                        <span>Share</span>
                    </button>

                    {showShareOptions && (
                        <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => shareViaService('twitter')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Twitter
                            </button>
                            <button
                                onClick={() => shareViaService('facebook')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Facebook
                            </button>
                            <button
                                onClick={() => shareViaService('linkedin')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                LinkedIn
                            </button>
                            <button
                                onClick={() => shareViaService('copy')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Copy link
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    className={`flex items-center space-x-1 ${saved
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                >
                    {saved ? (
                        <BookmarkIconSolid className="h-6 w-6" />
                    ) : (
                        <BookmarkIcon className="h-6 w-6" />
                    )}
                    <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
            </div>

            {blog.isOwnBlog && (
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <DotsHorizontalIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg z-10 overflow-hidden border border-gray-200 dark:border-gray-700">
                            <Link
                                href={`/blog/${blog._id}/edit`}
                                className="flex items-center px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
                            >
                                <PencilAltIcon className="h-5 w-5 mr-2" />
                                Edit blog
                            </Link>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
                            >
                                <TrashIcon className="h-5 w-5 mr-2" />
                                {isDeleting ? 'Deleting...' : 'Delete blog'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}