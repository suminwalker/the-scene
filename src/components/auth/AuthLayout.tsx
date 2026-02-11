import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    showBack?: boolean;
}

export function AuthLayout({ children, title, subtitle, showBack = true }: AuthLayoutProps) {
    return (
        <ThemeProvider attribute="class" defaultTheme="super-light" enableSystem={false} disableTransitionOnChange>
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-[400px] space-y-8">
                    {showBack && (
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm text-zinc-500 hover:text-black transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    )}

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-light tracking-tight">{title}</h1>
                        {subtitle && <p className="text-zinc-500 font-light">{subtitle}</p>}
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-zinc-100">
                        {children}
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
