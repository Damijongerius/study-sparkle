import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Users, LogOut, Home, Timer, Calendar, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Props {
    user: any; friends: any[]; onLogout: () => void; onOpenFriends: () => void; hasUnread: boolean;
}

export const Header = ({ user, friends, onLogout, onOpenFriends, hasUnread }: Props) => {
  const loc = useLocation();
  const nav = [{ l: 'Home', p: '/', i: Home }, { l: 'Study', p: '/study', i: Timer }, { l: 'Planner', p: '/planner', i: Calendar }];

  return (
    <header className="py-6 px-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button className="flex items-center gap-3 bg-card border-2 border-primary/20 rounded-2xl px-3 py-1.5 shadow-soft transition-all"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div><span className="font-bold text-sm hidden sm:block">{user.username}</span></button></DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48"><DropdownMenuItem className="text-muted-foreground"><span className="text-xs">#{user.friendCode}</span></DropdownMenuItem><DropdownMenuItem onClick={onLogout} className="text-destructive"><LogOut className="w-4 h-4 mr-2" /> Logout</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
          <nav className="hidden md:flex gap-2 ml-4">{nav.map(n => <Link key={n.p} to={n.p}><Button variant={loc.pathname === n.p ? 'cute' : 'ghost'} size="sm" className="gap-2"><n.i className="w-4 h-4" />{n.l}</Button></Link>)}</nav>
        </div>
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2"><Heart className="w-5 h-5 text-pink-400 fill-pink-400" /><span className="text-xl font-fredoka font-bold text-primary">Study Sparkle</span></Link>
        <Button variant="outline" size="sm" onClick={onOpenFriends} className="gap-2 border-2 border-primary/20">{hasUnread && <span className="w-2 h-2 bg-destructive rounded-full" />}<Users className="w-4 h-4" /><span className="hidden sm:inline">Friends</span><span className="bg-primary text-white text-[10px] px-1.5 rounded-full">{friends.length}</span></Button>
      </div>
    </header>
  );
};
