'use client';

import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const { user, isLoaded } = useUser();
  const { openAuth } = useAuth();
  const router = useRouter();

  const handleApplyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!user) {
      openAuth('sign-up');
    } else {
      router.push('/openings');
    }
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-10 md:pt-32 md:pb-16 bg-slate-50">
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-brand-gradient/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-brand-gradient/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="max-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-brand-purple uppercase bg-brand-purple/10 rounded-full">
            WE ARE HIRING
          </span>
          <h1 className="mb-6 font-lexend font-black text-4xl md:text-7xl lg:text-8xl tracking-tight text-gray-900 leading-[1.1]">
            Join Us to Build the <br />
            <span className="text-home-gradient">Future of Learning</span>
          </h1>
          <p className="max-w-2xl mx-auto mb-10 font-medium text-lg md:text-xl text-gray-600 leading-relaxed">
            Join GradSkills and help empower thousands of students to become the next generation of industry leaders.
          </p>
          
          <div className="flex justify-center">
            <motion.button
              onClick={handleApplyNow}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-home-gradient text-white rounded-full font-bold text-xl shadow-premium hover:shadow-2xl transition-all"
            >
              Apply Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
