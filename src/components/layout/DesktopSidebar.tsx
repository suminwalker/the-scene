"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map as MapIcon, MessageCircle, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
    const pathname = usePathname();

    const tabs = [
        { name: "Feed", href: "/discover", icon: Compass },
        { name: "Map", href: "/map", icon: MapIcon },
        { name: "Messages", href: "/messages", icon: MessageCircle },
        { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-black/5 bg-zinc-50/50 backdrop-blur-xl z-50">
            {/* Logo Area */}
            <div className="p-8 pb-12">
                <h1 className="text-xl font-mono uppercase tracking-[0.3em] font-black text-black">
                    The Scene
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {tabs.map((tab) => {
                    const isActive = pathname.startsWith(tab.href);
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-black text-white shadow-lg shadow-black/5"
                                    : "text-zinc-500 hover:bg-black/5 hover:text-black"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                                    isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
                                )}
                            />
                            <span className={cn(
                                "text-xs font-mono uppercase tracking-widest font-bold",
                                isActive ? "text-white" : "text-zinc-600 group-hover:text-black"
                            )}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Area (Optional) */}
            <div className="p-6 border-t border-black/5">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-black/5 overflow-hidden">
                        <img src="https://i.pravatar.cc/150?u=sumin" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">Sumin Walker</p>
                        <p className="text-[10px] text-zinc-500 truncate">Member</p>
                    </div>
                    <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
                </div>
            </div>
        </aside>
    );
}
