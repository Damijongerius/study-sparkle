import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { StudyStoreProvider } from "@/hooks/useStudyStoreContext";
import { sfx } from "@/lib/sfx";
import Layout from "./components/Layout";
import StudyBuddy from "./pages/StudyBuddy";
import StudySession from "./pages/StudySession";
import StudyPlanner from "./pages/StudyPlanner";
import PdfScanner from "./pages/PdfScanner";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import VersionBadge from "@/components/VersionBadge";
import { AuthProvider } from "@/hooks/Auth/AuthContext";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
    const auth = useAuth();

    // Global Click Sound
    React.useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button')) sfx.click();
        };
        window.addEventListener('click', handleGlobalClick, true);
        return () => window.removeEventListener('click', handleGlobalClick, true);
    }, []);

    if (auth.isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center"><div className="text-4xl mb-4 animate-bounce">📚</div><p className="text-muted-foreground">Loading...</p></div>
            </div>
        );
    }

    if (!auth.isAuthenticated) return <Login />;

    return (
        <StudyStoreProvider username={auth.user!.username}>
            <BrowserRouter>
                <Layout user={auth.user!} friends={auth.friends} onLogout={auth.logout} onAddFriend={auth.addFriend as any} onRemoveFriend={auth.removeFriend}>
                    <Routes>
                        <Route path="/" element={<StudyBuddy />} />
                        <Route path="/study" element={<StudySession />} />
                        <Route path="/planner" element={<StudyPlanner />} />
                        <Route path="/scanner" element={<PdfScanner />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </StudyStoreProvider>
    );
};

const App = () => (
<QueryClientProvider client={queryClient}>
    <TooltipProvider>
        <Toaster /><Sonner />
        <div ref={el => {
                if (!el || (el as any).__soundInit) return;
                (el as any).__soundInit = true;
                try {
                    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
                    const ctx = new AudioCtx();
                    const observer = new MutationObserver(() => {
                        const now = Date.now();
                        const notifs = document.querySelectorAll('[role="status"], [role="alert"], [class*="toast"], [class*="sonner"]');
                        if (notifs.length && now - (el as any).__lastBeep > 300) {
                            (el as any).__lastBeep = now;
                            let isNegative = false;
                            notifs.forEach(n => {
                                const text = n.textContent?.toLowerCase() || '';
                                if ([' -5', 'penalty', 'locked', 'error', 'failed', 'paused'].some(k => text.includes(k))) isNegative = true;
                            });
                            isNegative ? sfx.failure() : sfx.notify();
                        }
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                } catch {}
            }} style={{ display: "none" }} />
        <AuthProvider><AuthenticatedApp /></AuthProvider>
        <VersionBadge />
    </TooltipProvider>
</QueryClientProvider>
);

export default App;
