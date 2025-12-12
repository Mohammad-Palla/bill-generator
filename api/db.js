import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || 'mongodb+srv://mohammadpalla24_db_user:Ul7ZRDXI0BKF9Qqm@bill-generator.ddjfb42.mongodb.net/?appName=bill-generator';
const DB_NAME = 'bill-generator';

let client = null;
let db = null;

// Initialize MongoDB connection
export async function connectDB() {
  if (db) {
    return db;
  }

  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined. Please set MONGODB_URI in your environment variables.');
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Close MongoDB connection
export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

