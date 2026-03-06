import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

export const AuthHeader = () => (
  <div className="text-center space-y-4">
    <div className="flex items-center justify-center gap-3">
      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}><Sparkles className="w-10 h-10 text-yellow-400 fill-yellow-200" /></motion.div>
      <h1 className="text-5xl font-fredoka font-bold text-primary tracking-tight">Study Sparkle</h1>
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}><Heart className="w-10 h-10 text-pink-400 fill-pink-200" /></motion.div>
    </div>
    <p className="text-muted-foreground text-lg font-medium">Make your learning journey magical! ✨</p>
  </div>
);
