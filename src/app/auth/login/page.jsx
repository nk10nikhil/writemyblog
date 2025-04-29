import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
                <LoginForm />
            </div>
        </div>
    );
}