"use client";

import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Search, PenSquare, Camera, ChevronLeft, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MOCK_CONVERSATIONS, MOCK_MUTUALS, User } from "@/lib/mock-messages";
import Link from "next/link";

export default function MessagesPage() {
    const [query, setQuery] = useState("");
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [composeQuery, setComposeQuery] = useState("");

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

    return (
        <div className="flex justify-center min-h-screen bg-black w-full text-white">
            <MobileContainer>
                {/* Header */}
                <div className="px-4 py-4 flex justify-between items-center sticky top-0 bg-black z-10">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">suminwalker</h1>
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                    <button
                        onClick={() => setIsComposeOpen(true)}
                        className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <PenSquare className="w-6 h-6" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full bg-zinc-900 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 placeholder:text-zinc-500"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pb-24 px-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg">Messages</h2>
                        <button className="text-zinc-500 text-sm hover:text-white transition-colors">Requests</button>
                    </div>

                    <div className="space-y-1">
                        {filteredConversations.map((convo) => {
                            const user = convo.participants[0];
                            const isUnread = convo.unreadCount > 0;

                            return (
                                <button
                                    key={convo.id}
                                    onClick={() => alert(`Chat with ${user.name} coming soon!`)}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-xl transition-colors text-left group"
                                >
                                    <div className="relative">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-14 h-14 rounded-full object-cover border border-zinc-800"
                                        />
                                        {isUnread && (
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-500 border-2 border-black rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm truncate", isUnread ? "font-bold text-white" : "font-medium text-white/90")}>
                                            {user.name}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                                            <p className={cn("truncate max-w-[180px]", isUnread && "font-bold text-white")}>
                                                {convo.lastMessage.content}
                                            </p>
                                            {convo.lastMessage.content.includes("·") ? "" : <span>· {convo.lastMessage.timestamp}</span>}
                                        </div>
                                    </div>
                                    <Camera className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
                                </button>
                            );
                        })}

                        {filteredConversations.length === 0 && (
                            <div className="text-center py-12 text-zinc-500">
                                <p>No messages found</p>
                            </div>
                        )}
                    </div>
                </div>

                <BottomNav />

                {/* Compose Modal */}
                {isComposeOpen && (
                    <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 backdrop-blur-sm animate-in slide-in-from-bottom-10 duration-200">
                        <div className="h-full flex flex-col">
                            {/* Modal Header */}
                            <div className="px-4 py-4 flex justify-between items-center border-b border-zinc-800">
                                <button
                                    onClick={() => setIsComposeOpen(false)}
                                    className="p-2 -ml-2 text-white"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <h2 className="text-lg font-bold">New Message</h2>
                                <div className="w-8" /> {/* Spacer */}
                            </div>

                            {/* Search Mutuals */}
                            <div className="p-4 border-b border-zinc-800">
                                <p className="text-sm font-bold text-white mb-2">To:</p>
                                <input
                                    autoFocus
                                    value={composeQuery}
                                    onChange={(e) => setComposeQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full bg-transparent text-white focus:outline-none placeholder:text-zinc-600"
                                />
                            </div>

                            {/* Mutuals List */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Suggested</p>
                                <div className="space-y-4">
                                    {filteredMutuals.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => {
                                                alert(`Starting chat with ${user.name}`);
                                                setIsComposeOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 text-left group"
                                        >
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white">{user.name}</p>
                                                <p className="text-xs text-zinc-500">@{user.handle}</p>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border-2 border-zinc-700 group-hover:border-blue-500 group-hover:bg-blue-500 transition-colors" />
                                        </button>
                                    ))}
                                    {filteredMutuals.length === 0 && (
                                        <p className="text-center text-zinc-500 py-4">No accounts found.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-zinc-800">
                                <button
                                    onClick={() => alert("Chat created!")}
                                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-transform"
                                >
                                    Chat
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </MobileContainer>
        </div>
    );
}
