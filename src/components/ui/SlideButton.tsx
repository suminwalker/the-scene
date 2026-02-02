"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideButtonProps {
    onSuccess: () => void;
    className?: string;
    text?: string;
}

export function SlideButton({ onSuccess, className, text = "Get Started" }: SlideButtonProps) {
    const [completed, setCompleted] = useState(false);
    const x = useMotionValue(0);

    // Dimensions
    const containerWidth = 280;
    const knobWidth = 52;
    const padding = 4; // 2px each side
    const maxDrag = containerWidth - knobWidth - padding; // 224px
    const threshold = maxDrag * 0.9; // Trigger at 90% of completion

    // Opacity of the text fades as we drag
    const textOpacity = useTransform(x, [0, maxDrag / 2], [1, 0]);

    // Background opacity or color shift could also be linked
    const bgOpacity = useTransform(x, [0, maxDrag], [0.6, 1]);

    // Clip Path to "erase" the track from the left as we drag
    // Clipping at 'value' (x) ensures the track starts 2px to the left of the knob (which is at x+2),
    // creating a consistent 2px "nest" border that travels with the knob.
    const trackClip = useTransform(x, (value) => `inset(0 0 0 ${value}px round 9999px)`);

    const handleDragEnd = () => {
        if (x.get() > threshold) {
            setCompleted(true);
            onSuccess();
        } else {
            animate(x, 0, { type: "spring", stiffness: 200, damping: 20 });
        }
    };

    return (
        <div className={cn("relative w-full max-w-[280px] h-14 rounded-full overflow-hidden select-none", className)}>
            {/* Track Background */}
            <motion.div
                className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xl border border-white/5 rounded-full"
                style={{ opacity: bgOpacity, clipPath: trackClip }}
            />

            {/* Shimmering Text Label */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center font-medium text-white pointer-events-none"
                style={{ opacity: textOpacity }}
            >
                <span className="ml-8 relative overflow-hidden bg-gradient-to-r from-white/40 via-white to-white/40 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
                    {text}
                </span>
            </motion.div>

            {/* Draggable Knob / Success Fill */}
            <motion.div
                drag={!completed ? "x" : false}
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.1} // Increased elasticity for better feel
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={completed ? {
                    width: "100%",
                    height: "100%",
                    borderRadius: 9999,
                    x: 0,
                    left: 0,
                    top: 0,
                    bottom: 0
                } : {
                    width: 52,
                    height: 52,
                    borderRadius: 9999
                }}
                whileTap={!completed ? { scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.5)" } : undefined}
                transition={completed ? { type: "spring", stiffness: 400, damping: 30 } : undefined}
                style={{ x }}
                className={cn(
                    "absolute top-[2px] left-[2px] bg-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_2px_10px_rgba(0,0,0,0.3)] z-10",
                    completed && "cursor-default"
                )}
            >
                {/* Arrow Icon - Fades out on success */}
                <motion.div animate={{ opacity: completed ? 0 : 1 }}>
                    <ArrowRight className="w-5 h-5 text-black" />
                </motion.div>
            </motion.div>
        </div>
    );
}
