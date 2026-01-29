"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { TopBar } from "@/components/layout/TopBar";
import { useCity } from "@/lib/city-context";
import { Place } from "@/lib/data";
import { MapPin, Store, Tag, PlusCircle, CheckCircle2, DollarSign, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const generateId = (prefix: string) => `${prefix}-${Date.now()}`;

const VIBE_OPTIONS = [
    "High-Energy", "Low-key", "Classy", "Divey-Cool", "Historic",
    "Cozy", "Loud", "Cinematic", "Romantic", "Buzz-y"
];

const PRICE_OPTIONS = ["$", "$$", "$$$", "$$$$"];

const CATEGORIES = [
    { id: "bars-20s", label: "Best Bars for 20s" },
    { id: "bars-30s", label: "Best Bars for 30s" },
    { id: "rooftops-20s", label: "Best Rooftops for 20s" },
    { id: "rooftops-30s", label: "Best Rooftops for 30s" },
    { id: "mixed-bars", label: "Best Mixed Bars" },
    { id: "mixed-rooftops", label: "Best Mixed Rooftops" },
    { id: "clubs", label: "Best Clubs" },
    { id: "daytime-early-20s", label: "Daytime: Early 20s" },
    { id: "daytime-mid-20s", label: "Daytime: Mid 20s" },
    { id: "daytime-30s", label: "Daytime: 30s+" },
    { id: "date-night", label: "Best Date Night" },
    { id: "late-night", label: "Best Late Night" },
    { id: "hidden-gems", label: "Hidden Gems" },
    { id: "group-hangouts", label: "Group Hangouts" },
    { id: "work-from-bar", label: "Work From Bar" },
];

function AddVenueContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { city } = useCity();

    const initialCategory = searchParams.get("category") || "";

    const [name, setName] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [address, setAddress] = useState("");
    const [price, setPrice] = useState("$$");
    const [category, setCategory] = useState(initialCategory);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const toggleVibe = (vibe: string) => {
        setSelectedVibes(prev =>
            prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !neighborhood) return;

        setIsSubmitting(true);

        // Simulate a small delay for premium feel
        setTimeout(() => {
            const newPlace: Place = {
                id: generateId('user'),
                name: name,
                city: city,
                category: "User Contribution",
                neighborhood: neighborhood,
                price: price,
                image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800",
                rating: 5.0,
                age: [category || "all"],
                vibe: selectedVibes,
                reviews: [
                    {
                        id: generateId('r'),
                        author: "Sumin Walker",
                        rating: 5,
                        text: "Just added this to the list. Essential spot!",
                        date: "Just now"
                    }
                ],
                crowd: [],
                intent: [],
                editorial: `A real-world suggestion in ${neighborhood}.`,
                address: address,
                phone: "",
                website: ""
            };

            const saved = localStorage.getItem('the_scene_user_venues');
            const localPlaces = saved ? JSON.parse(saved) : [];
            localStorage.setItem('the_scene_user_venues', JSON.stringify([newPlace, ...localPlaces]));

            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1200);
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12 text-accent" />
                </div>
                <h2 className="text-3xl font-serif mb-4">Scene Updated</h2>
                <p className="text-zinc-500 text-sm mb-12 leading-relaxed max-w-[280px]">
                    &quot;{name}&quot; is now part of the {city.toUpperCase()} atlas.
                </p>
                <button
                    onClick={() => router.push(`/browse?age=${category || "all"}`)}
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold text-sm shadow-2xl active:scale-95 transition-all"
                >
                    Back to Scene
                </button>
            </div>
        );
    }

    return (
        <div className="px-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12">
                <h1 className="text-4xl font-serif mb-3 tracking-tight">Add a Venue</h1>
                <p className="text-zinc-400 text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
                    Contribute to the {city.toUpperCase()} scene
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    {/* Venue Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 ml-1">Venue Name</label>
                        <div className="relative group">
                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-black transition-colors" />
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Fanelli Cafe"
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all placeholder:text-zinc-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Neighborhood */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 ml-1">Neighborhood</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-black transition-colors" />
                                <input
                                    required
                                    type="text"
                                    value={neighborhood}
                                    onChange={(e) => setNeighborhood(e.target.value)}
                                    placeholder="e.g. SoHo"
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all placeholder:text-zinc-300"
                                />
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 ml-1">Price</label>
                            <div className="flex bg-zinc-50 border border-zinc-100 rounded-2xl p-1">
                                {PRICE_OPTIONS.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setPrice(opt)}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                                            price === opt ? "bg-white text-black shadow-sm" : "text-zinc-400"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 ml-1">Address</label>
                        <div className="relative group">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-black transition-colors" />
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="e.g. 94 Prince St"
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all placeholder:text-zinc-300"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 ml-1">The Scene</label>
                        <div className="relative group">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-black transition-colors" />
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-10 text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all appearance-none"
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Vibes */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 ml-1">
                            <Sparkles className="w-3 h-3 text-accent" />
                            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">Vibe Check</label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {VIBE_OPTIONS.map(vibe => (
                                <button
                                    key={vibe}
                                    type="button"
                                    onClick={() => toggleVibe(vibe)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all border",
                                        selectedVibes.includes(vibe)
                                            ? "bg-black border-black text-white"
                                            : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300"
                                    )}
                                >
                                    {vibe}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8 pb-12">
                    <button
                        type="submit"
                        disabled={isSubmitting || !name || !neighborhood}
                        className="w-full py-5 bg-black text-white rounded-2xl font-bold text-sm shadow-2xl active:scale-[0.98] transition-all disabled:opacity-20 disabled:active:scale-100 flex items-center justify-center gap-3 group"
                    >
                        {isSubmitting ? (
                            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                                <span>Submit Venue</span>
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-zinc-300 mt-6 font-mono font-medium leading-relaxed tracking-wider">
                        Contribute quality to the {city.toUpperCase()} scene
                    </p>
                </div>
            </form>
        </div>
    );
}

export default function AddVenuePage() {
    return (
        <div className="flex justify-center min-h-screen bg-white text-black">
            <MobileContainer>
                <TopBar backHref="/browse" />
                <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
                    <Suspense fallback={<div className="p-10 text-center text-zinc-300 font-mono animate-pulse uppercase tracking-[0.2em]">Curating...</div>}>
                        <AddVenueContent />
                    </Suspense>
                </main>
            </MobileContainer>
        </div>
    );
}
