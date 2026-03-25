'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#8c52ff] mx-auto" />
        <p className="text-slate-500 font-medium">Completing sign in...</p>
        {/* Official Clerk handler */}
        <div className="hidden">
           <AuthenticateWithRedirectCallback />
        </div>
      </div>
    </div>
  );
}
