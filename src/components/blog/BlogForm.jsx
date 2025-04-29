'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BlogEditor from './BlogEditor';
import { CameraIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';

// Maximum file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;
// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function BlogForm({ initialData = null }) {
    const router = useRouter();
    const { data: session } = useSession();
    const editing = !!initialData;

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '',
        coverImage: initialData?.coverImage || '',
        tags: initialData?.tags || [],
        privacy: initialData?.privacy || 'public',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coverImagePreview, setCoverImagePreview] = useState(initialData?.coverImage || '');
    const [tagInput, setTagInput] = useState('');
    const [imageError, setImageError] = useState('');

    // Check for authentication
    useEffect(() => {
        if (!session && typeof window !== 'undefined') {
            router.push('/auth/login?callbackUrl=/blog/create');
        }
    }, [session, router]);

    if (!session) {
        return (
            <div className="text-center py-12">
                <p className="text-lg text-gray-600 dark:text-gray-400">Please log in to create a blog post.</p>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        setImageError('');

        if (!file) return;

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setImageError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setImageError(`Image size should be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
            return;
        }

        // Process image for preview and upload
        const reader = new FileReader();
        reader.onloadend = () => {
            setCoverImagePreview(reader.result);
            // Store the image data in form state
            setFormData(prev => ({ ...prev, coverImage: reader.result }));
        };
        reader.onerror = () => {
            setImageError('Error reading the image file');
        };
        reader.readAsDataURL(file);
    };

    const removeCoverImage = () => {
        setCoverImagePreview('');
        setFormData(prev => ({ ...prev, coverImage: '' }));
        setImageError('');
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (!tagInput.trim()) return;

        // Normalize tag (lowercase, remove extra spaces)
        const normalizedTag = tagInput.trim().toLowerCase();

        // Check if tag already exists in formData.tags
        if (!formData.tags.includes(normalizedTag)) {
            // Limit to a maximum of 5 tags
            if (formData.tags.length >= 5) {
                setError('You can only add up to 5 tags');
                return;
            }

            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, normalizedTag],
            }));
        }

        setTagInput('');
    };

    const removeTag = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            // Validation
            if (!formData.title.trim()) {
                setError('Title is required');
                setIsSubmitting(false);
                return;
            }

            if (!formData.content.trim() || formData.content === '<p><br></p>') {
                setError('Content is required');
                setIsSubmitting(false);
                return;
            }

            // Prepare the request
            const url = editing
                ? `/api/blogs/${initialData._id}`
                : '/api/blogs';

            const method = editing ? 'PUT' : 'POST';

            // Send the request
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            // Handle non-OK responses
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Handle success
            if (editing) {
                setSuccess('Blog updated successfully!');
                setTimeout(() => {
                    router.push(`/blog/${data.blog._id}`);
                }, 1500);
            } else {
                router.push(`/blog/${data.blog._id}`);
            }
        } catch (err) {
            console.error('Error submitting blog:', err);
            setError(err.message || 'Failed to save blog. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-md">
                    {success}
                </div>
            )}

            <div>
                <label htmlFor="title" className="block text-lg font-medium mb-2">
                    Blog Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter a descriptive title"
                    className="input text-xl"
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-lg font-medium">
                        Cover Image
                    </label>
                    {coverImagePreview && (
                        <button
                            type="button"
                            onClick={removeCoverImage}
                            className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center"
                        >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Remove
                        </button>
                    )}
                </div>

                {imageError && (
                    <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                        {imageError}
                    </div>
                )}

                {coverImagePreview ? (
                    <div className="relative h-64 rounded-lg overflow-hidden mb-3">
                        <Image
                            src={coverImagePreview}
                            alt="Cover preview"
                            fill
                            className="object-cover"
                            onError={() => {
                                setImageError('Error loading image preview');
                                setCoverImagePreview('');
                            }}
                        />
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center mb-3">
                        <div className="space-y-2">
                            <div className="flex justify-center">
                                <CameraIcon className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Upload a cover image to make your blog stand out
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                Max size: 2MB. Formats: JPEG, PNG, GIF, WebP
                            </p>
                        </div>
                    </div>
                )}

                <label className="btn-secondary inline-block cursor-pointer">
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleCoverImageChange}
                        className="sr-only"
                    />
                    {coverImagePreview ? 'Change Cover Image' : 'Upload Cover Image'}
                </label>
            </div>

            <div>
                <label className="block text-lg font-medium mb-2">
                    Blog Content
                </label>
                <BlogEditor value={formData.content} onChange={handleEditorChange} />
            </div>

            <div>
                <label htmlFor="tags" className="block text-lg font-medium mb-2">
                    Tags
                </label>
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full flex items-center text-sm"
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className="ml-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </span>
                        ))}
                    </div>

                    <div className="flex">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <TagIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="tag-input"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                className="input pl-10"
                                placeholder="Add a tag and press Enter"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag(e);
                                    }
                                }}
                                maxLength={20}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddTag}
                            className="ml-2 btn-secondary"
                        >
                            Add
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add up to 5 tags to categorize your blog
                    </p>
                </div>
            </div>

            <div>
                <label className="block text-lg font-medium mb-3">
                    Privacy Settings
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.privacy === 'public'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                        onClick={() => setFormData(prev => ({ ...prev, privacy: 'public' }))}
                    >
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="public"
                                name="privacy"
                                value="public"
                                checked={formData.privacy === 'public'}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="public" className="font-medium">Public</label>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Anyone can view this blog post
                        </p>
                    </div>

                    <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.privacy === 'followers'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                        onClick={() => setFormData(prev => ({ ...prev, privacy: 'followers' }))}
                    >
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="followers"
                                name="privacy"
                                value="followers"
                                checked={formData.privacy === 'followers'}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="followers" className="font-medium">Followers Only</label>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Only your followers can view this blog post
                        </p>
                    </div>

                    <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.privacy === 'connections'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                        onClick={() => setFormData(prev => ({ ...prev, privacy: 'connections' }))}
                    >
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="connections"
                                name="privacy"
                                value="connections"
                                checked={formData.privacy === 'connections'}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="connections" className="font-medium">Connections Only</label>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Only your connections can view this blog post
                        </p>
                    </div>

                    <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.privacy === 'private'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                        onClick={() => setFormData(prev => ({ ...prev, privacy: 'private' }))}
                    >
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="private"
                                name="privacy"
                                value="private"
                                checked={formData.privacy === 'private'}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="private" className="font-medium">Private</label>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Only you can view this blog post
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-4">
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : editing ? 'Update Blog' : 'Publish Blog'}
                </button>
            </div>
        </form>
    );
}