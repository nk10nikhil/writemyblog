import mongoose from 'mongoose';

// Define the schema for the Follow model
const followSchema = new mongoose.Schema(
    {
        follower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        following: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

// Create a compound index to ensure a user can only follow another user once
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Use mongoose.models to prevent "OverwriteModelError" during hot reloading
const Follow = mongoose.models.Follow || mongoose.model('Follow', followSchema);

export default Follow;