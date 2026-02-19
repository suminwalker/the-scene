"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Compass, Map as MapIcon, MessageCircle, User, LogOut,
    Mail, Settings, Building2, Lock, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/supabase/client";
import { AccountModal } from "./AccountModal";
import { NotificationBell } from "./NotificationBell";

export function DesktopSidebar() {
    const pathname = usePathname();
    const { session } = useSession();
    const user = session?.user;
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const tabs = [
        { name: "Feed", href: "/discover", icon: Compass },
        { name: "Map", href: "/map", icon: MapIcon },
        { name: "Messages", href: "/messages", icon: MessageCircle },
        { name: "Profile", href: "/profile", icon: User },
    ];

    // Items that open modals
    const modalItems = [
        { icon: Mail, label: "Invites", action: "Invites" },
        { icon: Building2, label: "Home City", action: "City" },
        { icon: MessageCircle, label: "FAQ", action: "FAQ" },
    ];

    // Items that navigate to pages
    const linkItems = [
        { icon: Settings, label: "Settings", href: "/settings" },
        { icon: Lock, label: "Password", href: "/reset-password" },
        { icon: FileText, label: "Privacy", href: "/privacy" },
    ];

    return (
        <>
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-black/5 bg-white z-50">
                {/* Logo Area */}
                <div className="p-8 pb-8 flex items-center justify-between">
                    <h1 className="text-xl font-mono uppercase tracking-[0.3em] font-black text-black">
                        The Scene
                    </h1>
                    <NotificationBell />
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

                        {/* Modal trigger items */}
                        {modalItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setActiveModal(item.action)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group text-left hover:bg-black/5"
                            >
                                <item.icon className="w-4 h-4 text-zinc-400 group-hover:text-black" />
                                <span className="text-sm font-medium text-zinc-600 group-hover:text-black">
                                    {item.label}
                                </span>
                            </button>
                        ))}

                        {/* Link navigation items */}
                        {linkItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group text-left",
                                        isActive ? "bg-black/5" : "hover:bg-black/5"
                                    )}
                                >
                                    <item.icon className={cn("w-4 h-4", isActive ? "text-black" : "text-zinc-400 group-hover:text-black")} />
                                    <span className={cn("text-sm font-medium", isActive ? "text-black" : "text-zinc-600 group-hover:text-black")}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* Logout */}
                        <button
                            onClick={() => setActiveModal("Logout")}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group text-left hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                            <span className="text-sm font-medium text-red-500 group-hover:text-red-600">
                                Log Out
                            </span>
                        </button>
                    </div>
                </nav>

                {/* User Footer */}
                <div className="p-6 border-t border-black/5 mt-auto bg-white">
                    <Link href={user ? `/profile/${user.user_metadata?.username || 'user'}` : '/login'} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 hover:shadow-sm transition-all cursor-pointer group border border-transparent hover:border-black/5">
                        <div className="w-10 h-10 rounded-full bg-black/5 overflow-hidden flex items-center justify-center text-zinc-400">
                            {user?.user_metadata?.photo ? (
                                <img src={user.user_metadata.photo} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zinc-900 truncate">
                                {user?.user_metadata?.full_name || user?.email || "Guest User"}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                                {user ? "View Profile" : "Log in"}
                            </p>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Account Modal */}
            <AccountModal activeModal={activeModal} onClose={() => setActiveModal(null)} />
        </>
    );
}
