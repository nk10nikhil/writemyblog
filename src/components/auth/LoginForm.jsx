'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('redirect') || '/dashboard';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result.error) {
                throw new Error(result.error);
            }

            router.push(callbackUrl);
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
                <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Log in to continue to your account
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="password" className="block text-sm font-medium">
                            Password
                        </label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="input pl-10 pr-10"
                            placeholder="••••••••"
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
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full btn-primary py-3"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Logging in...' : 'Log In'}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                        href="/auth/register"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}