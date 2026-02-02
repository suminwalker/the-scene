"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Search, Map as MapIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    { name: "Feed", href: "/discover", icon: Compass },
    { name: "Map", href: "/map", icon: MapIcon },
    { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-black/5 safe-area-bottom w-full max-w-[480px] mx-auto">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = pathname.startsWith(tab.href);
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-zinc-400 hover:text-foreground/80"
                            )}
                        >
                            <Icon
                                className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")}
                            />
                            <span className="text-[10px] font-medium tracking-wide">{tab.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
