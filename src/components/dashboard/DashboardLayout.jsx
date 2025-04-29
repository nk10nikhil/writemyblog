'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Squares2X2Icon,
    DocumentTextIcon,
    UsersIcon,
    UserGroupIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    BellIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: Squares2X2Icon
        },
        {
            name: 'My Blogs',
            href: '/dashboard/blogs',
            icon: DocumentTextIcon
        },
        {
            name: 'Connections',
            href: '/dashboard/connections',
            icon: UsersIcon
        },
        {
            name: 'Followers',
            href: '/dashboard/followers',
            icon: UserGroupIcon
        },
        {
            name: 'Analytics',
            href: '/dashboard/analytics',
            icon: ChartBarIcon
        },
    ];

    const Sidebar = () => (
        <aside className={`w-64 flex-shrink-0 ${isMobile ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 shadow-lg lg:shadow-none' : 'sticky top-0 h-screen'} ${isMobile && !showMobileSidebar ? '-translate-x-full' : 'translate-x-0'
            }`}>
            <div className="h-full flex flex-col border-r border-gray-200 dark:border-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <Link href="/blog/create" className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
                        <PlusIcon className="h-5 w-5" />
                        <span>New Blog</span>
                    </Link>
                </div>

                <div className="p-4">
                    <h2 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Menu</h2>
                    <nav className="mt-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-md ${isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                                        }`}
                                    onClick={() => isMobile && setShowMobileSidebar(false)}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="space-y-1">
                        <Link
                            href="/profile/settings"
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                            onClick={() => isMobile && setShowMobileSidebar(false)}
                        >
                            <Cog6ToothIcon className="h-5 w-5" />
                            <span>Settings</span>
                        </Link>
                        <Link
                            href="/notifications"
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                            onClick={() => isMobile && setShowMobileSidebar(false)}
                        >
                            <BellIcon className="h-5 w-5" />
                            <span>Notifications</span>
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );

    const MobileOverlay = () => (
        isMobile && showMobileSidebar && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-30"
                onClick={() => setShowMobileSidebar(false)}
            />
        )
    );

    const MobileMenuButton = () => (
        isMobile && (
            <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
                <span className="sr-only">{showMobileSidebar ? 'Close sidebar' : 'Open sidebar'}</span>
                {showMobileSidebar ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>
        )
    );

    return (
        <div className="flex">
            <MobileOverlay />
            <Sidebar />

            <div className="flex-1 min-w-0">
                <div className="p-4 md:p-6 lg:p-8">
                    {isMobile && (
                        <div className="mb-4">
                            <MobileMenuButton />
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}