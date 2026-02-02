"use client";

import React, { useState, useRef } from "react";
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
    const containerWidth = 210;
    const knobWidth = 39;
    const padding = 3; // 1.5px each side
    const maxDrag = containerWidth - knobWidth - padding; // 210 - 39 - 3 = 168
    const threshold = maxDrag * 0.9; // Trigger at 90% of completion

    // Opacity of the text fades as we drag
    const textOpacity = useTransform(x, [0, maxDrag / 2], [1, 0]);

    // Background opacity or color shift could also be linked
    const bgOpacity = useTransform(x, [0, maxDrag], [0.6, 1]);

    // Clip Path to "erase" the track from the left as we drag
    // Clipping at 'value' (x) ensures the track starts 1.5px to the left of the knob (which is at x+1.5),
    // creating a consistent 1.5px "nest" border that travels with the knob.
    const trackClip = useTransform(x, (value) => `inset(0 0 0 ${value}px round 9999px)`);

    const lastVibrationX = useRef(0);

    const handleDrag = () => {
        const currentX = x.get();
        // Haptic feedback every ~10px of movement
        if (Math.abs(currentX - lastVibrationX.current) > 10) {
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate(5);
            }
            lastVibrationX.current = currentX;
        }
    };

    const handleDragStart = () => {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(10);
        }
        lastVibrationX.current = x.get();
    };

    const handleDragEnd = () => {
        if (x.get() > threshold) {
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate(50);
            }
            setCompleted(true);
            onSuccess();
        } else {
            animate(x, 0, { type: "spring", stiffness: 200, damping: 20 });
        }
    };

    return (
        <div className={cn("relative w-full max-w-[210px] h-[42px] rounded-full overflow-hidden select-none", className)}>
            {/* Track Background */}
            <motion.div
                className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xl border border-white/5 rounded-full"
                style={{ opacity: bgOpacity, clipPath: trackClip }}
            />

            {/* Shimmering Text Label */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center font-medium text-sm text-white pointer-events-none"
                style={{ opacity: textOpacity }}
            >
                <span className="ml-6 relative overflow-hidden bg-gradient-to-r from-white/40 via-white to-white/40 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
                    {text}
                </span>
            </motion.div>

            {/* Draggable Knob / Success Fill */}
            <motion.div
                drag={!completed ? "x" : false}
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.1} // Increased elasticity for better feel
                dragMomentum={false}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
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
                    width: 39,
                    height: 39,
                    borderRadius: 9999
                }}
                whileTap={!completed ? { scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.5)" } : undefined}
                transition={completed ? { type: "spring", stiffness: 400, damping: 30 } : undefined}
                style={{ x }}
                className={cn(
                    "absolute top-[1.5px] left-[1.5px] bg-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_2px_10px_rgba(0,0,0,0.3)] z-10",
                    completed && "cursor-default"
                )}
            >
                {/* Arrow Icon - Fades out on success */}
                <motion.div animate={{ opacity: completed ? 0 : 1 }}>
                    <ArrowRight className="w-4 h-4 text-black" />
                </motion.div>
            </motion.div>
        </div>
    );
}
