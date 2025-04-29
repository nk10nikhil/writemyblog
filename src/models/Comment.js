import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);