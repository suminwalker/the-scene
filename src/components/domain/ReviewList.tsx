import { Review } from "@/lib/data";
import { Star } from "lucide-react";

interface ReviewListProps {
    reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="py-12 text-center text-zinc-600 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                <p className="text-base font-medium">No reviews yet. Be the first to tell us the vibe.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-white rounded-xl border border-zinc-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="font-bold text-sm text-zinc-900">{review.author}</p>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{review.date}</p>
                        </div>
                        <div className="flex text-black">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-zinc-200 fill-none"}`} />
                            ))}
                        </div>
                    </div>

                    {/* Example usage of potential tags - visually conditional */}
                    {(review.vibe || review.crowd || review.attire) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {review.vibe?.map(t => (
                                <span key={t} className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-medium text-zinc-600 border border-zinc-200">
                                    ✨ {t}
                                </span>
                            ))}

                            {review.attire?.map(t => (
                                <span key={t} className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-medium text-zinc-600 border border-zinc-200">
                                    👔 {t}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-sm text-zinc-600 leading-relaxed font-serif">&quot;{review.text}&quot;</p>
                </div>
            ))}
        </div>
    );
}
