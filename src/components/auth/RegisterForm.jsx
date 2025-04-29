'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    AtSymbolIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function RegisterForm() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear username availability status when username is changed
        if (name === 'username') {
            setUsernameAvailable(null);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const checkUsernameAvailability = async () => {
        if (!formData.username || formData.username.length < 3) {
            return;
        }

        setCheckingUsername(true);

        try {
            const response = await fetch(`/api/users?username=${formData.username}`);
            const data = await response.json();

            setUsernameAvailable(!data.exists);
        } catch (err) {
            console.error('Error checking username:', err);
            setUsernameAvailable(null);
        } finally {
            setCheckingUsername(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (usernameAvailable === false) {
            setError('Username is already taken');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Register the user
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Registration failed');
            }

            // Log the user in
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result.error) {
                throw new Error(result.error);
            }

            // Redirect to dashboard
            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Create an account</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Join our community of writers and readers
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-2">
                        Username
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={checkUsernameAvailability}
                            className="input pl-10"
                            placeholder="johndoe123"
                            minLength={3}
                        />
                        {checkingUsername && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <div className="h-4 w-4 border-2 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                        {usernameAvailable !== null && !checkingUsername && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {usernameAvailable ? (
                                    <span className="text-green-600 dark:text-green-400 text-sm">Available</span>
                                ) : (
                                    <span className="text-red-600 dark:text-red-400 text-sm">Taken</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="input pl-10 pr-10"
                            placeholder="••••••••"
                            minLength={8}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Must be at least 8 characters
                    </p>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full btn-primary py-3"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                        href="/auth/login"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}