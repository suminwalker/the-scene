"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useCity } from "@/lib/city-context";
import { PLACES } from "@/lib/data";

interface CityOption {
    value: string;
    label: string;
}

export function CitySelector() {
    const { city, setCity } = useCity();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");

    // Dynamic cities derived from data
    // TO-DO: When ready to launch other cities, remove the filter here to show all `sortedCities`
    const sortedCities = Array.from(new Set(PLACES.map(p => p.city))).sort();

    // For now, only show NYC
    const enabledCities = sortedCities.filter(c => c === 'nyc');

    const formatCity = (slug: string) => {
        if (slug === "nyc") return "New York City";
        if (slug === "la") return "Los Angeles";
        if (slug === "ldn") return "London";
        if (slug === "washington") return "Washington DC";
        return slug.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    };

    const allCities: CityOption[] = enabledCities.map(c => ({
        value: c,
        label: formatCity(c)
    }));

    const filtered = allCities.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="relative flex-1 max-w-sm">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-white transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => {
                        if (!query) setQuery("");
                        setOpen(true);
                    }}
                    placeholder={formatCity(city) || "Search city..."}
                    className="w-full bg-black/5 dark:bg-white/10 border border-transparent focus:border-white/20 rounded-full pl-10 pr-4 py-2 text-sm outline-none transition-all placeholder-zinc-500 text-zinc-800 dark:text-zinc-200"
                />
            </div>

            {/* Dropdown Results */}
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                        {filtered.length > 0 ? (
                            filtered.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => {
                                        setCity(c.value);
                                        setQuery("");
                                        setOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between group transition-colors"
                                >
                                    <span className={`text-sm font-medium ${city === c.value ? "text-accent" : "text-zinc-600 dark:text-zinc-300"}`}>
                                        {c.label}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-zinc-500">
                                No cities found.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
