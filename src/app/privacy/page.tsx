"use client";

import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <ResponsiveContainer>
            <div className="flex-1 overflow-y-auto bg-white">
                {/* Header */}
                <div className="px-8 pt-10 pb-6 border-b border-black/5 flex items-center gap-4">
                    <Link href="/discover" className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-black transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Privacy Policy</h1>
                </div>

                <div className="max-w-2xl px-8 py-8 space-y-8 text-sm text-zinc-600 leading-relaxed">
                    <section>
                        <h2 className="text-black font-bold text-lg mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our interactive features.</p>
                    </section>

                    <section>
                        <h2 className="text-black font-bold text-lg mb-3">2. How We Use Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, including to personalize your experience and facilitate social interactions.</p>
                    </section>

                    <section>
                        <h2 className="text-black font-bold text-lg mb-3">3. Information Sharing</h2>
                        <p>We do not share your personal information with third parties except as described in this policy or with your consent.</p>
                    </section>

                    <section>
                        <h2 className="text-black font-bold text-lg mb-3">4. Security</h2>
                        <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
                    </section>
                </div>
            </div>
        </ResponsiveContainer>
    );
}
