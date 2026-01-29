"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    title: "Track",
    description: "Keep a running list of your favorite places to go out.",
  },
  {
    title: "Share",
    description: "Send your favorite going out spots to friends or newcomers to your city.",
  },
  {
    title: "Discover",
    description: "See the places people love going out — and discover what’s worth showing up for.",
  }
];

export default function OnboardingPage() {
  const [[currentSlide, direction], setPage] = useState([0, 0]);
  const router = useRouter();

  const paginate = (newDirection: number) => {
    const nextSlide = currentSlide + newDirection;
    if (nextSlide < 0) {
      setPage([SLIDES.length - 1, newDirection]);
    } else if (nextSlide >= SLIDES.length) {
      setPage([0, newDirection]);
    } else {
      setPage([nextSlide, newDirection]);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className="flex justify-center min-h-screen bg-white w-full">
      <MobileContainer className="relative overflow-hidden bg-white">
        {/* Background Map (Blurred) */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200"
            alt="Map"
            className="w-full h-full object-cover opacity-20 blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/80 to-white" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center h-full px-8 pt-24 pb-12">
          {/* Logo/Header Area */}
          <div className="mb-auto text-center">
            <h1 className="text-[14px] font-mono uppercase tracking-[0.5em] text-black font-black mb-1">
              The Scene
            </h1>
          </div>

          {/* Carousel */}
          <div className="w-full mb-12 relative">
            <div className="h-[180px] flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);

                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className="absolute w-full px-8 cursor-grab active:cursor-grabbing"
                >
                  <h2 className="text-5xl font-serif text-zinc-900 tracking-tight mb-4">
                    {SLIDES[currentSlide].title}
                  </h2>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto select-none">
                    {SLIDES[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const newDirection = i > currentSlide ? 1 : -1;
                    setPage([i, newDirection]);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    currentSlide === i ? "bg-black w-4" : "bg-zinc-200"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-6 flex flex-col items-center">
            <button
              onClick={() => router.push("/auth/signup")}
              className="w-full max-w-[200px] py-4 bg-black text-white rounded-3xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all"
            >
              Get started
            </button>

            <div className="text-center">
              <button
                onClick={() => router.push("/auth/login")}
                className="text-sm font-medium text-zinc-400 active:opacity-60 transition-opacity"
              >
                Already have an account? <span className="text-zinc-900 font-bold">Log in</span>
              </button>
            </div>
          </div>

          {/* Legal */}
          <div className="mt-8 text-center px-4">
            <p className="text-[10px] text-zinc-300 leading-relaxed font-mono">
              By continuing, you agree to our <span className="underline">Terms</span>. You acknowledge receipt and understanding of our <span className="underline">Privacy Policy</span> and <span className="underline">Cookie Notice</span>.
            </p>
          </div>
        </div>
      </MobileContainer>
    </div>
  );
}
