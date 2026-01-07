import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Sparkles, User, Lock, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: (username: string, password: string) => { success: boolean; error?: string };
  onSignup: (username: string, password: string) => { success: boolean; error?: string };
}

const Login = ({ onLogin, onSignup }: LoginProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignup) {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match!');
        return;
      }
      const result = onSignup(username, password);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success('Welcome to Study Buddy! 🎉');
      }
    } else {
      const result = onLogin(username, password);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success('Welcome back! 💖');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <Heart className="w-10 h-10 text-pink-medium fill-pink-medium" />
            </motion.div>
            <h1 className="text-4xl font-fredoka font-bold text-gradient-primary">
              Study Buddy
            </h1>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.5 }}
            >
              <Heart className="w-10 h-10 text-pink-medium fill-pink-medium" />
            </motion.div>
          </div>
          <p className="text-muted-foreground">
            {isSignup ? 'Create your study space ✨' : 'Welcome back! Ready to study? 📚'}
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="bg-card rounded-3xl p-8 shadow-float border-2 border-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.form
              key={isSignup ? 'signup' : 'login'}
              initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignup ? -20 : 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <AnimatePresence>
                {isSignup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  variant="cute"
                  className="w-full h-12 text-lg gap-2"
                >
                  {isSignup ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Login
                    </>
                  )}
                  <Sparkles className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.form>
          </AnimatePresence>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignup ? (
                <>Already have an account? <span className="font-semibold text-primary">Login</span></>
              ) : (
                <>New here? <span className="font-semibold text-primary">Sign up</span></>
              )}
            </button>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 left-10 text-4xl opacity-50"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-4xl opacity-50"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: 1 }}
        >
          🌸
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
