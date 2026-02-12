"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AESTHETIC_TAGS } from "@/lib/taxonomy";
import { supabase } from "@/lib/supabase";

interface ReviewFormProps {
    venueId?: string;
    venueName?: string;
    venueCity?: string;
}

export function ReviewForm({ venueId, venueName, venueCity }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Structured State
    const [selectedAesthetic, setSelectedAesthetic] = useState<string[]>([]);

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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        // 1. Check for blocked terms
        const lowerText = reviewText.toLowerCase();
        const foundBlock = BLOCKED_TERMS.find(term => lowerText.includes(term));

        if (foundBlock) {
            setError(`We can't post that. Please remove references to protected groups or targeting language.`);
            setIsSubmitting(false);
            return;
        }

        // 2. Check completeness
        if (reviewText.length < 5) {
            setError("Please add a bit more detail about your experience.");
            setIsSubmitting(false);
            return;
        }

        try {
            // 3. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError("You must be logged in to leave a review.");
                setIsSubmitting(false);
                return;
            }

            // 4. Use provided ID or fallback (removed venue lookup for now as we have denormalized data)
            // If we needed to lookup, we'd do it here, but we prefer passing ID.
            if (!venueId && !venueName) {
                throw new Error("Venue identity missing");
            }
            const targetVenueId = venueId || venueName?.toLowerCase().replace(/ /g, '-');

            // 5. Insert Review into 'activities'
            const { error: insertError } = await supabase.from('activities').insert({
                user_id: user.id,
                venue_id: targetVenueId,
                venue_name: venueName || "Unknown Venue",
                venue_location: venueCity, // mapping city to location roughly
                action_type: 'review',
                rating: rating,
                venue_category: "Review", // Fallback or passed prop? Ideally passed.
                content: (selectedAesthetic.length > 0 ? `[${selectedAesthetic.join(', ')}] ` : "") + reviewText
            });

            if (insertError) {
                console.error("Review submission failed:", insertError);
                setError("Something went wrong. Please try again.");
                setIsSubmitting(false);
                return;
            }

            setSubmitted(true);

        } catch (err) {
            console.error("Unexpected error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center border border-green-100 dark:border-green-900/30">
                <p className="text-green-700 dark:text-green-300 font-medium font-serif">Thanks for the review!</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-mono">Your insights help the community find their scene.</p>
                <p className="text-[10px] text-green-500/80 mt-4 uppercase tracking-widest">Reputation Points Added</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl space-y-6">
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-1 text-zinc-900">Leave a Review</h3>
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
                                : "text-zinc-300"
                                }`}
                        />
                    </button>
                ))}
            </div>





            {/* Aesthetic Selection */}
            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Aesthetic <span className="text-[10px] lowercase opacity-50">(Select up to 2)</span></label>
                </div>
                <div className="flex flex-wrap gap-2">
                    {AESTHETIC_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag, selectedAesthetic, setSelectedAesthetic, 2)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                                selectedAesthetic.includes(tag)
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
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
                    className="w-full h-24 p-3 rounded-lg border border-zinc-200 bg-white text-sm focus:ring-1 focus:ring-black outline-none resize-none placeholder:text-zinc-400"
                    placeholder="Tell us more about the experience..."
                    value={reviewText}
                    onChange={(e) => {
                        setReviewText(e.target.value);
                        setError(null);
                    }}
                />
            </div>

            {/* Trust & Safety Nudge */}
            <div className="bg-zinc-100 p-3 rounded-lg">
                <p className="text-[10px] text-zinc-500 text-center leading-tight">
                    Your review helps curate the scene. Please be honest, constructive, and respectful to the community.
                </p>
            </div>

            {error && (
                <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded border border-red-100">
                    {error}
                </p>
            )}

            <button
                onClick={handleSubmit}
                className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!rating}
            >
                Post Review
            </button>
        </div>
    );
}
