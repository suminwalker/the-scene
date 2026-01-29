"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { TopBar } from "@/components/layout/TopBar";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login
        setTimeout(() => {
            router.push("/discover");
        }, 800);
    };

    return (
        <div className="flex justify-center min-h-screen bg-white text-black">
            <MobileContainer className="bg-white">
                <TopBar backHref="/" />

                <main className="px-8 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <header className="mb-12 space-y-2">
                        <h1 className="text-4xl font-serif tracking-tight">
                            Welcome back!
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Already created an account? Sign in here.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            {/* Email/Phone */}
                            <div className="border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                <input
                                    required
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email or phone (non-US include &quot;+&quot;)"
                                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-zinc-300 italic"
                                />
                            </div>

                            {/* Password */}
                            <div className="relative border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-zinc-300 italic pr-16"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-8 top-0 text-zinc-400 p-1 hover:text-zinc-600 transition-colors"
                                >
                                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>

                            <button
                                type="button"
                                className="text-xs font-bold text-zinc-900 hover:text-accent transition-colors tracking-tight"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <div className="pt-12 space-y-6">
                            <button
                                type="submit"
                                disabled={!email || !password}
                                className="w-full py-5 bg-black text-white rounded-2xl font-bold text-sm shadow-2xl active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center"
                            >
                                Log in
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => router.push("/auth/signup")}
                                    className="text-sm font-medium text-zinc-400 active:opacity-60 transition-opacity"
                                >
                                    Not on The Scene yet? <span className="text-zinc-900 font-bold underline underline-offset-4">Create an account</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </main>
            </MobileContainer>
        </div>
    );
}
