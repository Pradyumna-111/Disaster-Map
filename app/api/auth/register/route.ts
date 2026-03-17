import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
    await connectToDatabase();

    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            hashedPassword,
        });
        await newUser.save();

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
