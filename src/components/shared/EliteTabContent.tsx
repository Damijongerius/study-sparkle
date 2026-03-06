import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
};

export const EliteTabContent = ({ children, id }: { children: React.ReactNode, id: string }) => (
  <motion.div key={id} variants={variants} initial="initial" animate="animate" exit="exit" className="w-full">
    {children}
  </motion.div>
);
