"use client";

import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import {
    ArrowLeft, Bell, Share, Instagram, Music2,
    ChevronRight, Trophy, Flame, TrendingUp, Menu, X,
    Mail, Gift, GraduationCap, Settings, Calendar, Crown,
    MessageCircle, Building2, AlertTriangle, HeartOff,
    CloudUpload, Lock, FileText, LogOut, Check, Camera,
    MapPin, Loader2, Copy
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ActivityFeedItem } from "@/components/domain/ActivityFeedItem";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/supabase/profiles";
import { NotificationBell } from "@/components/layout/NotificationBell";

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
    ageBracket?: string;
    neighborhoods?: string[];
    city?: string;
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
    venueId?: string; // Added
    venueImage?: string; // Added
    timestamp: string;
    category?: string;
    location?: string;
    score?: number; // Added
    likes?: number;
    comments?: number;
    tags?: string[]; // Added
}

// Removed Mock SESSION_USERS and AVATAR_PRESETS
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

    const [user, setUser] = useState<ProfileUser | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();


    // Fetch Profile Data
    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            try {
                // 1. Get Session User to determine ownership
                const { data: { session } } = await supabase.auth.getSession();
                const sessionUserId = session?.user?.id;

                // 2. Resolve target Profile ID
                let query = supabase.from('profiles').select('*');
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

                if (isUUID) {
                    query = query.or(`id.eq.${id},username.eq.${id}`);
                } else {
                    query = query.eq('username', id);
                }

                const { data: profileData, error: profileError } = await query.single();

                if (profileError) {
                    console.error("Error fetching profile:", profileError);
                    setLoading(false);
                    return;
                }

                if (profileData) {
                    const isCurrentUser = sessionUserId === profileData.id;

                    // 3. Fetch Stats (Counts)
                    const { count: beenCount } = await supabase
                        .from('activities')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', profileData.id)
                        .in('action_type', ['check_in', 'review', 'rate']);

                    const { count: wantToTryCount } = await supabase
                        .from('saved_venues')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', profileData.id);

                    // 4. Fetch User Activity
                    const { data: activityData } = await supabase
                        .from('activities')
                        .select('*')
                        .eq('user_id', profileData.id)
                        .order('created_at', { ascending: false })
                        .limit(10);

                    const mappedActivity = activityData?.map((item: any) => ({
                        id: item.id,
                        action: mapActionType(item.action_type),
                        user: {
                            id: profileData.id,
                            name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || "User",
                            avatar: profileData.avatar_url || "https://i.pravatar.cc/150",
                        },
                        venue: item.venue_name,
                        venueId: item.venue_id,
                        venueImage: item.venue_image,
                        timestamp: new Date(item.created_at).toLocaleDateString(), // Simple format
                        category: item.venue_category,
                        location: item.venue_location,
                        score: item.rating
                    })) || [];

                    // 5. Fetch Follow Data
                    const { count: followersCount } = await supabase
                        .from('follows')
                        .select('*', { count: 'exact', head: true })
                        .eq('following_id', profileData.id);

                    const { count: followingCount } = await supabase
                        .from('follows')
                        .select('*', { count: 'exact', head: true })
                        .eq('follower_id', profileData.id);

                    let amIFollowing = false;
                    if (sessionUserId && !isCurrentUser) {
                        const { data: followData } = await supabase
                            .from('follows')
                            .select('*')
                            .eq('follower_id', sessionUserId)
                            .eq('following_id', profileData.id)
                            .single();
                        amIFollowing = !!followData;
                    }

                    const mappedUser: ProfileUser = {
                        id: profileData.id,
                        name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || "Scene Member",
                        handle: profileData.handle || profileData.username || "user",
                        avatar: profileData.avatar_url || "",
                        bio: profileData.bio || "",
                        instagram: profileData.instagram || "",
                        tiktok: profileData.tiktok || "",
                        memberSince: new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                        followers: followersCount?.toString() || "0",
                        following: followingCount?.toString() || "0",
                        rank: "N/A",
                        streak: "0 weeks",
                        lastHandleChange: profileData.last_handle_change ? new Date(profileData.last_handle_change).getTime() : 0,
                        isFollowing: amIFollowing,
                        challenge: { progress: 0, total: 250 },
                        stats: { been: beenCount || 0, wantToTry: wantToTryCount || 0, mutual: 0 },
                        activity: mappedActivity,
                        ageBracket: profileData.age_bracket,
                        neighborhoods: profileData.neighborhoods || [],
                        city: profileData.home_city || "New York, NY"
                    };

                    setUser(mappedUser);
                    setIsFollowing(amIFollowing);

                    // ... (rest of state updates)
                }

            } catch (err) {
                console.error("Profile load error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [id, supabase]);

    // Handle Follow/Unfollow
    const handleFollowToggle = async () => {
        if (!user || !currentSessionUserId) return;

        // Optimistic UI Update
        const newStatus = !isFollowing;
        setIsFollowing(newStatus);
        setUser(prev => prev ? ({
            ...prev,
            followers: (parseInt(prev.followers) + (newStatus ? 1 : -1)).toString()
        }) : null);

        try {
            if (newStatus) {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert({
                        follower_id: currentSessionUserId,
                        following_id: user.id
                    });
                if (error) throw error;
            } else {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', currentSessionUserId)
                    .eq('following_id', user.id);
                if (error) throw error;
            }
        } catch (err) {
            console.error("Error toggling follow:", err);
            // Revert on error
            setIsFollowing(!newStatus);
            setUser(prev => prev ? ({
                ...prev,
                followers: (parseInt(prev.followers) + (!newStatus ? 1 : -1)).toString()
            }) : null);
        }
    };


    // Construct mapActionType helper inside or import
    const mapActionType = (type: string) => {
        switch (type) {
            case 'check_in': return 'visited';
            case 'rate': return 'rated';
            case 'review': return 'reviewed';
            case 'list_add': return 'added to list';
            default: return 'visited';
        }
    };

    // Derived State
    const [currentSessionUserId, setCurrentSessionUserId] = useState<string | null>(null);
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentSessionUserId(data.user?.id || null);
        });
    }, [supabase]);

    const isOwner = user && currentSessionUserId ? user.id === currentSessionUserId : false;

    // UI State
    const [activeTab, setActiveTab] = useState<"activity" | "taste">("activity");
    const [isEditing, setIsEditing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeMenuModal, setActiveMenuModal] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [notified, setNotified] = useState(false);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [inviteRemaining, setInviteRemaining] = useState<number>(0);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteCopied, setInviteCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        handle: "",
        bio: "",
        avatar: "",
        instagram: "",
        tiktok: "",
        city: ""
    });

    const [lastHandleChange, setLastHandleChange] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!user || !isOwner) return;

        // Validations...
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        if (formData.handle !== user.handle && (now - lastHandleChange < THIRTY_DAYS_MS)) {
            const daysLeft = Math.ceil((THIRTY_DAYS_MS - (now - lastHandleChange)) / (1000 * 60 * 60 * 24));
            setError(`You can change your handle again in ${daysLeft} days.`);
            return;
        }

        try {
            await updateProfile(user.id, {
                name: formData.name,
                handle: formData.handle,
                bio: formData.bio,
                // avatar: formData.avatar, // Need to handle image upload separately later, likely base64 or bucket
                instagram: formData.instagram,
                tiktok: formData.tiktok,
                city: formData.city
            });

            // Optimistic Update
            setUser(prev => prev ? ({
                ...prev,
                ...formData,
                lastHandleChange: formData.handle !== prev.handle ? now : prev.lastHandleChange
            }) : null);

            setIsEditing(false);
            setError(null);
        } catch (e: any) {
            console.error("Save failed:", e);
            setError(e.message || "Failed to update profile");
        }
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
        if (!user) return;
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `${user.name}'s Profile on The Scene`,
                    text: `Check out ${user.name}'s profile on The Scene!`,
                    url: window.location.href,
                });
            } catch {
                copyToClipboard();
            }
        } else {
            copyToClipboard();
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert("Profile link copied!");
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            alert("Profile link copied!");
        }
    };

    const handleMenuAction = (action: string) => {
        setIsMenuOpen(false);
        setActiveMenuModal(action);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
    }, [supabase]);

    // Fetch invite code when Invites modal opens
    useEffect(() => {
        if (activeMenuModal !== "Invites" || !session?.user) return;

        const fetchInvite = async () => {
            setInviteLoading(true);
            try {
                const { data: existing } = await supabase
                    .rpc("get_my_invite", { p_user_id: session.user.id });

                if (existing) {
                    setInviteCode(existing.code);
                    setInviteRemaining(existing.remaining);
                } else {
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
    }, [activeMenuModal, session]);

    const [recoveryAttemped, setRecoveryAttempted] = useState(false);

    // Auto-recover effect
    useEffect(() => {
        // Check if we are viewing our own profile (by ID or username) but it's missing
        const isMe = session?.user && (id === session.user.id || id === session.user.user_metadata?.username);

        if (!user && !loading && isMe && !recoveryAttemped && !error) {
            setRecoveryAttempted(true);
            handleCreateProfile();
        }
    }, [user, loading, session, id, recoveryAttemped, error]);

    const handleCreateProfile = async () => {
        if (!session?.user) return;
        setLoading(true);
        try {
            const userMeta = session.user.user_metadata;
            const { error: insertError } = await supabase.from('profiles').insert({
                id: session.user.id,
                username: userMeta.username || session.user.id,
                // name: schema mismatch
                // handle: schema mismatch
                first_name: userMeta.first_name,
                last_name: userMeta.last_name,
                avatar_url: userMeta.avatar_url || "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (insertError) {
                if (insertError.code === '23505') { // unique_violation
                    // Profile already exists, just reload
                    window.location.reload();
                    return;
                }
                throw insertError;
            }
            window.location.reload();
        } catch (err: any) {
            console.error("Failed to create profile:", err);
            setError("Failed to recover profile: " + err.message);
            setLoading(false);
        }
    };

    if (loading) {
        // If we are recovering, show specific message
        if (recoveryAttemped && !error) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                    <p className="text-zinc-500 font-medium">Finalizing your profile setup...</p>
                </div>
            );
        }
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 p-4 text-center">
                <p className="text-xl font-bold">User not found</p>
                <p className="text-zinc-500 max-w-md">
                    We couldn't find a profile for <span className="font-mono bg-zinc-100 px-1 rounded">{id}</span>.
                </p>

                {error && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 max-w-sm mx-auto mt-4">
                        <p className="text-sm text-red-600 mb-3">{error}</p>
                        <button
                            onClick={handleCreateProfile}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <Link href="/discover" className="text-sm font-medium underline text-zinc-400 hover:text-black mt-8">
                    Return to Feed
                </Link>
            </div>
        );
    }

    return (
        <ResponsiveContainer>
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
                                    <p className="text-sm text-zinc-400 px-8">
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
                                            onClick={() => {
                                                navigator.clipboard.writeText(inviteCode);
                                                setInviteCopied(true);
                                                setTimeout(() => setInviteCopied(false), 2000);
                                            }}
                                            className={cn(
                                                "text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-all flex items-center gap-1.5",
                                                inviteCopied ? "bg-green-500 text-white" : "bg-black text-white"
                                            )}
                                        >
                                            {inviteCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-400">Could not load invite code.</p>
                                )}
                            </div>
                        )}

                        {activeMenuModal === "School" && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-foreground">Add Your School</h3>
                                <div className="space-y-4">
                                    <input
                                        placeholder="Enter your university name..."
                                        className="w-full bg-white border border-black/10 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-accent shadow-sm"
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
                                    {["New York, NY"].map((city) => (
                                        <button
                                            key={city}
                                            onClick={() => setActiveMenuModal(null)}
                                            className="w-full p-4 flex justify-between items-center bg-white hover:bg-zinc-50 rounded-2xl border border-black/10 transition-colors shadow-sm"
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
                                            className="p-4 bg-white hover:border-accent border border-black/10 rounded-2xl text-sm font-medium text-zinc-600 transition-all shadow-sm"
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
                                        <div key={i} className="p-5 bg-white rounded-2xl border border-black/10 space-y-2 shadow-sm">
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
                                        onClick={handleLogout}
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
                    "fixed inset-0 z-[100] transition-opacity duration-300 pointer-events-none md:hidden",
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
                            { icon: Mail, label: inviteCode ? `You have ${inviteRemaining} invite${inviteRemaining !== 1 ? "s" : ""} left!` : "Invites", color: "text-zinc-600", action: "Invites" },
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

            {/* Desktop: Hidden File Input acts same */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
            />

            <div className="flex-1 overflow-y-auto pb-24 relative bg-background md:pb-0">
                {/* Mobile Header Nav - Hidden on Desktop */}
                <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md px-4 py-4 flex justify-between items-center border-b border-black/5 md:hidden">
                    {!isOwner ? (
                        <Link href="/discover" className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                    ) : (
                        <div className="w-10" />
                    )}

                    {!isEditing ? (
                        <div />
                    ) : (
                        <h2 className="text-sm font-bold tracking-tight text-zinc-500">Editing Profile</h2>
                    )}

                    <div className="flex gap-2">
                        {!isEditing ? (
                            <>
                                {!isOwner && (
                                    <button
                                        onClick={() => setNotified(!notified)}
                                        className={cn("p-2 transition-colors", notified ? "text-black" : "text-foreground/70 hover:text-foreground")}
                                    >
                                        <Bell className={cn("w-5 h-5", notified && "fill-black")} />
                                    </button>
                                )}
                                <button
                                    onClick={handleShare}
                                    className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                                >
                                    <Share className="w-5 h-5" />
                                </button>
                                {isOwner && (
                                    <div className="md:hidden">
                                        <NotificationBell />
                                    </div>
                                )}
                                {isOwner && (
                                    <button
                                        onClick={() => setIsMenuOpen(true)}
                                        className="p-2 text-foreground/70 hover:text-foreground transition-colors md:hidden"
                                    >
                                        <Menu className="w-5 h-5" />
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={handleSave}
                                className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-full"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Grid for Desktop */}
                <div className="md:grid md:grid-cols-12 md:gap-10 md:p-8 md:max-w-7xl md:mx-auto items-start">

                    {/* Left Column: Profile Card (Sticky on Desktop) */}
                    <div className="md:col-span-4 lg:col-span-3 md:sticky md:top-8 space-y-6">
                        {/* Profile Banner/Info */}
                        <div className="px-6 pt-8 pb-4 md:p-0 text-center md:text-left space-y-4 md:space-y-6">
                            <div className="relative inline-block md:block md:w-full md:text-center">
                                {formData.avatar ? (
                                    <div
                                        className="w-24 h-24 md:w-40 md:h-40 mx-auto rounded-full bg-zinc-100 border-4 border-background shadow-xl bg-cover bg-center overflow-hidden"
                                        style={{ backgroundImage: `url(${formData.avatar})` }}
                                    />
                                ) : (
                                    <div className="w-24 h-24 md:w-40 md:h-40 mx-auto rounded-full bg-zinc-100 border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-zinc-50" />
                                    </div>
                                )}
                                {isEditing && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:bg-black/60 md:w-40 md:h-40 md:mx-auto"
                                    >
                                        <Camera className="w-6 h-6 text-white" />
                                    </button>
                                )}
                            </div>

                            {/* Desktop Edit Controls showing Presets inline if editing */}
                            {isEditing && (
                                <div className="space-y-4 px-2 md:px-0">
                                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] text-center md:text-left">Character Presets</p>
                                    <div className="flex overflow-x-auto gap-4 py-2 px-4 md:px-0 no-scrollbar scroll-smooth">
                                        {AVATAR_PRESETS.map((preset, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setFormData({ ...formData, avatar: preset })}
                                                className={cn(
                                                    "relative flex-shrink-0 w-16 h-16 rounded-2xl bg-white border-2 transition-all active:scale-95 overflow-hidden",
                                                    formData.avatar === preset ? "border-black scale-105 shadow-md" : "border-black/5 grayscale-[0.3]"
                                                )}
                                            >
                                                <img src={preset} className="w-full h-full object-cover" alt={`Preset ${index + 1}`} />
                                                {formData.avatar === preset && (
                                                    <div className="absolute top-1 right-1 bg-black rounded-full p-0.5 shadow-lg">
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
                                    <div className="space-y-1 md:text-center text-center">
                                        <h1 className="text-xl md:text-3xl font-bold text-foreground font-serif">{user.name}</h1>
                                        <p className="text-[10px] md:text-xs text-zinc-500 font-mono uppercase tracking-[0.2em] relative">
                                            @{user.handle}
                                            {isOwner && (
                                                <button onClick={() => setIsEditing(true)} className="hidden md:inline-flex ml-2 p-1 text-zinc-400 hover:text-black">
                                                    <Settings className="w-3 h-3" />
                                                    <span className="sr-only">Edit</span>
                                                </button>
                                            )}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-zinc-500 font-mono uppercase tracking-[0.2em]">
                                            {user.city ? `${user.city} · ` : ""}{user.stats.been} places
                                        </p>
                                        {user.bio && <p className="text-sm md:text-base font-serif italic text-zinc-300 py-1 md:py-4 leading-relaxed">{user.bio}</p>}
                                    </div>
                                ) : (
                                    <div className="space-y-3 px-4 md:px-0 text-left">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono text-zinc-500 uppercase">Name</label>
                                            <input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white border border-black/10 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono text-zinc-500 uppercase">Username</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-2 text-zinc-500 text-sm">@</span>
                                                <input
                                                    value={formData.handle}
                                                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                                                    className="w-full bg-white border border-black/10 rounded-xl pl-8 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent shadow-sm"
                                                />
                                            </div>
                                            {error && <p className="text-[10px] text-red-500 pt-1 font-mono">{error}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono text-zinc-500 uppercase">City</label>
                                            <input
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full bg-white border border-black/10 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-mono text-zinc-500 uppercase">Bio</label>
                                                <span className="text-[10px] font-mono text-zinc-400">{formData.bio.length}/250</span>
                                            </div>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                maxLength={250}
                                                className="w-full bg-white border border-black/10 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent h-20 resize-none shadow-sm"
                                            />
                                        </div>
                                        {/* Desktop-specific: Social inputs in column or grid? */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono text-zinc-500 uppercase">Instagram</label>
                                                <input
                                                    placeholder="handle"
                                                    value={formData.instagram}
                                                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono text-zinc-500 uppercase">TikTok</label>
                                                <input
                                                    placeholder="handle"
                                                    value={formData.tiktok}
                                                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                                                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        {/* Desktop Edit Save Button */}
                                        <div className="pt-2 hidden md:block">
                                            <button
                                                onClick={handleSave}
                                                className="w-full py-2 bg-black text-white text-sm font-bold rounded-xl"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!isEditing && (
                                    <div className="flex justify-center gap-4 py-2">
                                        {user.instagram ? (
                                            <Link
                                                href={`https://instagram.com/${user.instagram}`}
                                                className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-zinc-400 hover:text-black hover:border-black transition-all bg-white shadow-sm"
                                            >
                                                <Instagram className="w-5 h-5" />
                                            </Link>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-zinc-300 bg-white shadow-sm cursor-default">
                                                <Instagram className="w-5 h-5" />
                                            </div>
                                        )}

                                        {user.tiktok ? (
                                            <Link
                                                href={`https://tiktok.com/@${user.tiktok}`}
                                                className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-zinc-400 hover:text-black hover:border-black transition-all bg-white shadow-sm"
                                            >
                                                <Music2 className="w-5 h-5" />
                                            </Link>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-zinc-300 bg-white shadow-sm cursor-default">
                                                <Music2 className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Stats Row - Centered in Left Col on Desktop */}
                            {!isEditing && (
                                <>
                                    <div className="flex justify-center gap-12 py-4 border-t border-b border-black/5 md:border-0 md:py-2">
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

                                    {/* Mobile/Desktop Owner Tools */}
                                    {isOwner && !isEditing && (
                                        <div className="flex gap-3 px-6 pt-2 pb-6 md:px-0 md:pb-0">
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex-1 py-3 px-4 rounded-xl border border-black/10 text-foreground text-sm font-bold hover:bg-zinc-50 transition-colors bg-white shadow-sm md:hidden"
                                            >
                                                Edit profile
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                className="flex-1 py-3 px-4 rounded-xl border border-black/10 text-foreground text-sm font-bold hover:bg-zinc-50 transition-colors bg-white shadow-sm w-full"
                                            >
                                                Share profile
                                            </button>
                                        </div>
                                    )}

                                    {!isOwner && (
                                        <div className="flex gap-3 px-4 pt-2 md:px-0 md:pt-4">
                                            <button
                                                onClick={handleFollowToggle}
                                                className={cn(
                                                    "flex-1 py-3.5 rounded-2xl font-bold text-sm tracking-tight active:scale-95 transition-all",
                                                    isFollowing ? "bg-black text-white" : "bg-black text-white"
                                                )}
                                            >
                                                {isFollowing ? "Following" : "Follow"}
                                            </button>
                                            <button className="p-3.5 bg-white text-foreground rounded-2xl font-bold text-sm active:scale-95 transition-all border border-black/10 shadow-sm hover:bg-zinc-50">
                                                <ChevronRight className="w-5 h-5 rotate-90" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>


                    {/* Right Column: Feed & Data (Desktop) */}
                    <div className="md:col-span-8 lg:col-span-9 md:space-y-8">

                        {/* Lists Sections - Horizontal Grid on Desktop */}
                        {!isEditing && (
                            <div className="px-4 py-6 md:p-0 space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                                {[
                                    { label: "Been", count: user.stats.been, href: "/saved" },
                                    { label: "Want to Try", count: user.stats.wantToTry, href: "/saved" }
                                ].map((item) => (
                                    <Link key={item.label} href={item.href} className="w-full flex justify-between items-center p-4 bg-white hover:bg-zinc-50 rounded-2xl border border-black/10 transition-colors group shadow-sm md:p-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-semibold text-zinc-400 font-mono uppercase tracking-widest">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl md:text-2xl font-black text-foreground">{item.count}</span>
                                            <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Content Tabs */}
                        <div className="mt-4 border-t border-black/5 md:border-0 md:mt-0">
                            <div className="flex px-4 pt-4 md:px-0 md:border-b md:border-black/5">
                                <button
                                    onClick={() => setActiveTab("activity")}
                                    className={cn(
                                        "flex-1 py-3 text-[11px] font-mono uppercase tracking-[0.2em] border-b-2 transition-all md:text-xs md:py-4 hover:text-black",
                                        activeTab === "activity" ? "border-foreground text-foreground" : "border-transparent text-zinc-400"
                                    )}
                                >
                                    Recent Activity
                                </button>
                                <button
                                    onClick={() => setActiveTab("taste")}
                                    className={cn(
                                        "flex-1 py-3 text-[11px] font-mono uppercase tracking-[0.2em] border-b-2 transition-all md:text-xs md:py-4 hover:text-black",
                                        activeTab === "taste" ? "border-foreground text-foreground" : "border-transparent text-zinc-400"
                                    )}
                                >
                                    Taste Profile
                                </button>
                            </div>

                            <div className="px-4 pt-6 divide-y divide-black/5 md:px-0 md:divide-none md:space-y-4">
                                {activeTab === "activity" ? (
                                    user.activity.length > 0 ? (
                                        // Desktop: Use Grid for Activities
                                        <div className="md:grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                                            {user.activity.map((item: ActivityItem) => (
                                                <ActivityFeedItem key={item.id} {...item} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center space-y-2">
                                            <p className="text-zinc-500 font-serif italic">No recent activity.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="py-8 space-y-6 md:py-0 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                                        {user.stats.been > 0 ? (
                                            <div className="p-6 rounded-3xl bg-white border border-black/10 space-y-4 shadow-sm h-full">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Last 30 Days</p>
                                                    <Share className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-black tracking-tight">Top 36% Rank</h3>
                                                <p className="text-xs text-zinc-500">New York</p>
                                                <div className="flex gap-8 pt-2">
                                                    <div>
                                                        <p className="text-2xl font-black text-black">{user.stats.been}</p>
                                                        <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Venues</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-black text-black">9</p>
                                                        <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Cities</p>
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
                                            <div className="p-8 rounded-3xl bg-zinc-50 border border-black/5 text-center space-y-3 h-full flex flex-col justify-center items-center">
                                                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                                                    <TrendingUp className="w-6 h-6 text-zinc-300" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-bold text-foreground">No data yet</h4>
                                                    <p className="text-xs text-zinc-500 px-4">Visit and rank 5 venues to unlock your personal Taste Profile & Scene Rank.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Onboarding / Vibe Check Info */}
                                        {(user.ageBracket || (user.neighborhoods && user.neighborhoods.length > 0)) && (
                                            <div className="p-6 rounded-3xl bg-zinc-50 border border-black/5 space-y-4 h-full">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-sm font-bold tracking-tight text-foreground">Vibe Check</h3>
                                                </div>

                                                <div className="space-y-3">
                                                    {user.ageBracket && (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center">
                                                                <Calendar className="w-4 h-4 text-zinc-500" />
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-zinc-500 block">Age Bracket</span>
                                                                <span className="text-sm font-semibold">{user.ageBracket}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {user.neighborhoods && user.neighborhoods.length > 0 && (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center">
                                                                <MapPin className="w-4 h-4 text-zinc-500" />
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-zinc-500 block">Frequent Spots</span>
                                                                <span className="text-sm font-semibold">{user.neighborhoods.join(", ")}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-6 rounded-3xl bg-zinc-50 border border-black/5 space-y-6 md:col-span-2">
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
                </div>
            </div>

            <BottomNav />
        </ResponsiveContainer>
    );
}
