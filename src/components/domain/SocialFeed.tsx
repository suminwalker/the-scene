"use client";

import { ActivityFeedItem } from "./ActivityFeedItem";
import { UserSearch } from "./UserSearch";
import { useState, useEffect } from "react";
import { Place } from "@/lib/data";

interface Activity {
    id: string;
    user: {
        id: string;
        avatar: string;
        name: string;
    };
    action: string;
    venue: string;
    venueId?: string;
    timestamp: string;
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
}

export function SocialFeed({ activeFilter }: SocialFeedProps) {
    const [localAddedPlaces, setLocalAddedPlaces] = useState<Place[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('the_scene_user_venues');
        if (saved) {
            try {
                setLocalAddedPlaces(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load user venues for feed", e);
            }
        }
    }, []);

    const userActivities: Activity[] = localAddedPlaces.map((place, idx) => ({
        id: `user-add-${place.id}`,
        user: {
            id: "suminwalker",
            name: "Sumin Walker",
            avatar: "https://i.pravatar.cc/150?u=sumin"
        },
        action: "just discovered",
        venue: place.name,
        venueId: place.id,
        timestamp: "Just now",
        category: place.category,
        location: place.neighborhood,
        tags: ["following", "trending"]
    }));

    const combinedActivity = [...userActivities];

    const filteredActivity = combinedActivity.filter(item =>
        activeFilter === "trending" ? item.tags.includes("trending") :
            activeFilter === "nearby" ? item.tags.includes("nearby") :
                activeFilter === "following" ? item.tags.includes("following") :
                    true
    );

    return (
        <div className="px-4 pb-12">
            <div className="flex justify-between items-end mb-6">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">Your Feed</h3>
                <button className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono hover:text-white transition-colors">Sort by New</button>
            </div>

            {activeFilter === "following" && filteredActivity.length < 3 && (
                <div className="mb-10 p-6 rounded-2xl bg-accent/5 border border-accent/10">
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
