'use client';

import { useState, useRef } from 'react';
import { useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X, Loader2, ArrowLeft } from 'lucide-react';

type View = 'sign-in' | 'sign-up' | 'forgot-password' | 'forgot-otp' | 'forgot-new-password' | 'sign-up-otp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'sign-in' | 'sign-up';
  noRedirect?: boolean;
}

export default function AuthModal({ isOpen, onClose, defaultView = 'sign-in', noRedirect = false }: AuthModalProps) {
  const [view, setView] = useState<View>(defaultView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const rateLimitTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clerk = useClerk();

  const ADMIN_EMAILS = ['kakkirenivishwas1@gmail.com', 'vishwas@redhost.tech', 'support@procreationstudio.com', 'kakkirenivishwas1409@gmail.com'];
  
  const redirectAfterAuth = (userEmail?: string) => {
    onClose();
    if (noRedirect) return;
    window.location.href = ADMIN_EMAILS.includes(userEmail || '') ? '/admin' : '/openings';
  };

  const switchView = (v: View) => { setError(''); setSuccess(''); setView(v); };

  const startRateLimit = (seconds = 120) => {
    if (rateLimitTimer.current) clearInterval(rateLimitTimer.current);
    setRateLimitSeconds(seconds);
    rateLimitTimer.current = setInterval(() => {
      setRateLimitSeconds(s => {
        if (s <= 1) { clearInterval(rateLimitTimer.current!); setError(''); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const handleClerkError = (err: any, fallback = 'Something went wrong. Try again.') => {
    const code = err?.errors?.[0]?.code || '';
    const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || fallback;
    if (code === 'too_many_requests' || msg.toLowerCase().includes('too many')) {
      startRateLimit(120);
      setError('Rate limited by Clerk. Please wait before trying again.');
    } else {
      setError(msg);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const client = (clerk as any).client;
      const result = await client.signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await (clerk as any).setActive({ session: result.createdSessionId });
        redirectAfterAuth(email);
      } else {
        setError('Additional verification required. Please try again.');
      }
    } catch (err: any) {
      handleClerkError(err, 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitSeconds > 0) return;
    setLoading(true); setError('');
    try {
      const client = (clerk as any).client;
      const firstName = name.split(' ')[0];
      const lastName = name.split(' ').slice(1).join(' ') || undefined;
      const result = await client.signUp.create({ emailAddress: email, password, firstName, lastName });
      if (result.status === 'complete') {
        await (clerk as any).setActive({ session: result.createdSessionId });
        redirectAfterAuth(email);
      } else {
        await client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        switchView('sign-up-otp');
      }
    } catch (err: any) {
      handleClerkError(err, 'Could not create account. Try again.');
    } finally { setLoading(false); }
  };

  const handleSignUpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const client = (clerk as any).client;
      const result = await client.signUp.attemptEmailAddressVerification({ code: otp.join('') });
      if (result.status === 'complete') {
        await (clerk as any).setActive({ session: result.createdSessionId });
        redirectAfterAuth(email);
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'Invalid or expired code.');
    } finally { setLoading(false); }
  };

  const handleResendSignUpOtp = async () => {
    if (resendCooldown) return;
    try {
      const client = (clerk as any).client;
      await client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setOtp(['', '', '', '', '', '']);
      setError('');
      setSuccess('Code resent! Check your inbox.');
      setResendCooldown(true);
      setTimeout(() => { setResendCooldown(false); setSuccess(''); }, 30000);
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'Could not resend. Try again in a moment.');
    }
  };

  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const client = (clerk as any).client;
      await client.signIn.create({ strategy: 'reset_password_email_code', identifier: email });
      switchView('forgot-otp');
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'Could not send reset email.');
    } finally { setLoading(false); }
  };

  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const client = (clerk as any).client;
      const result = await client.signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: otp.join(''),
      });
      if (result.status === 'needs_new_password') {
        switchView('forgot-new-password');
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'Invalid or expired code.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const client = (clerk as any).client;
      const result = await client.signIn.resetPassword({ password: newPassword });
      if (result.status === 'complete') {
        await (clerk as any).setActive({ session: result.createdSessionId });
        onClose();
        if (noRedirect) return;
        window.location.href = '/';
      } else {
        setError('Could not reset. Please try again.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'Password reset failed.');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const n = [...otp]; n[i] = val; setOtp(n);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  if (!isOpen) return null;

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
  };

  const PrimaryButton = ({ children, isLoading, ...props }: any) => (
    <button
      {...props}
      disabled={isLoading || props.disabled || rateLimitSeconds > 0}
      className="w-full h-14 bg-gradient-to-r from-[#ff5757] to-[#8c52ff] text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
    >
      {isLoading ? <Loader2 size={20} className="animate-spin" /> : rateLimitSeconds > 0 ? `Try again in ${rateLimitSeconds}s` : children}
    </button>
  );

  const isForgotView = ['forgot-password', 'forgot-otp', 'forgot-new-password', 'sign-up-otp'].includes(view);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          <div id="clerk-captcha" className="hidden" />
          <button onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-all z-20">
            <X size={16} className="text-slate-500" />
          </button>

          <div className="px-10 pt-10 pb-8">
            {isForgotView && (
              <button onClick={() => switchView('sign-in')}
                className="flex items-center gap-2 text-slate-500 hover:text-gray-900 font-semibold text-sm mb-6 transition-colors -mt-2">
                <ArrowLeft size={15} /> Back to Sign in
              </button>
            )}

            <AnimatePresence mode="wait">
              {view === 'sign-in' && (
                <motion.div key="si" variants={slideVariants} custom={-1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
                  <h2 className="font-lexend font-bold text-[26px] text-gray-900 tracking-tight leading-tight mb-1">Welcome back.</h2>
                  <p className="text-slate-500 font-medium text-sm mb-7">Sign in to manage your career applications.</p>
                  {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-2xl px-4 py-3 mb-5">{success}</div>}

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-gray-800 uppercase tracking-widest block mb-2">Email</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                        className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#8c52ff] transition-all" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-black text-gray-800 uppercase tracking-widest">Password</label>
                        <button type="button" onClick={() => switchView('forgot-password')}
                          className="text-xs text-[#8c52ff] font-bold hover:underline">Forgot password?</button>
                      </div>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                          className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#8c52ff] transition-all pr-12" />
                        <button type="button" onClick={() => setShowPassword(s => !s)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    <PrimaryButton type="submit" isLoading={loading}>Sign in</PrimaryButton>
                  </form>
                </motion.div>
              )}

              {view === 'sign-up' && (
                <motion.div key="su" variants={slideVariants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
                  <h2 className="font-lexend font-bold text-[26px] text-gray-900 tracking-tight leading-tight mb-1">Join GradSkills.</h2>
                  <p className="text-slate-500 font-medium text-sm mb-7">Create your account to apply for positions.</p>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-gray-800 uppercase tracking-widest block mb-2">Full Name</label>
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name"
                        className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#8c52ff] transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-800 uppercase tracking-widest block mb-2">Email</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                        className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#8c52ff] transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-800 uppercase tracking-widest block mb-2">Password</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                          className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#8c52ff] transition-all pr-12" />
                        <button type="button" onClick={() => setShowPassword(s => !s)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    <PrimaryButton type="submit" isLoading={loading}>Create account</PrimaryButton>
                  </form>
                </motion.div>
              )}

              {view === 'forgot-password' && (
                <motion.div key="fp" variants={slideVariants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
                  <h2 className="font-lexend font-bold text-[26px] text-gray-900 tracking-tight leading-tight mb-1">Reset password.</h2>
                  <p className="text-slate-500 font-medium text-sm mb-7">Enter your email for a 6-digit reset code.</p>
                  <form onSubmit={handleForgotSend} className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-gray-800 uppercase tracking-widest block mb-2">Email</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                        className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#8c52ff] transition-all" />
                    </div>
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    <PrimaryButton type="submit" isLoading={loading}>Send Reset Code</PrimaryButton>
                  </form>
                </motion.div>
              )}

              {view === 'forgot-otp' && (
                <motion.div key="fo" variants={slideVariants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
                  <h2 className="font-lexend font-bold text-[26px] text-gray-900 tracking-tight leading-tight mb-1">Verification code.</h2>
                  <p className="text-slate-500 font-medium text-sm mb-7">6-digit code sent to {email}</p>
                  <form onSubmit={handleForgotVerify} className="space-y-6">
                    <div className="flex gap-3 justify-center">
                      {otp.map((digit, i) => (
                        <input key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          autoFocus={i === 0}
                          className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8c52ff] transition-all"
                        />
                      ))}
                    </div>
                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
                    <PrimaryButton type="submit" isLoading={loading}>Verify Code</PrimaryButton>
                  </form>
                </motion.div>
              )}

              {view === 'forgot-new-password' && (
                <motion.div key="fnp" variants={slideVariants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
                  <h2 className="font-lexend font-bold text-[26px] text-gray-900 tracking-tight leading-tight mb-1">Set new password.</h2>
                  <p className="text-slate-500 font-medium text-sm mb-7">Choose a strong new password.</p>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-gray-800 uppercase tracking-widest block mb-2">New Password</label>
                      <div className="relative">
                        <input type={showNewPassword ? 'text' : 'password'} required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters"
                          className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#8c52ff] transition-all pr-12" />
                        <button type="button" onClick={() => setShowNewPassword(s => !s)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    <PrimaryButton type="submit" isLoading={loading}>Update Password</PrimaryButton>
                  </form>
                </motion.div>
              )}

              {view === 'sign-up-otp' && (
                <motion.div key="suo" variants={slideVariants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
                  <h2 className="font-lexend font-bold text-[26px] text-gray-900 tracking-tight leading-tight mb-1">Verify email.</h2>
                  <p className="text-slate-500 font-medium text-sm mb-7">6-digit code sent to {email}</p>
                  <form onSubmit={handleSignUpVerify} className="space-y-6">
                    <div className="flex gap-3 justify-center">
                      {otp.map((digit, i) => (
                        <input key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          autoFocus={i === 0}
                          className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8c52ff] transition-all"
                        />
                      ))}
                    </div>
                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
                    <PrimaryButton type="submit" isLoading={loading}>Complete Sign Up</PrimaryButton>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isForgotView && (
            <div className="px-10 py-5 border-t border-slate-100 text-center">
              {view === 'sign-in' ? (
                <p className="text-slate-500 font-medium text-sm">
                  Don't have an account?{' '}
                  <button onClick={() => switchView('sign-up')} className="text-[#8c52ff] font-bold hover:underline">Sign up</button>
                </p>
              ) : (
                <p className="text-slate-500 font-medium text-sm">
                  Already have an account?{' '}
                  <button onClick={() => switchView('sign-in')} className="text-[#8c52ff] font-bold hover:underline">Sign in</button>
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
