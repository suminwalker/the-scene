import React from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
    return (
        <div className={cn("w-[480px] max-w-full h-screen bg-background text-foreground relative shadow-2xl overflow-hidden flex flex-col mx-auto", className)}>
            {children}
        </div>
    );
}
