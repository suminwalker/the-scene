"use client";

import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Search, PenSquare, ChevronLeft, X, MessageCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChatWindow } from "@/components/messaging/ChatWindow";

// Types
interface Conversation {
    id: string;
    last_message_preview: string;
    updated_at: string;
    other_user: {
        id: string;
        name: string;
        avatar: string;
        handle: string;
    };
    participants: any[]; // Raw data
}

interface MutualUser {
    id: string;
    name: string;
    handle: string;
    avatar: string;
}

export default function MessagesPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [mutuals, setMutuals] = useState<MutualUser[]>([]);
    const [query, setQuery] = useState("");

    // Compose State
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [composeQuery, setComposeQuery] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Active Chat State
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [activeChatUser, setActiveChatUser] = useState<{ id: string, name: string, avatar: string } | null>(null);

    // Fetch Conversations
    useEffect(() => {
        async function loadConversations() {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                // 1. Get my conversations
                const { data: myConvos } = await supabase
                    .from('conversation_participants')
                    .select('conversation_id')
                    .eq('user_id', session.user.id);

                if (!myConvos || myConvos.length === 0) {
                    setLoading(false);
                    return;
                }

                const convoIds = myConvos.map(c => c.conversation_id);

                // 2. Get conversation details and OTHER participants
                const { data: convos, error } = await supabase
                    .from('conversations')
                    .select(`
                        id,
                        updated_at,
                        last_message_preview,
                        conversation_participants!inner (
                            user_id
                        )
                    `)
                    .in('id', convoIds)
                    .order('updated_at', { ascending: false });

                if (convos) {
                    // Enrich with profile data for the OTHER user
                    const enriched: Conversation[] = [];

                    for (const convo of convos) {
                        // Find the other user ID (simple 1-on-1 logic for now)
                        const otherParticipant = convo.conversation_participants.find((p: any) => p.user_id !== session.user.id);
                        if (!otherParticipant) continue;

                        // Fetch their profile
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('name, handle, avatar_url')
                            .eq('id', otherParticipant.user_id)
                            .single();

                        if (profile) {
                            enriched.push({
                                id: convo.id,
                                updated_at: new Date(convo.updated_at).toLocaleDateString(), // Format as needed
                                last_message_preview: convo.last_message_preview || "No messages yet",
                                other_user: {
                                    id: otherParticipant.user_id,
                                    name: profile.name || "User",
                                    handle: profile.handle || "user",
                                    avatar: profile.avatar_url || "https://i.pravatar.cc/150"
                                },
                                participants: convo.conversation_participants
                            });
                        }
                    }
                    setConversations(enriched);
                }

                // 3. Fetch Mutuals (Mock logic: just fetch people I follow who follow me, OR just people I follow for MVP)
                // For MVP: Fetch people I follow
                const { data: follows } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', session.user.id);

                if (follows && follows.length > 0) {
                    const followingIds = follows.map(f => f.following_id);
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, name, handle, avatar_url')
                        .in('id', followingIds);

                    if (profiles) {
                        setMutuals(profiles.map(p => ({
                            id: p.id,
                            name: p.name || "User",
                            handle: p.handle || "user",
                            avatar: p.avatar_url || "https://i.pravatar.cc/150"
                        })));
                    }
                }

            } catch (err) {
                console.error("Error loading messages:", err);
            } finally {
                setLoading(false);
            }
        }
        loadConversations();
    }, []);

    // Create Chat Handler
    const handleStartChat = async () => {
        if (!selectedUserId) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // 1. Create Conversation
            const { data: newConvo, error: convoError } = await supabase
                .from('conversations')
                .insert({}) // Defaults
                .select()
                .single();

            if (convoError || !newConvo) throw convoError;

            // 2. Add Participants
            const { error: partError } = await supabase
                .from('conversation_participants')
                .insert([
                    { conversation_id: newConvo.id, user_id: session.user.id },
                    { conversation_id: newConvo.id, user_id: selectedUserId }
                ]);

            if (partError) throw partError;

            // 3. Navigate (or refresh list)
            setIsComposeOpen(false);
            // Ideally navigate to chat page, but for now just refresh or alert
            // For MVP: We will likely need a Chat Page/Component. 
            // Let's just reload for now to see it in list
            // 3. Set Active Chat
            const user = mutuals.find(u => u.id === selectedUserId);
            if (user) {
                setActiveChatUser({ id: user.id, name: user.name, avatar: user.avatar });
                setActiveConversationId(newConvo.id);
            }

            setIsComposeOpen(false);

        } catch (err) {
            console.error("Error creating chat:", err);
        }
    };

    // Filter conversations based on search
    const filteredConversations = conversations.filter(c =>
        c.other_user.name.toLowerCase().includes(query.toLowerCase()) ||
        c.other_user.handle.toLowerCase().includes(query.toLowerCase())
    );

    // Filter mutuals for compose modal
    const filteredMutuals = mutuals.filter(u =>
        u.name.toLowerCase().includes(composeQuery.toLowerCase()) ||
        u.handle.toLowerCase().includes(composeQuery.toLowerCase())
    );

    return (
        <ResponsiveContainer>
            {/* Active Chat Overlay */}
            {activeConversationId && activeChatUser && (
                <ChatWindow
                    conversationId={activeConversationId}
                    otherUser={activeChatUser}
                    onBack={() => {
                        setActiveConversationId(null);
                        setActiveChatUser(null);
                        // Refresh list to show new preview
                        window.location.reload();
                    }}
                />
            )}

            {/* Header */}
            <div className="px-6 py-6 flex justify-between items-center sticky top-0 bg-zinc-100/90 backdrop-blur-md z-10 mb-6">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold font-serif">Messages</h1>
                </div>
                <button
                    onClick={() => setIsComposeOpen(true)}
                    className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-600 hover:text-black"
                >
                    <PenSquare className="w-6 h-6" />
                </button>
            </div>

            {/* Search */}
            <div className="px-6 mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search messages"
                        className="w-full bg-white border border-black/5 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-black/20 placeholder:text-zinc-400 shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-24 px-6">
                <div className="space-y-2">
                    {filteredConversations.map((convo) => (
                        <button
                            key={convo.id}
                            onClick={() => {
                                setActiveChatUser(convo.other_user);
                                setActiveConversationId(convo.id);
                            }}
                            className="w-full flex items-center gap-4 p-4 bg-white hover:bg-zinc-50 border border-black/5 rounded-2xl transition-all shadow-sm group active:scale-[0.98]"
                        >
                            <div className="relative">
                                <img
                                    src={convo.other_user.avatar}
                                    alt={convo.other_user.name}
                                    className="w-14 h-14 rounded-full object-cover border border-zinc-100"
                                    onError={(e) => e.currentTarget.src = "https://i.pravatar.cc/150"}
                                />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-base font-bold text-foreground">
                                    {convo.other_user.name}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono mt-0.5">
                                    <p className="truncate max-w-[160px]">
                                        {convo.last_message_preview}
                                    </p>
                                    <span>· {convo.updated_at}</span>
                                </div>
                            </div>
                        </button>
                    ))}

                    {!loading && filteredConversations.length === 0 && (
                        <div className="text-center py-20 text-zinc-400">
                            <p className="font-serif italic">No messages yet.</p>
                            <button onClick={() => setIsComposeOpen(true)} className="mt-4 text-xs font-bold font-mono uppercase tracking-widest text-black hover:underline">
                                Start a chat
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />

            {/* Compose Modal */}
            {isComposeOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={() => setIsComposeOpen(false)} />

                    <div className="relative w-full max-w-[480px] h-[85vh] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden pointer-events-auto flex flex-col animate-in slide-in-from-bottom duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-5 flex justify-between items-center border-b border-zinc-100">
                            <button
                                onClick={() => setIsComposeOpen(false)}
                                className="p-2 -ml-2 text-zinc-400 hover:text-black transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-lg font-bold font-serif">New Message</h2>
                            <div className="w-8" />
                        </div>

                        {/* Search */}
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="flex items-center gap-2 mb-3">
                                <p className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500">To:</p>
                                {selectedUserId && (
                                    <span className="text-xs bg-black text-white px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                                        {mutuals.find(m => m.id === selectedUserId)?.name}
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedUserId(null); }} className="hover:text-zinc-300">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                            <input
                                autoFocus
                                value={composeQuery}
                                onChange={(e) => setComposeQuery(e.target.value)}
                                placeholder="Search people..."
                                className="w-full bg-transparent text-lg font-serif placeholder:font-sans placeholder:text-zinc-300 focus:outline-none text-foreground"
                            />
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Suggested</p>
                            <div className="space-y-2">
                                {filteredMutuals.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedUserId(user.id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-3 rounded-2xl transition-colors text-left group",
                                            selectedUserId === user.id ? "bg-zinc-100" : "hover:bg-zinc-50"
                                        )}
                                    >
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-12 h-12 rounded-full object-cover border border-zinc-100"
                                            onError={(e) => e.currentTarget.src = "https://i.pravatar.cc/150"}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-foreground font-serif">{user.name}</p>
                                            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">@{user.handle}</p>
                                        </div>
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                                            selectedUserId === user.id ? "bg-black border-black" : "border-zinc-200 group-hover:border-black"
                                        )}>
                                            {selectedUserId === user.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-zinc-100 bg-white">
                            <button
                                onClick={handleStartChat}
                                disabled={!selectedUserId}
                                className="w-full py-4 bg-black text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Start Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ResponsiveContainer>
    );
}
