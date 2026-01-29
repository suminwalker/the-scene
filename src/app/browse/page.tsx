"use client";

import { Suspense, useState, useEffect } from "react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { getCombinedPlaces, Place } from "@/lib/data";
import Link from "next/link";
import { useCity } from "@/lib/city-context";
import { useSearchParams, useRouter } from "next/navigation";

const CATEGORIES = [
    { id: "bars-20s", label: "Best Bars for 20s", sub: "Loud, High Energy, Scene-y", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b" },
    { id: "bars-30s", label: "Best Bars for 30s", sub: "Craft Cocktails, Social, Mature", image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20" },
    { id: "rooftops-20s", label: "Best Rooftops for 20s", sub: "Views, Music, Crowd-y", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3" },
    { id: "rooftops-30s", label: "Best Rooftops for 30s", sub: "Sunset, Networking, Posh", image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2" },
    { id: "mixed-bars", label: "Best Mixed Bars", sub: "Diverse Crowd, Local Vibes", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de" },
    { id: "mixed-rooftops", label: "Best Mixed Rooftops", sub: "All Ages, Skyline Views", image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a" },
    { id: "clubs", label: "Best Clubs", sub: "Dancing, Late Night, Energy", image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67" },
    { id: "daytime-early-20s", label: "Daytime: Early 20s", sub: "Brunch, High Energy, Social", image: "https://images.unsplash.com/photo-1577366366530-5bb287b94998" },
    { id: "daytime-mid-20s", label: "Daytime: Mid 20s", sub: "Outdoor, Cafe Vibe, Chill", image: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2" },
    { id: "daytime-30s", label: "Daytime: 30s+", sub: "Sophisticated Brunch, Coffee", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4" },
    { id: "date-night", label: "Best Date Night", sub: "Intimate, Dimly Lit, Romantic", image: "https://images.unsplash.com/photo-1547620615-5d9c6e5a5286" },
    { id: "late-night", label: "Best Late Night", sub: "After Hours, Night Owls", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b" },
    { id: "hidden-gems", label: "Hidden Gems", sub: "Speakeasies, No Signs", image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56" },
    { id: "group-hangouts", label: "Group Hangouts", sub: "Large Tables, Fun Atmosphere", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591" },
    { id: "work-from-bar", label: "Work From Bar", sub: "Wi-Fi, Quiet, Daytime Vibe", image: "https://images.unsplash.com/photo-1571204829887-3b8d69f4b04c" },
];


function BrowseContent() {
    const { city } = useCity();
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedAge = searchParams.get('age');
    const backHref = "/discover";
    const [localAddedPlaces, setLocalAddedPlaces] = useState<Place[]>([]);

    // Initialize from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('the_scene_user_venues');
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setLocalAddedPlaces(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load user venues", e);
            }
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (localAddedPlaces.length > 0) {
            localStorage.setItem('the_scene_user_venues', JSON.stringify(localAddedPlaces));
        }
    }, [localAddedPlaces]);

    // Check if a category is selected via URL param
    // (selectedAge is already declared at the top of the function)

    // Filter places logic
    const allPlaces = getCombinedPlaces().filter(p => p.city === city);
    let cityPlaces: Place[] = [];

    if (selectedAge && selectedAge !== 'all') {
        cityPlaces = allPlaces.filter(p => p.age && p.age.includes(selectedAge));
    } else {
        cityPlaces = allPlaces;
    }

    // Category label
    const category = CATEGORIES.find(c => c.id === selectedAge);
    const categoryLabel = category ? category.label : selectedAge === 'all' ? 'All Spots' : `Night Out: ${selectedAge}`;

    // Simple alphabetic sort or by rating
    cityPlaces.sort((a, b) => b.rating - a.rating);

    const handleAddVenue = () => {
        router.push(`/browse/add?category=${selectedAge || "all"}`);
    };

    // MODE 1: Categories (Root View)
    if (!selectedAge) {
        return (
            <>
                <TopBar backHref={backHref} />
                <main className="flex-1 overflow-y-auto pb-24 px-6 py-8 scrollbar-hide">
                    <header className="mb-10 text-center sm:text-left">
                        <h1 className="text-4xl font-serif leading-[1.1] mb-2">
                            Browse
                        </h1>
                        <p className="text-zinc-500 text-lg font-sans font-normal italic">by Vibe Check</p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {CATEGORIES.map((cat) => (
                            <Link key={cat.id} href={`/browse?age=${cat.id}`} className="block group">
                                <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${cat.image})` }}
                                    />
                                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />

                                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                                        <h3 className="text-2xl font-serif text-white mb-1 group-hover:underline decoration-accent/50 underline-offset-4">{cat.label}</h3>
                                        <p className="text-xs text-zinc-300 font-medium font-mono uppercase tracking-tight">{cat.sub}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* View All fallback */}
                        <Link href={`/browse?age=all`} className="block group mt-8 text-center">
                            <span className="text-zinc-500 text-sm font-mono uppercase tracking-widest hover:text-white transition-colors">
                                View Everything ({cityPlaces.length})
                            </span>
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    // MODE 2: Grid View (Filtered)
    return (
        <>
            <TopBar backHref={backHref} />
            <main className="flex-1 overflow-y-auto pb-24 px-4 py-8 scrollbar-hide">
                <header className="mb-8 relative flex flex-col sm:flex-row sm:items-end sm:justify-between items-center text-center sm:text-left gap-4">
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-3xl font-serif leading-tight">
                            {categoryLabel}
                        </h1>
                        <p className="text-zinc-500 text-[10px] font-mono mt-1 uppercase tracking-[0.2em]">
                            {cityPlaces.length} Results
                        </p>
                    </div>

                    <button
                        onClick={handleAddVenue}
                        className="flex-none px-6 py-2.5 bg-white text-black rounded-full text-xs font-bold active:scale-95 transition-all shadow-xl"
                    >
                        Add a Venue
                    </button>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cityPlaces.map((place) => (
                        <Link key={place.id} href={`/places/${place.id}`}>
                            <div className="aspect-[3/4] bg-zinc-900 relative group overflow-hidden rounded-xl border border-white/5">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${place.image})` }}
                                />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12">
                                    <p className="font-serif text-white text-sm font-medium leading-tight truncate">{place.name}</p>
                                    <p className="text-[10px] text-zinc-400 mt-1 truncate font-mono">{place.neighborhood} • {place.price}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {cityPlaces.length === 0 && (
                    <div className="py-20 text-center text-zinc-500">
                        <p>No places found for this vibe.</p>
                    </div>
                )}
            </main>
        </>
    );
}

export default function BrowsePage() {
    return (
        <div className="flex justify-center min-h-screen bg-background">
            <MobileContainer>
                <Suspense fallback={<div className="p-10 text-center text-zinc-500 font-mono animate-pulse uppercase tracking-widest">Loading scene...</div>}>
                    <BrowseContent />
                </Suspense>
                <BottomNav />
            </MobileContainer>
        </div>
    );
}
