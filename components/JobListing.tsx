'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/types';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Search, MapPin, Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

type JobListingProps = {
  limit?: number;
  hideFilters?: boolean;
  title?: string;
  subtitle?: string;
};

export default function JobListing({ 
  limit, 
  hideFilters = false,
  title = "Current Openings",
  subtitle = "Apply to join our mission of building world-class education tools."
}: JobListingProps) {
  const { user, isLoaded } = useUser();
  const { openAuth } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    role: '',
    location: '',
    type: '',
  });

  // Optimized Unified Fetch
  useEffect(() => {
    async function init() {
      setLoading(true);
      
      // Fetch Jobs & Applications in parallel for max speed
      const [jobsRes, appsRes] = await Promise.all([
        supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        (isLoaded && user) 
          ? supabase.from('candidates').select('job_id').eq('clerk_user_id', user.id)
          : Promise.resolve({ data: null })
      ]);

      if (jobsRes.data) {
        setJobs(jobsRes.data);
      } else {
        // Fallback mock data
        setJobs([{ id: '1', title: 'Senior Product Designer', location: 'Remote', type: 'Full-time', salary_range: '₹12L - ₹18L', description: '...', is_active: true, created_at: new Date().toISOString() }] as Job[]);
      }

      if (appsRes.data) {
        setAppliedJobIds(new Set(appsRes.data.map((a: any) => a.job_id)));
      } else {
        setAppliedJobIds(new Set());
      }

      setLoading(false);
    }
    init();
  }, [user, isLoaded]);

  useEffect(() => {
    let result = jobs;
    if (filters.role) {
      result = result.filter((job) =>
        job.title.toLowerCase().includes(filters.role.toLowerCase())
      );
    }
    if (filters.location) {
      result = result.filter((job) =>
        job.location === filters.location
      );
    }
    if (filters.type) {
      result = result.filter((job) =>
        job.type === filters.type
      );
    }
    if (limit) {
      result = result.slice(0, limit);
    }
    setFilteredJobs(result);
  }, [filters, jobs, limit]);

  const locations = Array.from(new Set(jobs.map((job) => job.location)));
  const types = Array.from(new Set(jobs.map((job) => job.type)));

  return (
    <section id="listings" className="pt-8 pb-24 bg-white">
      <div className="max-container">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            <h2 className="mb-4 font-lexend font-bold text-4xl text-gray-900 leading-[1.2]">
               {title}
            </h2>
            <p className="text-gray-600 font-medium text-lg">
              {subtitle}
            </p>
          </div>
        )}

        {/* Filter Controls */}
        {!hideFilters && (
          <div className="mb-12 glass border border-slate-100 rounded-32 p-8 shadow-premium flex flex-col md:flex-row gap-6 items-center">
           <div className="flex-1 w-full space-y-2">
             <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-4">Search Roles</label>
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
               <input
                 type="text"
                 placeholder="Search by role..."
                 className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
                 onChange={(e) => setFilters({ ...filters, role: e.target.value })}
               />
             </div>
           </div>

           <div className="w-full md:w-56 space-y-2">
             <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-4">Location</label>
             <select
               className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium appearance-none cursor-pointer"
               onChange={(e) => setFilters({ ...filters, location: e.target.value })}
             >
               <option value="">All Locations</option>
               {locations.map((loc) => (
                 <option key={loc} value={loc}>{loc}</option>
               ))}
             </select>
           </div>

           <div className="w-full md:w-56 space-y-2">
             <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-4">Job Type</label>
             <select
               className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium appearance-none cursor-pointer"
               onChange={(e) => setFilters({ ...filters, type: e.target.value })}
             >
               <option value="">All Types</option>
               {types.map((t) => (
                 <option key={t} value={t}>{t}</option>
               ))}
             </select>
           </div>
          </div>
        )}

        {/* Listings Display */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-6">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="h-28 w-full bg-slate-100 animate-pulse rounded-24" />
               ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <AnimatePresence>
                  {filteredJobs.map((job) => {
                    const isApplied = appliedJobIds.has(job.id);
                    return (
                      <motion.div
                        key={job.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div
                          onClick={(e) => {
                            if (!isLoaded) return;
                            if (isApplied) return; // Prevent clicking if already applied
                            if (!user) {
                              e.preventDefault();
                              openAuth('sign-up');
                            } else {
                              router.push(`/job/${job.id}`);
                            }
                          }}
                          className={cn(
                            "group flex flex-col md:flex-row md:items-center justify-between p-8 rounded-32 border border-slate-100 bg-white transition-all relative overflow-hidden",
                            isApplied ? "opacity-75 cursor-default grayscale-[0.3]" : "hover:border-brand-purple/20 hover:shadow-premium cursor-pointer"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0 left-0 w-1.5 h-0 transition-all duration-300",
                            isApplied ? "h-full bg-green-500" : "bg-brand-purple group-hover:h-full"
                          )} />
                          <div className="flex-1">
                            <h3 className={cn(
                              "text-2xl font-bold mb-4 transition-colors",
                              isApplied ? "text-gray-500" : "text-gray-900 group-hover:text-brand-purple"
                            )}>
                               {job.title}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-gray-600 font-medium text-sm">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-brand-red" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-brand-purple" />
                                {job.type}
                              </span>
                              {job.salary_range && (
                                 <span className="font-bold text-gray-900 border-l border-slate-200 pl-4 ml-2">
                                   {job.salary_range}
                                 </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-8 md:mt-0 flex items-center gap-4">
                             {isApplied ? (
                               <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-full font-black text-xs uppercase tracking-widest border border-green-100">
                                 Applied ✓
                               </div>
                             ) : (
                               <>
                                 <span className="hidden md:inline font-bold text-brand-purple opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                   View Details
                                 </span>
                                 <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-home-gradient group-hover:border-transparent group-hover:text-white transition-all">
                                   <ChevronRight className="w-6 h-6" />
                                 </div>
                               </>
                             )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
            </AnimatePresence>
          ) : (
             <div className="text-center py-20 bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No jobs match your criteria</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => setFilters({ role: '', location: '', type: '' })}
                  className="mt-6 text-brand-purple font-bold hover:underline"
                >
                  Clear all filters
                </button>
             </div>
          )}
        </div>

        {limit && jobs.length > limit && (
           <div className="mt-16 text-center">
              <Link 
                href="/openings"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-full font-bold text-gray-900 hover:bg-slate-50 transition-all shadow-sm"
              >
                View All Openings <ChevronRight className="w-5 h-5" />
              </Link>
           </div>
        )}
      </div>
    </section>
  );
}
