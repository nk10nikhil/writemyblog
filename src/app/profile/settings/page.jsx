import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import ProfileSettingsForm from '@/components/profile/ProfileSettingsForm';
import TabNavigation from '@/components/common/TabNavigation';

export const metadata = {
    title: 'Profile Settings | ModernBlog',
    description: 'Update your profile settings and preferences',
};

async function getUserData(userId) {
    await connectToDatabase();
    const user = await User.findById(userId).lean();

    if (!user) {
        return null;
    }

    return {
        ...user,
        _id: user._id.toString(),
    };
}

export default async function ProfileSettingsPage() {
    const session = await getServerSession();

    if (!session) {
        redirect('/auth/login?redirect=/profile/settings');
    }

    const userData = await getUserData(session.user.id);

    if (!userData) {
        // This would be unusual - the session exists but the user doesn't
        // Could happen if the user was deleted while having an active session
        redirect('/auth/login?redirect=/profile/settings&error=account-not-found');
    }

    // Tabs for settings pages
    const tabs = [
        { id: 'profile', label: 'Profile', href: '/profile/settings' },
        { id: 'account', label: 'Account', href: '/profile/settings/account' },
        { id: 'privacy', label: 'Privacy', href: '/profile/settings/privacy' },
        { id: 'notifications', label: 'Notifications', href: '/profile/settings/notifications' },
    ];

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Update your personal information and how others see you on the platform.
                </p>
            </div>

            <TabNavigation tabs={tabs} />

            <ProfileSettingsForm user={userData} />
        </div>
    );
}