"use client";

import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Search, PenSquare, ChevronLeft, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MOCK_CONVERSATIONS, MOCK_MUTUALS } from "@/lib/mock-messages";

export default function MessagesPage() {
    const [query, setQuery] = useState("");
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [composeQuery, setComposeQuery] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    // Filter conversations based on search
    const filteredConversations = MOCK_CONVERSATIONS.filter(c =>
        c.participants[0].name.toLowerCase().includes(query.toLowerCase()) ||
        c.participants[0].handle.toLowerCase().includes(query.toLowerCase())
    );

    // Filter mutuals for compose modal
    const filteredMutuals = MOCK_MUTUALS.filter(u =>
        u.name.toLowerCase().includes(composeQuery.toLowerCase()) ||
        u.handle.toLowerCase().includes(composeQuery.toLowerCase())
    );

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreateChat = () => {
        if (selectedUserIds.length === 0) return;

        if (selectedUserIds.length === 1) {
            const user = MOCK_MUTUALS.find(u => u.id === selectedUserIds[0]);
            alert(`Starting chat with ${user?.name}`);
        } else {
            const users = MOCK_MUTUALS.filter(u => selectedUserIds.includes(u.id));
            const names = users.map(u => u.name).join(", ");
            alert(`Creating group chat with: ${names}`);
        }
        setIsComposeOpen(false);
        setSelectedUserIds([]);
    };

    return (

        <ResponsiveContainer>
            {/* Header */}
            <div className="px-6 py-6 flex justify-between items-center sticky top-0 bg-zinc-100/90 backdrop-blur-md z-10 mb-6">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold font-serif">suminwalker</h1>
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
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
                        placeholder="Search"
                        className="w-full bg-white border border-black/5 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-black/20 placeholder:text-zinc-400 shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-24 px-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-2xl tracking-tight">Messages</h2>
                    <button className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Requests</button>
                </div>

                <div className="space-y-2">
                    {filteredConversations.map((convo) => {
                        const user = convo.participants[0];
                        const isUnread = convo.unreadCount > 0;

                        return (
                            <button
                                key={convo.id}
                                onClick={() => alert(`Chat with ${user.name} coming soon!`)}
                                className="w-full flex items-center gap-4 p-4 bg-white hover:bg-zinc-50 border border-black/5 rounded-2xl transition-all shadow-sm group active:scale-[0.98]"
                            >
                                <div className="relative">
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-14 h-14 rounded-full object-cover border border-zinc-100"
                                    />
                                    {isUnread && (
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className={cn("text-base truncate", isUnread ? "font-bold text-foreground" : "font-serif text-foreground")}>
                                        {user.name}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono mt-0.5">
                                        <p className={cn("truncate max-w-[160px]", isUnread && "font-bold text-black")}>
                                            {convo.lastMessage.content}
                                        </p>
                                        {convo.lastMessage.content.includes("·") ? "" : <span>· {convo.lastMessage.timestamp}</span>}
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {filteredConversations.length === 0 && (
                        <div className="text-center py-20 text-zinc-400">
                            <p className="font-serif italic">No messages found</p>
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
                            <div className="w-8" /> {/* Spacer */}
                        </div>

                        {/* Search Mutuals */}
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="flex items-center gap-2 mb-3">
                                <p className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500">To:</p>
                                {selectedUserIds.length > 0 && (
                                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                                        {selectedUserIds.map(id => {
                                            const u = MOCK_MUTUALS.find(m => m.id === id);
                                            return u ? (
                                                <span key={id} className="text-xs bg-black text-white px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                                                    {u.name.split(' ')[0]}
                                                    <button onClick={(e) => { e.stopPropagation(); toggleUserSelection(id); }} className="hover:text-zinc-300">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>
                            <input
                                autoFocus
                                value={composeQuery}
                                onChange={(e) => setComposeQuery(e.target.value)}
                                placeholder={selectedUserIds.length > 0 ? "Add more people..." : "Search people..."}
                                className="w-full bg-transparent text-lg font-serif placeholder:font-sans placeholder:text-zinc-300 focus:outline-none text-foreground"
                            />
                        </div>

                        {/* Mutuals List */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Suggested</p>
                            <div className="space-y-2">
                                {filteredMutuals.map((user) => {
                                    const isSelected = selectedUserIds.includes(user.id);
                                    return (
                                        <button
                                            key={user.id}
                                            onClick={() => toggleUserSelection(user.id)}
                                            className={cn(
                                                "w-full flex items-center gap-4 p-3 rounded-2xl transition-colors text-left group",
                                                isSelected ? "bg-zinc-100" : "hover:bg-zinc-50"
                                            )}
                                        >
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover border border-zinc-100"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-foreground font-serif">{user.name}</p>
                                                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">@{user.handle}</p>
                                            </div>
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                                                isSelected ? "bg-black border-black" : "border-zinc-200 group-hover:border-black"
                                            )}>
                                                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredMutuals.length === 0 && (
                                    <div className="text-center py-10 opacity-50">
                                        <p className="font-serif italic text-zinc-400">No people found.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-zinc-100 bg-white">
                            <button
                                onClick={handleCreateChat}
                                disabled={selectedUserIds.length === 0}
                                className="w-full py-4 bg-black text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {selectedUserIds.length > 1 ? `Create Group (${selectedUserIds.length})` : "Chat"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ResponsiveContainer>
    );
}
