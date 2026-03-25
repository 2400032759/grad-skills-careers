'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser, Show, UserButton } from '@clerk/nextjs';
import { useAuth } from './AuthContext';
import { Menu, X, Briefcase, Globe, ExternalLink, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── ADMIN WHITELIST ──────────────────────────────────────────
export const ADMIN_EMAILS = [
  'kakkirenivishwas1@gmail.com',
  'vishwas@redhost.tech',
  'support@procreationstudio.com',
];
// ────────────────────────────────────────────────────────────

export default function Navbar({ hideAuth = false }: { hideAuth?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const { openAuth } = useAuth();

  const isAdmin = ADMIN_EMAILS.includes(user?.primaryEmailAddress?.emailAddress || '');

  const navLinks = [
    { name: 'Openings', href: '/openings', icon: Briefcase },
    { name: 'Main Site', href: 'https://gradskills.in', icon: Globe, external: true },
  ];

  return (
    <>
      <nav className="sticky top-0 z-[60] w-full py-4 glass border-b border-slate-200">
        <div className="max-container flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 sm:gap-4">
            <img
              src="https://image2url.com/r2/default/images/1772362953079-6c29c142-3343-457e-aa4f-e62893004fd6.png"
              alt="GradSkills"
              className="h-8 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <div className="h-6 sm:h-8 w-px bg-slate-200 hidden sm:block" />
            <span className="font-lexend font-black text-xl sm:text-2xl tracking-tight text-gray-900 hidden xs:block">
              <span className="text-brand-purple">Careers</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.name} 
                href={link.href} 
                target={link.external ? '_blank' : undefined}
                className="text-gray-600 hover:text-brand-purple transition-colors font-medium flex items-center gap-2"
              >
                {link.name}
              </Link>
            ))}

            {!hideAuth && (
              <div className="flex items-center gap-3 ml-4">
                <Show when="signed-out">
                  <button 
                    onClick={() => openAuth('sign-in')} 
                    className="text-gray-600 hover:text-brand-purple font-bold transition-all text-sm"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => openAuth('sign-up')} 
                    className="bg-gradient-to-r from-[#ff5757] to-[#8c52ff] text-white px-7 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-sm"
                  >
                    Sign Up
                  </button>
                </Show>
                <Show when="signed-in">
                  {isAdmin && (
                    <Link href="/admin" className="text-brand-purple font-bold transition-all text-sm hover:underline flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <UserButton />
                </Show>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-4">
            {!hideAuth && (
              <Show when="signed-in">
                <UserButton />
              </Show>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-brand-purple transition-colors"
            >
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-[80] shadow-2xl p-8 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="font-lexend font-black text-2xl text-brand-purple">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 space-y-6">
                {navLinks.map(link => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    target={link.external ? '_blank' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-xl font-bold text-gray-900 hover:text-brand-purple transition-colors p-2"
                  >
                    <link.icon className="w-6 h-6 text-gray-400" />
                    {link.name}
                  </Link>
                ))}
                
                <Show when="signed-in">
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 text-xl font-bold text-brand-purple p-2"
                    >
                      <LayoutDashboard className="w-6 h-6" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link 
                    href="/openings" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-xl font-bold text-gray-600 p-2"
                  >
                    <Briefcase className="w-6 h-6" />
                    My Applications
                  </Link>
                </Show>
              </div>

                {!hideAuth && (
                  <Show when="signed-out">
                    <div className="mt-auto space-y-4 pt-8 border-t border-slate-100">
                      <button 
                        onClick={() => { setIsMobileMenuOpen(false); openAuth('sign-in'); }}
                        className="w-full py-5 text-xl font-bold text-gray-600 hover:bg-slate-50 rounded-2xl transition-all"
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={() => { setIsMobileMenuOpen(false); openAuth('sign-up'); }}
                        className="w-full py-5 bg-home-gradient text-white rounded-2xl font-bold text-xl shadow-lg"
                      >
                        Sign Up Now
                      </button>
                    </div>
                  </Show>
                )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

