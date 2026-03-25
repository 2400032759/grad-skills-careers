'use client';

import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-gradient/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-brand-gradient/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 opacity-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10 space-y-4">
          <img 
            src="https://image2url.com/r2/default/images/1772362953079-6c29c142-3343-457e-aa4f-e62893004fd6.png" 
            alt="GradSkills" 
            className="h-12 w-auto object-contain mx-auto mb-6"
          />
          <h1 className="font-lexend font-bold text-3xl text-gray-900 tracking-tight">Admin Portal</h1>
          <p className="font-medium text-gray-500">Sign in to manage GradSkills careers.</p>
        </div>

        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full mx-auto",
              card: "shadow-2xl border border-slate-100 rounded-4xl bg-white",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formButtonPrimary: "bg-home-gradient hover:bg-home-gradient shadow-premium hover:shadow-2xl rounded-2xl py-4 font-bold transition-all",
              formFieldInput: "rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-purple transition-all font-medium py-4 px-6",
              footerActionLink: "text-brand-purple hover:text-brand-purple/80 font-bold",
              identityPreviewText: "font-medium text-gray-900",
              identityPreviewEditButton: "text-brand-purple hover:text-brand-purple/80 font-bold",
            }
          }}
          routing="path"
          path="/admin/login"
        />

        <div className="mt-12 text-center text-xs text-gray-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-8">
          GradSkills Administration
        </div>
      </motion.div>
    </div>
  );
}
