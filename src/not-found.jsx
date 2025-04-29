import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: 'Page Not Found | ModernBlog',
    description: 'We couldn\'t find the page you were looking for.',
};

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
            <div className="text-center">
                <div className="relative h-48 w-48 mx-auto mb-6">
                    <Image
                        src="/images/404.svg"
                        alt="404 Illustration"
                        fill
                        className="object-contain"
                    />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">404</h1>

                <h2 className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                    Oops! Page not found
                </h2>

                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                    The page you are looking for might have been removed, had its name changed,
                    or is temporarily unavailable.
                </p>

                <div className="space-x-4">
                    <Link href="/" className="btn-primary">
                        Go to Homepage
                    </Link>

                    <Link href="/search" className="btn-secondary">
                        Search Blogs
                    </Link>
                </div>
            </div>
        </div>
    );
}