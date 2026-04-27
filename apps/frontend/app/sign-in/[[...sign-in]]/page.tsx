'use client';

import { useSignIn, useUser } from '@clerk/nextjs';
import { ArrowLeft, Lock, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

type AuthMethod = 'email' | 'phone';
type Step = 'form' | 'phone-verify';

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const { user } = useUser();

  // ─── If user already signed in, redirect to home ─────────────────
  const [step, setStep] = useState<Step>('form');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');

  // Form state
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    router.replace('/home');
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
          <p className="text-slate-400 text-sm tracking-widest uppercase">Redirecting...</p>
        </div>
      </div>
    );
  }

  // ─── Email/Password Sign-In ─────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/home');
      } else {
        console.log(result);
        setError('Additional verification required.');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.errors?.[0]?.message || 'Something went wrong. Please try again.';
      if (msg.toLowerCase().includes('no account')) {
        setError('No account found with this email. Please sign up first.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Phone Sign-In: Send OTP ───────────────────────────────────────────────
  const handlePhoneSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: phoneNumber,
      });

      // Prepare the phone code factor
      const phoneCodeFactor = result.supportedFirstFactors?.find(
        (factor: any) => factor.strategy === 'phone_code',
      );

      if (phoneCodeFactor && 'phoneNumberId' in phoneCodeFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId: phoneCodeFactor.phoneNumberId,
        });
        setStep('phone-verify');
      } else {
        setError('Phone sign-in is not available for this account. Try email/password instead.');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.errors?.[0]?.message || 'Something went wrong.';
      if (msg.toLowerCase().includes('no account') || msg.toLowerCase().includes('not found')) {
        setError('No account found with this phone number. Please sign up first.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Phone Sign-In: Verify OTP ─────────────────────────────────────────────
  const handlePhoneVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code: phoneCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/home');
      } else {
        setError('Additional verification required.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Google Sign-In ─────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setError('');
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/home',
      });
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.errors?.[0]?.message || 'Failed to start Google sign-in.');
    }
  };

  // ─── Phone Verify Step ──────────────────────────────────────────────────────
  if (step === 'phone-verify') {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center font-sans text-slate-200 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="z-10 w-full max-w-[420px] bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative">
          <button
            onClick={() => {
              setStep('form');
              setError('');
            }}
            className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>

          <div className="text-center mb-10 pt-4">
            <h2 className="font-serif text-4xl mb-4 text-white italic">Enter Code</h2>
            <p className="text-sm text-slate-400">
              We sent a code to <span className="text-orange-300">{phoneNumber}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handlePhoneVerify} className="space-y-6">
            <div>
              <input
                type="text"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                placeholder="Verification Code"
                className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 px-4 text-center text-xl tracking-[0.5em] text-white placeholder-slate-600 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-200 hover:to-orange-300 text-orange-950 font-serif italic text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(253,186,116,0.15)] disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center font-sans text-slate-200 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#111111_100%)] pointer-events-none" />

      {/* Header */}
      <div className="z-10 mb-8 text-center">
        <h1 className="font-serif text-3xl italic text-orange-200/90 tracking-wide">Soouls</h1>
      </div>

      {/* Main Card */}
      <div className="z-10 w-full max-w-[420px] bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative">
        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl mb-2 text-white">
            Welcome back to
            <br />
            <span className="italic text-orange-300">Soouls</span>
          </h2>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mt-4">
            CONTINUE YOUR JOURNEY
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
            {error.includes('sign up') && (
              <Link
                href="/sign-up"
                className="block mt-2 text-orange-300/80 hover:text-orange-200 underline transition-colors"
              >
                Create an ID →
              </Link>
            )}
          </div>
        )}

        {/* Auth Method Toggle */}
        <div className="flex mb-6 bg-[#222222] rounded-2xl p-1">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setError('');
            }}
            className={`flex-1 py-3 rounded-xl text-xs tracking-widest font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              authMethod === 'email'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>EMAIL</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setError('');
            }}
            className={`flex-1 py-3 rounded-xl text-xs tracking-widest font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              authMethod === 'phone'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>PHONE</span>
          </button>
        </div>

        {/* Email Form */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">
                  EMAIL ADDRESS
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

              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded bg-[#222222] border-transparent text-orange-400 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Keep session active
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-orange-400/80 hover:text-orange-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-200 hover:to-orange-300 text-orange-950 font-serif italic text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(253,186,116,0.15)] disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Phone Form */}
        {authMethod === 'phone' && (
          <form onSubmit={handlePhoneSendCode} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">
                PHONE NUMBER
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-2 ml-2">
                Include country code (e.g. +91, +1)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-200 hover:to-orange-300 text-orange-950 font-serif italic text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(253,186,116,0.15)] disabled:opacity-50"
            >
              {isLoading ? 'Sending code...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        <div className="mt-8 mb-6 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative bg-[#1A1A1A] px-4 text-[10px] uppercase tracking-[0.2em] text-slate-600">
            OR CONTINUE WITH
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-[#222222] hover:bg-[#2A2A2A] text-xs tracking-widest text-slate-300 py-4 rounded-2xl flex items-center justify-center space-x-3 transition-colors border border-white/5"
          >
            <FcGoogle className="w-4 h-4" />
            <span>SIGN IN WITH GOOGLE</span>
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          New here?{' '}
          <Link
            href="/sign-up"
            className="text-orange-300/80 hover:text-orange-200 transition-colors"
          >
            Create an ID
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
