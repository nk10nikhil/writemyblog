'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ large = false, placeholder = 'Search...' }) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const searchRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const clearSearch = () => {
        setQuery('');
    };

    return (
        <div ref={searchRef} className="relative w-full">
            <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                    <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none`}>
                        <MagnifyingGlassIcon className={`${large ? 'h-5 w-5' : 'h-4 w-4'} text-gray-500 dark:text-gray-400`} />
                    </div>
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        className={`w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full 
                        focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent 
                        ${large
                                ? 'pl-10 pr-12 py-3 text-base'
                                : 'pl-9 pr-10 py-1.5 text-sm'
                            }`}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className={`absolute inset-y-0 right-0 flex items-center 
                        ${large ? 'pr-3.5' : 'pr-3'}`}
                        >
                            <XMarkIcon className={`${large ? 'h-5 w-5' : 'h-4 w-4'} text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`} />
                        </button>
                    )}
                </div>
            </form>

            {isOpen && query.length >= 2 && (
                <SearchSuggestions query={query} onSelect={(suggestion) => {
                    setQuery(suggestion);
                    setIsOpen(false);
                    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                }} />
            )}
        </div>
    );
}

function SearchSuggestions({ query, onSelect }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.length < 2) return;

        setLoading(true);

        // This would normally be an API call to get search suggestions
        // For now, we'll just simulate some suggestions based on the query
        const simulateSuggestions = () => {
            const sampleSuggestions = [
                `${query} blogs`,
                `${query} writers`,
                `${query} technology`,
                `${query} tips`,
                `best ${query} content`,
            ];
            return sampleSuggestions.slice(0, 5);
        };

        // Simulate API delay
        const timer = setTimeout(() => {
            setSuggestions(simulateSuggestions());
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    if (!suggestions.length && !loading) return null;

    return (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <ul className="max-h-60 overflow-auto py-1">
                {loading ? (
                    <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        Loading suggestions...
                    </li>
                ) : (
                    suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => onSelect(suggestion)}
                            className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                        >
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-3" />
                            <span>{suggestion}</span>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}