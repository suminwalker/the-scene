"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { WHO_TAGS, AESTHETIC_TAGS } from "@/lib/taxonomy";

interface FilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    // New State Props
    selectedWho: string[];
    onWhoChange: (tags: string[]) => void;
    selectedAesthetic: string[];
    onAestheticChange: (tags: string[]) => void;
}

export function FilterSheet({
    isOpen,
    onClose,
    selectedWho,
    onWhoChange,
    selectedAesthetic,
    onAestheticChange
}: FilterSheetProps) {
    if (!isOpen) return null;

    const toggleTag = (tag: string, current: string[], setter: (t: string[]) => void) => {
        if (current.includes(tag)) {
            setter(current.filter(t => t !== tag));
        } else {
            setter([...current, tag]);
        }
    };

    const clearAll = () => {
        onWhoChange([]);
        onAestheticChange([]);
    };

    const activeCount = selectedWho.length + selectedAesthetic.length;

    return (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 pointer-events-auto"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-md h-full bg-white text-black pointer-events-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
                    <h2 className="text-xl font-serif font-medium tracking-tight">
                        Filter Scene
                    </h2>
                    <button onClick={onClose} className="p-2 -mr-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">

                    {/* Who You'll Run Into */}
                    <section>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">
                            Who You'll Run Into
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {WHO_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag, selectedWho, onWhoChange)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                                        selectedWho.includes(tag)
                                            ? "bg-black text-white border-black shadow-sm"
                                            : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
                                    )}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Aesthetic */}
                    <section>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">
                            Aesthetic
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {AESTHETIC_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag, selectedAesthetic, onAestheticChange)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                                        selectedAesthetic.includes(tag)
                                            ? "bg-black text-white border-black shadow-sm"
                                            : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
                                    )}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
                    <div className="flex gap-3">
                        <button
                            onClick={clearAll}
                            className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                            disabled={activeCount === 0}
                        >
                            Clear
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg"
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
