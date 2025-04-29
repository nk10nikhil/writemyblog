import Link from 'next/link';

export default function TagCard({ tag }) {
    return (
        <Link
            href={`/explore?tag=${encodeURIComponent(tag.name)}`}
            className="card p-4 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center">
                        <span className="text-blue-500 dark:text-blue-400 mr-1">#</span>
                        {tag.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {tag.blogCount || tag.count || 0} posts
                    </p>
                </div>

                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getTagColor(tag.name)}`}>
                    <span className="text-xl">{getTagEmoji(tag.name)}</span>
                </div>
            </div>
        </Link>
    );
}

// Helper to get a consistent color based on tag name
function getTagColor(tagName) {
    const colors = [
        'bg-blue-100 dark:bg-blue-900/30',
        'bg-green-100 dark:bg-green-900/30',
        'bg-purple-100 dark:bg-purple-900/30',
        'bg-yellow-100 dark:bg-yellow-900/30',
        'bg-red-100 dark:bg-red-900/30',
        'bg-indigo-100 dark:bg-indigo-900/30',
        'bg-pink-100 dark:bg-pink-900/30',
        'bg-orange-100 dark:bg-orange-900/30',
    ];

    // Generate a consistent index based on the tag name
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

// Helper to get an emoji based on tag name
function getTagEmoji(tagName) {
    const emojis = ['📝', '💡', '🚀', '🌟', '📚', '✨', '🔍', '🎯', '🧠', '🌱', '💻', '🎨', '🏆', '🔬', '🧩'];

    // Generate a consistent index based on the tag name
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % emojis.length;
    return emojis[index];
}