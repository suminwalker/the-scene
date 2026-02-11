import React from "react";
import { cn } from "@/lib/utils";

interface AppContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function AppContainer({ children, className }: AppContainerProps) {
    return (
        <div className={cn(
            "w-full h-screen bg-background text-foreground relative shadow-2xl overflow-hidden flex flex-col mx-auto",
            // Mobile: 480px centered
            "max-w-[480px]",
            // Desktop: Full width, max-width constrained for readability if needed, but per plan full responsive
            "md:max-w-full md:shadow-none md:border-x-0",
            className
        )}>
            {children}
        </div>
    );
}
