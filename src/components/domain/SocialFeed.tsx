import { useRef, useState, useEffect, useCallback } from "react";
import { TrendingUp, Users, Check, Filter, Loader2 } from "lucide-react";
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
    likes?: number;
    comments?: number;
    bookmarks?: number;
    price?: string;
    tags: string[];
    createdAt: string; // ISO string for cursor pagination
}

interface SocialFeedProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

const PAGE_SIZE = 20;

export function SocialFeed({ activeFilter, onFilterChange }: SocialFeedProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [followingIds, setFollowingIds] = useState<string[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    // Close filter menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper: Map activity rows to UI shape
    const mapActivity = useCallback((item: any): Activity => {
        const profile = item.profiles || {};
        const date = new Date(item.created_at);
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
            timestamp: getTimeString(date),
            rawTimestamp: date.getTime(),
            category: item.venue_category,
            location: item.venue_location,
            score: item.rating || undefined,
            tags: ["trending"],
            createdAt: item.created_at
        };
    }, []);

    // Fetch initial feed
    const fetchContent = useCallback(async (filter: string) => {
        setLoading(true);
        setError(null);
        setHasMore(true);

        try {
            // 1. Get session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setActivities([]);
                setLoading(false);
                return;
            }

            const userId = session.user.id;
            setCurrentUserId(userId);

            // 2. Fetch following list
            const { data: followsData } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', userId);

            const fIds = followsData?.map(f => f.following_id) || [];
            setFollowingIds(fIds);

            // 3. Build scoped query based on filter
            const feedUserIds = [userId, ...fIds];

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
                `);

            if (filter === "trending") {
                // Trending = GLOBAL discovery (all users)
                query = query
                    .order('rating', { ascending: false, nullsFirst: false })
                    .order('created_at', { ascending: false });
            } else {
                // "new" (default) = scoped to followed + self
                query = query
                    .in('user_id', feedUserIds)
                    .order('created_at', { ascending: false });
            }

            query = query.limit(PAGE_SIZE);

            const { data: activityData, error: fetchError } = await query;

            if (fetchError) {
                throw fetchError;
            }

            const mapped = (activityData || []).map(mapActivity);
            setActivities(mapped);
            setHasMore(mapped.length >= PAGE_SIZE);

        } catch (err) {
            console.error("Error fetching feed:", err);
            setError("Couldn't load your feed. Tap to retry.");
        } finally {
            setLoading(false);
        }
    }, [mapActivity]);

    // Load more (cursor pagination)
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || activities.length === 0) return;
        setLoadingMore(true);

        try {
            const lastActivity = activities[activities.length - 1];
            const feedUserIds = currentUserId ? [currentUserId, ...followingIds] : [];

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
                `);

            if (activeFilter === "trending") {
                query = query
                    .order('rating', { ascending: false, nullsFirst: false })
                    .order('created_at', { ascending: false })
                    .lt('created_at', lastActivity.createdAt);
            } else {
                query = query
                    .in('user_id', feedUserIds)
                    .order('created_at', { ascending: false })
                    .lt('created_at', lastActivity.createdAt);
            }

            query = query.limit(PAGE_SIZE);

            const { data: moreData, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            const mapped = (moreData || []).map(mapActivity);
            setActivities(prev => [...prev, ...mapped]);
            setHasMore(mapped.length >= PAGE_SIZE);

        } catch (err) {
            console.error("Error loading more:", err);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, activities, currentUserId, followingIds, activeFilter, mapActivity]);

    // Refetch when filter changes
    useEffect(() => {
        fetchContent(activeFilter);
    }, [activeFilter, fetchContent]);

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

    // Skeleton loader
    const SkeletonCard = () => (
        <div className="bg-white border border-black/5 rounded-2xl p-5 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100" />
                <div className="space-y-2 flex-1">
                    <div className="h-3 bg-zinc-100 rounded w-2/3" />
                    <div className="h-2 bg-zinc-50 rounded w-1/3" />
                </div>
            </div>
            <div className="h-3 bg-zinc-100 rounded w-full" />
            <div className="h-3 bg-zinc-50 rounded w-3/4" />
        </div>
    );

    const isFollowingNobody = followingIds.length === 0 && !loading;
    const isDefaultFeed = activeFilter !== "trending";

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
                        {activeFilter !== "trending" && <Filter className="w-3 h-3" />}

                        {activeFilter === "trending" ? "Trending" : "Sort by New"}
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
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="py-16 text-center">
                    <button
                        onClick={() => fetchContent(activeFilter)}
                        className="space-y-2 group"
                    >
                        <p className="text-sm text-red-500 group-hover:text-red-600 transition-colors">{error}</p>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Tap to retry</p>
                    </button>
                </div>
            )}

            {/* Skeleton Loading */}
            {loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

            {/* Main Content */}
            {!loading && !error && (
                <>
                    {/* Cold Start: Following nobody on the scoped feed */}
                    {isFollowingNobody && isDefaultFeed && (
                        <div className="mb-8 p-6 rounded-2xl bg-zinc-50 border border-black/5 space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">Welcome to The Scene! 👋</p>
                                <p className="text-xs text-zinc-500">Follow people to see their activity here.</p>
                            </div>
                            <UserSearch />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activities.map((activity) => (
                            <ActivityFeedItem key={activity.id} {...activity} />
                        ))}
                    </div>

                    {/* Empty state (after cold-start prompt) */}
                    {activities.length === 0 && !isFollowingNobody && (
                        <div className="py-20 text-center space-y-4 col-span-full">
                            <p className="text-zinc-500 font-serif italic">Nothing to see here yet.</p>
                            <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">
                                {isDefaultFeed
                                    ? "Your friends haven't posted yet. Check back soon!"
                                    : "Be the first to check in somewhere!"}
                            </p>
                        </div>
                    )}

                    {/* Load More */}
                    {hasMore && activities.length > 0 && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-500 hover:text-black bg-white border border-black/5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                    "Load More"
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
