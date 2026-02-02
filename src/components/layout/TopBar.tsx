import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
    backHref?: string;
    onBack?: () => void;
    title?: string;
}

export function TopBar({ backHref, onBack, title = "THE SCENE" }: TopBarProps) {
    const content = (
        <ChevronLeft className="w-6 h-6 text-foreground" />
    );

    return (
        <header className="sticky top-0 z-40 w-full glass border-b border-black/5 px-4 h-14 flex items-center justify-between">
            <div className="w-10">
                {onBack ? (
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors block">
                        {content}
                    </button>
                ) : backHref ? (
                    <Link href={backHref} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors block">
                        {content}
                    </Link>
                ) : null}
            </div>

            <h1 className="text-xl font-serif font-bold tracking-[0.2em] text-foreground absolute left-1/2 -translate-x-1/2">
                {title.toUpperCase()}
            </h1>

            <div className="w-10" />
        </header>
    );
}
