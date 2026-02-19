"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function ProfileRedirect() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Gets username from metadata or falls back to user ID
                const username = session.user.user_metadata?.username || session.user.id;
                router.replace(`/profile/${username}`);
            } else {
                router.replace("/login");
            }
        };

        checkSession();
    }, [router, supabase]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
    );
}
