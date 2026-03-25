'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Candidate, Job } from '@/types';
import { 
  Search, Download, ExternalLink, ChevronDown, 
  MapPin, User, Mail, Phone, Calendar, Loader2, Users, Linkedin 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data: candidatesData, error: cError } = await supabase
      .from('candidates')
      .select('*, jobs(title)')
      .order('created_at', { ascending: false });
    
    const { data: jobsData } = await supabase.from('jobs').select('id, title');
    
    if (cError) toast.error('Error fetching candidates');
    else {
      setCandidates(candidatesData || []);
      setJobs((jobsData as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, newStatus: Candidate['status']) => {
    const { error } = await supabase
      .from('candidates')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) toast.error('Error updating status');
    else {
      toast.success('Status updated');
      fetchData();
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(search.toLowerCase()) || 
                         c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus ? c.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const statuses: Candidate['status'][] = ['Applied', 'Under Review', 'Interview', 'Accepted', 'Rejected'];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-600';
      case 'Under Review': return 'bg-orange-100 text-orange-600';
      case 'Interview': return 'bg-purple-100 text-purple-600';
      case 'Accepted': return 'bg-green-100 text-green-600';
      case 'Rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-slate-100">
         <div className="space-y-1">
            <h2 className="font-lexend font-bold text-3xl text-gray-900">Applicants</h2>
            <p className="font-medium text-gray-500">Review and manage talent applications.</p>
         </div>
      </div>

      {/* Filters */}
      <div className="glass border border-slate-100 rounded-32 p-8 shadow-premium flex flex-col md:flex-row gap-6 items-center">
         <div className="flex-1 w-full space-y-2">
           <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-4">Search Applicants</label>
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input
               type="text"
               placeholder="Search by name or email..."
               className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
         </div>

         <div className="w-full md:w-56 space-y-2">
           <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-4">Filter Status</label>
           <select
             className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium appearance-none cursor-pointer"
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option value="">All Statuses</option>
             {statuses.map((s) => (
               <option key={s} value={s}>{s}</option>
             ))}
           </select>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-4xl shadow-premium pb-32">
         {loading ? (
            <div className="flex justify-center p-24"><Loader2 className="w-8 h-8 text-brand-purple animate-spin" /></div>
         ) : filteredCandidates.length > 0 ? (
               <table className="w-full text-left bg-white rounded-4xl">
                  <thead className="bg-slate-50 border-b border-slate-100 rounded-t-4xl">
                     <tr>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Candidate Info</th>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Applied Role</th>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Resume</th>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredCandidates.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-gray-400">
                                    <User className="w-6 h-6" />
                                 </div>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                       <p className="font-bold text-gray-900 text-lg leading-none">{c.full_name}</p>
                                       {c.linkedin_url && (
                                          <button 
                                             onClick={() => window.open(c.linkedin_url, '_blank')}
                                             className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                             title="View LinkedIn Profile"
                                          >
                                             <Linkedin className="w-4 h-4 fill-current" />
                                          </button>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                       <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
                                       <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.phone}</span>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="space-y-1">
                                 <p className="font-bold text-gray-900">{c.jobs?.title}</p>
                                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Applied {new Date(c.created_at).toLocaleDateString()}</p>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <button 
                                 onClick={() => window.open(c.resume_url, '_blank')}
                                 className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-slate-100 hover:text-brand-purple transition-all"
                              >
                                 <Download className="w-4 h-4" /> View Resume
                              </button>
                           </td>
                           <td className="px-10 py-8">
                              <span className={cn(
                                 "px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block shadow-sm",
                                 getStatusStyle(c.status)
                              )}>
                                 {c.status}
                              </span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="inline-block relative group/drop text-left">
                                 <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-gray-600 flex items-center gap-2 hover:border-brand-purple/50 transition-all">
                                    Change Status <ChevronDown className="w-4 h-4" />
                                 </button>
                                 <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover/drop:opacity-100 group-hover/drop:visible transition-all z-30 p-2 space-y-1">
                                    {statuses.map((s) => (
                                       <button
                                          key={s}
                                          onClick={() => updateStatus(c.id, s)}
                                          className={cn(
                                             "w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all",
                                             c.status === s ? "bg-brand-purple text-white" : "hover:bg-slate-50 text-gray-500 hover:text-brand-purple"
                                          )}
                                       >
                                          {s}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
         ) : (
            <div className="p-32 text-center text-gray-400">
               <Users className="w-16 h-16 mx-auto mb-6 text-slate-200" />
               <p className="font-bold text-xl">No candidates found.</p>
               <p className="font-medium">Try adjusting your search or filters.</p>
            </div>
         )}
      </div>
    </div>
  );
}
