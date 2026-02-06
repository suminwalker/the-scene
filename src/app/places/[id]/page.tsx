import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { PLACES } from "@/lib/data";
import { ReviewList } from "@/components/domain/ReviewList";
import { ReviewForm } from "@/components/domain/ReviewForm";
import { ArrowLeft, MapPin, Share, Bookmark, Globe, Phone, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PlacePageProps {
    params: {
        id: string;
    };
}

// Next.js 15+ Params are async.
// Assuming this is built for the current Next.js runtime in this env.
export default async function PlacePage({ params }: PlacePageProps) {
    const { id } = await params;
    const place = PLACES.find((p) => p.id === id);

    if (!place) {
        notFound();
    }

    return (
        <div className="flex justify-center min-h-screen bg-zinc-100 dark:bg-black">
            <MobileContainer>
                <div className="flex-1 overflow-y-auto pb-24 relative bg-white dark:bg-zinc-900">
                    {/* Header / Image Area */}
                    <div className="relative w-full aspect-[4/5] bg-zinc-800 group overflow-hidden">
                        {/* Image Placeholder with Zoom Effect */}
                        <div className="absolute inset-0 bg-cover bg-center duration-700 hover:scale-105" style={{ backgroundImage: `url(${place.image})` }} />

                        {/* Fallback Text if image fails */}
                        <div className="absolute inset-0 flex items-center justify-center text-white/30 font-serif italic text-2xl z-0 pointer-events-none">
                            {place.name}
                        </div>

                        {/* Back Button */}
                        <Link href="/discover" className="absolute top-4 left-4 p-2 rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 transition-colors z-20">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        {/* Actions */}
                        <div className="absolute top-4 right-4 flex gap-2 z-20">
                            <button className="p-2 rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 transition-colors">
                                <Share className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 transition-colors">
                                <Bookmark className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                            <h1 className="text-4xl font-serif font-bold leading-tight mb-1">{place.name}</h1>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300 font-medium">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-accent text-accent" />
                                    <span className="text-white">{place.rating}</span>
                                </div>
                                <span>•</span>
                                <span>{place.neighborhood}</span>
                                <span>•</span>
                                <span>{place.price}</span>
                                <span>•</span>
                                <span>{place.category}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 space-y-10">

                        {/* Contact Actions */}
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                            {place.website && (
                                <a href={place.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full text-sm font-medium whitespace-nowrap hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                                    <Globe className="w-4 h-4 text-zinc-500" />
                                    Website
                                </a>
                            )}
                            {place.phone && (
                                <a href={`tel:${place.phone}`} className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full text-sm font-medium whitespace-nowrap hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                                    <Phone className="w-4 h-4 text-zinc-500" />
                                    Call
                                </a>
                            )}
                            <a href={`https://maps.google.com/?q=${place.address}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full text-sm font-medium whitespace-nowrap hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                                <MapPin className="w-4 h-4 text-zinc-500" />
                                Map
                            </a>
                        </div>

                        {/* Editorial */}
                        {place.editorial && (
                            <section>
                                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">The Edit</h3>
                                <p className="text-lg font-serif leading-relaxed text-zinc-800 dark:text-zinc-200">
                                    {place.editorial}
                                </p>
                            </section>
                        )}

                        {/* Address Snippet */}
                        <section className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">{place.address}</p>
                                <p className="text-xs text-zinc-500 mt-1">Open today 5pm - 2am</p>
                            </div>
                        </section>

                        {/* Tags */}
                        {(place.vibe.length > 0) && (
                            <section className="space-y-4">
                                {place.vibe.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">Vibe</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {place.vibe.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />

                        {/* Reviews */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-serif font-bold">Reviews</h3>
                                <span className="text-xs text-zinc-500">{place.reviews.length} Reviews</span>
                            </div>

                            <ReviewList reviews={place.reviews} />
                            <ReviewForm venueName={place.name} venueCity={place.city} />

                            {/* Trust & Safety Disclaimer */}
                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] text-zinc-400 text-center leading-relaxed max-w-xs mx-auto">
                                    Reviews are based on recent reports and historical trends.
                                    They are aggregated anonymously and are not guarantees of who is there right now.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>

                <BottomNav />
            </MobileContainer>
        </div>
    );
}
