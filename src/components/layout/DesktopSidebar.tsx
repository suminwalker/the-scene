"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Compass, Map as MapIcon, MessageCircle, User, LogOut,
    Mail, Gift, GraduationCap, Settings, Crown, Building2, Lock, FileText
} from "lucide-react";
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
            <div className="p-8 pb-8">
                <h1 className="text-xl font-mono uppercase tracking-[0.3em] font-black text-black">
                    The Scene
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar">
                {/* Primary Nav */}
                <div className="space-y-2">
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
                </div>

                {/* Secondary Nav */}
                <div className="space-y-1 pt-4 border-t border-black/5">
                    <p className="px-4 pb-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400">Account</p>
                    {[
                        { icon: Mail, label: "Invites", action: "Invites" },
                        { icon: Gift, label: "Unlock", action: "Unlock" },
                        { icon: GraduationCap, label: "School", action: "School" },
                        { icon: Settings, label: "Settings", action: "OverallSettings" },
                        { icon: Crown, label: "Subscriptions", action: "Subscriptions" },
                        { icon: MessageCircle, label: "FAQ", action: "FAQ" },
                        { icon: Building2, label: "Home City", action: "City" },
                        { icon: Lock, label: "Password", action: "Password" },
                        { icon: FileText, label: "Privacy", action: "Privacy" },
                        { icon: LogOut, label: "Log Out", action: "Logout", color: "text-red-500 hover:text-red-600" },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => alert("This feature will be available in the next desktop update.")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group text-left",
                                item.color ? "hover:bg-red-50" : "hover:bg-black/5"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4", item.color || "text-zinc-400 group-hover:text-black")} />
                            <span className={cn("text-sm font-medium", item.color || "text-zinc-600 group-hover:text-black")}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* User Footer */}
            <div className="p-6 border-t border-black/5 mt-auto bg-zinc-50/80">
                <Link href="/profile/suminwalker" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group border border-transparent hover:border-black/5">
                    <div className="w-10 h-10 rounded-full bg-black/5 overflow-hidden">
                        <img src="https://i.pravatar.cc/150?u=sumin" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">Sumin Walker</p>
                        <p className="text-xs text-zinc-500 truncate">View Profile</p>
                    </div>
                </Link>
            </div>
        </aside>
    );
}
