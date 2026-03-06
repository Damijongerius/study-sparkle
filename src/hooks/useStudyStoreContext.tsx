import React, { createContext, useContext, ReactNode } from 'react';
import { useStudyStore, StudyStore } from '@/hooks/useStudyStore';

const StudyStoreContext = createContext<StudyStore | undefined>(undefined);

export const StudyStoreProvider = ({ children, username }: { children: ReactNode; username: string }) => {
  const store = useStudyStore(username);
  return (
    <StudyStoreContext.Provider value={store}>
      {children}
    </StudyStoreContext.Provider>
  );
};

export const useStudyStoreContext = () => {
  const context = useContext(StudyStoreContext);
  if (context === undefined) {
    throw new Error('useStudyStoreContext must be used within a StudyStoreProvider');
  }
  return context;
};
