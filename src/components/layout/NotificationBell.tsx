"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, UserPlus, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    data: Record<string, any>;
    read: boolean;
    created_at: string;
}

export function NotificationBell() {
    const supabase = createClient();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch unread count on mount
    useEffect(() => {
        const fetchUnread = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: count } = await supabase
                .rpc("get_unread_notification_count", { p_user_id: session.user.id });

            if (typeof count === "number") {
                setUnreadCount(count);
            }
        };

        fetchUnread();

        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpen = async () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { data } = await supabase
                    .rpc("get_my_notifications", { p_user_id: session.user.id, p_limit: 20 });

                setNotifications(data || []);

                // Mark all as read
                if (unreadCount > 0) {
                    await supabase.rpc("mark_notifications_read", { p_user_id: session.user.id });
                    setUnreadCount(0);
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "invite_redeemed": return <UserPlus className="w-4 h-4 text-green-500" />;
            case "new_follower": return <UserPlus className="w-4 h-4 text-blue-500" />;
            default: return <Mail className="w-4 h-4 text-zinc-400" />;
        }
    };

    const getTimeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-lg hover:bg-black/5 transition-colors group"
            >
                <Bell className={cn(
                    "w-5 h-5 transition-colors",
                    isOpen ? "text-black" : "text-zinc-400 group-hover:text-black"
                )} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white leading-none">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-black/5 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
                        <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-zinc-900">
                            Notifications
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-black/5">
                            <X className="w-4 h-4 text-zinc-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-6 text-center">
                                <div className="w-5 h-5 border-2 border-zinc-200 border-t-black rounded-full animate-spin mx-auto" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center space-y-2">
                                <Bell className="w-8 h-8 text-zinc-200 mx-auto" />
                                <p className="text-sm text-zinc-400">No notifications yet</p>
                                <p className="text-xs text-zinc-300">
                                    You&apos;ll be notified when friends join via your invite
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-black/5">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "flex items-start gap-3 px-4 py-3 transition-colors",
                                            !n.read && "bg-blue-50/50"
                                        )}
                                    >
                                        <div className="mt-0.5 w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center flex-shrink-0">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-zinc-900 leading-snug">
                                                {n.title}
                                            </p>
                                            {n.body && (
                                                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                                                    {n.body}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-zinc-300 font-mono mt-1">
                                                {getTimeAgo(n.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
