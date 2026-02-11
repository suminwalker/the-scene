"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Send, MoreVertical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    is_me: boolean;
}

interface ChatWindowProps {
    conversationId: string;
    otherUser: {
        id: string;
        name: string;
        avatar: string;
    };
    onBack: () => void;
}

export function ChatWindow({ conversationId, otherUser, onBack }: ChatWindowProps) {
    const supabase = createClient();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial Load & Subscription
    useEffect(() => {
        let subscription: any;

        async function loadMessages() {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                // 1. Fetch existing messages
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', conversationId)
                    .order('created_at', { ascending: true });

                if (data) {
                    setMessages(data.map((m: any) => ({
                        id: m.id,
                        content: m.content,
                        sender_id: m.sender_id,
                        created_at: m.created_at,
                        is_me: m.sender_id === session.user.id
                    })));
                }

                // 2. Subscribe to new messages
                subscription = supabase
                    .channel(`chat:${conversationId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'messages',
                            filter: `conversation_id=eq.${conversationId}`
                        },
                        (payload: any) => {
                            const newMsg = payload.new;
                            setMessages(prev => [...prev, {
                                id: newMsg.id,
                                content: newMsg.content,
                                sender_id: newMsg.sender_id,
                                created_at: newMsg.created_at,
                                is_me: newMsg.sender_id === session.user.id
                            }]);
                        }
                    )
                    .subscribe();

            } catch (err) {
                console.error("Error loading chat:", err);
            } finally {
                setLoading(false);
            }
        }

        loadMessages();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [conversationId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;
        setSending(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const content = newMessage.trim();
            setNewMessage(""); // Optimistic clear

            // Insert Message
            const { error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: session.user.id,
                    content: content
                });

            if (error) throw error;

            // Update Conversation Preview (Optional but good for lists)
            await supabase
                .from('conversations')
                .update({
                    last_message_preview: content,
                    updated_at: new Date().toISOString()
                })
                .eq('id', conversationId);

        } catch (err) {
            console.error("Error sending message:", err);
            // Ideally toast error here
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300 items-stretch absolute inset-0 z-20">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-100 bg-white/90 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-100"
                        />
                        <span className="font-bold font-serif text-sm">{otherUser.name}</span>
                    </div>
                </div>
                <button className="p-2 text-zinc-400 hover:text-black">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50"
            >
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20 opacity-50 space-y-2">
                        <img src={otherUser.avatar} className="w-16 h-16 rounded-full mx-auto grayscale opacity-50" />
                        <p className="font-serif italic text-sm text-zinc-500">Start the conversation</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col max-w-[75%]",
                                msg.is_me ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "px-4 py-2.5 rounded-2xl text-sm font-medium",
                                    msg.is_me
                                        ? "bg-black text-white rounded-tr-sm"
                                        : "bg-white border border-zinc-200 text-foreground rounded-tl-sm shadow-sm"
                                )}
                            >
                                {msg.content}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono mt-1 px-1 opacity-50">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-zinc-100 pb-8">
                <div className="flex items-end gap-2 bg-zinc-50 border border-zinc-200 rounded-3xl p-1.5 focus-within:border-black/20 focus-within:ring-2 focus-within:ring-black/5 transition-all">
                    <input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2.5 min-h-[44px] max-h-32 text-sm placeholder:text-zinc-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className="p-2.5 bg-black text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
