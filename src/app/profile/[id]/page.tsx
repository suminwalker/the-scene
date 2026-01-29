"use client";

import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import {
    ArrowLeft, Bell, Share, Instagram, Music2,
    ChevronRight, Trophy, Flame, TrendingUp, Menu, X,
    Mail, Gift, GraduationCap, Settings, Calendar, Crown,
    MessageCircle, Building2, AlertTriangle, HeartOff,
    CloudUpload, Lock, FileText, LogOut, Check, Camera
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ActivityFeedItem } from "@/components/domain/ActivityFeedItem";

interface ProfileUser {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    bio: string;
    instagram: string;
    tiktok: string;
    memberSince: string;
    followers: string;
    following: string;
    rank: string;
    streak: string;
    lastHandleChange: number;
    isFollowing: boolean;
    challenge: { progress: number; total: number };
    stats: { been: number; wantToTry: number; mutual: number };
    activity: ActivityItem[];
}

interface ActivityItem {
    id: string;
    action: string;
    user: {
        id: string;
        name: string;
        avatar: string;
    };
    venue: string;
    timestamp: string;
    category?: string;
    location?: string;
    likes?: number;
    comments?: number;
}

// Mock global store for persistence in session
const SESSION_USERS: Record<string, ProfileUser> = {
    suminwalker: {
        id: "suminwalker",
        name: "Sumin Walker",
        handle: "suminwalker",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
        bio: "User #1",
        instagram: "",
        tiktok: "",
        memberSince: "January 2026",
        followers: "0",
        following: "0",
        rank: "N/A",
        streak: "0 weeks",
        lastHandleChange: 0,
        isFollowing: false,
        challenge: { progress: 0, total: 250 },
        stats: { been: 0, wantToTry: 0, mutual: 0 },
        activity: []
    }
};

const AVATAR_PRESETS = [
    "/avatars/presets/avatar1.png",
    "/avatars/presets/avatar2.png",
    "/avatars/presets/avatar3.png",
    "/avatars/presets/avatar4.png",
    "/avatars/presets/avatar5.png",
    "/avatars/presets/avatar6.png",
    "/avatars/presets/avatar7.png",
    "/avatars/presets/avatar8.png",
    "/avatars/presets/avatar9.png",
    "/avatars/presets/avatar10.png",
];

export default function ProfilePage() {
    const params = useParams();
    const id = params.id as string;

    // For demo purposes, assume 'suminwalker' is the currentUser
    const isOwner = id === "suminwalker";
    const initialUser = (SESSION_USERS[id] || SESSION_USERS.suminwalker) as ProfileUser;

    // UI State
    const [activeTab, setActiveTab] = useState<"activity" | "taste">("activity");
    const [isEditing, setIsEditing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeMenuModal, setActiveMenuModal] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(initialUser.isFollowing);
    const [notified, setNotified] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: initialUser.name,
        handle: initialUser.handle,
        bio: initialUser.bio,
        avatar: initialUser.avatar,
        instagram: initialUser.instagram,
        tiktok: initialUser.tiktok
    });

    const [lastHandleChange, setLastHandleChange] = useState(initialUser.lastHandleChange);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        if (formData.handle !== initialUser.handle && (now - lastHandleChange < THIRTY_DAYS_MS)) {
            const daysLeft = Math.ceil((THIRTY_DAYS_MS - (now - lastHandleChange)) / (1000 * 60 * 60 * 24));
            setError(`You can change your handle again in ${daysLeft} days.`);
            return;
        }

        if (formData.handle !== initialUser.handle) {
            setLastHandleChange(now);
        }

        // Persist to session store
        SESSION_USERS[id] = {
            ...initialUser,
            ...formData,
            lastHandleChange: formData.handle !== initialUser.handle ? now : lastHandleChange
        };

        setIsEditing(false);
        setError(null);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `${user.name}'s Profile on The Scene`,
                    text: `Check out ${user.name}'s profile on The Scene!`,
                    url: window.location.href,
                });
            } catch {
                // Fallback to clipboard if share fails
                copyToClipboard();
            }
        } else {
            copyToClipboard();
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            // Last resort
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            alert("Profile link copied!");
        }
    };

    const user = {
        ...initialUser,
        ...formData,
        isFollowing
    };

    const handleMenuAction = (action: string) => {
        setIsMenuOpen(false);
        setActiveMenuModal(action);
    };

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            window.location.href = "/";
        }
    };

    return (
        <MobileContainer>
            {/* Menu Action Modals */}
            {/* Menu Action Modals */}
            {activeMenuModal && (
                <div className="fixed inset-0 z-[110] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveMenuModal(null)} />
                    <div className="relative w-full max-w-[480px] bg-white rounded-t-[32px] border-t border-black/5 p-8 pt-4 pb-12 animate-in slide-in-from-bottom duration-300">
                        <div className="w-12 h-1 bg-zinc-100 rounded-full mx-auto mb-6" />

                        {activeMenuModal === "Invites" && (
                            <div className="space-y-6 text-center">
                                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                                    <Mail className="w-8 h-8 text-accent" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-foreground">Invite your friends</h3>
                                    <p className="text-sm text-zinc-400 px-8">Share the scene with your inner circle. You have 2 invites left.</p>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-black/5 flex justify-between items-center">
                                    <code className="text-accent font-mono font-bold">SCENE-SUMIN-2026</code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText("SCENE-SUMIN-2026");
                                            alert("Invite code copied!");
                                        }}
                                        className="text-xs font-bold text-white bg-zinc-800 px-4 py-2 rounded-full active:scale-95 transition-all"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeMenuModal === "School" && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-foreground">Add Your School</h3>
                                <div className="space-y-4">
                                    <input
                                        placeholder="Enter your university name..."
                                        className="w-full bg-zinc-50 border border-black/5 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-accent"
                                    />
                                    <button
                                        onClick={() => setActiveMenuModal(null)}
                                        className="w-full py-4 bg-black text-white rounded-2xl font-bold active:scale-95 transition-all"
                                    >
                                        Save School
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeMenuModal === "City" && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-foreground">Select Home City</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {["New York, NY", "Los Angeles, CA", "Chicago, IL", "Miami, FL", "London, UK"].map((city) => (
                                        <button
                                            key={city}
                                            onClick={() => setActiveMenuModal(null)}
                                            className="w-full p-4 flex justify-between items-center bg-zinc-50 hover:bg-zinc-100 rounded-2xl border border-black/5 transition-colors"
                                        >
                                            <span className="text-foreground font-medium">{city}</span>
                                            {city === "New York, NY" && <Check className="w-5 h-5 text-accent" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMenuModal === "Dietary" && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-foreground">Dietary Restrictions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {["Vegan", "Vegetarian", "Gluten Free", "Dairy Free", "Nut Allergy", "Shellfish Free"].map((tag) => (
                                        <button
                                            key={tag}
                                            className="p-4 bg-zinc-50 hover:border-accent border border-black/5 rounded-2xl text-sm font-medium text-zinc-600 transition-all"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setActiveMenuModal(null)}
                                    className="w-full py-4 bg-black text-white rounded-2xl font-bold"
                                >
                                    Update Profile
                                </button>
                            </div>
                        )}

                        {["Reservations", "Subscriptions", "Goal", "Import"].includes(activeMenuModal) && (
                            <div className="space-y-6 text-center py-4">
                                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                                    <TrendingUp className="w-8 h-8 text-zinc-400" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-foreground">Coming Soon</h3>
                                    <p className="text-sm text-zinc-500">This feature is being curated and will be available in the 2026 Spring update.</p>
                                </div>
                                <button
                                    onClick={() => setActiveMenuModal(null)}
                                    className="w-full py-4 bg-zinc-100 text-foreground rounded-2xl font-bold mt-4"
                                >
                                    Got it
                                </button>
                            </div>
                        )}

                        {activeMenuModal === "FAQ" && (
                            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                                <h3 className="text-xl font-bold text-foreground sticky top-0 bg-white py-2">FAQ</h3>
                                <div className="space-y-4">
                                    {[
                                        { q: "How do I rank a venue?", a: "Find any venue on the map or search, and tap the 'Review' button to add your voice." },
                                        { q: "What is Scene Rank?", a: "Your rank is calculated based on venue variety, frequency, and the weight of your reviews within The Scene community." },
                                        { q: "Are reviews anonymous?", a: "No, The Scene is built on trust. All reviews are tied to your public profile." }
                                    ].map((item, i) => (
                                        <div key={i} className="p-5 bg-zinc-50 rounded-2xl border border-black/5 space-y-2">
                                            <p className="text-sm font-bold text-foreground">{item.q}</p>
                                            <p className="text-xs text-zinc-400 leading-relaxed">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMenuModal === "Logout" && (
                            <div className="space-y-8 text-center py-6">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto relative">
                                    <div className="absolute inset-0 bg-red-500/5 rounded-full animate-ping" />
                                    <div className="relative w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-red-100">
                                        <LogOut className="w-6 h-6 text-red-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-foreground tracking-tight">Logging Out?</h3>
                                    <p className="text-sm text-zinc-400 px-10 leading-relaxed font-medium">You&apos;ll need to sign back in to access your saved lists and taste profile.</p>
                                </div>
                                <div className="space-y-3 pt-4">
                                    <button
                                        onClick={() => window.location.href = "/"}
                                        className="w-full py-5 bg-[#FF3B30] text-white rounded-2xl font-bold text-base shadow-[0_8px_30px_rgb(255,59,48,0.3)] active:scale-[0.98] transition-all"
                                    >
                                        Logout
                                    </button>
                                    <button
                                        onClick={() => setActiveMenuModal(null)}
                                        className="w-full py-4 bg-zinc-50 text-zinc-500 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Default Fallback */}
                        {!["Invites", "School", "City", "Dietary", "FAQ", "Logout", "Reservations", "Subscriptions", "Goal", "Import"].includes(activeMenuModal) && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-foreground">{activeMenuModal}</h3>
                                <p className="text-sm text-zinc-400">Settings and information regarding {activeMenuModal.toLowerCase()} can be managed here. Full interface coming soon.</p>
                                <button
                                    onClick={() => setActiveMenuModal(null)}
                                    className="w-full py-4 bg-zinc-100 text-foreground rounded-2xl font-bold"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Menu Drawer */}
            <div
                className={cn(
                    "fixed inset-0 z-[100] transition-opacity duration-300 pointer-events-none",
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
                )}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                <div className={cn(
                    "absolute right-0 top-0 bottom-0 w-[280px] bg-white text-black transition-transform duration-300 transform shadow-2xl overflow-y-auto",
                    isMenuOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="p-4 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white z-10">
                        <h3 className="text-xl font-bold text-zinc-900">Menu</h3>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-zinc-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="py-2">
                        {[
                            { icon: Mail, label: "You have 2 invites left!", color: "text-zinc-600", action: "Invites" },
                            { icon: Gift, label: "Unlock Features", color: "text-zinc-600", action: "Unlock" },
                            { icon: GraduationCap, label: "Add Your School", color: "text-zinc-600", action: "School" },
                            { icon: Settings, label: "Settings", color: "text-zinc-600", action: "OverallSettings" },
                            { icon: Crown, label: "Your Subscriptions", color: "text-zinc-600", action: "Subscriptions" },
                            { icon: MessageCircle, label: "FAQ", color: "text-zinc-600", action: "FAQ" },
                            { icon: Building2, label: "Home City: New York, NY", color: "text-zinc-600", action: "City" },
                            { icon: Lock, label: "Change Password", color: "text-zinc-600", action: "Password" },
                            { icon: FileText, label: "Privacy Policy", color: "text-zinc-600", action: "Privacy" },
                            { icon: LogOut, label: "Log Out", color: "text-red-500", action: "Logout" },
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => handleMenuAction(item.action)}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 group"
                            >
                                <item.icon className={cn("w-5 h-5", item.color)} />
                                <span className="text-sm font-medium text-zinc-800 group-hover:text-black">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
            />

            <div className="flex-1 overflow-y-auto pb-24 relative bg-background">
                {/* Header Nav */}
                <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md px-4 py-4 flex justify-between items-center border-b border-black/5">
                    {!isOwner ? (
                        <Link href="/discover" className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                    ) : (
                        <div className="w-10" /> // Spacer to balance header
                    )}

                    {!isEditing ? (
                        <h2 className="text-sm font-bold tracking-tight">{user.name}</h2>
                    ) : (
                        <h2 className="text-sm font-bold tracking-tight text-accent">Editing Profile</h2>
                    )}

                    <div className="flex gap-2">
                        {!isEditing ? (
                            <>
                                {!isOwner && (
                                    <button
                                        onClick={() => setNotified(!notified)}
                                        className={cn("p-2 transition-colors", notified ? "text-accent" : "text-foreground/70 hover:text-foreground")}
                                    >
                                        <Bell className={cn("w-5 h-5", notified && "fill-accent")} />
                                    </button>
                                )}
                                <button
                                    onClick={handleShare}
                                    className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                                >
                                    <Share className="w-5 h-5" />
                                </button>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsMenuOpen(true)}
                                        className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                                    >
                                        <Menu className="w-5 h-5" />
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={handleSave}
                                className="px-4 py-1.5 bg-accent text-white text-xs font-bold rounded-full"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Banner/Info */}
                <div className="px-6 pt-8 pb-4 text-center space-y-4">
                    <div className="relative inline-block">
                        <div
                            className="w-24 h-24 mx-auto rounded-full bg-zinc-100 border-4 border-background shadow-xl bg-cover bg-center overflow-hidden"
                            style={{ backgroundImage: `url(${formData.avatar})` }}
                        />
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:bg-black/60"
                            >
                                <Camera className="w-6 h-6 text-white" />
                            </button>
                        )}
                    </div>

                    {isEditing && (
                        <div className="space-y-4 px-2">
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] text-center">Character Presets</p>
                            <div className="flex overflow-x-auto gap-4 py-2 px-4 no-scrollbar scroll-smooth">
                                {AVATAR_PRESETS.map((preset, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setFormData({ ...formData, avatar: preset })}
                                        className={cn(
                                            "relative flex-shrink-0 w-16 h-16 rounded-2xl bg-zinc-50 border-2 transition-all active:scale-95 overflow-hidden",
                                            formData.avatar === preset ? "border-accent scale-105 shadow-[0_0_15px_rgba(255,107,0,0.3)]" : "border-black/5 grayscale-[0.3]"
                                        )}
                                    >
                                        <img src={preset} className="w-full h-full object-cover" alt={`Preset ${index + 1}`} />
                                        {formData.avatar === preset && (
                                            <div className="absolute top-1 right-1 bg-accent rounded-full p-0.5 shadow-lg">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {!isEditing ? (
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground tracking-widest uppercase font-mono">@{user.handle}</p>
                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">Member since {user.memberSince}</p>
                                <p className="text-sm font-serif italic text-zinc-300 py-1">{user.bio}</p>
                            </div>
                        ) : (
                            <div className="space-y-3 px-4 text-left">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-zinc-50 border border-black/5 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Username</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-2 text-zinc-500 text-sm">@</span>
                                        <input
                                            value={formData.handle}
                                            onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                                            className="w-full bg-zinc-50 border border-black/5 rounded-xl pl-8 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                    {error && <p className="text-[10px] text-red-500 pt-1 font-mono">{error}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-zinc-50 border border-black/5 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent h-20 resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-zinc-500 uppercase">Instagram</label>
                                        <input
                                            placeholder="handle"
                                            value={formData.instagram}
                                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                            className="w-full bg-zinc-50 border border-black/5 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-zinc-500 uppercase">TikTok</label>
                                        <input
                                            placeholder="handle"
                                            value={formData.tiktok}
                                            onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                                            className="w-full bg-zinc-50 border border-black/5 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center gap-4 py-2">
                            <Link
                                href={isEditing ? "#" : `https://instagram.com/${user.instagram}`}
                                className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center text-zinc-400 hover:text-accent hover:border-accent transition-all"
                            >
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link
                                href={isEditing ? "#" : `https://tiktok.com/@${user.tiktok}`}
                                className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center text-zinc-400 hover:text-accent hover:border-accent transition-all"
                            >
                                <Music2 className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex justify-center gap-12 py-4">
                        <div className="text-center">
                            <p className="text-lg font-black text-foreground">{user.followers}</p>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Followers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-foreground">{user.following}</p>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Following</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-foreground">{user.rank}</p>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Rank</p>
                        </div>
                    </div>

                    {/* Owner UI Repositioned Buttons */}
                    {isOwner && !isEditing && (
                        <div className="flex gap-3 px-6 pt-2 pb-6">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 py-3 px-4 rounded-xl border border-black/10 text-foreground text-sm font-bold hover:bg-black/5 transition-colors"
                            >
                                Edit profile
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex-1 py-3 px-4 rounded-xl border border-black/10 text-foreground text-sm font-bold hover:bg-black/5 transition-colors"
                            >
                                Share profile
                            </button>
                        </div>
                    )}

                    {!isOwner && (
                        <div className="flex gap-3 px-4 pt-2">
                            <button
                                onClick={() => setIsFollowing(!isFollowing)}
                                className={cn(
                                    "flex-1 py-3.5 rounded-2xl font-bold text-sm tracking-tight active:scale-95 transition-all",
                                    isFollowing ? "bg-black text-white" : "bg-accent text-white"
                                )}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                            <button className="p-3.5 bg-zinc-100 text-foreground rounded-2xl font-bold text-sm active:scale-95 transition-all border border-black/5">
                                <ChevronRight className="w-5 h-5 rotate-90" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Lists Sections */}
                <div className="px-4 py-6 space-y-2">
                    {[
                        { label: "Been", count: user.stats.been, icon: "✅", href: "/saved" },
                        { label: "Want to Try", count: user.stats.wantToTry, icon: "🔖", href: "/saved" },
                        { label: "Places you both want to try", count: user.stats.mutual, icon: "✨", href: "/saved" }
                    ].map((item) => (
                        <Link key={item.label} href={item.href} className="w-full flex justify-between items-center p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl border border-black/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-sm font-semibold text-zinc-200">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-foreground">{item.count}</span>
                                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Badges Cards */}
                <div className="grid grid-cols-2 gap-3 px-4 py-2">
                    <button
                        onClick={() => alert("Leaderboard coming soon!")}
                        className="p-5 rounded-3xl bg-zinc-50 border border-black/5 space-y-2 text-left hover:bg-zinc-100 transition-colors"
                    >
                        <Trophy className="w-6 h-6 text-accent mb-2" />
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Rank on The Scene</p>
                        <p className="text-xl font-black text-accent">{user.rank}</p>
                    </button>
                    <button
                        onClick={() => alert("Keep the streak alive!")}
                        className="p-5 rounded-3xl bg-zinc-50 border border-black/5 space-y-2 text-left hover:bg-zinc-100 transition-colors"
                    >
                        <Flame className="w-6 h-6 text-orange-500 mb-2" />
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Current Streak</p>
                        <p className="text-xl font-black text-orange-500">{user.streak}</p>
                    </button>
                </div>

                {/* Challenge Card */}
                <div className="px-4 py-6">
                    <div className="p-6 rounded-[32px] bg-zinc-50 border border-black/5 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-foreground/50 tracking-[0.15em] font-mono uppercase">2026 Venue Challenge</h4>
                                <p className="text-lg font-bold text-foreground leading-tight">
                                    {user.challenge.progress} of {user.challenge.total} venues
                                </p>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent transition-all duration-1000"
                                style={{ width: `${(user.challenge.progress / user.challenge.total) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono tracking-widest">
                            <span>339 days left</span>
                            <button
                                onClick={() => alert("Goal setting coming soon in the 2026 update!")}
                                className="text-accent hover:underline"
                            >
                                Set your 2026 goal &gt;
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="mt-4 border-t border-black/5">
                    <div className="flex px-4 pt-4">
                        <button
                            onClick={() => setActiveTab("activity")}
                            className={cn(
                                "flex-1 py-3 text-[11px] font-mono uppercase tracking-[0.2em] border-b-2 transition-all",
                                activeTab === "activity" ? "border-foreground text-foreground" : "border-transparent text-zinc-400"
                            )}
                        >
                            📝 Recent Activity
                        </button>
                        <button
                            onClick={() => setActiveTab("taste")}
                            className={cn(
                                "flex-1 py-3 text-[11px] font-mono uppercase tracking-[0.2em] border-b-2 transition-all",
                                activeTab === "taste" ? "border-foreground text-foreground" : "border-transparent text-zinc-400"
                            )}
                        >
                            📊 Taste Profile
                        </button>
                    </div>

                    <div className="px-4 pt-6 divide-y divide-black/5">
                        {activeTab === "activity" ? (
                            user.activity.length > 0 ? (
                                user.activity.map((item: ActivityItem) => (
                                    <ActivityFeedItem key={item.id} {...item} />
                                ))
                            ) : (
                                <div className="py-20 text-center space-y-2">
                                    <p className="text-zinc-500 font-serif italic">No recent activity.</p>
                                </div>
                            )
                        ) : (
                            <div className="py-8 space-y-6">
                                {user.stats.been > 0 ? (
                                    <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest">Last 30 Days</p>
                                            <Share className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-indigo-950 tracking-tight">Top 36% Rank</h3>
                                        <p className="text-xs text-indigo-700">New York</p>
                                        <div className="flex gap-8 pt-2">
                                            <div>
                                                <p className="text-2xl font-black text-indigo-950">{user.stats.been}</p>
                                                <p className="text-[10px] text-indigo-300 font-mono uppercase tracking-widest">Venues</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-indigo-950">9</p>
                                                <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest">Cuisines</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] italic text-indigo-400/80 pt-2 border-t border-indigo-100">
                                            More active than 64% of members in New York
                                        </p>
                                        <div className="flex justify-center pt-2">
                                            <span className="text-xs font-serif font-black tracking-widest italic opacity-20">THE SCENE</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 rounded-3xl bg-zinc-50 border border-black/5 text-center space-y-3">
                                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                                            <TrendingUp className="w-6 h-6 text-zinc-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-foreground">No data yet</h4>
                                            <p className="text-xs text-zinc-500 px-4">Visit and rank 5 venues to unlock your personal Taste Profile & Scene Rank.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 rounded-3xl bg-zinc-50 border border-black/5 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold tracking-tight text-foreground">{user.name.split(' ')[0]}&apos;s Scene Map</h3>
                                        <Share className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                                        {isOwner ? "0 cities • 0 venues" : "97 cities • 1324 venues"}
                                    </p>
                                    <div className="aspect-video w-full bg-zinc-50 rounded-2xl overflow-hidden opacity-80 relative border border-black/5">
                                        <img
                                            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200"
                                            className="w-full h-full object-cover grayscale"
                                            alt="Map"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-black/10 text-[10px] font-mono text-zinc-600">
                                                {isOwner ? "Explore venues to populate your map" : "Interactive Map Available in App"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <BottomNav />
        </MobileContainer>
    );
}
