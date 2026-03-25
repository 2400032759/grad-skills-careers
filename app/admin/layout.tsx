'use client';

import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Briefcase, Users, LogOut,
  Loader2, Home, ShieldOff, ChevronsLeft,
  ChevronsRight, Menu, X as CloseIcon
} from 'lucide-react';

// ── ADMIN WHITELIST ─────────────────────────────────────────
// Add any email that should have admin access here
const ADMIN_EMAILS = [
  'kakkirenivishwas1409@gmail.com',
  'kakkirenivishwas1@gmail.com',
  'vishwas@redhost.tech',
  'support@procreationstudio.com',
];
// ────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setIsMounted(true); }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!isLoaded || !isMounted) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 px-6 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <ShieldOff className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="font-lexend font-bold text-2xl text-gray-900">Sign in required</h1>
      <p className="text-gray-500 font-medium max-w-sm">You must be signed in to access the admin panel.</p>
      <Link href="/" className="px-8 py-4 bg-home-gradient text-white rounded-full font-bold shadow-lg">Go to Home</Link>
    </div>
  );

  const userEmail = user.primaryEmailAddress?.emailAddress || '';
  if (!ADMIN_EMAILS.includes(userEmail)) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 px-6 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center pointer-events-none">
        <ShieldOff className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="font-lexend font-bold text-2xl text-gray-900">Access Denied</h1>
      <p className="text-gray-500 font-medium max-w-sm">
        <span className="font-bold text-gray-900">{userEmail}</span> is not authorized to access the admin panel.
      </p>
      <Link href="/" className="px-8 py-4 bg-home-gradient text-white rounded-full font-bold shadow-lg">Go to Home</Link>
    </div>
  );

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Manage Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Candidates', href: '/admin/candidates', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 shadow-xl lg:shadow-sm z-50 transition-all duration-300",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isSidebarCollapsed ? "lg:w-24" : "lg:w-72 w-72"
      )}>
        <div className={cn(
          "p-8 border-b border-slate-100 flex items-center justify-between lg:justify-start gap-3 overflow-hidden whitespace-nowrap",
          isSidebarCollapsed && "lg:p-6 lg:justify-center"
        )}>
           <div className="flex items-center gap-3">
             <img
               src="https://image2url.com/r2/default/images/1772362953079-6c29c142-3343-457e-aa4f-e62893004fd6.png"
               alt="GradSkills"
               className="h-10 w-auto object-contain flex-shrink-0"
             />
             {(!isSidebarCollapsed || isMobileOpen) && (
               <>
                 <div className="h-6 w-px bg-slate-200" />
                 <span className="font-lexend font-bold text-xl text-gray-900 tracking-tight">Admin</span>
               </>
             )}
           </div>
           {/* Mobile Close Button */}
           <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-gray-900">
              <CloseIcon className="w-6 h-6" />
           </button>
        </div>

        <nav className={cn("flex-1 p-6 space-y-2 mt-4", isSidebarCollapsed && "lg:p-3")}>
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              title={isSidebarCollapsed ? item.name : ""}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all group overflow-hidden whitespace-nowrap",
                isSidebarCollapsed && "lg:px-0 lg:justify-center",
                pathname === item.href
                  ? "bg-brand-purple text-white shadow-lg"
                  : "text-gray-500 hover:bg-slate-50 hover:text-brand-purple"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-brand-purple")} />
              {(!isSidebarCollapsed || isMobileOpen) && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className={cn("p-6 border-t border-slate-100 space-y-2 lg:space-y-4", isSidebarCollapsed && "lg:p-3")}>
           <Link href="/" className={cn("flex items-center gap-4 px-6 py-4 text-gray-400 font-bold hover:text-gray-900 transition-colors whitespace-nowrap", isSidebarCollapsed && "lg:px-0 lg:justify-center")}>
              <Home className="w-5 h-5 flex-shrink-0" />
              {(!isSidebarCollapsed || isMobileOpen) && <span>Public Site</span>}
           </Link>
           <button
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className={cn("hidden lg:flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-brand-purple transition-all font-bold", isSidebarCollapsed && "lg:px-0 lg:justify-center")}
           >
             {isSidebarCollapsed ? <ChevronsRight className="w-6 h-6" /> : <ChevronsLeft className="w-6 h-6" />}
             {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
           </button>
           <SignOutButton>
             <button className={cn("w-full flex items-center gap-4 px-6 py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all whitespace-nowrap", isSidebarCollapsed && "lg:px-0 lg:justify-center")}>
               <LogOut className="w-5 h-5 flex-shrink-0" />
               {(!isSidebarCollapsed || isMobileOpen) && <span>Logout</span>}
             </button>
           </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 w-full min-w-0",
        isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"
      )}>
         <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-100 px-6 lg:px-12 flex items-center justify-between z-20">
            <div className="flex items-center gap-4">
               <button
                 onClick={() => setIsMobileOpen(true)}
                 className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-brand-purple transition-colors"
               >
                 <Menu className="w-7 h-7" />
               </button>
               <h2 className="font-lexend font-bold text-xl lg:text-2xl text-gray-900 capitalize truncate max-w-[200px] sm:max-w-none">
                  {pathname.split('/').pop() || 'Dashboard'}
               </h2>
            </div>
            <div className="flex items-center gap-3 lg:gap-4">
               <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-gray-900">{user?.primaryEmailAddress?.emailAddress}</p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Administrator</p>
               </div>
               <div className="w-10 h-10 lg:w-12 lg:h-12 overflow-hidden bg-slate-100 rounded-full flex items-center justify-center text-gray-400 border border-slate-200">
                  {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" /> : <Users className="w-6 h-6" />}
               </div>
            </div>
         </header>

         <div className={cn("p-6 lg:p-12", isSidebarCollapsed && "lg:p-16")}>
            <div className="max-w-[1600px] mx-auto">
               {children}
            </div>
         </div>
      </main>
    </div>
  );
}
