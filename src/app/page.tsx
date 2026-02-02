"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { LandingVisuals } from "@/components/domain/LandingVisuals";
import { SlideButton } from "@/components/ui/SlideButton";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    // strict scroll locking: fixed inset-0, touch-none, overscroll-none
    <div className="fixed inset-0 w-full h-[100dvh] flex justify-center bg-black overflow-hidden overscroll-none touch-none">
      <MobileContainer className="relative w-full h-full overflow-hidden bg-black">
        <LandingVisuals>
          {/* Logo/Header Fixed Top (Absolute in this slot relative to the container, or just place it here and let visual handle layout?) 
             The Visuals component puts children in a bottom flex-col div.
             I should probably move the Logo OUT of the children if I want it at top, OR just put logic in Visuals.
             Visuals component design:
              - Top: Logo
              - Center: Slider Content
              - Right: Nav
              - Bottom: Actions
          */}

          <div className="w-full space-y-6 flex flex-col items-center">
            <SlideButton onSuccess={() => router.push("/auth/signup")} />

            <div className="text-center">
              <button
                onClick={() => router.push("/auth/login")}
                className="text-sm font-medium text-white/60 active:opacity-100 transition-opacity"
              >
                Already have an account? <span className="text-white font-bold">Log in</span>
              </button>
            </div>
          </div>



          {/* Legal */}
          <div className="mt-4 text-center px-4 max-w-xs mx-auto">
            <p className="text-[10px] text-white/40 leading-relaxed font-mono">
              By continuing, you agree to our <Link href="/terms" className="underline hover:text-white transition-colors">Terms</Link>. You acknowledge receipt of our <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        </LandingVisuals>

        {/* Floating Logo - Placed outside visuals to be on top? 
            Visuals component covers everything. 
            I'll modify Visuals to accept a 'header' prop or just overlay it here absolutely if Visuals doesn't block z-index.
            Visuals children are at z-30 bottom. 
            Visuals nav is z-20. 
            Content is z-10. 
            Canvas is z-0.
            So I can place a logo absolute here.
        */}
        <div className="absolute top-12 left-0 right-0 z-40 text-center pointer-events-none">
          <h1 className="text-[14px] font-mono uppercase tracking-[0.5em] text-white font-black mb-1 drop-shadow-lg">
            The Scene
          </h1>
        </div>
      </MobileContainer>
    </div>
  );
}
