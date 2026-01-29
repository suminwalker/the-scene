"use client";

import Link from "next/link";
import { PLACES } from "@/lib/data";
import { useCity } from "@/lib/city-context";

const LISTS = [
    {
        id: "bars-20s",
        title: "Best Bars for 20s",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: "bars-30s",
        title: "Best Bars for 30s",
        image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: "rooftops-20s",
        title: "Best Rooftops for 20s",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: "rooftops-30s",
        title: "Best Rooftops for 30s",
        image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1000&auto=format&fit=crop",
    }
];

export function FeaturedLists() {
    const { city } = useCity();

    return (
        <section className="space-y-4 px-4">
            <div className="flex justify-between items-end">
                <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500">Featured Lists</h3>
                <Link href="/browse" className="text-[10px] uppercase tracking-wide text-accent font-mono hover:underline">See all</Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {LISTS.map((list) => {
                    const totalCount = PLACES.filter(p =>
                        p.city === city &&
                        p.age &&
                        p.age.includes(list.id)
                    ).length;

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
