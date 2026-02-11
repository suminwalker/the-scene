"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DesktopSidebar } from "./DesktopSidebar";
import { AppContainer } from "./AppContainer";

interface ResponsiveContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
    return (
        <div className="min-h-screen w-full bg-zinc-100 dark:bg-black">
            {/* Desktop Sidebar (Self-manages hidden state) */}
            <DesktopSidebar />

            <AppContainer className={cn(
                // Override desktop max-width to respect sidebar
                // AppContainer is normally centered, but here we want it pushed right by sidebar
                "md:ml-64 md:w-auto md:max-w-none md:h-screen md:rounded-none md:border-none",
                className
            )}>
                {children}
            </AppContainer>
        </div>
    );
}
