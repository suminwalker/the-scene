'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null);

    // Form State
    const [ageBracket, setAgeBracket] = useState('');
    // Neighborhoods would be better as multi-select, simplified for initial phase
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [dislikes, setDislikes] = useState<string[]>([]);

    useEffect(() => {
        async function checkUser() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUserId(session.user.id);

            // Check if already onboarded
            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', session.user.id)
                .single();

            if (profile?.onboarding_completed) {
                router.push('/discover');
            } else {
                setLoading(false);
            }
        }
        checkUser();
    }, [router, supabase]);

    const handleComplete = async () => {
        if (!userId) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    age_bracket: ageBracket,
                    neighborhoods: neighborhoods,
                    dislikes: dislikes,
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;

            router.push('/discover');
        } catch (error) {
            console.error('Onboarding error:', error);
            alert('Failed to save onboarding data. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 space-y-6">
                <h1 className="text-2xl font-light text-center">Complete Your Profile</h1>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Age Bracket</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={ageBracket}
                            onChange={(e) => setAgeBracket(e.target.value)}
                        >
                            <option value="">Select Age</option>
                            <option value="21-24">21-24</option>
                            <option value="25-29">25-29</option>
                            <option value="30-34">30-34</option>
                            <option value="35-39">35-39</option>
                        </select>
                    </div>

                    {/* Simplified for MVP - Neighborhoods would be a complex selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Favorite Neighborhoods (Comma separated)</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            placeholder="e.g. Soho, West Village"
                            onChange={(e) => setNeighborhoods(e.target.value.split(',').map(s => s.trim()))}
                        />
                    </div>

                    <button
                        onClick={handleComplete}
                        disabled={!ageBracket || saving}
                        className="w-full bg-black text-white py-3 rounded-xl font-medium disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Start Discovering'}
                    </button>
                </div>
            </div>
        </div>
    );
}
