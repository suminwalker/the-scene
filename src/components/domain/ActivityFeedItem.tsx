"use client";

import { Heart, MessageCircle, Send, Plus, Bookmark } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ActionDrawer } from "../ui/ActionDrawer";

interface ActivityFeedItemProps {
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
    category?: string;
    location?: string; // This is usually neighborhood
    score?: number;
    likes?: number;
    comments?: number;
    bookmarks?: number;
    price?: string;
}

export function ActivityFeedItem({
    user,
    action,
    venue,
    venueId: passedVenueId,
    venueImage,
    timestamp,
    category = "Restaurant",
    location,
    score,
    likes = 0,
    comments = 0,
    bookmarks = 0,
    price = "$$",
}: ActivityFeedItemProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<"rank" | "bookmark">("rank");

    const openDrawer = (mode: "rank" | "bookmark") => {
        setDrawerMode(mode);
        setDrawerOpen(true);
    };

    // Use passed ID or generate simple slug for demo
    const venueId = passedVenueId || venue.toLowerCase().replace(/ /g, "-").replace(/'/g, "");

    return (
        <div className="py-6 border-b border-black/5 space-y-4 md:border md:rounded-xl md:p-6 md:shadow-sm md:hover:shadow-md transition-all md:bg-white md:h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="flex gap-3">
                    <Link
                        href={`/profile/${user.id}`}
                        className="w-10 h-10 rounded-full bg-zinc-100 bg-cover bg-center border border-black/5 shrink-0"
                        style={{ backgroundImage: `url(${user.avatar})` }}
                    />
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-medium leading-tight">
                            <Link href={`/profile/${user.id}`} className="text-foreground hover:text-accent transition-colors font-bold">{user.name}</Link>
                            {user.badge && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 ml-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${user.badge === "Taste Maker"
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                    }`}>
                                    {user.badge}
                                </span>
                            )}
                            {" "}
                            <span className={action === "rated" ? "text-foreground font-medium" : "text-zinc-500"}>{action}</span>
                            {" "}
                            <Link href={`/places/${venueId}`} className="text-foreground font-bold hover:text-accent transition-colors">{venue}</Link>
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono italic">
                            {category && <span>{category} • {location}</span>}
                            {!category && <span>{timestamp}</span>}
                        </div>
                    </div>
                </div>
                {score && (
                    <div className="w-10 h-10 rounded-full border-2 border-accent/20 flex items-center justify-center text-accent font-black text-sm bg-accent/5 shrink-0">
                        {score.toFixed(1)}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-6">
                    <button className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors group">
                        <Heart className="w-5 h-5 group-active:scale-125 transition-transform" />
                        <span className="text-xs">{likes > 0 ? likes : ""}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-400 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs">{comments > 0 ? comments : ""}</span>
                    </button>
                    <button className="flex items-center text-zinc-500 hover:text-foreground transition-colors">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openDrawer("rank")}
                        className="p-1 rounded-full border border-black/10 text-zinc-400 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => openDrawer("bookmark")}
                        className="p-1 rounded-full border border-black/10 text-zinc-400 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
                    >
                        <Bookmark className="w-5 h-5" />
                        <span className="sr-only">{bookmarks} bookmarks</span>
                    </button>
                </div>
            </div>

            {category && (
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">{timestamp}</p>
            )}

            <ActionDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                mode={drawerMode}
                venue={{
                    id: venueId,
                    name: venue,
                    price: price,
                    category: category,
                    image: venueImage,
                    neighborhood: location
                }}
            />
        </div>
    );
}

