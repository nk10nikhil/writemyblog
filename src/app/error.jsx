'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-xl">
                <div className="inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 p-4 mb-6">
                    <ExclamationTriangleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>

                <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We're sorry, but we encountered an unexpected error. Our team has been notified and we're working to fix the issue.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="btn-primary w-full sm:w-auto"
                    >
                        Try again
                    </button>

                    <Link href="/" className="btn-secondary w-full sm:w-auto">
                        Return to home page
                    </Link>
                </div>
            </div>
        </div>
    );
}