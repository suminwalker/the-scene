"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function ReviewForm() {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Trust & Safety: Basic Client-Side Filtering
    // In a real app, this would be server-side AI.
    const BLOCKED_TERMS = ["hate", "stupid", "ugly", "fat", "race", "religion", "jew", "black", "white", "asian", "latino"];
    // Note: This is an extremely simplified example of "Hard Enforcement" for the prototype.

    const handleSubmit = () => {
        // 1. Check for blocked terms
        const lowerText = reviewText.toLowerCase();
        const foundBlock = BLOCKED_TERMS.find(term => lowerText.includes(term));

        if (foundBlock) {
            setError(`We can't post that. Please remove references to protected groups or targeting language.`);
            return;
        }

        // 2. Check for length/emptiness
        if (reviewText.length < 5) {
            setError("Please add a bit more detail about the vibe.");
            return;
        }

        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                <p className="text-green-700 dark:text-green-300 font-medium">Thanks for the vibe check!</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">Your review is anonymous and helps the community.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <h3 className="text-sm font-bold uppercase tracking-wide mb-4 text-zinc-500">Leave a Vibe Check</h3>

            <div className="flex gap-1 mb-4">
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

            <textarea
                className="w-full h-24 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none mb-2"
                placeholder="What’s the vibe like tonight? (e.g., Chill, Busy, Creative)"
                value={reviewText}
                onChange={(e) => {
                    setReviewText(e.target.value);
                    setError(null);
                }}
            />

            {/* Trust & Safety Nudge */}
            <p className="text-[10px] text-zinc-400 mb-4 px-1">
                Keep it to the vibe, not specific people. No targeting or harassment allowed.
            </p>

            {error && (
                <p className="text-xs text-red-500 mb-3 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {error}
                </p>
            )}

            <button
                onClick={handleSubmit}
                className="w-full py-3 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!rating}
            >
                Post Review
            </button>
        </div>
    );
}
