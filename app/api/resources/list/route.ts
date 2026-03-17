import { NextResponse } from 'next/server';
import Resource from '@/models/Resource';
import connectToDatabase from '@/lib/mongodb';

export async function GET(request: Request) {
    await connectToDatabase();

    try {
        const { searchParams } = new URL(request.url);
        const resourceType = searchParams.get('type');

        const query: Record<string, string> = { status: 'verified' };

        if (resourceType && resourceType !== 'all') {
            query.type = resourceType;
        }

        const resources = await Resource.find(query).select('type name address location description').lean();

        const mappedResources = resources.map((resource) => {
            const r = resource as unknown as {
                _id: { toString: () => string };
                type: string;
                name: string;
                address: string;
                description: string;
                location: { coordinates: [number, number] };
            };
            return {
                id: r._id.toString(),
                type: r.type,
                name: r.name,
                address: r.address,
                description: r.description,
                lat: r.location.coordinates[1],
                lng: r.location.coordinates[0],
            };
        });

        return NextResponse.json(mappedResources, { status: 200 });

    } catch (error) {
        console.error('Resource fetching failed:', error);
        return NextResponse.json({ error: 'Internal server error during resource fetching.' }, { status: 500 });
    }
}
