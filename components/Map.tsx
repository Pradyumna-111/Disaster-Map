'use client';

import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

interface Location {
    lat: number;
    lng: number;
}

interface MapResource {
    id: string;
    type: string;
    name: string;
    address: string;
    description?: string;
    lat: number;
    lng: number;
}

interface MapIncident {
    id: string;
    type: string;
    description: string;
    severity: string;
    status: string;
    lat: number;
    lng: number;
}

interface MapProps {
    filter: string;
    initialCenter: Location;
    isLoaded: boolean;
    onMapClick?: (location: Location) => void;
}

const defaultMapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
};

const getResourceIcon = (type: string) => {
    switch (type) {
        case 'safe': return '#10b981'; // emerald-500
        case 'food': return '#f59e0b'; // amber-500
        case 'shelter': return '#4f46e5'; // indigo-600
        case 'medical': return '#0891b2'; // cyan-600
        case 'sos': return '#b91c1c'; // red-700
        default: return '#4b5563'; // gray-600
    }
};

const getIncidentIcon = (severity: string) => {
    switch (severity) {
        case 'critical': return '#7f1d1d'; // red-900
        case 'high': return '#dc2626'; // red-600
        case 'medium': return '#ea580c'; // orange-600
        case 'low': return '#d97706'; // amber-600
        default: return '#ea580c';
    }
};

export default function Map({ filter, initialCenter, isLoaded, onMapClick }: MapProps) {
    const [resources, setResources] = useState<MapResource[]>([]);
    const [incidents, setIncidents] = useState<MapIncident[]>([]);
    const [selectedMarker, setSelectedMarker] = useState<{ type: 'resource' | 'incident', data: MapResource | MapIncident } | null>(null);

    useEffect(() => {
        if (!isLoaded) return;

        const fetchData = async () => {
            try {
                // Fetch resources
                if (filter === 'all' || ['safe', 'food', 'shelter', 'medical', 'sos'].includes(filter)) {
                    const resResponse = await fetch(`/api/resources/list?type=${filter}`);
                    if (resResponse.ok) {
                        const resData = await resResponse.json();
                        setResources(resData);
                    }
                } else {
                    setResources([]);
                }

                // Fetch incidents
                if (filter === 'all' || filter === 'incident') {
                    const incResponse = await fetch('/api/incidents/list');
                    if (incResponse.ok) {
                        const incData = await incResponse.json();
                        setIncidents(incData);
                    }
                } else {
                    setIncidents([]);
                }
            } catch (error) {
                console.error('Data fetching error:', error);
            }
        };

        fetchData();
    }, [filter, isLoaded]);

    if (!isLoaded) return <div className="p-4 flex items-center justify-center h-full bg-gray-100 animate-pulse">Initializing Map...</div>;

    return (
        <GoogleMap
            center={initialCenter}
            zoom={initialCenter.lat !== 20.5937 ? 14 : 5}
            options={defaultMapOptions}
            mapContainerClassName="w-full h-full"
            onClick={(e) => {
                if (e.latLng && onMapClick) {
                    onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                }
                setSelectedMarker(null);
            }}
        >
            {resources.map((resource) => (
                <MarkerF
                    key={resource.id}
                    position={{ lat: resource.lat, lng: resource.lng }}
                    onClick={() => setSelectedMarker({ type: 'resource', data: resource })}
                    options={{
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: getResourceIcon(resource.type),
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: '#ffffff',
                        }
                    }}
                />
            ))}

            {incidents.map((incident) => (
                <MarkerF
                    key={incident.id}
                    position={{ lat: incident.lat, lng: incident.lng }}
                    onClick={() => setSelectedMarker({ type: 'incident', data: incident })}
                    options={{
                        icon: {
                            path: "M 0,0 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 M -5,-5 L 5,5 M 5,-5 L -5,5",
                            scale: 1.2,
                            fillColor: getIncidentIcon(incident.severity),
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: '#ffffff',
                        }
                    }}
                />
            ))}

            {selectedMarker && (
                <InfoWindowF
                    position={{ lat: selectedMarker.data.lat, lng: selectedMarker.data.lng }}
                    onCloseClick={() => setSelectedMarker(null)}
                >
                    <div className="p-2 max-w-xs">
                        {selectedMarker.type === 'resource' ? (
                            <>
                                <h3 className="font-bold text-lg text-teal-700">{(selectedMarker.data as MapResource).name}</h3>
                                <p className="text-xs font-semibold uppercase text-gray-500 mb-1">{selectedMarker.data.type}</p>
                                <p className="text-sm mb-2">{(selectedMarker.data as MapResource).address}</p>
                                {selectedMarker.data.description && (
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{selectedMarker.data.description}</p>
                                )}
                            </>
                        ) : (
                            <>
                                <h3 className="font-bold text-lg text-orange-700">Incident: {selectedMarker.data.type}</h3>
                                <div className="flex gap-2 mb-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                        (selectedMarker.data as MapIncident).severity === 'critical' ? 'bg-red-600 text-white' :
                                        (selectedMarker.data as MapIncident).severity === 'high' ? 'bg-red-100 text-red-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                        {(selectedMarker.data as MapIncident).severity}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-gray-100 text-gray-700">
                                        {(selectedMarker.data as MapIncident).status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-800">{selectedMarker.data.description}</p>
                            </>
                        )}
                    </div>
                </InfoWindowF>
            )}
        </GoogleMap>
    );
}
