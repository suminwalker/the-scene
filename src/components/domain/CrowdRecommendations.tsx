"use client";

import Link from "next/link";
import { WHO_TAGS } from "@/lib/taxonomy";
import { ArrowRight, Users } from "lucide-react";

export function CrowdRecommendations() {
    // Show all WHO tags as recommendations
    const displayTags = WHO_TAGS;

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between px-6">
                <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                    See Where Your Type Likely Goes Out
                </h2>
            </div>

            <div className="flex overflow-x-auto gap-3 px-6 pb-4 scrollbar-hide snap-x snap-mandatory">
                {displayTags.map((tag) => (
                    <Link
                        key={tag}
                        href={`/browse?crowd=${encodeURIComponent(tag)}`}
                        className="flex-none snap-center group"
                    >
                        <div className="flex items-center gap-3 px-5 py-3 bg-white border border-zinc-200 rounded-full shadow-sm group-hover:border-black group-hover:shadow-md transition-all">
                            <div className="p-1.5 bg-zinc-50 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                                <Users className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm whitespace-nowrap">
                                {tag}
                            </span>
                            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-black transition-colors -ml-1" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
