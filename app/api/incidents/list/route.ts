import { NextResponse } from 'next/server';
import Incident from '@/models/Incident';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
    await connectToDatabase();

    try {
        const incidents = await Incident.find({ status: { $in: ['active', 'verified'] } }).lean();

        const mappedIncidents = incidents.map((incident) => {
            const inc = incident as unknown as {
                _id: { toString: () => string };
                type: string;
                description: string;
                severity: string;
                status: string;
                location: { coordinates: [number, number] };
            };
            return {
                id: inc._id.toString(),
                type: inc.type,
                description: inc.description,
                severity: inc.severity,
                status: inc.status,
                lat: inc.location.coordinates[1],
                lng: inc.location.coordinates[0],
            };
        });

        return NextResponse.json(mappedIncidents, { status: 200 });

    } catch (error) {
        console.error('Incident fetching failed:', error);
        return NextResponse.json({ error: 'Internal server error during incident fetching.' }, { status: 500 });
    }
}
