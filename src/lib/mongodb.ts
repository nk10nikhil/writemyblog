import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'writemyblog';

// Create a development mode flag - this helps us handle missing DB connections in development
const isDevelopment = process.env.NODE_ENV === 'development';

// In development, we'll provide a warning but not throw hard errors when MongoDB isn't configured
if (!MONGODB_URI) {
    if (isDevelopment) {
        console.warn('MongoDB URI not defined in environment variables. Using mock data in development mode.');
    } else {
        throw new Error('Please define the MONGODB_URI environment variable');
    }
}

// Define type for global mongoose cache
declare global {
    var mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    // If we've already connected, return the existing connection
    if (cached.conn) {
        return cached.conn;
    }

    // If no MongoDB URI is provided and we're in development, use mock data approach
    if (!MONGODB_URI && isDevelopment) {
        console.warn('Skipping MongoDB connection in development mode - mock data will be used');
        return null;
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

                if (isDevelopment) {
                    console.warn('Failed to connect to MongoDB. Using mock data in development mode.');
                    return null;
                }

                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;

        if (isDevelopment) {
            console.warn('Error establishing MongoDB connection. Using mock data in development mode.');
            return null;
        }

        console.error('Failed to connect to MongoDB:', e);
        throw new Error(`Unable to connect to MongoDB: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    return cached.conn;
}

export default connectToDatabase;