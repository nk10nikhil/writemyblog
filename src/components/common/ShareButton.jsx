'use client';

import { useState, useRef, useEffect } from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';

export default function ShareButton({ url, title }) {
    const [showShareMenu, setShowShareMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowShareMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleShareMenu = () => {
        setShowShareMenu(!showShareMenu);
    };

    const shareOptions = [
        {
            name: 'Copy Link',
            action: () => {
                navigator.clipboard.writeText(url);
                setShowShareMenu(false);
            },
            isNative: false,
        },
        {
            name: 'Twitter',
            action: () => {
                window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        url
                    )}&text=${encodeURIComponent(title)}`,
                    '_blank'
                );
                setShowShareMenu(false);
            },
            isNative: false,
        },
        {
            name: 'Facebook',
            action: () => {
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        url
                    )}`,
                    '_blank'
                );
                setShowShareMenu(false);
            },
            isNative: false,
        },
        {
            name: 'LinkedIn',
            action: () => {
                window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        url
                    )}`,
                    '_blank'
                );
                setShowShareMenu(false);
            },
            isNative: false,
        }
    ];

    // Add Web Share API if available
    useEffect(() => {
        if (navigator.share) {
            shareOptions.unshift({
                name: 'Share',
                action: async () => {
                    try {
                        await navigator.share({
                            title: title,
                            url: url,
                        });
                    } catch (error) {
                        console.error('Error sharing:', error);
                    }
                    setShowShareMenu(false);
                },
                isNative: true,
            });
        }
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={toggleShareMenu}
                className="btn-outline-secondary flex items-center p-2"
                aria-label="Share"
            >
                <ShareIcon className="h-5 w-5" />
            </button>

            {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                        {shareOptions.map((option) => (
                            <button
                                key={option.name}
                                onClick={option.action}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {option.name}
                                {option.isNative && ' (Native)'}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}