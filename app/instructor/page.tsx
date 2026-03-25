'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Cpu, 
  Globe, 
  Smartphone, 
  ChevronRight, 
  CheckCircle2, 
  Upload, 
  Loader2, 
  Paperclip,
  Award,
  Users,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import InstructorForm from '@/components/InstructorForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function InstructorPage() {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      <Navbar hideAuth={true} />
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-purple/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -right-24 w-[40rem] h-[40rem] bg-blue-500/5 blur-[160px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto pt-24">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header Section */}
              <div className="text-center max-w-3xl mx-auto mb-12 px-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/10 text-brand-purple font-bold text-xs uppercase tracking-widest mb-6"
                >
                  <Award className="w-4 h-4" /> Join our Elite Instructor Network
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-lexend font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">
                  Teach the <span className="text-transparent bg-clip-text bg-home-gradient">Next Generation</span> of Builders
                </h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed mb-10">
                  We are hiring expert instructors to deliver world-class courses in Web, App, and Agentic AI Development.
                </p>

                <motion.button
                  onClick={scrollToForm}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 bg-home-gradient text-white rounded-full font-bold text-xl shadow-premium hover:shadow-2xl transition-all mb-12"
                >
                  Apply Now
                </motion.button>
              </div>

              {/* Roles Grid Above Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-6xl mx-auto px-6">
                {[
                  {
                    title: "Web Development",
                    icon: Globe,
                    desc: "Mastering React, Next.js, and Modern Web Architectures.",
                    color: "bg-blue-500"
                  },
                  {
                    title: "App Development",
                    icon: Smartphone,
                    desc: "Building native-quality experiences with Flutter & React Native.",
                    color: "bg-purple-500"
                  },
                  {
                    title: "Agentic AI Automation",
                    icon: Cpu,
                    desc: "Leading the frontier in AI Agents, LLM Orchestration, and Autonomy.",
                    color: "bg-emerald-500"
                  }
                ].map((role, idx) => (
                  <motion.div
                    key={role.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-premium hover:shadow-2xl transition-all hover:-translate-y-2"
                  >
                    <div className={`w-16 h-16 rounded-3xl ${role.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <role.icon className={`w-8 h-8 ${role.color.replace('bg-', 'text-')}`} />
                    </div>
                    <h3 className="text-2xl font-lexend font-bold text-gray-900 mb-3">{role.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{role.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Form Section */}
              <div ref={formRef} className="w-full max-w-4xl mx-auto mb-12 scroll-mt-24">
                <div className="bg-white rounded-none md:rounded-[3rem] p-0 md:p-2 border-x-0 md:border border-slate-100 shadow-none md:shadow-2xl relative">
                  <div className="p-6 md:p-14">
                    <div className="mb-12">
                      <h2 className="text-4xl font-lexend font-black text-gray-900 mb-4">Instructor Application</h2>
                      <p className="text-gray-500 font-medium">Tell us about your expertise and passion for teaching.</p>
                    </div>
                    <InstructorForm onComplete={() => setSubmitted(true)} />
                  </div>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8"
            >
              <div className="relative mb-12">
                 {/* Success 3D Animation (simulated with motion) */}
                 <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 100 }}
                    className="w-40 h-40 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                 >
                    <motion.div
                       initial={{ pathLength: 0, opacity: 0 }}
                       animate={{ pathLength: 1, opacity: 1 }}
                       transition={{ delay: 0.3, duration: 0.8 }}
                    >
                       <svg className="w-20 h-20 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                       </svg>
                    </motion.div>

                    {/* Orbiting particles */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-green-400 rounded-full"
                        animate={{ 
                          x: [Math.cos(i * 60) * 100, Math.cos((i * 60) + 360) * 100],
                          y: [Math.sin(i * 60) * 100, Math.sin((i * 60) + 360) * 100],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          delay: i * 0.2,
                          ease: "linear"
                        }}
                      />
                    ))}
                 </motion.div>
              </div>

              <h2 className="text-5xl font-lexend font-black text-gray-900 mb-4">Application Submitted!</h2>
              <p className="text-xl text-gray-500 font-medium max-w-md mx-auto mb-10">
                We'll respond to your application as soon as possible. Thank you for your interest!
              </p>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="px-10 py-5 bg-home-gradient text-white rounded-full font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 group"
              >
                Go to Homepage <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
}
