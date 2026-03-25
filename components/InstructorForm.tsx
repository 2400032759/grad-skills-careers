'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Upload, CheckCircle2, X, Paperclip, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getR2PresignedUrl } from '@/app/actions/upload';
import { cn } from '@/lib/utils';

type Props = {
  onComplete: () => void;
};

export default function InstructorForm({ onComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    specialization: 'Web Development', // Default option
  });
  const [resume, setResume] = useState<File | null>(null);

  const specializations = [
    'Web Development',
    'App Development',
    'Agentic AI Automation',
    'Multiple Focus Areas'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) { toast.error('Please upload your resume (PDF)'); return; }

    setLoading(true);
    const loadingToast = toast.loading('Submitting application...');

    try {
      const { success: r2Success, signedUrl, publicUrl, error: r2Error } = await getR2PresignedUrl(resume.name, resume.type);
      if (!r2Success || !signedUrl) throw new Error(r2Error || 'Failed to get upload URL');

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: resume,
        headers: { 'Content-Type': resume.type },
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      // Note: We use the 'instructor' job_id to ensure it shows up in the admin dashboard.
      const { error: dbError } = await supabase.from('candidates').insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        linkedin_url: formData.linkedin || null,
        portfolio_url: formData.portfolio || null,
        resume_url: publicUrl,
        job_id: 'instructor',
        status: 'Applied',
      });

      if (dbError) {
        if (dbError.code === '23505') toast.error('You have already applied.');
        else throw dbError;
      } else {
        toast.success('Interest registered!');
        onComplete();
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">Full Name *</label>
          <input required type="text" placeholder="Your Name"
            className="w-full px-7 py-5 rounded-[1.5rem] bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
            value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">Email Address *</label>
          <input required type="email" placeholder="Email ID"
            className="w-full px-7 py-5 rounded-[1.5rem] bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">Phone Number *</label>
          <input required type="tel" placeholder="+91 98765 43210"
            className="w-full px-7 py-5 rounded-[1.5rem] bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
            value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">Area of Specialization *</label>
          <select
            className="w-full px-7 py-5 rounded-[1.5rem] bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium appearance-none cursor-pointer"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          >
            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">LinkedIn Profile</label>
          <input type="text" placeholder="LinkedIn profile (URL)"
            className="w-full px-7 py-5 rounded-[1.5rem] bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
            value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">Portfolio (Optional)</label>
          <input type="url" placeholder="Portfolio (URL)"
            className="w-full px-7 py-5 rounded-[1.5rem] bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
            value={formData.portfolio} onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">Resume / CV (PDF, Max 5MB) *</label>
        <div className={cn(
          "relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer group",
          resume ? "border-brand-purple bg-brand-purple/5" : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-brand-purple/50"
        )}>
          <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB allowed.'); return; }
                if (file.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
                setResume(file);
              }
            }} />
          <div className="flex flex-col items-center gap-4">
            {resume ? (
              <><Paperclip className="w-12 h-12 text-brand-purple" />
                <p className="font-bold text-gray-900 truncate max-w-xs text-lg">{resume.name}</p>
                <span className="text-sm font-medium text-gray-500">Click to replace</span></>
            ) : (
              <><Upload className="w-12 h-12 text-slate-300 group-hover:text-brand-purple transition-colors" />
                <p className="font-bold text-gray-900 text-lg">Drag & drop or click to upload CV</p>
                <span className="text-sm font-medium text-gray-500">PDF Files only, up to 5MB</span></>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button disabled={loading} type="submit"
          className={cn(
            "w-full py-6 text-white rounded-full font-bold text-xl shadow-premium hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3",
            "bg-home-gradient"
          )}>
          {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Submitting Application...</> : 'Apply as Instructor'}
        </button>
      </div>
    </form>
  );
}
