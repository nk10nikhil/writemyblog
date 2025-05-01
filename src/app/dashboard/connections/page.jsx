import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ConnectionsList from '@/components/profile/ConnectionsList';

export const metadata = {
    title: 'Connections | Dashboard | Blogly',
    description: 'Manage your connections on Blogly'
};

export default async function ConnectionsPage() {
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session) {
        redirect('/auth/login?redirect=/dashboard/connections');
    }

    return (
        <DashboardLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        My Connections
                    </h1>
                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="p-6">
                            <ConnectionsList />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}