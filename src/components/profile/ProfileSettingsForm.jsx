'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ProfileSettingsForm({ user }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
        avatar: user.avatar || '',
        coverImage: user.coverImage || '',
    });

    const [avatarPreview, setAvatarPreview] = useState(user.avatar || '');
    const [coverPreview, setCoverPreview] = useState(user.coverImage || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                // In a real app, you'd upload the file to a server here
                // For now, just set the preview as the avatar
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result);
                // In a real app, you'd upload the file to a server here
                // For now, just set the preview as the cover
                setFormData(prev => ({ ...prev, coverImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setAvatarPreview('/images/default-avatar.png');
        setFormData(prev => ({ ...prev, avatar: '/images/default-avatar.png' }));
    };

    const removeCover = () => {
        setCoverPreview('');
        setFormData(prev => ({ ...prev, coverImage: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully');
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-8">
                {/* Avatar Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2">Profile Photo</label>
                    <div className="flex items-center space-x-6">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {avatarPreview && (
                                <Image
                                    src={avatarPreview}
                                    alt="Profile avatar"
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <label className="cursor-pointer btn-secondary">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleAvatarChange}
                                />
                                <CameraIcon className="h-5 w-5 mr-1.5 inline-block" />
                                Change Photo
                            </label>
                            <button
                                type="button"
                                onClick={removeAvatar}
                                className="text-red-600 dark:text-red-400 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cover Image Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2">Cover Image</label>
                    <div className="space-y-3">
                        <div className="relative h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {coverPreview && (
                                <Image
                                    src={coverPreview}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                />
                            )}
                            {!coverPreview && (
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-gray-400 dark:text-gray-500">No cover image</span>
                                </div>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <label className="cursor-pointer btn-secondary">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleCoverChange}
                                />
                                <CameraIcon className="h-5 w-5 mr-1.5 inline-block" />
                                Upload Cover
                            </label>
                            {coverPreview && (
                                <button
                                    type="button"
                                    onClick={removeCover}
                                    className="text-red-600 dark:text-red-400 hover:underline"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Basic Profile Information */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Display Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input"
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="input"
                            placeholder="username"
                        />
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Your URL: yourdomain.com/profile/{formData.username}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium mb-2">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows="4"
                            value={formData.bio}
                            onChange={handleChange}
                            className="input"
                            placeholder="Tell people about yourself"
                        ></textarea>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Brief description for your profile. URLs are hyperlinked.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="website" className="block text-sm font-medium mb-2">
                            Website
                        </label>
                        <input
                            type="url"
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="input"
                            placeholder="https://yourwebsite.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="input"
                            placeholder="City, Country"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}