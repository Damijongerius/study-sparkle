import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthHeader } from '@/features/Auth/AuthHeader';
import { LoginForm } from '@/features/Auth/LoginForm';
import { SignupForm } from '@/features/Auth/SignupForm';
import { EliteCard } from '@/components/shared/EliteCard';
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, isLoading } = useAuth();

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="w-full max-w-md space-y-8 relative z-10">
        <AuthHeader />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <EliteCard className="overflow-hidden" variant="glass">
            <CardContent className="p-8">
              <div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl border-2 border-primary/5 mb-8">
                <Button variant={isLogin ? 'cute' : 'ghost'} className="flex-1 rounded-xl font-bold" onClick={() => setIsLogin(true)}>Login</Button>
                <Button variant={!isLogin ? 'cute' : 'ghost'} className="flex-1 rounded-xl font-bold" onClick={() => setIsLogin(false)}>Sign Up</Button>
              </div>
              <AnimatePresence mode="wait">
                {isLogin ? <LoginForm key="login" onLogin={login} isLoading={isLoading} /> : <SignupForm key="signup" onSignup={signup} isLoading={isLoading} />}
              </AnimatePresence>

              <div className="mt-8 space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><Separator /></div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase"><span className="bg-white px-2 text-muted-foreground/60">Or continue with</span></div>
                </div>

                <div className="grid gap-3">
                  <Button variant="outline" className="h-12 rounded-xl border-2 font-bold gap-3" onClick={handleGoogleLogin}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-3.27 3.28-7.79 3.28-11.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                    </svg>
                    Google Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </EliteCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
