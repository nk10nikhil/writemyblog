'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TabNavigation({ tabs }) {
    const pathname = usePathname();

    return (
        <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                    // Consider a tab active if the current path is either exactly the tab's href
                    // or starts with the tab's href (for nested routes)
                    const isActive = pathname === tab.href ||
                        (tab.href !== '/' && pathname.startsWith(tab.href));

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${isActive
                                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${isActive
                                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}