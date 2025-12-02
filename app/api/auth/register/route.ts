import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- Mongoose Setup (Connection and Model Definition - Assumed consistent) ---
const MONGODB_URI = process.env.MONGODB_URI as string;
let cachedDb: mongoose.Connection | null = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const db = await mongoose.connect(MONGODB_URI);
    cachedDb = db.connection;
    return cachedDb;
}
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- POST Handler for Registration ---
export async function POST(request: Request) {
    await connectToDatabase();

    try {
        const { name, email, password } = await request.json();

        // 1. Input Validation
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        // 2. Normalize the email to lowercase
        const lowercasedEmail = email.toLowerCase();

        // 3. Check for existing user
        const existingUser = await User.findOne({ email: lowercasedEmail });
        if (existingUser) {
            return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
        }

        // 4. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create and save the new user
        const newUser = new User({
            name,
            email: lowercasedEmail, // Save the normalized email
            hashedPassword,
        });
        await newUser.save();

        // 6. Success
        return NextResponse.json(
            {
                message: 'Registration successful!',
                userId: newUser._id,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration failed:', error);
        return NextResponse.json({ error: 'Internal server error during registration.' }, { status: 500 });
    }
}