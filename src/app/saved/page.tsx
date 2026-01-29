import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Plus } from "lucide-react";

export default function SavedPage() {
    return (
        <div className="flex justify-center min-h-screen bg-zinc-100 dark:bg-black">
            <MobileContainer>
                <div className="flex-1 overflow-y-auto pb-24 px-6 pt-12">
                    <header className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-serif leading-tight">
                            My <br /> Collections.
                        </h1>
                        <button className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Plus className="w-5 h-5" />
                        </button>
                    </header>

                    <div className="space-y-6">
                        {/* Demo List Cards */}
                        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-serif text-xl">Summer Fridays</h3>
                                <span className="text-xs font-mono text-zinc-400">0 PLACES</span>
                            </div>
                            <div className="h-32 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center text-zinc-300 border border-dashed border-zinc-200 dark:border-zinc-700">
                                Empty Collection
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm opacity-60">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-serif text-xl">Date Night</h3>
                                <span className="text-xs font-mono text-zinc-400">0 PLACES</span>
                            </div>
                            <div className="h-32 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center text-zinc-300 border border-dashed border-zinc-200 dark:border-zinc-700">
                                Empty Collection
                            </div>
                        </div>
                    </div>
                </div>
                <BottomNav />
            </MobileContainer>
        </div>
    );
}
