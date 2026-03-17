import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as { mongoose?: { conn: unknown; promise: unknown } }).mongoose;

if (!cached) {
  cached = (global as { mongoose?: { conn: unknown; promise: unknown } }).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached!.conn) {
    return cached!.conn as typeof mongoose;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }
  cached!.conn = await cached!.promise;
  return cached!.conn as typeof mongoose;
}

export default connectToDatabase;
