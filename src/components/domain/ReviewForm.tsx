"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Structured Taxonomies for Review
const VIBE_TAGS = ["Chill", "Buzzing", "Romantic", "Loud", "Intimate", "Trendy", "Cozy", "Party", "Business", "Divey"];
const CROWD_TAGS = ["The Industry", "Downtown Set", "Uptown Polish", "Art & Design", "Locals Only", "International", "After Work", "Date Night", "Groups"];
const ATTIRE_TAGS = ["Casual", "Smart Casual", "Dress to Impress", "Streetwear", "Business", "Formal"];

export function ReviewForm() {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [error, setError] = useState<string | null>(null);

    // New Structured State
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [selectedCrowd, setSelectedCrowd] = useState<string[]>([]);
    const [selectedAttire, setSelectedAttire] = useState<string[]>([]);

    const toggleTag = (tag: string, current: string[], setter: (val: string[]) => void, max: number) => {
        if (current.includes(tag)) {
            setter(current.filter(t => t !== tag));
        } else {
            if (current.length < max) {
                setter([...current, tag]);
            }
        }
    };

    const BLOCKED_TERMS = ["hate", "stupid", "ugly", "fat", "race", "religion", "jew", "black", "white", "asian", "latino"];

    const handleSubmit = () => {
        // 1. Check for blocked terms
        const lowerText = reviewText.toLowerCase();
        const foundBlock = BLOCKED_TERMS.find(term => lowerText.includes(term));

        if (foundBlock) {
            setError(`We can't post that. Please remove references to protected groups or targeting language.`);
            return;
        }

        // 2. Check completeness
        if (reviewText.length < 5) {
            setError("Please add a bit more detail about your experience.");
            return;
        }

        // Log the structured data for now (simulating API payload)
        console.log("Submitting Review:", {
            rating,
            text: reviewText,
            vibe: selectedVibes,
            crowd: selectedCrowd,
            attire: selectedAttire,
            timestamp: new Date().toISOString()
        });

        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center border border-green-100 dark:border-green-900/30">
                <p className="text-green-700 dark:text-green-300 font-medium font-serif">Thanks for the review!</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-mono">Your insights help the community find their scene.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-6">
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-1 text-zinc-900 dark:text-zinc-100">Leave a Review</h3>
                <p className="text-xs text-zinc-500 font-serif italic">Share the vibe, the crowd, and what to wear.</p>
            </div>

            {/* Rating */}
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-transform hover:scale-110"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                    >
                        <Star
                            className={`w-6 h-6 ${star <= (hoveredRating || rating)
                                ? "text-accent fill-accent"
                                : "text-zinc-300 dark:text-zinc-700"
                                }`}
                        />
                    </button>
                ))}
            </div>

            {/* Vibe Selection */}
            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">The Vibe <span className="text-[10px] lowercase opacity-50">(Select up to 3)</span></label>
                </div>
                <div className="flex flex-wrap gap-2">
                    {VIBE_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag, selectedVibes, setSelectedVibes, 3)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                                selectedVibes.includes(tag)
                                    ? "bg-black text-white border-black dark:bg-white dark:text-black"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Crowd Selection */}
            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">The Crowd <span className="text-[10px] lowercase opacity-50">(Select up to 3)</span></label>
                </div>
                <div className="flex flex-wrap gap-2">
                    {CROWD_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag, selectedCrowd, setSelectedCrowd, 3)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                                selectedCrowd.includes(tag)
                                    ? "bg-black text-white border-black dark:bg-white dark:text-black"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Attire Selection */}
            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Attire <span className="text-[10px] lowercase opacity-50">(Select up to 2)</span></label>
                </div>
                <div className="flex flex-wrap gap-2">
                    {ATTIRE_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag, selectedAttire, setSelectedAttire, 2)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                                selectedAttire.includes(tag)
                                    ? "bg-black text-white border-black dark:bg-white dark:text-black"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Text Review */}
            <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Details</label>
                <textarea
                    className="w-full h-24 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none resize-none placeholder:text-zinc-400"
                    placeholder="Tell us more about the experience..."
                    value={reviewText}
                    onChange={(e) => {
                        setReviewText(e.target.value);
                        setError(null);
                    }}
                />
            </div>

            {/* Trust & Safety Nudge */}
            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-lg">
                <p className="text-[10px] text-zinc-500 text-center leading-tight">
                    Your review helps curate the scene. Please be honest, constructive, and respectful to the community.
                </p>
            </div>

            {error && (
                <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">
                    {error}
                </p>
            )}

            <button
                onClick={handleSubmit}
                className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!rating}
            >
                Post Review
            </button>
        </div>
    );
}
