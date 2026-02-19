"use client";

import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { useSession } from "@/lib/supabase/client";
import {
    User, Bell, Palette, AlertTriangle, ChevronRight, Lock
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { session } = useSession();
    const user = session?.user;

    return (
        <ResponsiveContainer>
            <div className="flex-1 overflow-y-auto bg-white">
                {/* Header */}
                <div className="px-8 pt-10 pb-6 border-b border-black/5">
                    <h1 className="text-3xl font-bold tracking-tight text-black">Settings</h1>
                    <p className="text-sm text-zinc-400 mt-1">Manage your account preferences</p>
                </div>

                <div className="max-w-2xl px-8 py-8 space-y-10">
                    {/* Account Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                            <User className="w-4 h-4 text-zinc-400" />
                            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">Account</h2>
                        </div>

                        <div className="bg-zinc-50 rounded-2xl border border-black/5 divide-y divide-black/5 overflow-hidden">
                            {/* Email */}
                            <div className="flex items-center justify-between p-5">
                                <div>
                                    <p className="text-sm font-medium text-black">Email</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">{user?.email || "Not set"}</p>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest">Read only</span>
                            </div>

                            {/* Password link */}
                            <Link href="/reset-password" className="flex items-center justify-between p-5 hover:bg-zinc-100 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-zinc-400" />
                                    <p className="text-sm font-medium text-black">Change Password</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                            </Link>
                        </div>
                    </section>

                    {/* Notifications Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                            <Bell className="w-4 h-4 text-zinc-400" />
                            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">Notifications</h2>
                        </div>

                        <div className="bg-zinc-50 rounded-2xl border border-black/5 divide-y divide-black/5 overflow-hidden">
                            <ToggleRow
                                label="Push Notifications"
                                description="Get notified about new followers, reviews, and invites"
                                defaultChecked={true}
                            />
                            <ToggleRow
                                label="Email Digest"
                                description="Weekly summary of activity in your city"
                                defaultChecked={false}
                            />
                        </div>
                        <p className="text-[10px] text-zinc-300 font-mono px-1">Notification preferences are visual only. Persistence coming soon.</p>
                    </section>

                    {/* Display Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                            <Palette className="w-4 h-4 text-zinc-400" />
                            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">Display</h2>
                        </div>

                        <div className="bg-zinc-50 rounded-2xl border border-black/5 divide-y divide-black/5 overflow-hidden">
                            <div className="flex items-center justify-between p-5">
                                <div>
                                    <p className="text-sm font-medium text-black">Theme</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">Light mode is the default experience</p>
                                </div>
                                <span className="text-xs font-mono text-zinc-300 bg-zinc-100 px-3 py-1 rounded-full">Light</span>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <h2 className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">Danger Zone</h2>
                        </div>

                        <div className="bg-red-50/50 rounded-2xl border border-red-100 overflow-hidden">
                            <div className="flex items-center justify-between p-5">
                                <div>
                                    <p className="text-sm font-medium text-red-600">Delete Account</p>
                                    <p className="text-xs text-red-400 mt-0.5">Permanently remove your data. This cannot be undone.</p>
                                </div>
                                <button className="text-xs font-bold text-red-500 bg-white border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </ResponsiveContainer>
    );
}

// Toggle component for settings switches
function ToggleRow({ label, description, defaultChecked }: { label: string; description: string; defaultChecked: boolean }) {
    return (
        <label className="flex items-center justify-between p-5 cursor-pointer hover:bg-zinc-100 transition-colors">
            <div>
                <p className="text-sm font-medium text-black">{label}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
            </div>
            <div className="relative">
                <input
                    type="checkbox"
                    defaultChecked={defaultChecked}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 rounded-full peer peer-checked:bg-black transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform" />
            </div>
        </label>
    );
}
