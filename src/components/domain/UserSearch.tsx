"use client";

import { Search } from "lucide-react";
import { useState } from "react";



export function UserSearch() {
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Find your people</h4>
                <p className="text-xs text-zinc-500 font-mono">Follow friends to see their recent moves and top rankings.</p>
            </div>

            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-accent transition-colors" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search contacts or username..."
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent/30 transition-all text-zinc-300"
                />
            </div>

            <div className="space-y-4">
                <div className="p-6 rounded-[24px] bg-gradient-to-br from-zinc-800/80 to-black border border-white/5 space-y-4 shadow-xl">
                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-white">Discover your circle</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed font-mono">Sync your contacts to find friends or invite them to start ranking with you.</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            onClick={() => alert("Searching contacts... Found 0 friends on The Scene yet.")}
                            className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm active:scale-95 transition-all"
                        >
                            Sync Contacts
                        </button>
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ title: 'The Scene', text: 'Join me on The Scene to rank our favorite spots!', url: window.location.origin });
                                } else {
                                    alert("Link copied to clipboard!");
                                }
                            }}
                            className="w-full py-3 bg-zinc-800 text-white rounded-xl font-bold text-sm border border-white/5 active:scale-95 transition-all"
                        >
                            Invite Friends
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
