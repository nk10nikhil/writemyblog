import mongoose from 'mongoose';
import slugify from 'slugify';

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
    },
    coverImage: {
        type: String,
        default: '/images/placeholder-blog.jpg',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    privacy: {
        type: String,
        enum: ['private', 'connections', 'followers', 'public'],
        default: 'public',
    },
    tags: [{
        type: String,
        trim: true,
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    featured: {
        type: Boolean,
        default: false,
    },
    viewCount: {
        type: Number,
        default: 0
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

// Pre-save middleware to generate slug from title
BlogSchema.pre('save', async function (next) {
    // Only update the slug if the title has been modified (or is new)
    if (this.isModified('title') || !this.slug) {
        // Generate a base slug from the title
        let baseSlug = slugify(this.title, {
            lower: true,            // Convert to lowercase
            strict: true,           // Strip special characters
            remove: /[*+~.()'"!:@]/g // Custom character removal
        });

        // Check if the slug already exists
        let slugExists = true;
        let slugToCheck = baseSlug;
        let counter = 1;

        while (slugExists) {
            // Skip checking if this is a new document (no _id yet)
            if (this.isNew) {
                const existingBlog = await mongoose.models.Blog.findOne({ slug: slugToCheck });
                if (!existingBlog) {
                    slugExists = false;
                    break;
                }
                slugToCheck = `${baseSlug}-${counter}`;
                counter++;
            } else {
                // For existing documents, only check if slug changed
                const existingBlog = await mongoose.models.Blog.findOne({
                    slug: slugToCheck,
                    _id: { $ne: this._id } // Exclude the current document
                });

                if (!existingBlog) {
                    slugExists = false;
                    break;
                }
                slugToCheck = `${baseSlug}-${counter}`;
                counter++;
            }
        }

        // Set the slug to the unique value
        this.slug = slugToCheck;
    }

    // Update the updatedAt timestamp
    this.updatedAt = Date.now();

    next();
});

// Add text index for search functionality
BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);