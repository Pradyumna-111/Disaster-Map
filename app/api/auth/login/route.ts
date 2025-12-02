import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- Mongoose Setup (Connect and Model Definition - Assumed consistent) ---
const MONGODB_URI = process.env.MONGODB_URI as string;
const JWT_SECRET = process.env.JWT_SECRET as string;
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
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- POST Handler for Login ---
export async function POST(request: Request) {
    await connectToDatabase();

    try {
        const { email, password } = await request.json();

        // 1. Input Validation
        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password.' }, { status: 400 });
        }

        // 2. Normalize the email for database query
        const lowercasedEmail = email.toLowerCase();

        // 3. Find the user
        const user = await User.findOne({ email: lowercasedEmail });

        if (!user) {
            // Fails if user not found (Primary 401 source)
            return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
        }

        // 4. Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.hashedPassword);

        if (!isMatch) {
            // Fails if password mismatch (Secondary 401 source)
            return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
        }

        // 5. Successful Login: Create and set JWT Token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 6. Create response and set the HttpOnly cookie
        const response = NextResponse.json(
            { message: 'Login successful!', userId: user._id },
            { status: 200 }
        );

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Mongoose Login Error:', error);
        return NextResponse.json({ error: 'Internal server error during login.' }, { status: 500 });
    }
}