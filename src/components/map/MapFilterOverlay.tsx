"use client";

import { useState, useEffect } from "react";
import { Filter, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useCity } from "@/lib/city-context"; // Removed as per new code
import { CitySelector } from "@/components/layout/CitySelector";
import { Place } from "@/lib/data";



interface MapFilterOverlayProps {
    onFilterChange: (filters: Record<string, string[]>) => void;
    places: Place[];
}

const FILTERS = {
    age: ["21-24", "25-29", "30-34", "35-39"],
    season: ["All Year", "Spring", "Summer", "Fall", "Winter"],
    timeOfDay: ["Morning", "Afternoon", "Evening", "Late Night"]
};

export function MapFilterOverlay({ onFilterChange, places }: MapFilterOverlayProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<Record<string, string[]>>({
        age: [],
        season: [],
        timeOfDay: [],
        neighborhood: []
    });

    // Extract unique neighborhoods from current city data
    const cityNeighborhoods = Array.from(new Set((places || []).filter(p => p?.neighborhood).map(p => p.neighborhood))).sort();

    // Notify parent onChange
    useEffect(() => {
        onFilterChange(selected);
    }, [selected, onFilterChange]);

    const toggleFilter = (category: string, value: string) => {
        setSelected(prev => {
            const current = prev[category] || [];
            const newValues = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];

            return { ...prev, [category]: newValues };
        });
    };

    const clearAll = () => {
        setSelected({
            age: [],
            season: [],
            timeOfDay: [],
            neighborhood: []
        });
    };

    const activeCount = Object.values(selected).flat().length;

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="pointer-events-auto p-3 bg-white border border-black/5 rounded-full text-foreground shadow-xl hover:bg-zinc-50 transition-all active:scale-95"
            >
                <div className="relative">
                    <Filter className="w-5 h-5" />
                    {activeCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border border-white shadow-sm" />
                    )}
                </div>
            </button>

            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 w-full max-w-sm bg-white border-l border-black/5 shadow-2xl z-[500] transition-transform duration-300 ease-out transform pointer-events-auto flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-black/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-serif text-foreground">Filter Scene</h2>
                        <div className="flex items-center gap-4">
                            {activeCount > 0 && (
                                <button onClick={clearAll} className="text-xs text-zinc-400 hover:text-foreground uppercase tracking-wider font-mono">
                                    Clear
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-zinc-400 hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Location Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Location</h3>

                        {/* City Switcher inside Filter */}
                        <CitySelector />

                        <div className="pt-2">
                            {/* Neighborhood Grouping Logic */}
                            {(() => {
                                // NYC Borough Taxonomy
                                const NYC_BOROUGHS: Record<string, string[]> = {
                                    Manhattan: [
                                        "Chelsea", "Chelsea / Garment District", "Chinatown", "East Village",
                                        "Financial District", "Flatiron", "Lower East Side", "Meatpacking District",
                                        "Midtown", "NoHo", "SoHo", "Tribeca", "West Village", "Greenwich Village",
                                        "Little Italy", "Nolita", "Gramercy", "Union Square", "Hell's Kitchen",
                                        "Upper East Side", "Upper West Side", "Harlem"
                                    ],
                                    Brooklyn: [
                                        "Bed-Stuy", "Boerum Hill", "Brooklyn Heights", "Bushwick",
                                        "Carroll Gardens", "Clinton Hill", "Cobble Hill", "DUMBO",
                                        "Fort Greene", "Greenpoint", "Williamsburg", "Park Slope",
                                        "Prospect Heights", "Red Hook", "Crown Heights"
                                    ],
                                    The_Bronx: ["Mott Haven", "Riverdale"],
                                };

                                // Group neighborhoods
                                const grouped: Record<string, string[]> = {};
                                const others: string[] = [];

                                // Only strictly group for NYC for now to avoid confusion in other cities
                                const showSections = cityNeighborhoods.some(n =>
                                    Object.values(NYC_BOROUGHS).flat().includes(n)
                                );

                                if (showSections) {
                                    cityNeighborhoods.forEach(hood => {
                                        let found = false;
                                        for (const [borough, hoods] of Object.entries(NYC_BOROUGHS)) {
                                            if (hoods.includes(hood)) {
                                                if (!grouped[borough]) grouped[borough] = [];
                                                grouped[borough].push(hood);
                                                found = true;
                                                break;
                                            }
                                        }
                                        if (!found) others.push(hood);
                                    });
                                } else {
                                    others.push(...cityNeighborhoods);
                                }

                                // Render Helper
                                const renderHoodButton = (hood: string) => {
                                    const isActive = selected.neighborhood?.includes(hood);
                                    return (
                                        <button
                                            key={hood}
                                            onClick={() => toggleFilter("neighborhood", hood)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-medium border transition-all active:scale-95",
                                                isActive
                                                    ? "bg-black text-white border-black"
                                                    : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300 hover:text-foreground"
                                            )}
                                        >
                                            {hood}
                                        </button>
                                    );
                                };

                                if (!showSections) {
                                    return (
                                        <>
                                            <p className="text-xs text-zinc-400 mb-2">Neighborhoods</p>
                                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                {cityNeighborhoods.map(renderHoodButton)}
                                            </div>
                                        </>
                                    );
                                }

                                return (
                                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {Object.entries(grouped).map(([borough, hoods]) => (
                                            <div key={borough}>
                                                <p className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400 mb-2">
                                                    {borough.replace('_', ' ')}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {hoods.sort().map(renderHoodButton)}
                                                </div>
                                            </div>
                                        ))}
                                        {others.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400 mb-2">
                                                    Other
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {others.sort().map(renderHoodButton)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="w-full h-px bg-black/5" />

                    {/* Other Filters */}
                    {Object.entries(FILTERS).map(([key, options]) => (
                        <div key={key} className="space-y-3">
                            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {options.map((option) => {
                                    const isActive = selected[key]?.includes(option);
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => toggleFilter(key, option)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 flex items-center gap-1.5",
                                                isActive
                                                    ? "bg-black text-white border-black"
                                                    : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300 hover:text-foreground"
                                            )}
                                        >
                                            {option}
                                            {isActive && <Check className="w-3 h-3" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-black/5 bg-zinc-50">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-black/90 transition-colors"
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </>
    );
}
