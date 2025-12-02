import { NextResponse } from 'next/server';
import Resource from '@/models/Resource'; // Import the MongoDB Resource model
import mongoose from 'mongoose';
// Assuming you have a database connection utility
// import connectToDatabase from '@/lib/mongoose';

// NOTE: Include your Mongoose connection logic here or import a utility function
let cachedDb: mongoose.Connection | null = null;
async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const MONGODB_URI = process.env.MONGODB_URI as string;
    const db = await mongoose.connect(MONGODB_URI);
    cachedDb = db.connection;
    return cachedDb;
}


export async function GET(request: Request) {
    // 1. Connect to the database
    await connectToDatabase();

    try {
        const { searchParams } = new URL(request.url);

        // Get the 'type' filter from the URL query parameters
        const resourceType = searchParams.get('type');

        // 2. Define the query
        const query: any = { status: 'verified' }; // ALWAYS filter for verified resources

        // Filter by resource type unless the filter is 'all'
        if (resourceType && resourceType !== 'all') {
            query.type = resourceType;
        }

        // 3. Fetch resources
        // Select only necessary fields for map rendering
        const resources = await Resource.find(query).select('type name address location').lean();

        // 4. Map the data structure for the frontend
        // MongoDB stores GeoJSON as [Lng, Lat], we map it to standard { lat, lng }
        const mappedResources = resources.map(resource => ({
            id: resource._id.toString(),
            type: resource.type,
            name: resource.name,
            address: resource.address,
            lat: resource.location.coordinates[1], // Latitude (second element)
            lng: resource.location.coordinates[0], // Longitude (first element)
        }));

        return NextResponse.json(mappedResources, { status: 200 });

    } catch (error) {
        console.error('Resource fetching failed:', error);
        return NextResponse.json({ error: 'Internal server error during resource fetching.' }, { status: 500 });
    }
}