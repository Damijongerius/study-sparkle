import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, ShoppingBag, Sparkles, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab = 'study' | 'shop' | 'collection' | 'log';

interface Props {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export const StudyNavigation = ({ activeTab, onTabChange }: Props) => {
  const tabs = [
    { id: 'study' as Tab, label: 'Study', icon: BookOpen, emoji: '📚' },
    { id: 'shop' as Tab, label: 'Shop', icon: ShoppingBag, emoji: '🛍️' },
    { id: 'collection' as Tab, label: 'Stickers', icon: Sparkles, emoji: '✨' },
    { id: 'log' as Tab, label: 'Log', icon: ScrollText, emoji: '📝' },
  ];

  return (
    <motion.nav initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="max-w-lg mx-auto flex gap-2 p-2 bg-card rounded-2xl shadow-soft border-2 border-primary/10">
          {tabs.map((tab, i) => (
            <motion.div key={tab.id} className="flex-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
              <Button variant={activeTab === tab.id ? 'cute' : 'ghost'} className={cn("w-full gap-2", activeTab === tab.id && "shadow-glow")} onClick={() => onTabChange(tab.id)}>
                <motion.span className="text-lg" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>{tab.emoji}</motion.span>
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
    </motion.nav>
  );
};
