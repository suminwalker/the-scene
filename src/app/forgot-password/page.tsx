"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppContainer } from "@/components/layout/AppContainer";
import { TopBar } from "@/components/layout/TopBar";
import { Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSubmitted(true);
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center min-h-screen bg-white text-black w-full">
            <AppContainer className="bg-white">
                <TopBar onBack={() => router.push("/login")} className="md:flex" />

                <main className="px-8 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <header className="mb-12 space-y-4">
                        <h1 className="text-4xl font-serif tracking-tight leading-tight">
                            Reset Password
                        </h1>
                        <p className="text-zinc-500 leading-relaxed">
                            Enter the email associated with your account and we'll send you a link to reset your password.
                        </p>
                    </header>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full bg-transparent text-lg focus:outline-none placeholder:text-zinc-300 font-serif italic"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={!email || loading}
                                    className="w-full py-5 bg-black text-white rounded-2xl font-bold text-sm shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Send Reset Link
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="rounded-3xl bg-zinc-50 p-8 border border-zinc-100 space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                <ArrowRight className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif">Check your email</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    If an account exists for <span className="font-bold text-black">{email}</span>, you will receive a password reset link shortly.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push("/login")}
                                className="w-full py-4 text-sm font-bold border-2 border-zinc-200 rounded-xl hover:border-black hover:bg-black hover:text-white transition-all"
                            >
                                Return to Log in
                            </button>
                        </div>
                    )}
                </main>
            </AppContainer>
        </div>
    );
}
