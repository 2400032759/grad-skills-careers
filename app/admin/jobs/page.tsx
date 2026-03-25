'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types';
import { 
  Plus, Search, MoreVertical, Edit2, Trash2, CheckCircle, XCircle, 
  MapPin, Briefcase, IndianRupee, Loader2, X, Share2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Remote',
    type: 'Full-time' as Job['type'],
    salary_range: '',
    is_active: true,
    is_filled: false, // Added is_filled
    custom_id: '',
  });

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error('Error fetching jobs');
    else setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const copyJobLink = (id: string) => {
    const url = `${window.location.origin}/job/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Job URL copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { custom_id, ...rest } = formData;
      const payload = {
        ...rest,
        id: custom_id || undefined
      };

      if (editingJob) {
        const { error } = await supabase
          .from('jobs')
          .update(rest) // Don't try to update ID
          .eq('id', editingJob.id);
        if (error) throw error;
        toast.success('Job updated successfully');
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert([payload]);
        if (error) throw error;
        toast.success('Job created successfully');
      }
      setShowModal(false);
      setEditingJob(null);
      setFormData({
        title: '', description: '', location: 'Remote',
        type: 'Full-time', salary_range: '', is_active: true, is_filled: false, custom_id: ''
      });
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (job: Job) => {
    const { error } = await supabase
      .from('jobs')
      .update({ is_active: !job.is_active })
      .eq('id', job.id);

    if (error) toast.error('Error updating status');
    else fetchJobs();
  };

  const toggleFilled = async (job: Job) => {
    const { error } = await supabase
      .from('jobs')
      .update({ is_filled: !(job as any).is_filled })
      .eq('id', job.id);

    if (error) toast.error('Error updating status');
    else fetchJobs();
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job? This will also delete all associated applications.')) return;
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) toast.error('Error deleting job');
    else {
      toast.success('Job deleted');
      fetchJobs();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-100">
         <div className="space-y-1">
            <h2 className="font-lexend font-bold text-3xl text-gray-900">Career Roles</h2>
            <p className="font-medium text-gray-500">Create and manage job listings for GradSkills.</p>
         </div>
         <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingJob(null);
              setFormData({ title: '', description: '', location: 'Remote', type: 'Full-time', salary_range: '', is_active: true, is_filled: false, custom_id: '' });
              setShowModal(true);
            }}
            className="px-8 py-4 bg-home-gradient text-white rounded-2xl font-bold flex items-center gap-3 shadow-premium"
         >
            <Plus className="w-6 h-6" /> Create New Role
         </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {loading && !showModal ? (
            <div className="flex justify-center p-24"><Loader2 className="w-8 h-8 text-brand-purple animate-spin" /></div>
         ) : jobs.length > 0 ? (
            jobs.map((job) => (
               <motion.div
                  key={job.id}
                  layout
                  className="bg-white p-10 rounded-4xl border border-slate-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-12 group hover:border-brand-purple/20 transition-all"
               >
                  <div className="flex-1 space-y-6">
                     <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-brand-purple transition-all">{job.title}</h3>
                        <div className="flex gap-2">
                          <span className={cn(
                             "px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full",
                             job.is_active ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                          )}>
                             {job.is_active ? "Active" : "Inactive"}
                          </span>
                          {(job as any).is_filled && (
                            <span className="px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full bg-red-100 text-red-600">
                               Filled
                            </span>
                          )}
                        </div>
                        <code className="text-[10px] font-mono bg-slate-50 px-2 py-0.5 rounded text-slate-400">ID: {job.id}</code>
                     </div>
                     <div className="flex flex-wrap gap-10 font-bold text-gray-500 text-sm">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-red" /> {job.location}</div>
                        <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-brand-purple" /> {job.type}</div>
                        {job.salary_range && <div className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-green-500" /> {job.salary_range}</div>}
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <button
                        onClick={() => copyJobLink(job.id)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-brand-purple font-bold text-sm transition-all"
                     >
                        <Share2 className="w-4 h-4" /> Copy Share Link
                     </button>
                     <div className="w-px h-8 bg-slate-100 mx-1" />
                     <button
                        onClick={() => {
                           setEditingJob(job);
                           setFormData({
                              title: job.title,
                              description: job.description,
                              location: job.location,
                              type: job.type,
                              salary_range: job.salary_range || '',
                              is_active: job.is_active,
                              is_filled: (job as any).is_filled || false,
                              custom_id: job.id,
                           });
                           setShowModal(true);
                        }}
                        className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 text-gray-400 transition-all font-bold"
                        title="Edit Role"
                     >
                        <Edit2 className="w-5 h-5" />
                     </button>
                     <button
                        onClick={() => deleteJob(job.id)}
                        className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-red-50 text-red-400 transition-all font-bold"
                        title="Delete Role"
                     >
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
               </motion.div>
            ))
         ) : (
            <div className="text-center py-32 bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
               <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-6" />
               <p className="text-gray-500 font-bold">No jobs created yet. Start by adding your first role.</p>
            </div>
         )}
      </div>

      <AnimatePresence>
         {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
               <motion.div
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                 onClick={() => setShowModal(false)}
               />
               <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-4xl bg-white rounded-4xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-full"
               >
                  <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                     <h3 className="font-lexend font-bold text-3xl text-gray-900">{editingJob ? 'Edit Role' : 'Create New Role'}</h3>
                     <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-gray-400"><X className="w-8 h-8" /></button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-1">Job ID (Slug) *</label>
                           <input
                              required
                              placeholder="e.g. frontend-dev-01"
                              disabled={!!editingJob}
                              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium disabled:opacity-50"
                              value={formData.custom_id}
                              onChange={(e) => setFormData({ ...formData, custom_id: e.target.value.toLowerCase().replace(/ /g, '-') })}
                           />
                           <p className="text-[10px] text-gray-400 italic">This will be used in the URL: careers.gradskills.in/job/<strong>{formData.custom_id || 'ID'}</strong></p>
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-1">Job Title *</label>
                           <input
                              required
                              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-1">Salary Range</label>
                           <input
                              placeholder="e.g. ₹5L - ₹8L"
                              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
                              value={formData.salary_range}
                              onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                           />
                        </div>
                        <div className="space-y-6">
                           <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-1 mt-2 block">Settings</label>
                           <div className="flex gap-8">
                             <label className="flex items-center gap-3 cursor-pointer group">
                               <input
                                 type="checkbox"
                                 checked={formData.is_active}
                                 onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                 className="w-6 h-6 rounded-lg text-brand-purple focus:ring-brand-purple border-slate-200 transition-all"
                               />
                               <span className="font-bold text-gray-600 group-hover:text-gray-900">Active</span>
                             </label>
                             <label className="flex items-center gap-3 cursor-pointer group">
                               <input
                                 type="checkbox"
                                 checked={formData.is_filled}
                                 onChange={(e) => setFormData({ ...formData, is_filled: e.target.checked })}
                                 className="w-6 h-6 rounded-lg text-brand-purple focus:ring-brand-purple border-slate-200 transition-all"
                               />
                               <span className="font-bold text-gray-600 group-hover:text-gray-900">Mark as Filled</span>
                             </label>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-1">Location *</label>
                           <input
                              required
                              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-1">Employment Type *</label>
                           <select
                              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value as Job['type'] })}
                           >
                              <option value="Full-time">Full-time</option>
                              <option value="Internship">Internship</option>
                              <option value="Contract">Contract</option>
                           </select>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-xs font-black text-gray-900 uppercase tracking-widest pl-1">Description (Markdown supported) *</label>
                        <textarea
                           required
                           rows={8}
                           className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium resize-none shadow-inner"
                           value={formData.description}
                           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                     </div>

                     <div className="flex justify-end gap-6 pt-6">
                        <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-gray-400 font-bold hover:text-gray-900 transition-colors">Cancel</button>
                        <button
                           disabled={loading}
                           type="submit"
                           className="px-10 py-5 bg-home-gradient text-white rounded-2xl font-bold shadow-premium hover:shadow-2xl transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                           {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                           {editingJob ? 'Save Changes' : 'Create & Generate Link'}
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
