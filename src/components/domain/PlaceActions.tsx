"use client";

import { Share, Bookmark, Plus, Check } from "lucide-react";
import { useState } from "react";
import { Place } from "@/lib/data";
import { ActionDrawer } from "../ui/ActionDrawer";
import { cn } from "@/lib/utils";

interface PlaceActionsProps {
    place: Place;
}

export function PlaceActions({ place }: PlaceActionsProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<"rank" | "bookmark">("rank");

    const openDrawer = (mode: "rank" | "bookmark") => {
        setDrawerMode(mode);
        setDrawerOpen(true);
    };

    return (
        <>
            <div className="absolute top-4 right-4 flex gap-2 z-20">
                {/* Been Here Button (New) */}
                <button
                    onClick={() => openDrawer("rank")}
                    className="p-2 rounded-full bg-black/20 backdrop-blur text-white hover:bg-accent hover:text-white transition-all group"
                >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="sr-only">I've been here</span>
                </button>

                <button className="p-2 rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 transition-colors">
                    <Share className="w-5 h-5" />
                    <span className="sr-only">Share</span>
                </button>

                <button
                    onClick={() => openDrawer("bookmark")}
                    className="p-2 rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 transition-colors"
                >
                    <Bookmark className="w-5 h-5" />
                    <span className="sr-only">Save</span>
                </button>
            </div>

            <ActionDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                mode={drawerMode}
                venue={{
                    id: place.id,
                    name: place.name,
                    price: place.price,
                    category: place.category,
                    image: place.image,
                    neighborhood: place.neighborhood
                }}
            />
        </>
    );
}
