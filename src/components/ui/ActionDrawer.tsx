"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Hash, FileText, Lock, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface ActionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "rank" | "bookmark";
    venue: {
        id?: string;
        name: string;
        price: string;
        category: string;
        image?: string;
        neighborhood?: string;
    };
}

export function ActionDrawer({ isOpen, onClose, mode, venue }: ActionDrawerProps) {
    const [selectedList] = useState("Restaurants");
    const [rating, setRating] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRankSubmit = async () => {
        if (!rating || !venue.id) return;
        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("User not logged in");
                return;
            }

            // Map UI rating to database value
            let numericRating = 0;
            switch (rating) {
                case 'liked': numericRating = 5; break; // 5 stars
                case 'fine': numericRating = 3; break; // 3 stars
                case 'disliked': numericRating = 1; break; // 1 star
            }

            const { error } = await supabase.from('activities').insert({
                user_id: user.id,
                venue_id: venue.id,
                venue_name: venue.name,
                venue_image: venue.image || null,
                venue_location: venue.neighborhood || null,
                venue_category: venue.category,
                action_type: 'check_in',
                rating: numericRating,
                content: rating
            });

            if (error) throw error;

            onClose();
        } catch (error) {
            console.error("Error submitting rank:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBookmarkSubmit = async () => {
        if (!venue.id) return;
        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("User not logged in");
                return;
            }

            // Check if exists logic
            const { data: existing } = await supabase
                .from('saved_venues')
                .select('id')
                .eq('user_id', user.id)
                .eq('venue_id', venue.id)
                .eq('list_type', selectedList)
                .maybeSingle();

            if (existing) {
                // Delete
                const { error } = await supabase
                    .from('saved_venues')
                    .delete()
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('saved_venues')
                    .insert({
                        user_id: user.id,
                        venue_id: venue.id,
                        venue_name: venue.name,
                        venue_image: venue.image || null,
                        venue_location: venue.neighborhood || null,
                        venue_category: venue.category,
                        list_type: selectedList
                    });
                if (error) throw error;
            }

            onClose();
        } catch (error) {
            console.error("Error saving bookmark:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-900 border-t border-white/10 rounded-t-[32px] overflow-hidden max-w-[480px] mx-auto shadow-2xl"
                    >
                        {/* Pull Bar */}
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mt-3 mb-1" />

                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-white tracking-tight">{venue.name}</h3>
                                    <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                                        {venue.price} • {venue.category}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* List Selector */}
                            <div className="flex items-center justify-between py-4 border-y border-white/5">
                                <span className="text-sm font-medium text-zinc-300">Add to my list of</span>
                                <button className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 hover:border-accent/50 transition-all">
                                    <span className="text-accent">🍴 {selectedList}</span>
                                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                                </button>
                            </div>

                            {mode === "rank" ? (
                                /* RANK MODE */
                                <div className="space-y-6 pt-2 pb-8">
                                    <h4 className="text-center text-lg font-serif italic text-white/90">How was it?</h4>
                                    <div className="flex justify-around items-center pt-4">
                                        {[
                                            { id: "liked", label: "I liked it!", color: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30" },
                                            { id: "fine", label: "It was fine", color: "bg-amber-400/20 text-amber-400 border-amber-400/30" },
                                            { id: "disliked", label: "I didn't like it", color: "bg-rose-400/20 text-rose-400 border-rose-400/30" }
                                        ].map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setRating(option.id)}
                                                className="flex flex-col items-center gap-3 group"
                                            >
                                                <div className={cn(
                                                    "w-16 h-16 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                                                    rating === option.id
                                                        ? option.color
                                                        : "bg-zinc-800 border-white/10 group-hover:border-white/20"
                                                )}>
                                                    {rating === option.id && <Check className="w-8 h-8" />}
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-medium tracking-wide uppercase",
                                                    rating === option.id ? "text-white" : "text-zinc-500"
                                                )}>
                                                    {option.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleRankSubmit}
                                        disabled={!rating || isSubmitting}
                                        className={cn(
                                            "w-full py-4 rounded-2xl font-bold transition-all mt-8",
                                            rating
                                                ? "bg-accent text-white shadow-lg shadow-accent/20"
                                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
                                            isSubmitting && "opacity-50 cursor-wait"
                                        )}
                                    >
                                        {isSubmitting ? "Saving..." : "Finish Ranking"}
                                    </button>
                                </div>
                            ) : (
                                /* BOOKMARK MODE */
                                <div className="space-y-6 pb-8">
                                    <div className="space-y-4">
                                        {/* Notification Toggle */}
                                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-zinc-800 rounded-lg">
                                                    <Bell className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <span className="text-sm font-medium">Get reservation notifications</span>
                                            </div>
                                            <div className="w-10 h-5 bg-zinc-700 rounded-full relative cursor-pointer">
                                                <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-400 rounded-full" />
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5 space-y-3">
                                            <div className="flex items-center gap-3 mb-2 text-zinc-400">
                                                <Hash className="w-4 h-4" />
                                                <span className="text-xs uppercase tracking-widest font-mono">Quick Tags</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {["Short List", "Afternoon Tea", "After Work", "Date Night", "Solo"].map(tag => (
                                                    <button key={tag} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs font-medium border border-white/5 hover:border-accent/40 hover:text-accent transition-all">
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-2xl border border-white/5 hover:bg-zinc-800 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-zinc-800 rounded-lg">
                                                    <FileText className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <span className="text-sm font-medium">Add notes</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-zinc-600 -rotate-90 group-hover:text-zinc-400 transition-colors" />
                                        </div>

                                        {/* Stealth Mode */}
                                        <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-zinc-800 rounded-lg">
                                                        <Lock className="w-4 h-4 text-accent" />
                                                    </div>
                                                    <span className="text-sm font-medium">Stealth mode</span>
                                                </div>
                                                <div className="w-10 h-5 bg-accent/20 border border-accent/30 rounded-full relative cursor-pointer">
                                                    <div className="absolute right-1 top-1 w-3 h-3 bg-accent rounded-full" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 pl-11">Hide this activity from newsfeed</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleBookmarkSubmit}
                                        disabled={isSubmitting}
                                        className={cn(
                                            "w-full py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 active:scale-95 transition-all",
                                            isSubmitting && "opacity-50 cursor-wait"
                                        )}
                                    >
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
