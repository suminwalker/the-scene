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
                <div key={review.id} className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{review.author}</p>
                            <p className="text-[10px] text-zinc-400">{review.date}</p>
                        </div>
                        <div className="flex text-accent">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-zinc-300 dark:text-zinc-600 fill-none"}`} />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">&quot;{review.text}&quot;</p>
                </div>
            ))}
        </div>
    );
}
