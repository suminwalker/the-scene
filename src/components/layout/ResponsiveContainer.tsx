"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DesktopSidebar } from "./DesktopSidebar";

interface ResponsiveContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
    return (
        <div className="min-h-screen w-full bg-zinc-100 dark:bg-black">
            {/* Desktop Sidebar (Self-manages hidden state) */}
            <DesktopSidebar />

            <div className={cn(
                // Mobile Styles (Default)
                // Strictly matching MobileContainer behavior: 
                // max-w-[480px], centred, fixed height/scroll behavior
                "w-full max-w-[480px] h-[100dvh] bg-background text-foreground relative shadow-2xl overflow-hidden flex flex-col mx-auto",

                // Desktop Styles (md+)
                // Relax width, keep "App" feel (fixed height) but use full window height 
                // Add padding for sidebar (64 usually 16rem = 256px? No w-64 is 256px)
                "md:max-w-none md:w-auto md:ml-64 md:shadow-none md:h-screen md:rounded-none md:border-none",

                className
            )}>
                {children}
            </div>
        </div>
    );
}
