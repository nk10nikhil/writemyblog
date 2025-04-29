'use client';

import { useState, useRef } from 'react';
import { ShareIcon, CheckIcon, LinkIcon } from '@heroicons/react/24/outline';
import {
    AtSymbolIcon,
    DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import {
    TwitterIcon,
    FacebookIcon,
    LinkedInIcon,
    WhatsAppIcon,
    RedditIcon,
} from './SocialIcons';

export function ShareButton({ url, title }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef(null);

    // Close the dropdown when clicking outside
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    // Add event listener when the dropdown opens
    React.useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        setCopied(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const shareByEmail = () => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`Check out this blog post: ${title}\n\n${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        setIsOpen(false);
    };

    const shareToSocial = (platform) => {
        let shareUrl = '';
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
                break;
            case 'reddit':
                shareUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
                break;
            default:
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
            setIsOpen(false);
        }
    };

    // Use Web Share API if available
    const useNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title,
                url,
            }).catch((error) => console.error('Error sharing:', error));
            return true;
        }
        return false;
    };

    const handleShare = () => {
        // Try native sharing first, fall back to dropdown
        if (!useNativeShare()) {
            toggleDropdown();
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleShare}
                className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
                <ShareIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Share</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 z-10">
                    <div className="py-1">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {copied ? (
                                <>
                                    <CheckIcon className="h-5 w-5 mr-3 text-green-500" />
                                    <span>Copied to clipboard</span>
                                </>
                            ) : (
                                <>
                                    <DocumentDuplicateIcon className="h-5 w-5 mr-3" />
                                    <span>Copy link</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={shareByEmail}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <AtSymbolIcon className="h-5 w-5 mr-3" />
                            <span>Email</span>
                        </button>
                    </div>
                    <div className="py-1">
                        <button
                            onClick={() => shareToSocial('twitter')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <TwitterIcon className="h-5 w-5 mr-3 text-[#1DA1F2]" />
                            <span>Twitter</span>
                        </button>
                        <button
                            onClick={() => shareToSocial('facebook')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <FacebookIcon className="h-5 w-5 mr-3 text-[#3b5998]" />
                            <span>Facebook</span>
                        </button>
                        <button
                            onClick={() => shareToSocial('linkedin')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <LinkedInIcon className="h-5 w-5 mr-3 text-[#0077b5]" />
                            <span>LinkedIn</span>
                        </button>
                        <button
                            onClick={() => shareToSocial('whatsapp')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <WhatsAppIcon className="h-5 w-5 mr-3 text-[#25D366]" />
                            <span>WhatsApp</span>
                        </button>
                        <button
                            onClick={() => shareToSocial('reddit')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <RedditIcon className="h-5 w-5 mr-3 text-[#FF4500]" />
                            <span>Reddit</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}