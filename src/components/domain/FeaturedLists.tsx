"use client";

import Link from "next/link";
import { PLACES } from "@/lib/data";
import { useCity } from "@/lib/city-context";
import { FEATURED_SECTIONS } from "@/lib/featured-lists";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

// Mapping from signup preference names to list IDs
const PREFERENCE_TO_LIST_ID: Record<string, string> = {
    "Date Night": "date-night",
    "Group Hangouts": "group-hangouts",
    "Casual Catch-Up": "casual",
    "Big Night Out": "big-night-out",
    "Daytime": "daytime",
    "Happy Hour": "happy-hour",
    "Late Night": "late-night",
    "Bars": "bar",
    "Rooftops": "rooftop",
    "Cocktail Bars": "cocktail",
    "Wine Bars": "wine",
    "Hidden Gems": "hidden-gems",
    "Work From Bar": "work-from-bar"
};

// Default lists to show if user has no preferences
const DEFAULT_LIST_IDS = ["recommended-match", "trending", "date-night", "hidden-gems", "happy-hour"];

export function FeaturedLists() {
    const { city } = useCity();
    const supabase = createClient();
    const [userPreferences, setUserPreferences] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchPreferences() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('dislikes')
                        .eq('id', user.id)
                        .single();

                    if (profile?.dislikes) {
                        setUserPreferences(profile.dislikes);
                    }
                }
            } catch (error) {
                console.error("Error fetching user preferences:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPreferences();
    }, []);

    // Convert user preferences to list IDs
    const preferredListIds = userPreferences
        .map(pref => PREFERENCE_TO_LIST_ID[pref])
        .filter(Boolean);

    // Add recommended/trending to the beginning if not already there
    const prioritizedListIds = [
        "recommended-match",
        "trending",
        ...preferredListIds.filter(id => id !== "recommended-match" && id !== "trending")
    ];

    // Use user preferences if available, otherwise use defaults
    const listIdsToShow = preferredListIds.length > 0
        ? prioritizedListIds.slice(0, 5)
        : DEFAULT_LIST_IDS;

    const LISTS = FEATURED_SECTIONS
        .flatMap(section => section.categories)
        .filter(cat => listIdsToShow.includes(cat.id))
        .map(cat => ({
            id: cat.id,
            title: cat.label,
            image: cat.image
        }))
        // Sort by the order in listIdsToShow
        .sort((a, b) => listIdsToShow.indexOf(a.id) - listIdsToShow.indexOf(b.id));

    if (isLoading) {
        return (
            <section className="space-y-4 px-4">
                <div className="flex justify-between items-end">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500">Featured Lists</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex-none w-48 aspect-[4/5] rounded-lg bg-zinc-100 animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-4 px-4">
            <div className="flex justify-between items-end">
                <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500">Featured Lists</h3>
                <Link href="/browse" className="text-[10px] uppercase tracking-wide text-accent font-mono hover:underline">See all</Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {LISTS.map((list) => {
                    // Simplified counting logic for the cards (just count matching tags)
                    const totalCount = PLACES.filter(p => {
                        if (p.city !== city) return false;
                        if (list.id === 'recommended-match') return p.rating >= 4.5;
                        if (list.id === 'trending') return p.reviews && p.reviews.length > 0;

                        const search = list.id.replace(/-/g, ' ').toLowerCase();
                        const tags = [
                            ...(p.age || []),
                            ...(p.intent || []),
                            ...(p.timeOfDay || []),
                            ...(p.crowd || []),
                            ...(p.vibe || []),
                            p.category,
                            p.neighborhood
                        ].map(t => t?.toLowerCase());

                        return tags.some(t => t?.includes(search) || search.includes(t || ''));
                    }).length;

                    return (
                        <Link
                            key={list.id}
                            href={`/browse?age=${list.id}`}
                            className="flex-none w-48 relative aspect-[4/5] rounded-lg overflow-hidden group border border-white/5 active:scale-95 transition-all"
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${list.image})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                            <div className="absolute inset-x-0 bottom-0 p-4 space-y-1">
                                <h4 className="text-sm font-serif text-white leading-tight">{list.title}</h4>
                                <p className="text-[10px] text-zinc-400 font-mono italic">You&apos;ve been to 0 of {totalCount}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
