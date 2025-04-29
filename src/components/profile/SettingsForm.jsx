'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { XCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function SettingsForm({ user }) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        email: user.email || '',
        username: user.username || '',
        avatar: user.avatar || '',
        coverImage: user.coverImage || '',
    });

    const [avatarPreview, setAvatarPreview] = useState(user.avatar || '');
    const [coverPreview, setCoverPreview] = useState(user.coverImage || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle avatar click
    const handleAvatarClick = () => {
        avatarInputRef.current?.click();
    };

    // Handle cover image click
    const handleCoverClick = () => {
        coverInputRef.current?.click();
    };

    // Handle image upload
    const handleImageUpload = async (file, type) => {
        if (!file) return;

        // Check file size and type
        if (file.size > 5 * 1024 * 1024) { // 5 MB limit
            setError(`${type} image must be smaller than 5MB`);
            return null;
        }

        if (!file.type.includes('image/')) {
            setError(`File must be an image`);
            return null;
        }

        setError('');
        type === 'avatar' ? setAvatarUploading(true) : setCoverUploading(true);

        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            // Upload to your image API
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const data = await response.json();
            return data.url;
        } catch (err) {
            setError(err.message || 'Failed to upload image');
            return null;
        } finally {
            type === 'avatar' ? setAvatarUploading(false) : setCoverUploading(false);
        }
    };

    // Handle avatar change
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        const imageUrl = await handleImageUpload(file, 'avatar');

        if (imageUrl) {
            setAvatarPreview(imageUrl);
            setFormData(prev => ({ ...prev, avatar: imageUrl }));
        }
    };

    // Handle cover image change
    const handleCoverChange = async (e) => {
        const file = e.target.files?.[0];
        const imageUrl = await handleImageUpload(file, 'cover');

        if (imageUrl) {
            setCoverPreview(imageUrl);
            setFormData(prev => ({ ...prev, coverImage: imageUrl }));
        }
    };

    // Remove avatar
    const removeAvatar = () => {
        setAvatarPreview('/images/default-avatar.png');
        setFormData(prev => ({ ...prev, avatar: '/images/default-avatar.png' }));
        if (avatarInputRef.current) avatarInputRef.current.value = '';
    };

    // Remove cover image
    const removeCover = () => {
        setCoverPreview('');
        setFormData(prev => ({ ...prev, coverImage: '' }));
        if (coverInputRef.current) coverInputRef.current.value = '';
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        if (!formData.email.trim()) {
            setError('Email is required');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully');

            // Refresh the page after a brief delay to show the success message
            setTimeout(() => {
                router.refresh();
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-lg">
                    {success}
                </div>
            )}

            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className="input"
                            placeholder="Your full name"
                        />
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            className="input"
                            placeholder="Your username"
                            disabled // Username typically can't be changed
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Username cannot be changed after registration
                        </p>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input"
                            placeholder="Your email address"
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium mb-2">
                            Location
                        </label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleChange}
                            className="input"
                            placeholder="Your location (optional)"
                        />
                    </div>

                    <div>
                        <label htmlFor="website" className="block text-sm font-medium mb-2">
                            Website
                        </label>
                        <input
                            id="website"
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleChange}
                            className="input"
                            placeholder="Your website URL (optional)"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Bio</h2>

                <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-2">
                        About You
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                        className="input resize-none"
                        placeholder="Tell others about yourself (optional)"
                    ></textarea>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Profile Pictures</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Profile Avatar
                        </label>
                        <div className="flex flex-col items-center">
                            <div
                                onClick={handleAvatarClick}
                                className={`relative h-32 w-32 rounded-full overflow-hidden border-2 border-dashed ${avatarUploading
                                    ? 'bg-gray-50 dark:bg-gray-800/50'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                                    }`}
                            >
                                {avatarUploading ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : avatarPreview ? (
                                    <Image
                                        src={avatarPreview}
                                        alt="Avatar preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ArrowUpTrayIcon className="h-10 w-10 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex space-x-2">
                                <button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    className="btn-secondary text-sm py-1 px-3"
                                    disabled={avatarUploading}
                                >
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={removeAvatar}
                                    className="btn-secondary text-sm py-1 px-3"
                                    disabled={avatarUploading || avatarPreview === '/images/default-avatar.png'}
                                >
                                    Remove
                                </button>
                            </div>

                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                                disabled={avatarUploading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Cover Image
                        </label>
                        <div
                            onClick={handleCoverClick}
                            className={`border-2 border-dashed rounded-lg p-4 ${coverUploading
                                ? 'bg-gray-50 dark:bg-gray-800/50'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                                }`}
                        >
                            {coverUploading ? (
                                <div className="py-10 flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Uploading image...</p>
                                </div>
                            ) : coverPreview ? (
                                <div className="relative">
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={coverPreview}
                                            alt="Cover preview"
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeCover();
                                        }}
                                        className="absolute top-2 right-2 text-white bg-gray-800/70 rounded-full p-1 hover:bg-red-600"
                                    >
                                        <XCircleIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-10 flex flex-col items-center">
                                    <ArrowUpTrayIcon className="h-10 w-10 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Click to upload a cover image
                                    </p>
                                </div>
                            )}
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="hidden"
                                disabled={coverUploading}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Preferences</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Theme
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                type="button"
                                onClick={() => setTheme('light')}
                                className={`p-4 border rounded-lg ${theme === 'light'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full bg-white border border-gray-300 flex items-center justify-center mb-2">
                                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Light</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTheme('dark')}
                                className={`p-4 border rounded-lg ${theme === 'dark'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center mb-2">
                                        <svg className="h-5 w-5 text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Dark</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTheme('system')}
                                className={`p-4 border rounded-lg ${theme === 'system'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-white to-gray-900 border border-gray-300 dark:border-gray-700 flex items-center justify-center mb-2">
                                        <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">System</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}