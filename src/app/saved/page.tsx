"use client";

import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Plus, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface SavedList {
    id: string;
    title: string;
    category: string;
    placeCount: number;
}

export default function SavedPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [savedLists, setSavedLists] = useState<SavedList[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [newListCategory, setNewListCategory] = useState("");

    // Fetch Lists
    useEffect(() => {
        async function fetchLists() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { data, error } = await supabase
                    .from('lists')
                    .select('*, list_items(count)')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (data) {
                    setSavedLists(data.map((list: any) => ({
                        id: list.id,
                        title: list.title,
                        category: list.category || "General",
                        placeCount: list.list_items?.[0]?.count || 0
                    })));
                }
            } catch (err) {
                console.error("Error fetching lists:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchLists();
    }, []);

    const handleCreateList = async () => {
        if (!newListTitle.trim()) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const category = newListCategory || "General";

            const { data, error } = await supabase
                .from('lists')
                .insert({
                    user_id: session.user.id,
                    title: newListTitle,
                    category: category,
                    is_public: true
                })
                .select()
                .single();

            if (data) {
                const newList: SavedList = {
                    id: data.id,
                    title: data.title,
                    category: data.category,
                    placeCount: 0
                };
                setSavedLists([newList, ...savedLists]);
                setNewListTitle("");
                setNewListCategory("");
                setIsModalOpen(false);
            }
        } catch (err) {
            console.error("Error creating list:", err);
        }
    };

    return (
        <div className="flex justify-center min-h-screen bg-zinc-100 dark:bg-black w-full">
            <MobileContainer>
                <div className="flex-1 overflow-y-auto pb-24 px-6 pt-12">
                    <header className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-serif leading-tight tracking-tighter">
                            Your Lists.
                        </h1>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </header>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
                            </div>
                        ) : savedLists.length > 0 ? (
                            savedLists.map((list) => (
                                <div key={list.id} className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl shadow-sm hover:border-black/10 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-serif text-xl text-black group-hover:underline decoration-zinc-300 underline-offset-4">{list.title}</h3>
                                            <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">{list.category}</p>
                                        </div>
                                        <span className="text-xs font-mono text-zinc-400">{list.placeCount} PLACES</span>
                                    </div>
                                    <div className="h-32 bg-white rounded-lg flex items-center justify-center text-zinc-300 border border-dashed border-zinc-200">
                                        Empty List
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <p className="text-zinc-400 font-serif italic">No lists yet.</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
                                >
                                    Create your first list
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <BottomNav />

                {/* Create List Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold font-serif text-black">New List</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-black">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500">List Title</label>
                                    <input
                                        autoFocus
                                        value={newListTitle}
                                        onChange={(e) => setNewListTitle(e.target.value)}
                                        placeholder="e.g. Summer Spots"
                                        className="w-full px-4 py-3 bg-zinc-100 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-black placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500">Category (Optional)</label>
                                    <input
                                        value={newListCategory}
                                        onChange={(e) => setNewListCategory(e.target.value)}
                                        placeholder="e.g. Date Night"
                                        className="w-full px-4 py-3 bg-zinc-100 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-black placeholder:text-zinc-400"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateList}
                                    disabled={!newListTitle.trim()}
                                    className="w-full py-4 bg-black text-white rounded-xl font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create List
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </MobileContainer>
        </div>
    );
}
