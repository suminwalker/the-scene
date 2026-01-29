"use client";

import { useState } from "react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { } from "lucide-react"; import { cn } from "@/lib/utils";

const FILTERS = {
    crowd: [
        "Young Professional", "Intellectual", "Creative", "Edgy", "International"
    ],
    vibe: [
        "Low-key", "High-Energy", "Classy", "Cozy",
        "Loud", "Divey-Cool"
    ],
    intent: [
        "Group Fun", "Meet New People", "Dancing"
    ],
    age: [
        "20s", "30s", "40s"
    ]
};


export default function SearchPage() {
    // We assume layout wraps this in FilterProvider, if not we need to add it to layout
    // For now we just use local state to demonstrate UI, but ideally we sync with context
    // Let's implement the localized version first that pushes params or context

    // TEMPORARY: Just local state specific to this page reset
    const [selected, setSelected] = useState<Record<string, string[]>>({
        crowd: [],
        vibe: [],
        intent: [],
        age: []
    });


    const toggleFilter = (category: string, value: string) => {
        setSelected(prev => {
            const current = prev[category];
            const isSelected = current.includes(value);
            return {
                ...prev,
                [category]: isSelected
                    ? current.filter(item => item !== value)
                    : [...current, value]
            };
        });
    };

    return (
        <div className="flex justify-center min-h-screen bg-zinc-100 dark:bg-black">
            <MobileContainer>
                <div className="flex-1 overflow-y-auto pb-40 px-6 pt-12">
                    <header className="mb-8">
                        <h1 className="text-3xl font-serif leading-tight mb-2">
                            Curate the <br /> night.
                        </h1>
                        <p className="text-zinc-500">Select what defines your scene tonight.</p>
                    </header>

                    <div className="space-y-10">
                        {Object.entries(FILTERS).map(([category, options]) => (
                            <section key={category} className="space-y-3">
                                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                                    {category}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {options.map((option) => {
                                        const isSelected = selected[category].includes(option);
                                        return (
                                            <button
                                                key={option}
                                                onClick={() => toggleFilter(category, option)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                                                    isSelected
                                                        ? "bg-foreground text-background border-foreground"
                                                        : "bg-transparent text-zinc-600 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                                                )}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                {/* Floating Action Button */}
                <div className="absolute bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
                    <button
                        onClick={() => {
                            // TODO: Save to context
                            // router.push('/discover')
                        }}
                        className="w-full bg-primary text-white h-14 rounded-full font-medium text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                        Show Results
                    </button>
                </div>

                <BottomNav />
            </MobileContainer>
        </div>
    );
}
