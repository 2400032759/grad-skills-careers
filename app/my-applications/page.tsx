'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { Candidate, ApplicationStatus } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, Briefcase, CheckCircle2, XCircle,
  MapPin, Calendar, Loader2, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const statusConfig: Record<ApplicationStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Applied':      { label: 'Applied',      color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: <FileText className="w-3.5 h-3.5" /> },
  'Under Review': { label: 'Under Review', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <Clock className="w-3.5 h-3.5" /> },
  'Interview':    { label: 'Interview',    color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: <Briefcase className="w-3.5 h-3.5" /> },
  'Accepted':     { label: 'Accepted ✓',  color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  'Rejected':     { label: 'Rejected',     color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    icon: <XCircle className="w-3.5 h-3.5" /> },
};

const steps: ApplicationStatus[] = ['Applied', 'Under Review', 'Interview', 'Accepted'];
const stepNum: Record<ApplicationStatus, number> = { 'Applied': 1, 'Under Review': 2, 'Interview': 3, 'Accepted': 4, 'Rejected': 0 };

export default function MyApplicationsPage() {
  const { user, isLoaded } = useUser();
  const [applications, setApplications] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;
    
    async function fetchApps() {
      const { data } = await supabase
        .from('candidates')
        .select('*, jobs(title, location, type)')
        .eq('clerk_user_id', user!.id)
        .order('created_at', { ascending: false });

      setApplications(data || []);
      setLoading(false);
    }
    fetchApps();
  }, [user, isLoaded]);

  if (isLoaded && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
        <p className="text-gray-500 font-medium">Please sign in to view your applications.</p>
        <Link href="/" className="px-8 py-3 bg-brand-purple text-white rounded-full font-bold">Go Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-24 pb-32 max-container">
        <Link href="/openings" className="inline-flex items-center gap-2 text-brand-purple font-bold mb-8 hover:gap-3 transition-all">
          <ChevronLeft className="w-5 h-5" /> Back to Jobs
        </Link>
        
        <div className="mb-12">
          <h1 className="font-lexend font-black text-4xl text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-500 font-medium">Track the status of your current job applications.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-4xl p-20 text-center shadow-premium">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="font-lexend font-bold text-2xl text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-8">You haven't applied to any roles. Explore our openings to get started!</p>
            <Link href="/openings" className="px-10 py-4 bg-home-gradient text-white rounded-full font-bold shadow-lg">Browse Jobs</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app, i) => {
              const status = app.status as ApplicationStatus;
              const config = statusConfig[status];
              const isRejected = status === 'Rejected';
              const currentStep = stepNum[status];

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-100 rounded-3xl p-8 shadow-premium"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-50">
                    <div>
                      <h3 className="font-lexend font-bold text-2xl text-gray-900">{(app as any).jobs?.title || 'Role'}</h3>
                      <div className="flex items-center gap-4 text-gray-500 font-medium mt-2">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brand-red" /> {(app as any).jobs?.location}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-purple" /> Applied {new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "px-6 py-3 rounded-2xl border font-bold flex items-center gap-2",
                      config.bg, config.color, config.border
                    )}>
                      {config.icon} {config.label}
                    </div>
                  </div>

                  {!isRejected ? (
                    <div className="grid grid-cols-4 gap-4 max-w-4xl">
                      {steps.map((step, idx) => {
                        const sNum = stepNum[step];
                        const done = currentStep > sNum;
                        const active = currentStep === sNum;
                        const isLast = idx === steps.length - 1;
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center gap-2">
                              <div className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all',
                                done ? 'bg-brand-purple border-brand-purple text-white shadow-lg shadow-brand-purple/30' :
                                active ? 'bg-white border-brand-purple text-brand-purple animate-pulse' :
                                'bg-white border-slate-100 text-slate-200'
                              )}>
                                {done ? '✓' : idx + 1}
                              </div>
                              <span className={cn('text-xs font-bold uppercase tracking-widest', done || active ? 'text-gray-900' : 'text-slate-300')}>
                                {step}
                              </span>
                            </div>
                            {!isLast && (
                              <div className={cn('flex-1 h-1 mx-4 rounded-full', currentStep > sNum ? 'bg-brand-purple' : 'bg-slate-100')} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 font-bold">
                       <XCircle className="w-8 h-8" />
                       Application not selected — keep applying, your perfect role is out there!
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
