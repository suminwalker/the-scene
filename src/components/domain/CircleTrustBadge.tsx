"use client";

import { useState, useEffect } from "react";
import { UsersRound, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CircleTrustBadgeProps {
    venueId: string;
}

export function CircleTrustBadge({ venueId }: CircleTrustBadgeProps) {
    const supabase = createClient();
    const [trustScore, setTrustScore] = useState<{ avg_rating: number | null; review_count: number } | null>(null);

    useEffect(() => {
        const fetchTrust = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data } = await supabase
                .rpc("get_circle_trust_score", {
                    p_user_id: session.user.id,
                    p_venue_id: venueId
                });

            if (data && data.review_count > 0) {
                setTrustScore(data);
            }
        };

        fetchTrust();
    }, [venueId]);

    if (!trustScore || !trustScore.avg_rating) return null;

    return (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <UsersRound className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-emerald-800">
                        {trustScore.avg_rating}
                    </span>
                    <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">
                        from your circle
                    </span>
                </div>
                <p className="text-[10px] text-emerald-500 font-mono">
                    {trustScore.review_count} review{trustScore.review_count !== 1 ? "s" : ""} from people you trust
                </p>
            </div>
        </div>
    );
}
