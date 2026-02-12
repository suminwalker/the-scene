"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { ContactSync } from "./ContactSync";



export function UserSearch() {
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Find your people</h4>
                <p className="text-xs text-zinc-500 font-mono">Follow friends to see their recent moves and top rankings.</p>
            </div>

            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search contacts or username..."
                    className="w-full bg-white border border-black/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-black/20 transition-all text-foreground placeholder:text-zinc-400 shadow-sm"
                />
            </div>

            <div className="space-y-4">
                <div className="p-6 rounded-[24px] bg-white border border-black/10 space-y-4 shadow-sm">
                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-foreground">Discover your circle</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed font-mono">Sync your contacts to find friends or invite them to start ranking with you.</p>
                    </div>

                    <div className="pt-2">
                        <ContactSync />
                    </div>
                </div>
            </div>
        </div>
    );
}
