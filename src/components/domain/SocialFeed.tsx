import { useRef, useState, useEffect } from "react";
import { SortDesc, TrendingUp, Users, Check, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Place } from "@/lib/data";
import { ActivityFeedItem } from "./ActivityFeedItem";
import { UserSearch } from "./UserSearch";


interface Activity {
    id: string;
    user: {
        id: string;
        avatar: string;
        name: string;
        badge?: string;
    };
    action: string;
    venue: string;
    venueId?: string;
    timestamp: string;
    rawTimestamp: number; // Added for sorting
    category?: string;
    location?: string;
    score?: number;
    likes?: number;
    comments?: number;
    bookmarks?: number;
    price?: string;
    tags: string[];
}

interface SocialFeedProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export function SocialFeed({ activeFilter, onFilterChange }: SocialFeedProps) {
    const [localAddedPlaces, setLocalAddedPlaces] = useState<Place[]>([]);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [onboardingData, setOnboardingData] = useState<{
        ageBracket: string | null;
        neighborhoods: string[];
        notFamiliar?: boolean;
        dislikes: string[];
    } | null>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);


    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('the_scene_user_venues');
        if (saved) {
            try {
                setLocalAddedPlaces(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load user venues for feed", e);
            }
        }

        const onboarding = localStorage.getItem("the_scene_onboarding_data");
        if (onboarding) {
            try {
                setOnboardingData(JSON.parse(onboarding));
            } catch (e) {
                console.error("Failed to parse onboarding data", e);
            }
        }
    }, []);

    const userActivities: Activity[] = localAddedPlaces.map((place, idx) => ({
        id: `user-add-${place.id}`,
        user: {
            id: "suminwalker",
            name: "Sumin Walker",
            avatar: "https://i.pravatar.cc/150?u=sumin",
            badge: "Member"
        },
        action: "just discovered",
        venue: place.name,
        venueId: place.id,
        timestamp: "Just now",
        rawTimestamp: Date.now() - (idx * 1000), // Recent, slightly staggered
        category: place.category,
        location: place.neighborhood,
        tags: ["following", "trending"]
    }));

    // Mock Rated Visits for Trending Algorithm Visualization
    const mockRatedVisits: Activity[] = [
        {
            id: "mock-rated-1",
            user: {
                id: "alex-chen",
                name: "Alex Chen",
                avatar: "https://i.pravatar.cc/150?u=alex",
                badge: "Taste Maker"
            },
            action: "rated",
            venue: "The Nines",
            venueId: "the-nines",
            timestamp: "2h ago",
            rawTimestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
            category: "Lounge",
            location: "NoHo",
            score: 9.2,
            tags: ["following", "trending"]
        },
        {
            id: "mock-rated-2",
            user: {
                id: "sarah-j",
                name: "Sarah Jenkins",
                avatar: "https://i.pravatar.cc/150?u=sarah",
                badge: "Curator"
            },
            action: "rated",
            venue: "Fanelli Cafe",
            venueId: "fanelli-cafe",
            timestamp: "4h ago",
            rawTimestamp: Date.now() - (4 * 60 * 60 * 1000), // 4 hours ago
            category: "Dive Bar",
            location: "SoHo",
            score: 8.5,
            tags: ["following"]
        }
    ];

    const combinedActivity = [...mockRatedVisits, ...userActivities];

    const filteredActivity = combinedActivity
        .filter(item =>
            activeFilter === "trending" ? item.tags.includes("trending") :
                activeFilter === "nearby" ? item.tags.includes("nearby") :
                    activeFilter === "following" ? item.tags.includes("following") :
                        true
        )
        .filter(item => {
            // Curation Logic: Exclude dislikes
            if (onboardingData?.dislikes && onboardingData.dislikes.length > 0) {
                if (item.category) {
                    // Check if category partially matches any dislike (e.g. "Dive Bar" matches "Bars")
                    // Actually the dislikes are specific strings like "Dive Bars", "Cocktail Bars".
                    // The categories in data are like "Dive-ish Bar", "Lounge".
                    // Let's do a loose check.
                    const category = item.category.toLowerCase();
                    const isDisliked = onboardingData.dislikes.some(dislike => {
                        const d = dislike.toLowerCase().replace(/s$/, ""); // Remove plural 's'
                        return category.includes(d);
                    });
                    if (isDisliked) return false;
                }
            }
            return true;
        })
        .sort((a, b) => b.rawTimestamp - a.rawTimestamp); // Sort by new

    return (
        <div className="px-4 pb-12">
            <div className="flex justify-between items-end mb-6">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">Your Feed</h3>

                <div className="relative" ref={filterRef}>
                    <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-900 font-bold font-mono hover:text-black transition-colors"
                    >
                        {activeFilter === "trending" && <TrendingUp className="w-3 h-3" />}
                        {activeFilter === "following" && <Users className="w-3 h-3" />}
                        {activeFilter !== "trending" && activeFilter !== "following" && <Filter className="w-3 h-3" />}

                        {activeFilter === "trending" ? "Trending" : activeFilter === "following" ? "Following" : "Sort by New"}
                    </button>

                    {showFilterMenu && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-black/5 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-1">
                                <button
                                    onClick={() => {
                                        onFilterChange("new");
                                        setShowFilterMenu(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-left hover:bg-zinc-50 rounded-lg transition-colors"
                                >
                                    <span>Sort by New</span>
                                    {(activeFilter === "new" || activeFilter === "all") && <Check className="w-3 h-3 text-accent" />}
                                </button>
                                <button
                                    onClick={() => {
                                        onFilterChange("trending");
                                        setShowFilterMenu(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-left hover:bg-zinc-50 rounded-lg transition-colors"
                                >
                                    <span>Trending</span>
                                    {activeFilter === "trending" && <Check className="w-3 h-3 text-accent" />}
                                </button>
                                <button
                                    onClick={() => {
                                        onFilterChange("following");
                                        setShowFilterMenu(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-left hover:bg-zinc-50 rounded-lg transition-colors"
                                >
                                    <span>Following</span>
                                    {activeFilter === "following" && <Check className="w-3 h-3 text-accent" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {activeFilter === "following" && filteredActivity.length < 3 && (
                <div className="mb-10 p-6 rounded-2xl bg-zinc-50 border border-black/5">
                    <UserSearch />
                </div>
            )}

            <div className="divide-y divide-white/5">
                {filteredActivity.map((activity) => (
                    <ActivityFeedItem key={activity.id} {...activity} />
                ))}
                {filteredActivity.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <p className="text-zinc-500 font-serif italic">Nothing to see here yet.</p>
                        <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">Try another filter</p>
                    </div>
                )}
            </div>
        </div>
    );
}
