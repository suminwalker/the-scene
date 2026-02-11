'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AuthInput } from './AuthInput'; // Assumed you have this component or verify its path
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginForm() { // Add export here!
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // Use correct import for app dir
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                router.push('/discover');
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <AuthInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                error={error ? undefined : undefined} // Simplification for now
                required
            />

            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-900 block pl-0.5">Password</label>
                    <button type="button" className="text-xs text-zinc-500 hover:text-black transition-colors">
                        Forgot?
                    </button>
                </div>
                <input
                    className={cn(
                        "flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                        error && "border-red-500 focus-visible:ring-red-500"
                    )}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
        </form>
    );
}
