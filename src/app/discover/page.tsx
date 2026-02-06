"use client";

import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SearchHeader } from "@/components/layout/SearchHeader";
import { FeaturedLists } from "@/components/domain/FeaturedLists";
import { SocialFeed } from "@/components/domain/SocialFeed";
import { Suspense, useState } from "react";

function DiscoverContent() {
    const [activeFilter, setActiveFilter] = useState("new");

    return (
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
            <div className="space-y-10">
                <SearchHeader />

                {/* Only show featured lists on trending for cleaner UI or keep always? 
                    User requested features, usually lists are part of discovery. */}
                <FeaturedLists />
                <SocialFeed
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
            </div>
        </main>
    );
}

export default function DiscoverPage() {
    return (
        <ResponsiveContainer>
            <TopBar />
            <Suspense fallback={<div className="p-10 text-center text-zinc-500 font-mono animate-pulse">Loading scene...</div>}>
                <DiscoverContent />
            </Suspense>
            <BottomNav />
        </ResponsiveContainer>
    );
}
