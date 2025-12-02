'use client';

import { Autocomplete } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useRef } from "react";

// Define the interface for the location data
interface Location {
    lat: number;
    lng: number;
    name: string;
}

// Props interface for the search box
interface SearchBoxProps {
    onPlaceSelect: (location: Location) => void;
}

export default function SearchBox({ onPlaceSelect }: SearchBoxProps) {
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 1. Called when the Autocomplete component mounts
    const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    };

    // 2. Called when a user selects a suggestion from the dropdown
    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();

            // Ensure we have geometry and location data
            if (place.geometry && place.geometry.location) {
                const location: Location = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    name: place.formatted_address || place.name || 'Unknown Location',
                };

                // Pass the selected location up to the parent component (HomePage)
                onPlaceSelect(location);

                // Clear the input after selection (optional)
                if (inputRef.current) {
                    inputRef.current.value = location.name;
                }
            } else {
                console.error("Place geometry is missing.");
            }
        }
    };

    // Define restrictions/options for Autocomplete (e.g., limit to India)
    const options = {
        // Only return results that have a place ID (useful for more accurate results)
        fields: ["address_components", "geometry", "icon", "name", "formatted_address"],
        // You can uncomment and modify this to limit search results geographically
        // componentRestrictions: { country: "in" },
    };

    return (
        <div className="relative w-full">
            {/* The Autocomplete component must wrap the input or a component that forwards the ref to the input. */}
            <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
                options={options}
            >
                {/* The input element must be the direct functional child being rendered.
                    We keep the Search icon and Input within the styled div. */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <Input
                        // The Autocomplete component attaches functionality to this input
                        ref={inputRef}
                        placeholder="Search for an area, shelter, or center..."
                        className="w-full pl-10 border-2 border-gray-300 focus:border-teal-500 transition-all duration-200"
                    />
                </div>
            </Autocomplete>
        </div>
    );
}