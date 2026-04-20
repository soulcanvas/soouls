"use client";

import { useSignUp, AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Phone, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

type AuthMethod = "email" | "phone";
type Step = "form" | "verify" | "phone-password";

export default function SignUpPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, signUp, setActive } = useSignUp();

  // ─── Handle SSO Callback (Google OAuth redirect lands here) ─────────────────
  if (pathname?.includes("sso-callback")) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-400 animate-spin" />
            <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-orange-300 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          </div>
          <p className="text-slate-400 text-sm tracking-widest uppercase">Creating your identity...</p>
        </div>
        <AuthenticateWithRedirectCallback />
      </div>
    );
  }

  const [step, setStep] = useState<Step>("form");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");

  // Form State
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [phonePassword, setPhonePassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ─── Email Sign-Up ──────────────────────────────────────────────────────────
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setError("");

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      const msg = err.errors?.[0]?.message || "Something went wrong.";
      const errCode = err.errors?.[0]?.code;
      if (errCode === "form_identifier_exists" || msg.toLowerCase().includes("already") || msg.toLowerCase().includes("taken")) {
        setError("You already have an identity with us. Sign in instead.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Phone Sign-Up ──────────────────────────────────────────────────────────
  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setError("");

    try {
      await signUp.create({ phoneNumber });
      await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
      setStep("verify");
    } catch (err: any) {
      const msg = err.errors?.[0]?.message || "Something went wrong.";
      const errCode = err.errors?.[0]?.code;
      if (errCode === "form_identifier_exists" || msg.toLowerCase().includes("already") || msg.toLowerCase().includes("taken")) {
        setError("You already have an identity with this phone number. Sign in instead.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Verify Code ────────────────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setError("");

    try {
      const result = authMethod === "email"
        ? await signUp.attemptEmailAddressVerification({ code })
        : await signUp.attemptPhoneNumberVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/onboarding");
      } else if (result.status === "missing_requirements" && authMethod === "phone") {
        setStep("phone-password");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Set Password (Phone flow) ──────────────────────────────────────────────
  const handleSetPhonePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.update({ password: phonePassword });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to set password.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Google Sign-Up ─────────────────────────────────────────────────────────
  const handleGoogleSignUp = () => {
    if (!isLoaded || !signUp) {
      setError("Still loading. Please wait a moment and try again.");
      return;
    }
    signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sign-up/sso-callback",
      redirectUrlComplete: "/onboarding",
    }).catch((err: any) => {
      console.error("Google sign-up error:", err);
      setError(err.errors?.[0]?.message || "Google sign-up failed. Please try again.");
    });
  };

  // ─── Verify Step ────────────────────────────────────────────────────────────
  if (step === "verify") {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center font-sans text-slate-200 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="z-10 w-full max-w-[420px] bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative">
          <button onClick={() => setStep("form")} className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="text-center mb-10 pt-4">
            <h2 className="font-serif text-4xl mb-4 text-white italic">Verify {authMethod === "email" ? "Email" : "Phone"}</h2>
            <p className="text-sm text-slate-400">
              Enter the code sent to <span className="text-orange-300">{authMethod === "email" ? emailAddress : phoneNumber}</span>
            </p>
          </div>
          {error && <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}
          <form onSubmit={handleVerify} className="space-y-6">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 px-4 text-center text-xl tracking-[0.5em] text-white placeholder-slate-600 outline-none transition-all" required autoFocus />
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-200 hover:to-orange-300 text-orange-950 font-serif italic text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(253,186,116,0.15)] disabled:opacity-50">
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Set Password Step (Phone) ──────────────────────────────────────────────
  if (step === "phone-password") {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center font-sans text-slate-200 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="z-10 w-full max-w-[420px] bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl mb-4 text-white italic">Set Password</h2>
            <p className="text-sm text-slate-400">Create a password for your Soouls account</p>
          </div>
          {error && <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}
          <form onSubmit={handleSetPhonePassword} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">PASSWORD</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-500" /></div>
                <input type="password" value={phonePassword} onChange={(e) => setPhonePassword(e.target.value)} placeholder="Create a strong password" className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all" required minLength={8} />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-200 hover:to-orange-300 text-orange-950 font-serif italic text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(253,186,116,0.15)] disabled:opacity-50">
              {isLoading ? "Setting up..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center font-sans text-slate-200 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#111111_100%)] pointer-events-none" />

      <div className="z-10 mb-8 text-center">
        <h1 className="font-serif text-3xl italic text-orange-200/90 tracking-wide">Soouls</h1>
      </div>

      <div className="z-10 w-full max-w-[420px] bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative">
        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl mb-2 text-white">
            Create your<br /><span className="italic text-orange-300">Identity</span>
          </h2>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mt-4">BEGIN YOUR CREATIVE JOURNEY</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
            {error.includes("already") && (
              <Link href="/sign-in" className="block mt-2 text-orange-300/80 hover:text-orange-200 underline transition-colors">Go to Sign In →</Link>
            )}
          </div>
        )}

        {/* Google Sign-Up — FIRST for prominence */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={!isLoaded}
          className="w-full bg-[#222222] hover:bg-[#2A2A2A] text-xs tracking-widest text-slate-300 py-4 rounded-2xl flex items-center justify-center space-x-3 transition-colors border border-white/5 cursor-pointer disabled:opacity-50 mb-6"
        >
          <FcGoogle className="w-5 h-5" />
          <span>SIGN UP WITH GOOGLE</span>
        </button>

        <div className="mb-6 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
          <div className="relative bg-[#1A1A1A] px-4 text-[10px] uppercase tracking-[0.2em] text-slate-600">OR WITH</div>
        </div>

        {/* Auth Method Toggle */}
        <div className="flex mb-6 bg-[#222222] rounded-2xl p-1">
          <button type="button" onClick={() => { setAuthMethod("email"); setError(""); }}
            className={`flex-1 py-3 rounded-xl text-xs tracking-widest font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${authMethod === "email" ? "bg-orange-500/20 text-orange-300 border border-orange-500/20" : "text-slate-500 hover:text-slate-300"}`}>
            <Mail className="w-3.5 h-3.5" /><span>EMAIL</span>
          </button>
          <button type="button" onClick={() => { setAuthMethod("phone"); setError(""); }}
            className={`flex-1 py-3 rounded-xl text-xs tracking-widest font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${authMethod === "phone" ? "bg-orange-500/20 text-orange-300 border border-orange-500/20" : "text-slate-500 hover:text-slate-300"}`}>
            <Phone className="w-3.5 h-3.5" /><span>PHONE</span>
          </button>
        </div>

        {/* Email Form */}
        {authMethod === "email" && (
          <form onSubmit={handleEmailSignUp} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">EMAIL ADDRESS</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-slate-500" /></div>
                  <input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} placeholder="you@example.com" className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">PASSWORD</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-500" /></div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all" required minLength={8} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-200 hover:to-orange-300 text-orange-950 font-serif italic text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(253,186,116,0.15)] disabled:opacity-50">
              {isLoading ? "Creating..." : "Create Identity"}
            </button>
          </form>
        )}

        {/* Phone Form */}
        {authMethod === "phone" && (
          <form onSubmit={handlePhoneSignUp} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2 ml-2">PHONE NUMBER</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-slate-500" /></div>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full bg-[#222222] border border-transparent focus:border-orange-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all" required />
              </div>
              <p className="text-[10px] text-slate-600 mt-2 ml-2">Include country code (e.g. +91, +1)</p>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-200 hover:to-orange-300 text-orange-950 font-serif italic text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(253,186,116,0.15)] disabled:opacity-50">
              {isLoading ? "Sending OTP..." : "Send Verification Code"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-slate-500">
          Already have an identity?{" "}
          <Link href="/sign-in" className="text-orange-300/80 hover:text-orange-200 transition-colors">Sign In</Link>
        </div>
      </div>

      <div className="absolute bottom-6 w-full px-12 flex justify-between items-center text-[10px] tracking-widest text-slate-600 z-10">
        <div>© SOOULS</div>
        <div className="flex space-x-8">
          <Link href="#" className="hover:text-slate-400 transition-colors">PRIVACY</Link>
          <Link href="#" className="hover:text-slate-400 transition-colors">TERMS</Link>
        </div>
      </div>
    </div>
  );
}
