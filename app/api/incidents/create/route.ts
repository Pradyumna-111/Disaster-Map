import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Incident from '@/models/Incident';
import connectToDatabase from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(request: NextRequest) {
    await connectToDatabase();

    try {
        const data = await request.json();
        const { type, description, severity, lat, lng } = data;

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

        if (type == null || description == null || lat == null || lng == null) {
            return NextResponse.json({ error: 'Missing required incident data.' }, { status: 400 });
        }

        const numericLat = Number(lat);
        const numericLng = Number(lng);

        if (Number.isNaN(numericLat) || Number.isNaN(numericLng) ||
            numericLat > 90 || numericLat < -90 || numericLng > 180 || numericLng < -180) {
            return NextResponse.json({ error: 'Invalid latitude or longitude values.' }, { status: 400 });
        }

        const newIncident = new Incident({
            type,
            description,
            severity: severity || 'medium',
            location: { type: 'Point', coordinates: [numericLng, numericLat] },
            reportedBy: new mongoose.Types.ObjectId(userId),
            status: 'active'
        });

        await newIncident.save();

        return NextResponse.json(
            { message: 'Incident successfully reported!', incidentId: newIncident._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Incident report failed:', error);
        return NextResponse.json({ error: 'Internal server error during incident submission.' }, { status: 500 });
    }
}
