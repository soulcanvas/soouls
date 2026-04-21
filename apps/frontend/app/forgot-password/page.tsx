'use client';

import { useSignIn } from '@clerk/nextjs';
import { ArrowLeft, CheckCircle2, Lock, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Step = 'email' | 'code' | 'success';

export default function ForgotPassword() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [emailAddress, setEmailAddress] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ─── Step 1: Send Reset Code ────────────────────────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });
      setStep('code');
    } catch (err: any) {
      console.error(err);
      const msg = err.errors?.[0]?.message || 'Failed to send reset code.';
      if (msg.toLowerCase().includes('no account') || msg.toLowerCase().includes('not found')) {
        setError('No account found with this email address.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Verify Code + Set New Password ────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setStep('success');
        // Redirect to dashboard after a short delay
        setTimeout(() => router.push('/home'), 2000);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || 'Invalid code or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Success Step ───────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center font-sans text-slate-200 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="z-10 w-full max-w-[420px] bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h2 className="font-serif text-3xl mb-4 text-white italic">Password Reset!</h2>
          <p className="text-sm text-slate-400 mb-6">
            Your password has been updated successfully. Redirecting you to the dashboard...
          </p>
          <div className="relative w-8 h-8 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Code + New Password Step ───────────────────────────────────────────────
  if (step === 'code') {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center font-sans text-slate-200 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-900/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#111111_100%)] pointer-events-none" />

        <div className="absolute top-10 left-12">
          <h1 className="font-serif text-2xl italic text-orange-200/90 tracking-wide">Soouls</h1>
        </div>

        <div className="z-10 w-full max-w-[420px] bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative">
          <button
            onClick={() => {
              setStep('email');
              setError('');
            }}
            className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>

          <div className="text-center mb-8 pt-4">
            <h2 className="font-serif text-3xl mb-4 text-white italic">Reset Password</h2>
            <p className="text-sm text-slate-400">
              Enter the code sent to <span className="text-orange-300">{emailAddress}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">
                VERIFICATION CODE
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 px-4 text-center text-xl tracking-[0.5em] text-white placeholder-slate-600 outline-none transition-all"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">
                NEW PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-200 hover:to-orange-300 text-orange-950 font-medium text-base py-4 rounded-full transition-all shadow-[0_0_20px_rgba(253,186,116,0.15)] disabled:opacity-50 flex items-center justify-center group"
            >
              {isLoading ? (
                'Resetting...'
              ) : (
                <>
                  Reset Password
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          <button
            onClick={handleSendCode}
            className="mt-4 w-full text-center text-xs text-slate-500 hover:text-orange-300 transition-colors"
          >
            Didn't receive the code? Send again
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 w-full px-12 flex justify-between items-center text-[10px] tracking-widest text-slate-600 z-10">
          <div>© SOOULS</div>
          <div className="flex space-x-8">
            <Link href="#" className="hover:text-slate-400 transition-colors">
              PRIVACY
            </Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">
              TERMS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Email Entry Step ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center font-sans text-slate-200 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-900/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#111111_100%)] pointer-events-none" />

      {/* Header */}
      <div className="absolute top-10 left-12">
        <h1 className="font-serif text-2xl italic text-orange-200/90 tracking-wide">Soouls</h1>
      </div>

      <div className="absolute top-10 right-12">
        <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          ?
        </button>
      </div>

      {/* Main Card */}
      <div className="z-10 w-full max-w-[420px] bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <Sparkles className="w-5 h-5 text-orange-300" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl mb-4 text-white italic">Forgot Password?</h2>
          <p className="text-sm text-slate-400 max-w-[260px] mx-auto leading-relaxed">
            No worries. Enter your email and we'll send you a code to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSendCode} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">
              ACCOUNT EMAIL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-200 hover:to-orange-300 text-orange-950 font-medium text-base py-4 rounded-full transition-all shadow-[0_0_20px_rgba(253,186,116,0.15)] disabled:opacity-50 flex items-center justify-center group"
          >
            {isLoading ? (
              'Sending...'
            ) : (
              <>
                Send Reset Code
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link
            href="/sign-in"
            className="text-xs tracking-[0.1em] text-slate-500 hover:text-slate-300 transition-colors uppercase flex items-center justify-center space-x-2"
          >
            <span>←</span>
            <span>BACK TO SIGN IN</span>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center text-[10px] tracking-wider text-slate-500">
          NEED FURTHER ASSISTANCE?{' '}
          <Link
            href="#"
            className="text-orange-300/80 hover:text-orange-200 transition-colors border-b border-orange-300/30 pb-0.5"
          >
            CONNECT WITH SUPPORT
          </Link>
        </div>
      </div>

      {/* Footer text */}
      <div className="absolute bottom-6 w-full px-12 flex justify-between items-center text-[10px] tracking-widest text-slate-600 z-10">
        <div>© SOOULS</div>
        <div className="flex space-x-8">
          <Link href="#" className="hover:text-slate-400 transition-colors">
            PRIVACY
          </Link>
          <Link href="#" className="hover:text-slate-400 transition-colors">
            TERMS
          </Link>
          <Link href="#" className="hover:text-slate-400 transition-colors">
            CONTACT
          </Link>
        </div>
      </div>
    </div>
  );
}
