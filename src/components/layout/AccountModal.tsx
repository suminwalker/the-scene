"use client";

import { useState, useEffect } from "react";
import { Mail, Check, Building2, LogOut, MessageCircle, Loader2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AccountModalProps {
    activeModal: string | null;
    onClose: () => void;
}

export function AccountModal({ activeModal, onClose }: AccountModalProps) {
    const [loggingOut, setLoggingOut] = useState(false);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [inviteRemaining, setInviteRemaining] = useState<number>(0);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const supabase = createClient();

    // Fetch or generate invite code when the Invites modal opens
    useEffect(() => {
        if (activeModal !== "Invites") return;

        const fetchInvite = async () => {
            setInviteLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setInviteLoading(false);
                    return;
                }

                // Try to get existing invite
                const { data: existing } = await supabase
                    .rpc("get_my_invite", { p_user_id: session.user.id });

                if (existing) {
                    setInviteCode(existing.code);
                    setInviteRemaining(existing.remaining);
                } else {
                    // Generate a new invite code
                    const { data: generated } = await supabase
                        .rpc("generate_invite_code", { p_user_id: session.user.id });

                    if (generated) {
                        setInviteCode(generated.code);
                        setInviteRemaining(generated.remaining);
                    }
                }
            } catch (err) {
                console.error("Error fetching invite:", err);
            } finally {
                setInviteLoading(false);
            }
        };

        fetchInvite();
    }, [activeModal]);

    if (!activeModal) return null;

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await supabase.auth.signOut();
            window.location.href = "/";
        } catch (err) {
            console.error("Logout error:", err);
            setLoggingOut(false);
        }
    };

    const handleCopyCode = () => {
        if (!inviteCode) return;
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-black/5 p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors text-sm font-medium"
                >
                    ✕
                </button>

                {/* Invites */}
                {activeModal === "Invites" && (
                    <div className="space-y-6 text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                            <Mail className="w-8 h-8 text-zinc-700" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-black">Invite your friends</h3>
                            <p className="text-sm text-zinc-400 px-4">
                                {inviteLoading
                                    ? "Loading your invite code..."
                                    : `Share the scene with your inner circle. You have ${inviteRemaining} invite${inviteRemaining !== 1 ? "s" : ""} left.`
                                }
                            </p>
                        </div>
                        {inviteLoading ? (
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-black/5 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                            </div>
                        ) : inviteCode ? (
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-black/5 flex justify-between items-center">
                                <code className="text-black font-mono font-bold text-sm">{inviteCode}</code>
                                <button
                                    onClick={handleCopyCode}
                                    className={cn(
                                        "text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-all flex items-center gap-1.5",
                                        copied
                                            ? "bg-green-500 text-white"
                                            : "bg-black text-white"
                                    )}
                                >
                                    {copied ? (
                                        <><Check className="w-3 h-3" /> Copied</>
                                    ) : (
                                        <><Copy className="w-3 h-3" /> Copy</>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400">Could not load invite code.</p>
                        )}
                        {inviteCode && inviteRemaining === 0 && (
                            <p className="text-xs text-zinc-400 italic">All invites used! Stay tuned for more.</p>
                        )}
                    </div>
                )}

                {/* FAQ */}
                {activeModal === "FAQ" && (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                        <h3 className="text-xl font-bold text-black sticky top-0 bg-white py-2">FAQ</h3>
                        <div className="space-y-4">
                            {[
                                { q: "How do I rank a venue?", a: "Find any venue on the map or search, and tap the 'Review' button to add your voice." },
                                { q: "What is Scene Rank?", a: "Your rank is calculated based on venue variety, frequency, and the weight of your reviews within The Scene community." },
                                { q: "Are reviews anonymous?", a: "No, The Scene is built on trust. All reviews are tied to your public profile." },
                            ].map((item, i) => (
                                <div key={i} className="p-5 bg-zinc-50 rounded-2xl border border-black/5 space-y-2">
                                    <p className="text-sm font-bold text-black">{item.q}</p>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Home City */}
                {activeModal === "City" && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-black">Select Home City</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {["New York, NY"].map((city) => (
                                <button
                                    key={city}
                                    onClick={onClose}
                                    className="w-full p-4 flex justify-between items-center bg-white hover:bg-zinc-50 rounded-2xl border border-black/10 transition-colors shadow-sm"
                                >
                                    <span className="text-black font-medium">{city}</span>
                                    {city === "New York, NY" && <Check className="w-5 h-5 text-black" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Logout */}
                {activeModal === "Logout" && (
                    <div className="space-y-8 text-center py-4">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto relative">
                            <div className="absolute inset-0 bg-red-500/5 rounded-full animate-ping" />
                            <div className="relative w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-red-100">
                                <LogOut className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-black tracking-tight">Logging Out?</h3>
                            <p className="text-sm text-zinc-400 px-10 leading-relaxed font-medium">
                                You&apos;ll need to sign back in to access your saved lists and taste profile.
                            </p>
                        </div>
                        <div className="space-y-3 pt-4">
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="w-full py-5 bg-[#FF3B30] text-white rounded-2xl font-bold text-base shadow-[0_8px_30px_rgb(255,59,48,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : "Logout"}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-zinc-50 text-zinc-500 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
