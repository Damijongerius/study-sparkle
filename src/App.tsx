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
            <AuthenticatedApp />
            <VersionBadge />
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;