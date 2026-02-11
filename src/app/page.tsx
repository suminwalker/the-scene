"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppContainer } from "@/components/layout/AppContainer";
import { LandingVisuals } from "@/components/domain/LandingVisuals";
import { SlideButton } from "@/components/ui/SlideButton";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    // strict scroll locking: fixed inset-0, touch-none, overscroll-none
    <div className="fixed inset-0 w-full h-[100dvh] flex justify-center bg-black overflow-hidden overscroll-none touch-none">
      <AppContainer className="relative w-full h-full overflow-hidden bg-black md:flex md:flex-row">

        {/* DESKTOP: Left Panel (Static Brand & Actions) */}
        <div className="hidden md:flex flex-col justify-center items-center w-full md:w-[400px] lg:w-[480px] h-full bg-black z-20 relative border-r border-white/10 p-12 shrink-0">
          <div className="space-y-12 w-full max-w-sm">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-mono uppercase tracking-[0.3em] text-white font-black drop-shadow-lg">
                The Scene
              </h1>
              <p className="text-zinc-400 font-serif text-xl italic">
                NYC's Nightlife, Curated.
              </p>
            </div>

            <div className="space-y-8">
              <SlideButton onSuccess={() => router.push("/signup")} />

              <div className="text-center">
                <button
                  onClick={() => router.push("/login")}
                  className="text-base font-medium text-white/60 hover:text-white transition-colors"
                >
                  Already have an account? <span className="text-white font-bold underline underline-offset-4">Log in</span>
                </button>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5">
              <p className="text-xs text-zinc-600 text-center leading-relaxed">
                By continuing, you agree to our Terms & Privacy Policy.
                <br />Designed for the tastemakers of NYC.
              </p>
            </div>
          </div>
        </div>

        {/* MOBILE & DESKTOP: Visuals Container */}
        {/* On Mobile: Full screen, contains actions as children */}
        {/* On Desktop: Right panel, fills remaining space, NO children (actions are on left) */}
        <div className="w-full h-full md:flex-1 relative md:border-l md:border-white/5">
          <LandingVisuals>
            {/* MOBILE ONLY CONTENT: Actions passed as children */}
            <div className="md:hidden w-full space-y-6 flex flex-col items-center">
              <SlideButton onSuccess={() => router.push("/signup")} />

              <div className="text-center">
                <button
                  onClick={() => router.push("/login")}
                  className="text-sm font-medium text-white/60 active:opacity-100 transition-opacity"
                >
                  Already have an account? <span className="text-white font-bold">Log in</span>
                </button>
              </div>
            </div>

            {/* Legal - Mobile Only */}
            <div className="md:hidden mt-4 text-center px-4 max-w-xs mx-auto">
              <p className="text-[10px] text-white/40 leading-relaxed font-mono">
                By continuing, you agree to our <Link href="/terms" className="underline hover:text-white transition-colors">Terms</Link>. You acknowledge receipt of our <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
              </p>
            </div>
          </LandingVisuals>

          {/* Mobile Logo Overlay */}
          <div className="md:hidden absolute top-12 left-0 right-0 z-40 text-center pointer-events-none">
            <h1 className="text-lg font-mono uppercase tracking-[0.5em] text-white font-black mb-1 drop-shadow-lg">
              The Scene
            </h1>
          </div>
        </div>
      </AppContainer>
    </div>
  );
}
