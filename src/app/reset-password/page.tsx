"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { Eye, EyeOff, Loader2, Check, Lock, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            setLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                setError(updateError.message);
            } else {
                router.push("/discover");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const hasLength = password.length >= 8 && password.length <= 20;
    const hasComplexity = /[0-9]/.test(password) && /[a-zA-Z]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isStrengthValid = hasLength && hasComplexity;

    return (
        <ResponsiveContainer>
            <div className="flex-1 overflow-y-auto bg-white">
                {/* Header */}
                <div className="px-8 pt-10 pb-6 border-b border-black/5 flex items-center gap-4">
                    <Link href="/settings" className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-black transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Change Password</h1>
                </div>

                <main className="max-w-lg px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-zinc-500 leading-relaxed mb-8">
                        Your new password must be different from previous used passwords.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="relative group">
                                <div className="relative border-b-2 border-zinc-100 group-focus-within:border-black transition-all pb-2">
                                    <input
                                        autoFocus
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="New Password"
                                        className="w-full bg-transparent text-xl font-serif italic focus:outline-none placeholder:text-zinc-200 pr-16"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1 text-zinc-400 p-1 hover:text-zinc-600 transition-colors"
                                    >
                                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className={cn("flex items-center gap-2 text-xs transition-colors duration-300", hasLength ? "text-green-600 font-medium" : "text-zinc-400")}>
                                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center border", hasLength ? "bg-green-100 border-green-200" : "border-zinc-200")}>
                                            {hasLength && <Check className="w-2.5 h-2.5" />}
                                        </div>
                                        8 to 20 characters
                                    </div>
                                    <div className={cn("flex items-center gap-2 text-xs transition-colors duration-300", hasComplexity ? "text-green-600 font-medium" : "text-zinc-400")}>
                                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center border", hasComplexity ? "bg-green-100 border-green-200" : "border-zinc-200")}>
                                            {hasComplexity && <Check className="w-2.5 h-2.5" />}
                                        </div>
                                        Letters, numbers, and special characters
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={!password || !isStrengthValid || loading}
                                className="w-full py-5 bg-black text-white rounded-2xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Reset Password
                                        <Lock className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </ResponsiveContainer>
    );
}
