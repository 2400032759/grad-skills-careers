'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import AuthModal from './AuthModal';

type View = 'sign-in' | 'sign-up';

interface AuthContextType {
  openAuth: (view: View) => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('sign-in');

  const openAuth = (v: View) => { setView(v); setIsOpen(true); };
  const closeAuth = () => { setIsOpen(false); };

  return (
    <AuthContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={closeAuth} defaultView={view} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
