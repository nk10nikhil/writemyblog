'use client';

import React from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function LikeButton({ isLiked, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center rounded-md p-2 transition ${isLiked
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                    : 'btn-outline-secondary'
                }`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
        >
            {isLiked ? (
                <HeartIconSolid className="h-5 w-5" />
            ) : (
                <HeartIcon className="h-5 w-5" />
            )}
        </button>
    );
}