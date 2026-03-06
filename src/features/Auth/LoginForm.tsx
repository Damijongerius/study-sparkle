import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Props {
    onLogin: (u: string, p: string) => Promise<any>;
    isLoading: boolean;
}

export const LoginForm = ({ onLogin, isLoading }: Props) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pass) return toast.error('Please fill in all fields');
    const res = await onLogin(user, pass);
    if (res?.error) toast.error(res.error);
  };

  return (
    <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSubmit} className="space-y-5 text-left">
      <div className="space-y-2"><Label className="font-bold ml-1">Username</Label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input placeholder="your_sparkle_name" value={user} onChange={e => setUser(e.target.value)} className="pl-12 h-14 rounded-2xl border-2" /></div></div>
      <div className="space-y-2"><Label className="font-bold ml-1">Password</Label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} className="pl-12 h-14 rounded-2xl border-2" /></div></div>
      <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl text-lg font-fredoka font-bold shadow-glow gap-2 mt-4">{isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Login <ArrowRight className="w-6 h-6" /></>}</Button>
    </motion.form>
  );
};
