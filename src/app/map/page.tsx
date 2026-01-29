"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BottomNav } from "@/components/layout/BottomNav";
import { useCity } from "@/lib/city-context";
import { getValidPlaces } from "@/lib/filter-utils";
import { MapFilterOverlay } from "@/components/map/MapFilterOverlay";

// Lazy load MapCanvas, disable SSR
const MapCanvas = dynamic(() => import("@/components/map/MapCanvas"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center w-full h-full bg-white text-zinc-400 font-mono text-sm">
            Loading Map...
        </div>
    ),
});

export default function MapPage() {
    const { city } = useCity();
    const [filters, setFilters] = useState<Record<string, string[]>>({});

    // Base places (Unfiltered)
    const initialCityPlaces = getValidPlaces(city);
    // Filtered places (Mutable)
    let filteredCityPlaces = initialCityPlaces;

    // Apply Client-Side Filters
    if (Object.keys(filters).length > 0) {
        filteredCityPlaces = filteredCityPlaces.filter(p => {
            // Logic: For each active filter category (Age, Vibe, etc), 
            // the place must match AT LEAST ONE of the selected tags.
            // (OR within category, AND across categories)

            for (const [key, values] of Object.entries(filters) as [string, string[]][]) {
                if (values.length === 0) continue;

                const placeValues = (p as Record<string, unknown>)[key]; // Dynamic access
                if (!placeValues) return false; // If place doesn't have metadata, strict filter out

                // Handle string vs array (Age is string, Vibe is array)
                const placeTags = Array.isArray(placeValues) ? placeValues : [placeValues];

                // Intersection check
                const match = placeTags.some((t: string) => values.includes(t));
                if (!match) return false;
            }
            return true;
        });
    }

    return (
        <div className="relative w-full h-screen bg-background overflow-hidden">
            <div className="absolute inset-0 z-0">
                <MapCanvas places={filteredCityPlaces} />
            </div>

            {/* Map Overlay Header - Centered Max Width */}
            {/* Map Overlay Header - Full Width */}
            <div className="absolute top-0 left-0 right-0 p-4 z-[400] pointer-events-none flex justify-between items-start w-full">
                <h1 className="text-3xl font-serif text-foreground drop-shadow-sm">Map</h1>

                {/* Controls Group */}
                <div className="pointer-events-auto">
                    <MapFilterOverlay onFilterChange={setFilters} places={initialCityPlaces} />
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
