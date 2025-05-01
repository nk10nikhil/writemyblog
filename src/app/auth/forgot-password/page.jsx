import React from 'react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
    title: 'Forgot Password | Blogly',
    description: 'Reset your password for Blogly'
};

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <div className="flex flex-col items-center">
                    <Link href="/" className="flex items-center mb-6">
                        <div className="relative h-10 w-10 mr-2">
                            <Image
                                src="/images/logo-dark.svg"
                                alt="Blogly Logo"
                                fill
                                className="dark:hidden"
                                priority
                            />
                            <Image
                                src="/images/logo-light.svg"
                                alt="Blogly Logo"
                                fill
                                className="hidden dark:block"
                                priority
                            />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">Blogly</span>
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Enter your email address and we&apos;ll send you instructions to reset your password
                    </p>
                </div>

                <ForgotPasswordForm />

                <div className="text-center mt-4">
                    <Link
                        href="/auth/login"
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}