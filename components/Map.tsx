'use client';

import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { useState, useEffect } from 'react'; // <-- IMPORT useState and useEffect

// Define the shape of the location prop
interface Location {
    lat: number;
    lng: number;
}

// Define the shape of a fetched resource
interface MapResource {
    id: string;
    type: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
}

// Map Component Props
interface MapProps {
    filter: string;
    initialCenter: Location;
    isLoaded: boolean;
}

// Default options for the map (omitted for brevity)
const defaultMapOptions = { /* ... */ disableDefaultUI: true, zoomControl: true, };

// Helper function to define marker icons/colors
const getMarkerIcon = (type: string) => {
    switch (type) {
        case 'safe':
            return 'green';
        case 'food':
            return 'orange';
        case 'shelter':
            return 'blue';
        case 'medical':
            return 'cyan';
        case 'sos':
            return 'red';
        default:
            return 'grey';
    }
};

export default function Map({ filter, initialCenter, isLoaded }: MapProps) {

    // State to hold the fetched resources
    const [resources, setResources] = useState<MapResource[]>([]);

    // --- Data Fetching Effect: Runs whenever filter or isLoaded changes ---
    useEffect(() => {
        // Only attempt to fetch data if the Google script is loaded
        if (!isLoaded) return;

        const fetchResources = async () => {
            try {
                // Call the new API, passing the current filter
                const response = await fetch(`/api/resources/list?type=${filter}`);
                if (response.ok) {
                    const data: MapResource[] = await response.json();
                    setResources(data);
                } else {
                    console.error('Failed to fetch resources:', response.statusText);
                    setResources([]);
                }
            } catch (error) {
                console.error('Network or parsing error:', error);
                setResources([]);
            }
        };

        fetchResources();

    }, [filter, isLoaded]); // Dependencies ensure data refreshes when filter changes

    if (!isLoaded) return <div className="p-4 flex items-center justify-center h-full">Loading map...</div>;

    // --- Component is ready, render the map and markers ---
    return (
        <GoogleMap
            center={initialCenter}
            zoom={initialCenter.lat !== 20.5937 ? 12 : 6}
            options={defaultMapOptions}
            mapContainerClassName="w-full h-full"
        >
            {/* Render all dynamically fetched resource markers */}
            {resources.map((resource) => (
                <MarkerF
                    key={resource.id}
                    position={{ lat: resource.lat, lng: resource.lng }}
                    title={resource.name}
                    options={{
                        // Using a simple styled circle marker for visual distinction
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: getMarkerIcon(resource.type),
                            fillOpacity: 0.9,
                            strokeWeight: 1,
                            strokeColor: 'black',
                        }
                    }}
                    onClick={() => {
                        // In a real application, this should open an info window/card
                        alert(`Clicked on ${resource.name} (${resource.type})`);
                    }}
                />
            ))}

            {/* Remove your fixed marker position here, as it's now dynamic */}
            {/* <MarkerF position={markerPosition} title={`Marker for filter: ${filter}`} /> */}
        </GoogleMap>
    );
}