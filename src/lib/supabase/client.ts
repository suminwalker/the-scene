'use client';

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react';

// Wrapper to ensure singleton client
export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

// Hook to get session
export function useSession() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Create client inside component/hook to use current env vars
    const supabase = createClient();

    useEffect(() => {
        async function getSession() {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        }

        getSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { session, loading };
}
