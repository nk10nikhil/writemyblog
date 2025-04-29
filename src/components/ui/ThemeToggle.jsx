'use client';

import { useTheme } from '@/hooks/useTheme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <MoonIcon className="h-5 w-5" />
            ) : (
                <SunIcon className="h-5 w-5" />
            )}
        </button>
    );
}