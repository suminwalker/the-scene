'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AuthInput } from './AuthInput';
import { Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function SignupForm() {
    const [step, setStep] = useState<'initial' | 'location'>('initial');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [handle, setHandle] = useState('');
    const [homeBorough, setHomeBorough] = useState<'Manhattan' | 'Brooklyn' | ''>('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!homeBorough) {
            setError('Please verify you live in Manhattan or Brooklyn');
            setLoading(false);
            return;
        }

        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        handle: handle,
                        home_borough: homeBorough,
                        // Add other metadata here
                    },
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            // 2. Create profile entry (usually triggered by DB trigger, but if we need manual additional setup)
            // For now, Supabase Auth handles basic user creation. 
            // The `profiles` table likely needs a Trigger to auto-create from auth.users, 
            // OR we manually insert if no trigger exists.
            // Assuming we need to verify: 

            // Check if session established (depends on email confirm settings)
            // If email confirm is off, we are logged in.

            if (authData.session) {
                // Manually update profile if trigger didn't handle custom fields
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        handle: handle,
                        home_borough: homeBorough
                    })
                    .eq('id', authData.user?.id);

                if (profileError) {
                    console.error("Profile update error:", profileError);
                    // Non-blocking but good to know
                }

                router.push('/onboarding'); // Redirect to onboarding flow
                router.refresh();
            } else {
                // Email confirmation required
                setStep('initial'); // Or success state
                alert('Check your email for confirmation link!');
            }

        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'initial') {
        return (
            <form onSubmit={(e) => { e.preventDefault(); setStep('location'); }} className="space-y-4">
                <AuthInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <AuthInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors"
                    >
                        Continue
                    </button>
                </div>
                <p className="text-center text-xs text-zinc-500">
                    Already have an account? <Link href="/login" className="text-black hover:underline">Sign in</Link>
                </p>
            </form>
        )
    }

    return (
        <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-4">
                {/* Handle */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-900 block pl-0.5">
                        Choose a Handle
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-zinc-400">@</span>
                        <input
                            className="flex w-full rounded-xl border border-zinc-200 bg-white pl-7 pr-3 py-2.5 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black placeholder:text-zinc-400"
                            placeholder="username"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            required
                        />
                    </div>
                </div>

                {/* NYC Validation */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-900 block pl-0.5">
                        Where do you live?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setHomeBorough('Manhattan')}
                            className={cn(
                                "p-3 rounded-xl border text-sm font-medium transition-all text-center",
                                homeBorough === 'Manhattan'
                                    ? "border-black bg-black text-white"
                                    : "border-zinc-200 hover:border-zinc-300 text-zinc-600"
                            )}
                        >
                            Manhattan
                        </button>
                        <button
                            type="button"
                            onClick={() => setHomeBorough('Brooklyn')}
                            className={cn(
                                "p-3 rounded-xl border text-sm font-medium transition-all text-center",
                                homeBorough === 'Brooklyn'
                                    ? "border-black bg-black text-white"
                                    : "border-zinc-200 hover:border-zinc-300 text-zinc-600"
                            )}
                        >
                            Brooklyn
                        </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 flex items-start gap-1.5 leading-tight px-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        The Scene is currently exclusive to residents of Manhattan and Brooklyn.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="space-y-3 pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </button>
                <button
                    type="button"
                    onClick={() => setStep('initial')}
                    className="w-full text-zinc-500 text-xs hover:text-zinc-900 transition-colors"
                >
                    Back
                </button>
            </div>
        </form>
    );
}
