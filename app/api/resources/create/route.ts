// typescript
import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Resource from '@/models/Resource';

const JWT_SECRET = process.env.JWT_SECRET as string;

let cachedDb: mongoose.Connection | null = null;
async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const MONGODB_URI = process.env.MONGODB_URI as string;
    const db = await mongoose.connect(MONGODB_URI);
    cachedDb = db.connection;
    return cachedDb;
}

export async function POST(request: NextRequest) {
    await connectToDatabase();

    try {
        const data = await request.json();
        const { type, name, address, description, lat, lng } = data;

        // JWT auth
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
        }

        let userId: string;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            userId = decoded.userId;
        } catch (err) {
            return NextResponse.json({ error: 'Unauthorized. Invalid token.' }, { status: 401 });
        }

        // Validate presence (allow numeric 0)
        if (name == null || address == null || type == null || lat == null || lng == null) {
            return NextResponse.json({ error: 'Missing required location or resource data.' }, { status: 400 });
        }

        // Coerce to numbers and validate ranges
        const numericLat = Number(lat);
        const numericLng = Number(lng);

        if (Number.isNaN(numericLat) || Number.isNaN(numericLng) ||
            numericLat > 90 || numericLat < -90 || numericLng > 180 || numericLng < -180) {
            return NextResponse.json({ error: 'Invalid latitude or longitude values.' }, { status: 400 });
        }

        const newResource = new Resource({
            type,
            name,
            address,
            description,
            location: { type: 'Point', coordinates: [numericLng, numericLat] },
            submittedBy: new mongoose.Types.ObjectId(userId),
            status: 'pending'
        });

        await newResource.save();

        return NextResponse.json(
            { message: 'Resource successfully submitted and is pending review!', resourceId: newResource._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Resource creation failed:', error);
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error during resource submission.' }, { status: 500 });
    }
}