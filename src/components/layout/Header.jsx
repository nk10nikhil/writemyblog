'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SearchBar from '@/components/search/SearchBar';
import {
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
    PencilSquareIcon,
    ArrowRightOnRectangleIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function Header() {
    const { data: session } = useSession();
    const { theme } = useTheme();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);
    const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
    const closeUserMenu = () => setShowUserMenu(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        const handleRouteChange = () => {
            closeMenu();
            closeUserMenu();
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [pathname]);

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'Explore', href: '/explore' },
        { label: 'Dashboard', href: '/dashboard', auth: true },
    ];

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled
                ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm'
                : 'bg-white dark:bg-gray-900'
                }`}
        >
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="relative h-8 w-8" style={{ position: 'relative' }}>
                            <img src="user.jpg" />
                        </div>
                        <span className="text-xl font-bold">WriteMyBlog</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <nav className="flex items-center space-x-6">
                            {navItems.map((item) => {
                                if (item.auth && !session) return null;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`text-base font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${pathname === item.href
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="w-64">
                            <SearchBar />
                        </div>

                        <ThemeToggle />

                        {/* User Menu or Auth Links */}
                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={toggleUserMenu}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <div className="relative h-8 w-8 rounded-full overflow-hidden" style={{ position: 'relative' }}>
                                        <img src="user.jpg" />
                                    </div>
                                    <span className="hidden lg:inline-block font-medium">{session.user.name}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                                        <div className="py-1" role="menu" aria-orientation="vertical">
                                            <Link
                                                href={`/profile/${session.user.username}`}
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                role="menuitem"
                                                onClick={closeUserMenu}
                                            >
                                                <UserCircleIcon className="h-5 w-5" />
                                                <span>Profile</span>
                                            </Link>
                                            <Link
                                                href="/blog/create"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                role="menuitem"
                                                onClick={closeUserMenu}
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                                <span>New Blog</span>
                                            </Link>
                                            <Link
                                                href="/profile/settings"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                role="menuitem"
                                                onClick={closeUserMenu}
                                            >
                                                <Cog6ToothIcon className="h-5 w-5" />
                                                <span>Settings</span>
                                            </Link>
                                            <Link
                                                href="/api/auth/signout"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                role="menuitem"
                                                onClick={closeUserMenu}
                                            >
                                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                                <span>Sign Out</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/auth/login"
                                    className="text-base font-medium hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="text-base font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center space-x-4">
                        <ThemeToggle />
                        <button onClick={toggleMenu} className="text-gray-700 dark:text-gray-300">
                            {isOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                        <nav className="flex flex-col space-y-3">
                            {navItems.map((item) => {
                                if (item.auth && !session) return null;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`text-base font-medium p-2 rounded-md ${pathname === item.href
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        onClick={closeMenu}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}

                            <div className="py-2">
                                <SearchBar />
                            </div>

                            {session ? (
                                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-3 p-2">
                                        <div className="relative h-8 w-8 rounded-full overflow-hidden" style={{ position: 'relative' }}>
                                            <img src="user.jpg" />
                                        </div>
                                        <span className="font-medium">{session.user.name}</span>
                                    </div>

                                    <Link
                                        href={`/profile/${session.user.username}`}
                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={closeMenu}
                                    >
                                        <UserCircleIcon className="h-5 w-5" />
                                        <span>Profile</span>
                                    </Link>

                                    <Link
                                        href="/blog/create"
                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={closeMenu}
                                    >
                                        <PencilSquareIcon className="h-5 w-5" />
                                        <span>New Blog</span>
                                    </Link>

                                    <Link
                                        href="/profile/settings"
                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={closeMenu}
                                    >
                                        <Cog6ToothIcon className="h-5 w-5" />
                                        <span>Settings</span>
                                    </Link>

                                    <Link
                                        href="/api/auth/signout"
                                        className="flex items-center space-x-2 p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={closeMenu}
                                    >
                                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                        <span>Sign Out</span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <Link
                                        href="/auth/login"
                                        className="block w-full text-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={closeMenu}
                                    >
                                        Log In
                                    </Link>

                                    <Link
                                        href="/auth/register"
                                        className="block w-full text-center p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={closeMenu}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}