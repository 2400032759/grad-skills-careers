'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, Users, FileCheck, Loader2, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    recentApplications: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data: jobs } = await supabase.from('jobs').select('id, is_active');
      const { data: candidates } = await supabase.from('candidates').select('id, created_at, job_id, full_name, status').order('created_at', { ascending: false }).limit(5);

      setStats({
        totalJobs: jobs?.length || 0,
        activeJobs: jobs?.filter(j => j.is_active).length || 0,
        totalCandidates: candidates?.length || 0, // Placeholder for total count
        recentApplications: candidates || [],
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-24">
      <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-4xl border border-slate-100 shadow-premium flex items-center justify-between"
        >
          <div className="space-y-2">
            <h3 className="font-lexend font-bold text-gray-500 uppercase tracking-widest text-xs">Total Jobs</h3>
            <p className="text-4xl font-black text-gray-900">{stats.totalJobs}</p>
          </div>
          <div className="w-16 h-16 bg-brand-purple/10 text-brand-purple rounded-3xl flex items-center justify-center">
            <Briefcase className="w-8 h-8" />
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
           className="bg-white p-10 rounded-4xl border border-slate-100 shadow-premium flex items-center justify-between"
        >
          <div className="space-y-2">
            <h3 className="font-lexend font-bold text-gray-500 uppercase tracking-widest text-xs">Active Roles</h3>
            <p className="text-4xl font-black text-green-500">{stats.activeJobs}</p>
          </div>
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center">
            <FileCheck className="w-8 h-8" />
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
           className="bg-white p-10 rounded-4xl border border-slate-100 shadow-premium flex items-center justify-between"
        >
          <div className="space-y-2">
            <h3 className="font-lexend font-bold text-gray-500 uppercase tracking-widest text-xs">Applications</h3>
            <p className="text-4xl font-black text-brand-red">{stats.totalCandidates}</p>
          </div>
          <div className="w-16 h-16 bg-brand-red/10 text-brand-red rounded-3xl flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-1">
               <h3 className="font-lexend font-bold text-2xl text-gray-900">Recent Applications</h3>
               <Link href="/admin/candidates" className="text-brand-purple font-bold text-sm tracking-wide uppercase hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-4xl overflow-hidden shadow-premium">
               {stats.recentApplications.length > 0 ? (
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                       <tr>
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {stats.recentApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-8 py-6 font-bold text-gray-900">{app.full_name}</td>
                             <td className="px-8 py-6">
                                <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-xs font-black uppercase tracking-widest">
                                   {app.status}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right font-medium text-gray-500 text-sm">
                                {new Date(app.created_at).toLocaleDateString()}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               ) : (
                 <div className="p-12 text-center text-gray-400 font-bold">No applications yet.</div>
               )}
            </div>
         </div>

         <div className="lg:col-span-1 space-y-8">
            <h3 className="font-lexend font-bold text-2xl text-gray-900 px-1">Quick Actions</h3>
            <div className="space-y-4">
               <Link href="/admin/jobs" className="block p-8 bg-home-gradient rounded-3xl text-white shadow-lg hover:shadow-2xl transition-all">
                  <p className="font-bold text-xl mb-2">Create New Job</p>
                  <p className="text-white/80 text-sm font-medium">Add a new career opportunity to the platform.</p>
               </Link>
               <Link href="https://gradskills.in" className="block p-8 bg-white border border-slate-200 rounded-3xl text-gray-900 shadow-sm hover:border-brand-purple transition-all">
                  <p className="font-bold text-xl mb-2">View Main Platform</p>
                  <p className="text-gray-500 text-sm font-medium">Check the main GradSkills website for branding alignment.</p>
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
}
