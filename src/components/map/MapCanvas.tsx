"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Place } from "@/lib/data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Custom Light Map Style (CartoDB Positron)
const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface MapCanvasProps {
    places: Place[];
}

export default function MapCanvas({ places }: MapCanvasProps) {
    // NYC Center
    const center: [number, number] = [40.725, -73.995];
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    // Deterministic pseudo-random coords based on place ID
    // This implies we don't have real coords yet, so we scatter them around the center.
    // Neighborhood Centroids (Approximate for NYC Demo)
    const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
        // Manhattan
        "SoHo": [40.723, -74.002],
        "West Village": [40.735, -74.004],
        "East Village": [40.728, -73.983],
        "Lower East Side": [40.715, -73.988],
        "Tribeca": [40.716, -74.008],
        "Chinatown": [40.715, -73.997],
        "Little Italy": [40.719, -73.997],
        "NoHo": [40.727, -73.993],
        "Nolita": [40.722, -73.995],
        "Greenwich Village": [40.733, -73.997],
        "Chelsea": [40.746, -74.001],
        "Meatpacking District": [40.740, -74.006],
        "Hell's Kitchen": [40.763, -73.991],
        "Flatiron": [40.741, -73.989],
        "Gramercy": [40.737, -73.981],
        "Midtown": [40.754, -73.983],
        "Upper East Side": [40.773, -73.956],
        "Upper West Side": [40.787, -73.975],
        "Harlem": [40.811, -73.946],
        "Financial District": [40.707, -74.009],
        // Brooklyn
        "Williamsburg": [40.714, -73.961],
        "Greenpoint": [40.727, -73.951],
        "Bushwick": [40.700, -73.916],
        "DUMBO": [40.703, -73.989],
        "Brooklyn Heights": [40.696, -73.993],
        "Cobble Hill": [40.686, -73.993],
        "Boerum Hill": [40.684, -73.984],
        "Carroll Gardens": [40.679, -73.995],
        "Park Slope": [40.671, -73.977],
        "Fort Greene": [40.688, -73.972],
        "Clinton Hill": [40.689, -73.963],
        "Bed-Stuy": [40.687, -73.941],
        "Red Hook": [40.673, -74.010],
        // Queens
        "Astoria": [40.764, -73.923],
        "Long Island City": [40.744, -73.948],
        "Sunnyside": [40.743, -73.918],
        "Ridgewood": [40.710, -73.902]
    };

    const getCoords = (id: string, neighborhood: string): [number, number] => {
        const base = NEIGHBORHOOD_COORDS[neighborhood] || center;

        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash |= 0;
        }

        const factor = 43758.5453;
        const seed = Math.sin(hash) * factor;
        const rand1 = seed - Math.floor(seed);
        const rand2 = (seed * factor) - Math.floor(seed * factor);

        // Scatter within ~0.5km of neighborhood center (tighter cluster)
        const lat = base[0] + (rand1 - 0.5) * 0.008;
        const lng = base[1] + (rand2 - 0.5) * 0.008;

        return [lat, lng];
    };

    // Memoize icon to prevent recreation and ensure it runs on client
    const customIcon = typeof window !== 'undefined' ? new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }) : null;

    if (!isMounted || !customIcon) return null;

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%", background: "#FFFFFF" }}
            zoomControl={false}
        >
            <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />

            {places.map((place) => (
                <Marker key={place.id} position={getCoords(place.id, place.neighborhood)} icon={customIcon}>
                    <Popup className="custom-popup">
                        <div className="min-w-[150px] p-1">
                            <h3 className="font-serif font-bold text-sm mb-0.5">{place.name}</h3>
                            <p className="text-xs text-zinc-500 mb-2">{place.category}</p>
                            <Link href={`/places/${place.id}`} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                                View <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
