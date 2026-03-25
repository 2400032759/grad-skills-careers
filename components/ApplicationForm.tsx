'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Upload, CheckCircle2, X, Paperclip, Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getR2PresignedUrl } from '@/app/actions/upload';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';

type Props = {
  jobId: string;
  jobTitle: string;
  onClose?: () => void;
};

export default function ApplicationForm({ jobId, jobTitle, onClose }: Props) {
  const { user, isLoaded } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
  });
  const [resume, setResume] = useState<File | null>(null);

  // Sync user data and close modal when logged in
  useEffect(() => {
    if (user) {
      if (showAuth) setJustLoggedIn(true); 
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.primaryEmailAddress?.emailAddress || '',
      }));
      setShowAuth(false);
    }
  }, [user, showAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!user) { setShowAuth(true); return; }
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

      const { error: dbError } = await supabase.from('candidates').insert({
        clerk_user_id: user?.id || null,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        linkedin_url: formData.linkedin || null,
        portfolio_url: formData.portfolio || null,
        resume_url: publicUrl,
        job_id: jobId,
        status: 'Applied',
      });

      if (dbError) {
        if (dbError.code === '23505') toast.error('Already applied for this position.');
        else throw dbError;
      } else {
        setSuccess(true);
        toast.success('Application submitted!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-6 bg-white rounded-3xl shadow-premium">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-14 h-14" />
        </div>
        <h3 className="text-3xl font-lexend font-bold text-gray-900 mb-3">Application Sent!</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Thanks for applying for <strong className="text-gray-900">{jobTitle}</strong>. We'll get back to you soon.</p>
        <Link href="/my-applications" className="px-8 py-4 bg-home-gradient text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all inline-block">Track My Application →</Link>
      </motion.div>
    );
  }

  return (
    <div className="p-8 md:p-12 bg-white rounded-3xl shadow-premium border border-slate-100 relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 transition-colors text-gray-400">
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="mb-10">
        <h3 className="text-3xl font-lexend font-bold text-gray-900 mb-2">Apply for Position</h3>
        <p className="font-bold text-brand-purple tracking-wide uppercase text-sm">{jobTitle}</p>
      </div>

      <AnimatePresence>
        {justLoggedIn && !success && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 shadow-sm"
          >
             <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
             <p className="font-bold text-sm">Success! You're signed in. Now just click "Submit Application" below to finish.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">Full Name *</label>
            <input required type="text" placeholder="John Doe"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
              value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">Email Address *</label>
            <input required type="email" placeholder="john@example.com"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">Phone Number *</label>
            <input required type="tel" placeholder="+91 98765 43210"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
              value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">LinkedIn Profile</label>
            <input type="text" placeholder="linkedin.com/in/..."
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium"
              value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-900 uppercase tracking-widest block ml-1">Resume (PDF, Max 2MB) *</label>
          <div className={cn(
            "relative border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group",
            resume ? "border-brand-purple bg-brand-purple/5" : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-brand-purple/50"
          )}>
            <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB.'); return; }
                  if (file.type !== 'application/pdf') { toast.error('PDF only.'); return; }
                  setResume(file);
                }
              }} />
            <div className="flex flex-col items-center gap-3">
              {resume ? (
                <><Paperclip className="w-10 h-10 text-brand-purple" />
                  <p className="font-bold text-gray-900 truncate max-w-xs">{resume.name}</p>
                  <span className="text-sm font-medium text-gray-500">Click to replace</span></>
              ) : (
                <><Upload className="w-10 h-10 text-slate-300 group-hover:text-brand-purple transition-colors" />
                  <p className="font-bold text-gray-900">Drag & drop or click to upload</p>
                  <span className="text-sm font-medium text-gray-500">PDF Files only, up to 2MB</span></>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          {!user ? (
            <button 
              type="button" onClick={() => setShowAuth(true)}
              className="w-full py-5 bg-brand-purple text-white rounded-full font-bold text-lg shadow-premium hover:bg-brand-purple/90 transition-all flex items-center justify-center gap-3"
            >
              <Lock className="w-5 h-5" /> Sign in to Apply
            </button>
          ) : (
            <button disabled={loading} type="submit"
              className={cn(
                "w-full py-5 text-white rounded-full font-bold text-lg shadow-premium hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3",
                justLoggedIn ? "bg-brand-purple shadow-[0_0_20px_rgba(140,82,255,0.4)] animate-pulse-subtle" : "bg-home-gradient"
              )}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Application'}
            </button>
          )}
        </div>
      </form>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} noRedirect={true} />
    </div>
  );
}
