"use client";

import { MobileContainer } from "@/components/layout/MobileContainer";
import { TopBar } from "@/components/layout/TopBar";

export default function TermsPage() {
    return (
        <div className="flex justify-center min-h-screen bg-black w-full">
            <MobileContainer className="bg-white min-h-screen flex flex-col">
                <TopBar
                    title="Terms of Service"
                    onBack={() => window.history.back()}
                />
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-zinc-600 leading-relaxed pb-24">
                    <section>
                        <h2 className="text-black font-bold text-lg mb-2">1. Acceptance of Terms</h2>
                        <p>By accessing and using The Scene, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    </section>

                    <section>
                        <h2 className="text-black font-bold text-lg mb-2">2. Use License</h2>
                        <p>Permission is granted to temporarily download one copy of the materials (information or software) on The Scene's website for personal, non-commercial transitory viewing only.</p>
                    </section>

                    <section>
                        <h2 className="text-black font-bold text-lg mb-2">3. User Conduct</h2>
                        <p>You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service.</p>
                    </section>

                    <section>
                        <h2 className="text-black font-bold text-lg mb-2">4. Disclaimer</h2>
                        <p>The materials on The Scene's website are provided "as is". The Scene makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>
                    </section>
                </div>
            </MobileContainer>
        </div>
    );
}
