"use client";

import { Suspense, useState, useEffect } from "react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { getCombinedPlaces, Place } from "@/lib/data";
import Link from "next/link";
import { useCity } from "@/lib/city-context";
import { useSearchParams, useRouter } from "next/navigation";

// New specialized structure
import { FEATURED_SECTIONS } from "@/lib/featured-lists";


function BrowseContent() {
    const { city } = useCity();
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedAge = searchParams.get('age');
    const backHref = "/discover";
    const [localAddedPlaces, setLocalAddedPlaces] = useState<Place[]>([]);

    // Initialize from localStorage
    const [onboardingData, setOnboardingData] = useState<{
        ageBracket: string | null;
        neighborhoods: string[];
        dislikes: string[];
    } | null>(null);

    useEffect(() => {
        // Load added places
        const savedPlaces = localStorage.getItem('the_scene_user_venues');
        if (savedPlaces) {
            try {
                setLocalAddedPlaces(JSON.parse(savedPlaces));
            } catch (e) {
                console.error("Failed to load user venues", e);
            }
        }

        // Load onboarding preferences
        const savedOnboarding = localStorage.getItem('the_scene_onboarding_data');
        if (savedOnboarding) {
            try {
                setOnboardingData(JSON.parse(savedOnboarding));
            } catch (e) {
                console.error("Failed to load onboarding data", e);
            }
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (localAddedPlaces.length > 0) {
            localStorage.setItem('the_scene_user_venues', JSON.stringify(localAddedPlaces));
        }
    }, [localAddedPlaces]);

    // Filter places logic
    const allPlaces = getCombinedPlaces().filter(p => p.city === city);
    let cityPlaces: Place[] = [];

    if (selectedAge && selectedAge !== 'all') {
        cityPlaces = allPlaces.filter(p => {
            // Specialized Playlists
            if (selectedAge === 'recommended-match') {
                // 1. Filter by Dislikes
                if (onboardingData?.dislikes?.length) {
                    const isDisliked = onboardingData.dislikes.some(dislike => {
                        const d = dislike.toLowerCase();
                        const pCat = p.category.toLowerCase();
                        const pVibe = p.vibe?.map(v => v.toLowerCase()) || [];
                        const pIntent = p.intent?.map(i => i.toLowerCase()) || [];

                        // Simple inclusion checks for common terms
                        if (d.includes("dive") && pCat.includes("dive")) return true;
                        if (d.includes("sports") && pCat.includes("sports")) return true;
                        if (d.includes("nightclub") && pCat.includes("nightclub")) return true;
                        if (d.includes("rooftop") && (pCat.includes("rooftop") || pCat.includes("deck"))) return true;
                        if (d.includes("wine") && pCat.includes("wine")) return true;
                        if (d.includes("cocktail") && pCat.includes("cocktail")) return true;
                        if (d.includes("hotel") && pCat.includes("hotel")) return true;

                        return false;
                    });
                    if (isDisliked) return false;
                }

                // 2. Filter by Neighborhood (if any selected)
                if (onboardingData?.neighborhoods?.length) {
                    // Fuzzy match neighborhood
                    const isMatch = onboardingData.neighborhoods.some(n =>
                        p.neighborhood.toLowerCase().includes(n.toLowerCase()) ||
                        n.toLowerCase().includes(p.neighborhood.toLowerCase())
                    );
                    if (!isMatch) return false;
                }

                // 3. Fallback / Rating Quality
                return p.rating >= 4.0;
            }

            if (selectedAge === 'trending') return p.reviews && p.reviews.length > 0;

            // General Filter Logic
            // Checks age, intent, timeOfDay, category, crowd, neighborhood, and regular category string
            const search = selectedAge.replace(/-/g, ' ').toLowerCase();
            const tags = [
                ...(p.age || []),
                ...(p.intent || []),
                ...(p.timeOfDay || []),
                ...(p.crowd || []),
                ...(p.vibe || []),
                p.category,
                p.neighborhood
            ].map(t => t?.toLowerCase());

            // Match if any tag includes the search term, or if the search term includes the tag (fuzzy)
            // e.g. "cocktail" matches "Cocktail Bar"
            return tags.some(t => t?.includes(search) || search.includes(t || ''));
        });
    } else {
        cityPlaces = allPlaces;
    }

    // Category label lookup
    let categoryLabel = 'All Spots';

    if (selectedAge && selectedAge !== 'all') {
        // Flatten sections to find the category
        const allCats = FEATURED_SECTIONS.flatMap(s => s.categories);
        const cat = allCats.find(c => c.id === selectedAge);
        if (cat) {
            categoryLabel = cat.label;
        } else {
            // Fallback nicely
            categoryLabel = selectedAge.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
    }

    // Simple alphabetic sort or by rating
    cityPlaces.sort((a, b) => b.rating - a.rating);

    // MODE 1: Categories (Root View)
    if (!selectedAge) {
        return (
            <>
                <TopBar backHref={backHref} />
                <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
                    <header className="mb-6 text-center sm:text-left px-6 pt-8">
                        <h1 className="text-4xl font-serif leading-[1.1] mb-2">
                            All Featured Lists
                        </h1>
                    </header>

                    <div className="space-y-10 px-6 pb-12">
                        {FEATURED_SECTIONS.map((section, idx) => (
                            <section key={idx} className="space-y-4">
                                <h2 className="text-lg font-bold tracking-tight text-zinc-900 border-b border-zinc-100 pb-2">
                                    {section.title}
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {section.categories.map((cat) => (
                                        <Link key={cat.id} href={`/browse?age=${cat.id}`} className="block group">
                                            <div className="relative h-32 w-full rounded-xl overflow-hidden border border-black/5 shadow-sm">
                                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                    style={{ backgroundImage: `url(${cat.image})` }}
                                                >
                                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                                                </div>
                                                <div className="absolute inset-0 flex flex-col justify-end p-3">
                                                    <h3 className="text-white font-bold text-sm leading-tight shadow-black/50 drop-shadow-sm">
                                                        {cat.label}
                                                    </h3>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </main>
                <BottomNav />
            </>
        );
    }

    // MODE 2: Grid View (Filtered)
    return (
        <>
            <TopBar backHref={backHref} />
            <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
                <header className="mb-6 relative flex flex-col sm:flex-row sm:items-end sm:justify-between items-center text-center sm:text-left gap-4 px-6 pt-8">
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-3xl font-serif leading-tight">
                            {categoryLabel}
                        </h1>
                        <p className="text-zinc-500 text-[10px] font-mono mt-1 uppercase tracking-[0.2em]">
                            {cityPlaces.length} Results
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 px-1">
                    {cityPlaces.map((place) => (
                        <Link key={place.id} href={`/places/${place.id}`}>
                            <div className="aspect-[3/4] bg-zinc-900 relative group overflow-hidden rounded-md border border-white/5">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${place.image})` }}
                                />
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12">
                                    <p className="font-serif text-white text-sm font-medium leading-tight truncate">{place.name}</p>
                                    <p className="text-[10px] text-zinc-400 mt-0.5 truncate font-mono">{place.neighborhood} • {place.price}</p>
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
        <div className="flex justify-center min-h-screen bg-background w-full">
            <MobileContainer>
                <Suspense fallback={<div className="p-10 text-center text-zinc-500 font-mono animate-pulse uppercase tracking-widest">Loading scene...</div>}>
                    <BrowseContent />
                </Suspense>
                <BottomNav />
            </MobileContainer>
        </div>
    );
}
