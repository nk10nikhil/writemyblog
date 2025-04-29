import mongoose from 'mongoose';

const ConnectionSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure each connection between two users is unique
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.models.Connection || mongoose.model('Connection', ConnectionSchema);