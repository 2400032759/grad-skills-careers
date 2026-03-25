'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import JobListing from '@/components/JobListing';
import Footer from '@/components/Footer';
import { FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function OpeningsPage() {
  const { user, isLoaded } = useUser();
  const [hasApplications, setHasApplications] = useState(false);

  useEffect(() => {
    async function checkApplications() {
      if (!user?.primaryEmailAddress?.emailAddress) return;
      
      const { count, error } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('email', user.primaryEmailAddress.emailAddress);
      
      if (!error && count && count > 0) {
        setHasApplications(true);
      }
    }
    if (isLoaded && user) checkApplications();
  }, [user, isLoaded]);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-16 pb-32">
        {/* ── HEADER ROW ── */}
        <div className="max-container mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-lexend font-black text-4xl md:text-5xl text-gray-900 leading-tight">All Career Openings</h1>
            <p className="text-gray-500 font-medium text-lg">Explore our active roles and find your next challenge at GradSkills.</p>
          </div>

          {isLoaded && user && hasApplications && (
            <Link 
              href="/my-applications" 
              className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-hover hover:border-brand-purple/20 transition-all font-bold text-gray-700 group"
            >
              <div className="w-8 h-8 bg-brand-purple/10 rounded-xl flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-all">
                <FileText className="w-4 h-4 text-brand-purple group-hover:text-white" />
              </div>
              My Applications
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </div>

        {/* ── JOB LISTINGS ── */}
        <JobListing
          hideFilters={false}
          title="" // Empty title because we added it above
          subtitle="" 
        />
      </div>
      <Footer />
    </main>
  );
}
