import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import VersionBadge from "@/components/VersionBadge";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
    const auth = useAuth();

    if (auth.isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-bounce">📚</div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return (
            <Login
                onLogin={auth.login as (username: string, password: string) => Promise<{ success: boolean; error?: string }>}
                onSignup={auth.signup as (username: string, password: string) => Promise<{ success: boolean; error?: string }>}
            />
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Index
                            user={auth.user!}
                            friends={auth.friends}
                            onLogout={auth.logout}
                            onAddFriend={auth.addFriend as unknown as (code: string) => { success: boolean; error?: string }}
                            onRemoveFriend={auth.removeFriend}
                        />
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

const App = () => (
<QueryClientProvider client={queryClient}>
    <TooltipProvider>
        <Toaster />
        <Sonner />
        <div
            // invisible helper: watches for notification DOM nodes and plays a short beep
            ref={el => {
                if (!el || (el as any).__soundInit) return;
                (el as any).__soundInit = true;
                try {
                    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
                    const ctx = new AudioCtx();
                    const playBeep = () => {
                        const o = ctx.createOscillator();
                        const g = ctx.createGain();
                        o.connect(g);
                        g.connect(ctx.destination);
                        o.type = "sine";
                        o.frequency.value = 1000;
                        g.gain.value = 0.04;
                        o.start();
                        setTimeout(() => o.stop(), 120);
                    };
                    (el as any).__lastBeep = 0;
                    const observer = new MutationObserver(() => {
                        const now = Date.now();
                        // look for elements that commonly represent notifications
                        const notifs = document.querySelectorAll('[role="status"], [role="alert"], [class*="toast"], [class*="sonner"]');
                        if (notifs.length && now - (el as any).__lastBeep > 300) {
                            (el as any).__lastBeep = now;
                            // resume audio context on first user gesture if needed
                            if (typeof ctx.resume === "function") ctx.resume().catch(() => {});
                            try { playBeep(); } catch {}
                        }
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                } catch {
                    /* silent fallback if WebAudio not available */
                }
            }}
            style={{ display: "none" }}
        />
        <AuthenticatedApp />
        <VersionBadge />
    </TooltipProvider>
</QueryClientProvider>
);

export default App;