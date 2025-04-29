'use client';

import { useState, useRef, useEffect } from 'react';
import {
    ShareIcon,
    LinkIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    WhatsappShareButton,
    EmailShareButton
} from 'react-share';
import {
    FaFacebook,
    FaTwitter,
    FaLinkedin,
    FaWhatsapp,
    FaEnvelope
} from 'react-icons/fa';

export default function ShareButton({ title, url }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Ensure the URL is absolute by adding the protocol if needed
    const fullUrl = url.startsWith('http') ? url : `https://${window.location.host}${url}`;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1.5 py-2 px-3 rounded-full text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <ShareIcon className="h-5 w-5" />
                <span>Share</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-900 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50 py-1">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-medium">Share this post</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-3 grid grid-cols-5 gap-2">
                        <FacebookShareButton url={fullUrl} quote={title} className="flex flex-col items-center justify-center">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                <FaFacebook size={18} />
                            </div>
                            <span className="text-xs mt-1">Facebook</span>
                        </FacebookShareButton>

                        <TwitterShareButton url={fullUrl} title={title} className="flex flex-col items-center justify-center">
                            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full">
                                <FaTwitter size={18} />
                            </div>
                            <span className="text-xs mt-1">Twitter</span>
                        </TwitterShareButton>

                        <LinkedinShareButton url={fullUrl} title={title} className="flex flex-col items-center justify-center">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500 rounded-full">
                                <FaLinkedin size={18} />
                            </div>
                            <span className="text-xs mt-1">LinkedIn</span>
                        </LinkedinShareButton>

                        <WhatsappShareButton url={fullUrl} title={title} className="flex flex-col items-center justify-center">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                                <FaWhatsapp size={18} />
                            </div>
                            <span className="text-xs mt-1">WhatsApp</span>
                        </WhatsappShareButton>

                        <EmailShareButton url={fullUrl} subject={title} className="flex flex-col items-center justify-center">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                <FaEnvelope size={18} />
                            </div>
                            <span className="text-xs mt-1">Email</span>
                        </EmailShareButton>
                    </div>

                    <div className="p-3 pt-0">
                        <button
                            onClick={copyLink}
                            className={`w-full mt-3 flex items-center justify-center space-x-2 rounded-md p-2 transition-colors ${copied
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="h-4 w-4" />
                                    <span>Copy link</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}