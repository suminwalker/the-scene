import { useRef, useState, useEffect } from "react";
import { SortDesc, TrendingUp, Users, Check, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityFeedItem } from "./ActivityFeedItem";
import { UserSearch } from "./UserSearch";
import { supabase } from "@/lib/supabase";

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
    venueImage?: string;
    timestamp: string;
    rawTimestamp: number;
    category?: string;
    location?: string;
    score?: number;
    likes?: number; // Not yet implemented in DB
    comments?: number; // Not yet implemented in DB
    bookmarks?: number; // Not yet implemented in DB
    price?: string;
    tags: string[];
}

interface SocialFeedProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export function SocialFeed({ activeFilter, onFilterChange }: SocialFeedProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
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

    // Fetch Real Activities & Recommendations
    useEffect(() => {
        async function fetchContent() {
            setLoading(true);
            try {
                // 1. Get User Profile for Personalization
                const { data: { session } } = await supabase.auth.getSession();
                let userPrefs = null;

                if (session) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('age_bracket, dislikes, not_familiar, neighborhoods')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        userPrefs = profile;
                    }
                }

                // 2. Fetch Activities (Standard Feed)
                let query = supabase
                    .from('activities')
                    .select(`
                        *,
                        profiles:user_id (
                            id,
                            name,
                            handle,
                            avatar_url
                        )
                    `)
                    .order('created_at', { ascending: false })
                    .limit(20);

                const { data: activityData, error } = await query;

                let mappedActivities: Activity[] = [];

                if (activityData) {
                    mappedActivities = activityData.map((item: any) => {
                        const profile = item.profiles || {};
                        const date = new Date(item.created_at);
                        const timeString = getTimeString(date);

                        return {
                            id: item.id,
                            user: {
                                id: profile.id || "unknown",
                                name: profile.name || "Anonymous",
                                avatar: profile.avatar_url || "https://i.pravatar.cc/150",
                                badge: "Member"
                            },
                            action: mapActionType(item.action_type),
                            venue: item.venue_name,
                            venueId: item.venue_id,
                            venueImage: item.venue_image,
                            timestamp: timeString,
                            rawTimestamp: date.getTime(),
                            category: item.venue_category,
                            location: item.venue_location,
                            score: item.rating || undefined,
                            tags: ["trending"]
                        };
                    });
                }

                // 3. Inject Recommendations if "Not Familiar" OR Feed is Empty
                // We treat recommendations as "System Activities" to blend them into the feed
                if (userPrefs?.not_familiar || mappedActivities.length === 0) {
                    // Import dynamically to avoid SSR issues if any, though filter-utils is pure JS
                    const { getRecommendedPlaces } = await import("@/lib/filter-utils");

                    // Default city 'nyc' for now, could get from context if passed prop
                    const recs = getRecommendedPlaces("nyc", {
                        ageBracket: userPrefs?.age_bracket || "25-29", // Default fallback
                        dislikes: userPrefs?.dislikes || [],
                        neighborhoods: []
                    });

                    // Take top 5 recs
                    const topRecs = recs.slice(0, 5).map(place => ({
                        id: `rec-${place.id}`,
                        user: {
                            id: "system",
                            name: "The Scene",
                            avatar: "/icon.png", // Or a system logo
                            badge: "Curator"
                        },
                        action: "recommends",
                        venue: place.name,
                        venueId: place.id,
                        venueImage: place.image,
                        timestamp: "Just for you",
                        rawTimestamp: Date.now(),
                        category: place.category,
                        location: place.neighborhood,
                        score: place.rating,
                        tags: ["recommended", ...(place.age || [])]
                    }));

                    // Interleave or append?
                    // If not familiar, prioritize recs. 
                    if (userPrefs?.not_familiar) {
                        mappedActivities = [...topRecs, ...mappedActivities];
                    } else if (mappedActivities.length === 0) {
                        mappedActivities = topRecs;
                    }
                }

                setActivities(mappedActivities);

            } catch (err) {
                console.error("Unexpected error fetching feed:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchContent();
    }, [activeFilter]);

    // Helper: Map DB action types to UI strings
    const mapActionType = (type: string) => {
        switch (type) {
            case 'check_in': return 'just visited';
            case 'rate': return 'rated';
            case 'review': return 'reviewed';
            case 'list_add': return 'added to list';
            default: return 'visited';
        }
    };

    // Helper: Time formatting
    const getTimeString = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

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

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
                </div>
            ) : (
                <>
                    {activeFilter === "following" && activities.length < 3 && (
                        <div className="mb-10 p-6 rounded-2xl bg-zinc-50 border border-black/5">
                            <UserSearch />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activities.map((activity) => (
                            <ActivityFeedItem key={activity.id} {...activity} />
                        ))}
                    </div>

                    {activities.length === 0 && (
                        <div className="py-20 text-center space-y-4 col-span-full">
                            <p className="text-zinc-500 font-serif italic">Nothing to see here yet.</p>
                            <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">Be the first to check in somewhere!</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
