"use client";

import { Search, TrendingUp, Users, Bell, X, ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getCombinedPlaces } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useCity } from "@/lib/city-context";



interface SearchHeaderProps {
    // Props removed as filters are moved
}

export function SearchHeader({ }: SearchHeaderProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCitySelector, setShowCitySelector] = useState(false);
    const { city, setCity } = useCity();
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const CITIES_LIST = [
        { id: "nyc", name: "New York City" },
    ];

    const results = useMemo(() => {
        if (query.length <= 1) return [];
        return getCombinedPlaces().filter(place =>
            place.city === city && (
                place.name.toLowerCase().includes(query.toLowerCase()) ||
                place.category.toLowerCase().includes(query.toLowerCase()) ||
                place.neighborhood.toLowerCase().includes(query.toLowerCase())
            )
        ).slice(0, 5);
    }, [query, city]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowCitySelector(false);
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        setIsOpen(false);
        setQuery("");
        router.push(`/places/${id}`);
    };

    const currentCityName = CITIES_LIST.find(c => c.id === city)?.name || "Select City";

    return (
        <div ref={containerRef} className="space-y-4 px-4 pt-4 pb-2 sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b border-black/5">
            {/* Search Input Container & Bell */}
            <div className="flex gap-3 items-center">
                <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-accent transition-colors" />

                    {/* City Selector (Integrated) */}
                    <div className="absolute left-9 top-1/2 -translate-y-1/2 z-20">
                        <div className="relative">
                            <button
                                onClick={() => setShowCitySelector(!showCitySelector)}
                                className="flex items-center gap-1 py-1 px-1.5 rounded hover:bg-zinc-100 transition-colors"
                            >
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap text-zinc-800">
                                    {currentCityName}
                                </span>
                                <ChevronLeft className={cn("w-3 h-3 transition-transform text-zinc-400", showCitySelector ? "rotate-90" : "-rotate-90")} />
                            </button>

                            {/* City Selector Overlay */}
                            {showCitySelector && (
                                <div className="absolute top-[calc(100%+12px)] left-0 w-48 bg-white backdrop-blur-xl border border-black/5 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                                    <div className="p-2 space-y-1">
                                        {CITIES_LIST.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    setCity(c.id);
                                                    setShowCitySelector(false);
                                                }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-colors",
                                                    city === c.id
                                                        ? "bg-zinc-100 text-accent font-bold"
                                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-black"
                                                )}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-px h-5 bg-zinc-200 absolute left-[calc(2.25rem+130px)] top-1/2 -translate-y-1/2" />



                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            const val = e.target.value;
                            setQuery(val);
                            setIsOpen(val.length > 1);
                        }}
                        onFocus={() => query.length > 1 && setIsOpen(true)}
                        placeholder="Search scene, venues..."
                        className="w-full bg-white border border-black/10 rounded-full py-2.5 pl-[185px] pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all placeholder:text-zinc-400 shadow-sm"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full text-zinc-400"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Autocomplete Dropdown */}
                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-xl border border-black/5 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="p-2">
                                {results.length > 0 ? (
                                    <div className="space-y-1">
                                        {results.map((place) => (
                                            <button
                                                key={place.id}
                                                onClick={() => handleSelect(place.id)}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-xl transition-colors text-left group/item"
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 border border-black/5"
                                                    style={{ backgroundImage: `url(${place.image})` }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate group-hover/item:text-accent transition-colors">
                                                        {place.name}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-500 truncate font-mono uppercase tracking-wider">
                                                        {place.category} • {place.neighborhood}
                                                    </p>
                                                </div>
                                                <div className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 font-mono">
                                                    {place.price}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center px-4">
                                        <p className="text-sm text-zinc-500 font-serif italic">No venues found for &quot;{query}&quot;</p>
                                        <p className="text-[10px] text-zinc-600 font-mono mt-2 uppercase tracking-widest">Try a different spelling</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-zinc-50 p-3 flex justify-between items-center border-t border-black/5">
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Search results</span>
                                <Search className="w-3 h-3 text-zinc-600" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Bell Icon */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={cn(
                            "relative p-2.5 rounded-full border transition-all shrink-0",
                            showNotifications
                                ? "bg-black border-black text-white"
                                : "bg-zinc-100 border-black/5 text-zinc-400 hover:text-black hover:bg-zinc-200"
                        )}
                    >
                        <Bell className="w-5 h-5" />
                        {!showNotifications && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent rounded-full border border-background" />
                        )}
                    </button>

                    {/* Notifications Overlay */}
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-black/5 rounded-2xl shadow-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-300 z-[60]">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Activity</h4>
                                <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded text-zinc-500 font-mono">Synced</span>
                            </div>

                            <div className="py-12 text-center space-y-3">
                                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                                    <Bell className="w-5 h-5 text-zinc-300" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-serif italic text-foreground">All caught up</p>
                                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">No new notifications</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
}
