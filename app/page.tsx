"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { User, LogOut, MapPin } from "lucide-react";
import AddResourceModal from '@/components/AddResourceModal'; // <-- IMPORT THE NEW MODAL
// --- REQUIRED IMPORT FOR SCRIPT LOADING ---
import { useLoadScript } from '@react-google-maps/api';
// -----------------------------------------

// Import the new SearchBox component and MapComponent dynamically
const MapComponent = dynamic(() => import("../components/Map"), { ssr: false });
const SearchBox = dynamic(() => import("../components/SearchBox"), { ssr: false });

// Define the shape of the location prop used by SearchBox and MapComponent
interface Location {
    lat: number;
    lng: number;
    name?: string;
}

// Required Google Maps Libraries for Autocomplete/Places (must be defined here)
const libraries: "places"[] = ["places"];


// Define the possible filters and their updated colors (omitted for brevity)
type FilterType = "all" | "safe" | "food" | "shelter" | "medical" | "sos";
const filterStyles: Record<FilterType, { label: string, color: string, hover: string }> = {
    all: { label: "All", color: "bg-teal-600", hover: "hover:bg-teal-700" },
    safe: { label: "Safe Zones", color: "bg-emerald-600", hover: "hover:bg-emerald-700" },
    food: { label: "Food Centers", color: "bg-amber-500", hover: "hover:bg-amber-600" },
    shelter: { label: "Shelters", color: "bg-indigo-600", hover: "hover:bg-indigo-700" },
    medical: { label: "Medical", color: "bg-cyan-600", hover: "hover:bg-cyan-700" },
    sos: { label: "SOS", color: "bg-red-700", hover: "hover:bg-red-800" },
};

export default function HomePage() {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // --- 1. SCRIPT LOADING LOGIC ---
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: libraries,
    });
    // -------------------------------

    // --- Map Center Management ---
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };
    const [mapCenter, setMapCenter] = useState<Location>(defaultCenter);
    const [selectedPlaceName, setSelectedPlaceName] = useState("Default Location (India)");

    // --- Authentication Placeholder ---
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const userName = "Admin User";
    // ----------------------------------

    const handlePlaceSelect = (location: Location) => {
        setMapCenter({ lat: location.lat, lng: location.lng });
        setSelectedPlaceName(location.name || 'Searched Location');
    };

    const handleLogout = () => {
        // In a real app, clear the cookie and redirect to /login
        setIsAuthenticated(false);
        alert("Logged out successfully!");
    };

    const NavbarActions = () => {
        // ... (Login/Logout buttons logic remains the same)
        if (isAuthenticated) {
            return (
                <div className="flex items-center space-x-4">
                    <span className="text-gray-700 flex items-center">
                        <User className="w-5 h-5 mr-2 text-teal-600" />
                        Hello, **{userName}**
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

    // Display error if API key is invalid or script loading fails
    if (loadError) return <div className="p-8 text-red-600">Error loading maps. Check API key or network connection.</div>;

    // Display a loader for the entire map/search functionality
    // if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Initializing Map Services...</div>;


    return (
        <main className="min-h-screen flex flex-col bg-gray-50">

            {/* Navbar */}
            <nav className="sticky top-0 z-20 w-full flex justify-between items-center px-6 py-3 bg-white shadow-md">
                <Link href="/" passHref className="text-2xl font-extrabold text-teal-600 tracking-tight">
                    DRM | Disaster Relief Map
                </Link>

                {/* 2. CONDITIONAL RENDERING for Search Bar */}
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

            {/* Main Content Area (Filters + Map + Sidebar) */}
            <div className="flex-1 flex relative">

                {/* Filters Sidebar (omitted for brevity) */}
                <aside className="w-56 p-4 flex flex-col gap-3 bg-white border-r shadow-lg z-10">
                    <h2 className="text-lg font-semibold mb-2 border-b pb-2 text-gray-700">Filter Resources</h2>
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

                    <div className="mt-4 pt-4 border-t">
                        <Button
                            variant="destructive"
                            className="w-full text-lg font-bold bg-red-600 hover:bg-red-700"
                            disabled={!isAuthenticated}
                            onClick={() => alert("Open Report Incident Modal")}
                        >
                            Report Incident
                        </Button>
                    </div>
                </aside>

                {/* Map Section */}
                <div className="flex-1 relative">
                    {/* 3. Pass the isLoaded state to the MapComponent */}
                    <MapComponent filter={selectedFilter} initialCenter={mapCenter} isLoaded={isLoaded} />

                    {/* Add Pin Button (omitted for brevity) */}
                    <div className="absolute bottom-6 right-6 z-10">
                        <Button
                            className="px-6 py-3 text-lg font-semibold bg-teal-700 hover:bg-teal-800 shadow-xl"
                            onClick={() => setIsModalOpen(true)}
                            disabled={!isAuthenticated}
                        >
                            <MapPin className="w-5 h-5 mr-2" />
                            {isAuthenticated ? 'Add Resource Pin' : 'Login to Add Pin'}
                        </Button>
                    </div>
                    <AddResourceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                    {/* Floating Info Card/Sidebar (omitted for brevity) */}
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
                                Current Location: **{selectedPlaceName}**
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                                Filter: **{filterStyles[selectedFilter].label}**.
                            </p>
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