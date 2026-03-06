import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Home, Timer, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { cn } from '@/lib/utils';
import { Header } from './Layout/Header';
import { FriendsPanel } from './Layout/FriendsPanel';

interface Props {
  children: React.ReactNode; user: any; friends: any[]; onLogout: () => void;
  onAddFriend: (c: string) => any; onRemoveFriend: (c: string) => void;
}

const Layout = ({ children, user, friends, onLogout, onAddFriend, onRemoveFriend }: Props) => {
  const [showFriends, setShowFriends] = useState(false);
  const loc = useLocation();
  const store = useStudyStoreContext();
  const nav = [{ l: 'Home', p: '/', i: Home }, { l: 'Study', p: '/study', i: Timer }, { l: 'Planner', p: '/planner', i: Calendar }];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header user={user} friends={friends} onLogout={onLogout} onOpenFriends={() => setShowFriends(true)} hasUnread={store.notifications?.some(n => !n.read)} />
      
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-md border-2 border-primary/20 rounded-full p-1.5 shadow-float flex items-center gap-1 z-40">
        {nav.map(n => <Link key={n.p} to={n.p}><Button variant={loc.pathname === n.p ? 'cute' : 'ghost'} size="sm" className={cn("rounded-full h-10 w-10 p-0 sm:w-auto sm:px-4", loc.pathname === n.p && "shadow-glow")}><n.i className="w-5 h-5" /><span className="hidden sm:inline text-xs ml-2">{n.l}</span></Button></Link>)}
      </nav>

      <main className="flex-1 overflow-x-hidden p-4">
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">Made with 💖 for my favorite study buddy</footer>
      <FriendsPanel open={showFriends} onClose={() => setShowFriends(false)} user={user} friends={friends} onAdd={onAddFriend} onRemove={onRemoveFriend} />
    </div>
  );
};

export default Layout;
