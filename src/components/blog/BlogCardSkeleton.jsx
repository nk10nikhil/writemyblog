export default function BlogCardSkeleton() {
    return (
        <div className="card overflow-hidden animate-pulse">
            {/* Skeleton for cover image */}
            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>

            <div className="p-5 space-y-4">
                {/* Skeleton for tags */}
                <div className="flex space-x-2">
                    <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>

                {/* Skeleton for title */}
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>

                {/* Skeleton for preview text */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>

                {/* Skeleton for author and stats */}
                <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            <div className="h-3 mt-1 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}