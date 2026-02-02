"use client";

import { MobileContainer } from "@/components/layout/MobileContainer";
import { TopBar } from "@/components/layout/TopBar";

export default function PrivacyPage() {
    return (
        <div className="flex justify-center min-h-screen bg-black w-full">
            <MobileContainer className="bg-white min-h-screen flex flex-col">
                <TopBar
                    title="Privacy Policy"
                    onBack={() => window.history.back()}
                />
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-zinc-600 leading-relaxed pb-24">
                    <section>
                        <h2 className="text-black font-bold text-lg mb-2">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our interactive features.</p>
                    </section>

                    <section>
                        <h2 className="text-black font-bold text-lg mb-2">2. How We Use Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, including to personalize your experience and facilitate social interactions.</p>
                    </section>

                    <section>
                        <h2 className="text-black font-bold text-lg mb-2">3. Information Sharing</h2>
                        <p>We do not share your personal information with third parties except as described in this policy or with your consent.</p>
                    </section>

                    <section>
                        <h2 className="text-black font-bold text-lg mb-2">4. Security</h2>
                        <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
                    </section>
                </div>
            </MobileContainer>
        </div>
    );
}
