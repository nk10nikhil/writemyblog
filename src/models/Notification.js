import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: [
                'comment',
                'like',
                'follow',
                'connection_request',
                'connection_accepted',
                'mention',
                'blog_published',
                'system'
            ],
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
        },
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
        link: {
            type: String,
        },
    },
    { timestamps: true }
);

// Create indexes
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);