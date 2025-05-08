import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'writemyblog';

// Always require a MongoDB connection regardless of environment
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

// Define type for global mongoose cache
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Add mongoose to the NodeJS global type
declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

// Initialize cached connection
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Save to global
if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectToDatabase() {
    // If we've already connected, return the existing connection
    if (cached.conn) {
        return cached.conn;
    }

    // Define MongoDB connection options
    const opts = {
        bufferCommands: false,
        dbName: MONGODB_DB
    };

    // If a connection attempt is in progress, return the promise
    if (!cached.promise) {
        let connectionTimeout: NodeJS.Timeout;

        // Create a timeout promise that rejects after 10 seconds
        const timeoutPromise = new Promise<null>((_, reject) => {
            connectionTimeout = setTimeout(() => {
                reject(new Error('MongoDB connection timeout after 10 seconds'));
            }, 10000);
        });

        // Create connection promise with timeout handling
        cached.promise = Promise.race([
            mongoose.connect(MONGODB_URI!, opts),
            timeoutPromise
        ])
            .then((result) => {
                clearTimeout(connectionTimeout);
                console.log('Connected to MongoDB');
                return result as typeof mongoose;
            })
            .catch((err) => {
                console.error('MongoDB connection error:', err);
                clearTimeout(connectionTimeout);
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('Failed to connect to MongoDB:', e);
        throw new Error(`Unable to connect to MongoDB: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    return cached.conn;
}

export default connectToDatabase;