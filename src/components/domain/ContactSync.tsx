"use client";

import { useState, useEffect } from "react";
// Removed Button import - using native button with Tailwind
import { createClient } from "@/lib/supabase/client";
import { Loader2, Users, Search, Link as LinkIcon, Check } from "lucide-react";
// Removed sonner import - using alert for MVP

interface MatchedUser {
    id: string;
    name: string;
    handle: string;
    avatar_url: string;
    is_following?: boolean;
}

export function ContactSync() {
    const [isSupported, setIsSupported] = useState(false);
    const [loading, setLoading] = useState(false);
    const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
    const [hasSynced, setHasSynced] = useState(false);
    const [copied, setCopied] = useState(false);

    // Create supabase client instance
    const supabase = createClient();

    useEffect(() => {
        // Check for Contact Picker API support
        if (typeof window !== "undefined" && "contacts" in navigator && "ContactsManager" in window) {
            setIsSupported(true);
        }
    }, []);

    const handleSync = async () => {
        setLoading(true);
        try {
            const props = ["tel"];
            const opts = { multiple: true };

            // @ts-ignore - native API
            const contacts = await navigator.contacts.select(props, opts);

            if (!contacts || contacts.length === 0) {
                setLoading(false);
                return;
            }

            // Extract and normalize phone numbers
            const phones: string[] = [];
            contacts.forEach((contact: any) => {
                contact.tel.forEach((t: string) => {
                    // Basic normalization: remove spaces, dashes, parentheses
                    const clean = t.replace(/\D/g, '');
                    if (clean.length >= 10) phones.push(clean);
                });
            });

            if (phones.length === 0) {
                alert("No valid phone numbers found in selected contacts.");
                setLoading(false);
                return;
            }

            // Match against database
            const { data: matched, error } = await supabase
                .rpc('match_phone_numbers', { phones });

            if (error) {
                console.error("RPC Error:", error);
                // Fallback if RPC fails/doesn't exist yet: just alert
                alert("Could not sync contacts at this time. Please try again later.");
                setLoading(false);
                return;
            }

            if (matched && matched.length > 0) {
                // Check if already following
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { data: follows } = await supabase
                        .from('follows')
                        .select('following_id')
                        .eq('follower_id', session.user.id);

                    const followingIds = new Set(follows?.map(f => f.following_id));

                    const processed = matched.filter((u: any) => u.id !== session.user.id).map((u: any) => ({
                        ...u,
                        is_following: followingIds.has(u.id)
                    }));

                    setMatchedUsers(processed);
                    if (processed.length === 0) {
                        alert("No new friends found on The Scene yet.");
                    }
                }
            } else {
                alert("No friends found on The Scene from your contacts yet.");
            }

            setHasSynced(true);

        } catch (err: any) {
            console.error("Error syncing contacts:", err);
            alert("Failed to sync contacts.");
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (userId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { error } = await supabase
                .from('follows')
                .insert({ follower_id: session.user.id, following_id: userId });

            if (error) throw error;

            setMatchedUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, is_following: true } : u
            ));

        } catch (err) {
            console.error(err);
            alert("Failed to follow user.");
        }
    };

    const handleCopyLink = () => {
        const link = "https://thescene.app/invite"; // Replace with real dynamic link if available
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Shared button styles
    const buttonBaseClass = "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 shadow-sm active:scale-95";

    // UI for Supported Browsers (Android/Chrome)
    if (isSupported) {
        return (
            <div className="space-y-4">
                {!hasSynced && (
                    <button
                        onClick={handleSync}
                        disabled={loading}
                        className={`${buttonBaseClass} w-full bg-black text-white hover:bg-zinc-800`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Users className="w-4 h-4 mr-2" />}
                        Sync Contacts
                    </button>
                )}

                {hasSynced && matchedUsers.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm font-bold text-zinc-900">Found Matches</p>
                        <div className="space-y-2">
                            {matchedUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-200 rounded-full overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{user.name}</p>
                                            <p className="text-xs text-zinc-500">@{user.handle}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => !user.is_following && handleFollow(user.id)}
                                        disabled={user.is_following}
                                        className={`${buttonBaseClass} h-8 px-3 text-xs ${user.is_following ? "bg-white text-zinc-500 border border-zinc-200 shadow-none" : "bg-black text-white"}`}
                                    >
                                        {user.is_following ? "Following" : "Follow"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Fallback UI for unsupported browsers (iOS Safari / Desktop)
    return (
        <div className="space-y-3">
            <button
                onClick={handleCopyLink}
                className={`${buttonBaseClass} w-full bg-white text-foreground border border-black/10 hover:bg-zinc-50`}
            >
                {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy Invite Link"}
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-zinc-400 font-mono tracking-widest">Or</span>
                </div>
            </div>

            <p className="text-xs text-center text-zinc-500">
                Search specifically by username above
            </p>
        </div>
    );
}
