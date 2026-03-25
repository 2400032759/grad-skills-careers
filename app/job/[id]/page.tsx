'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApplicationForm from '@/components/ApplicationForm';
import { MapPin, Briefcase, IndianRupee, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        if (error) console.error('Job not found:', error);
        
        // Mock fallback for common IDs or any ID during development
        const mockJobs: Record<string, Job> = {
          '1': {
            id: '1', title: 'Senior Product Designer', location: 'Remote', type: 'Full-time',
            salary_range: '₹12L - ₹18L', is_active: true, created_at: new Date().toISOString(),
            description: "### Role Overview\nWe are looking for a visionary Senior Product Designer to lead our design efforts...\n\n### What You'll Do\n- Design beautiful and functional interfaces\n- Collaborate with product and engineering\n- Conduct user research"
          },
          '2': {
             id: '2', title: 'Frontend Developer (React)', location: 'Bangalore, India', type: 'Full-time',
             salary_range: '₹8L - ₹15L', is_active: true, created_at: new Date().toISOString(),
             description: "### Role Overview\nJoin us as a Frontend Developer and build amazing user experiences...\n\n### Skills Required\n- React, Next.js, TypeScript\n- Tailwind CSS\n- Framer Motion"
          },
          '3': {
             id: '3', title: 'Content Strategy Intern', location: 'Remote', type: 'Internship',
             salary_range: '₹20k - ₹30k', is_active: true, created_at: new Date().toISOString(),
             description: "### Role Overview\nLearn content strategy from the ground up...\n\n### Perks\n- Mentorship\n- Certificate of completion"
          }
        };

        if (id && mockJobs[id as string]) {
          setJob(mockJobs[id as string]);
        } else {
          // If ID not in mock, use the first one as template or go back
          setJob(mockJobs['1']);
        }
      } else {
        setJob(data);
      }
      setLoading(false);
    }
    if (id) fetchJob();
  }, [id, router]);

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin" />
     </div>
  );

  if (!job) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-8 pb-32">
        <div className="max-container">
          <Link href="/openings" className="inline-flex items-center gap-2 mb-8 text-gray-500 hover:text-brand-purple transition-all group font-bold">
            <div className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center group-hover:bg-brand-purple group-hover:border-transparent group-hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
            Back to All Roles
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-8">
                 <span className="px-4 py-1.5 bg-brand-purple/10 text-brand-purple font-bold text-sm rounded-full tracking-wider uppercase">
                   {job.type}
                 </span>
                 <h1 className="font-lexend font-black text-5xl md:text-6xl text-gray-900 leading-tight">
                   {job.title}
                 </h1>
                 <div className="flex flex-wrap gap-12 font-bold text-gray-500 text-lg">
                    <div className="flex items-center gap-3">
                       <MapPin className="w-6 h-6 text-brand-red" />
                       {job.location}
                    </div>
                    {job.salary_range && (
                       <div className="flex items-center gap-3">
                          <IndianRupee className="w-6 h-6 text-green-500" />
                          {job.salary_range}
                       </div>
                    )}
                 </div>

                 {!(job as any).is_filled && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="inline-flex items-center gap-3 px-10 py-5 bg-home-gradient text-white rounded-2xl font-bold text-lg shadow-premium hover:shadow-2xl transition-all"
                    >
                      Apply for this Role <ArrowRight className="w-5 h-5" />
                    </motion.button>
                 )}
              </div>

              <div className="p-1 w-full h-px bg-gradient-to-r from-slate-200 via-brand-purple/20 to-slate-200" />


              <div className="prose prose-slate prose-lg max-w-none prose-headings:font-lexend prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:font-medium prose-p:leading-relaxed">
                 {/* Assuming description is markdown-ready or plain text with breaks */}
                 <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} />
              </div>
            </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-32 glass border border-white/50 rounded-4xl p-10 shadow-2xl space-y-8">
                    <div className="space-y-6">
                      <h4 className="font-lexend font-bold text-2xl text-gray-900">
                        {(job as any).is_filled ? 'Position Closed' : 'Interested in this role?'}
                      </h4>
                      <p className="font-medium text-gray-600">
                        {(job as any).is_filled 
                          ? "This position has been filled and we are no longer accepting applications. Thank you for your interest!" 
                          : "Submit your application today and our team will get in touch if it's a match."}
                      </p>
                      
                      {!(job as any).is_filled && (
                        <ul className="space-y-4">
                          <li className="flex items-start gap-4 text-sm font-bold text-gray-900">
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center pt-0.5 text-green-600">✓</div>
                              Fast application process
                          </li>
                          <li className="flex items-start gap-4 text-sm font-bold text-gray-900">
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center pt-0.5 text-green-600">✓</div>
                              Response within 7 days
                          </li>
                          <li className="flex items-start gap-4 text-sm font-bold text-gray-900">
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center pt-0.5 text-green-600">✓</div>
                              Direct impact on students
                          </li>
                        </ul>
                      )}
                    </div>

                    <button
                      disabled={(job as any).is_filled}
                      onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className={cn(
                        "w-full py-5 rounded-full font-bold text-xl shadow-premium transition-all flex items-center justify-center gap-3",
                        (job as any).is_filled 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                          : "bg-home-gradient text-white hover:shadow-2xl"
                      )}
                    >
                      {(job as any).is_filled ? 'Position Filled' : 'Apply Now'} {(job as any).is_filled ? null : <ArrowRight className="w-6 h-6" />}
                    </button>


                 <div className="pt-8 border-t border-slate-200">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Share this role</p>
                    <div className="flex justify-center gap-6 mt-6">
                       <button className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-500">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                       </button>
                       <button className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-500">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {!(job as any).is_filled && (
            <div className="mt-32 max-w-4xl mx-auto scroll-mt-32" id="apply-form">
              <ApplicationForm 
                 jobId={job.id} 
                 jobTitle={job.title} 
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
