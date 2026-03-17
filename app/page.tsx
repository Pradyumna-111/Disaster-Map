"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, LogOut, MapPin, AlertCircle } from "lucide-react";
import AddResourceModal from '@/components/AddResourceModal';
import ReportIncidentModal from '@/components/ReportIncidentModal';
import { useLoadScript } from '@react-google-maps/api';

const MapComponent = dynamic(() => import("../components/Map"), { ssr: false });
const SearchBox = dynamic(() => import("../components/SearchBox"), { ssr: false });

interface Location {
    lat: number;
    lng: number;
    name?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

const libraries: "places"[] = ["places"];

type FilterType = "all" | "safe" | "food" | "shelter" | "medical" | "sos" | "incident";
const filterStyles: Record<FilterType, { label: string, color: string, hover: string }> = {
    all: { label: "All", color: "bg-teal-600", hover: "hover:bg-teal-700" },
    safe: { label: "Safe Zones", color: "bg-emerald-600", hover: "hover:bg-emerald-700" },
    food: { label: "Food Centers", color: "bg-amber-500", hover: "hover:bg-amber-600" },
    shelter: { label: "Shelters", color: "bg-indigo-600", hover: "hover:bg-indigo-700" },
    medical: { label: "Medical", color: "bg-cyan-600", hover: "hover:bg-cyan-700" },
    sos: { label: "SOS", color: "bg-red-700", hover: "hover:bg-red-800" },
    incident: { label: "Incidents", color: "bg-orange-600", hover: "hover:bg-orange-700" },
};

export default function HomePage() {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [clickedLocation, setClickedLocation] = useState<Location | null>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: libraries,
    });

    const defaultCenter = { lat: 20.5937, lng: 78.9629 };
    const [mapCenter, setMapCenter] = useState<Location>(defaultCenter);
    const [selectedPlaceName, setSelectedPlaceName] = useState("Default Location (India)");

    const [user, setUser] = useState<User | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.authenticated) {
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Auth check failed:", err);
            } finally {
                setIsLoadingAuth(false);
            }
        }
        checkAuth();
    }, []);

    const handlePlaceSelect = (location: Location) => {
        setMapCenter({ lat: location.lat, lng: location.lng });
        setSelectedPlaceName(location.name || 'Searched Location');
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            alert("Logged out successfully!");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const handleMapClick = (location: Location) => {
        setClickedLocation(location);
    };

    const NavbarActions = () => {
        if (isLoadingAuth) return <div className="w-24 h-8 bg-gray-100 animate-pulse rounded"></div>;

        if (user) {
            return (
                <div className="flex items-center space-x-4">
                    <span className="text-gray-700 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-teal-600" />
                        Hello, <span className="font-bold ml-1">{user.name}</span>
                    </span>
                    <Button variant="outline" onClick={handleLogout} className="group hover:bg-red-50 text-red-600 border-red-300">
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                </div>
            );
        } else {
            return (
                <div className="space-x-4">
                    <Link href="/login" passHref>
                        <Button variant="outline">Login</Button>
                    </Link>
                    <Link href="/register" passHref>
                        <Button className="bg-teal-600 hover:bg-teal-700">Register</Button>
                    </Link>
                </div>
            );
        }
    };

    if (loadError) return <div className="p-8 text-red-600">Error loading maps. Check API key or network connection.</div>;

    return (
        <main className="min-h-screen flex flex-col bg-gray-50">
            <nav className="sticky top-0 z-20 w-full flex justify-between items-center px-6 py-3 bg-white shadow-md">
                <Link href="/" passHref className="text-2xl font-extrabold text-teal-600 tracking-tight shrink-0">
                    DRM | Disaster Relief Map
                </Link>

                <div className="flex-1 max-w-lg mx-8">
                    {isLoaded ? (
                        <SearchBox onPlaceSelect={handlePlaceSelect} />
                    ) : (
                        <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse flex items-center pl-4">
                            <span className="text-gray-500 text-sm">Loading search service...</span>
                        </div>
                    )}
                </div>

                <NavbarActions />
            </nav>

            <div className="flex-1 flex relative">
                <aside className="w-56 p-4 flex flex-col gap-3 bg-white border-r shadow-lg z-10">
                    <h2 className="text-lg font-semibold mb-2 border-b pb-2 text-gray-700">Filter View</h2>
                    {Object.entries(filterStyles).map(([key, style]) => (
                        <Button
                            key={key}
                            className={selectedFilter === key
                                ? `${style.color} ${style.hover} text-white font-semibold`
                                : "w-full justify-start border border-gray-300 text-gray-700 hover:bg-gray-100"
                            }
                            onClick={() => setSelectedFilter(key as FilterType)}
                        >
                            {style.label}
                        </Button>
                    ))}

                    <div className="mt-4 pt-4 border-t space-y-3">
                        <Button
                            variant="destructive"
                            className="w-full text-md font-bold bg-orange-600 hover:bg-orange-700"
                            disabled={!user}
                            onClick={() => setIsIncidentModalOpen(true)}
                        >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Report Incident
                        </Button>
                        <p className="text-[10px] text-gray-500 text-center italic">
                            {!user ? "Login to report or add pins" : "Select on map or click button"}
                        </p>
                    </div>
                </aside>

                <div className="flex-1 relative">
                    <MapComponent
                        filter={selectedFilter}
                        initialCenter={mapCenter}
                        isLoaded={isLoaded}
                        onMapClick={handleMapClick}
                    />

                    <div className="absolute bottom-6 right-6 z-10">
                        <Button
                            className="px-6 py-3 text-lg font-semibold bg-teal-700 hover:bg-teal-800 shadow-xl"
                            onClick={() => setIsResourceModalOpen(true)}
                            disabled={!user}
                        >
                            <MapPin className="w-5 h-5 mr-2" />
                            {user ? 'Add Resource Pin' : 'Login to Add Pin'}
                        </Button>
                    </div>

                    <AddResourceModal
                        isOpen={isResourceModalOpen}
                        onClose={() => { setIsResourceModalOpen(false); setClickedLocation(null); }}
                        initialLocation={clickedLocation || undefined}
                    />

                    <ReportIncidentModal
                        isOpen={isIncidentModalOpen}
                        onClose={() => { setIsIncidentModalOpen(false); setClickedLocation(null); }}
                        initialLocation={clickedLocation || undefined}
                    />

                    {isSidebarOpen && (
                        <div className="absolute top-4 left-4 z-10 w-80 p-4 bg-white rounded-lg shadow-xl">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Map Context
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    ✕
                                </Button>
                            </div>
                            <p className="mt-2 text-sm font-medium text-teal-700">
                                Current Location: <span className="text-gray-800">{selectedPlaceName}</span>
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                                Filter: <span className="font-semibold">{filterStyles[selectedFilter].label}</span>.
                            </p>
                            {clickedLocation && (
                                <div className="mt-3 p-2 bg-teal-50 border border-teal-200 rounded text-xs text-teal-800">
                                    <p className="font-bold mb-1">Location selected on map:</p>
                                    <p>Lat: {clickedLocation.lat.toFixed(4)}, Lng: {clickedLocation.lng.toFixed(4)}</p>
                                    <p className="mt-1 font-semibold italic">Open a modal to use this location.</p>
                                </div>
                            )}
                            <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-semibold">
                                Emergency Hotline: 112
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
