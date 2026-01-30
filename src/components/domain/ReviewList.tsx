import { Review } from "@/lib/data";
import { Star } from "lucide-react";

interface ReviewListProps {
    reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="py-8 text-center text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                <p className="text-sm">No reviews yet. Be the first to tell us the vibe.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{review.author}</p>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{review.date}</p>
                        </div>
                        <div className="flex text-black dark:text-white">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-zinc-200 dark:text-zinc-700 fill-none"}`} />
                            ))}
                        </div>
                    </div>

                    {/* Example usage of potential tags - visually conditional */}
                    {(review.vibe || review.crowd || review.attire) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {review.vibe?.map(t => (
                                <span key={t} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600">
                                    ✨ {t}
                                </span>
                            ))}
                            {review.crowd?.map(t => (
                                <span key={t} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600">
                                    👥 {t}
                                </span>
                            ))}
                            {review.attire?.map(t => (
                                <span key={t} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600">
                                    👔 {t}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-serif">&quot;{review.text}&quot;</p>
                </div>
            ))}
        </div>
    );
}
