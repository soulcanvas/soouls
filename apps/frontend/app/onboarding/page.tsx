'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  PenTool,
  Sparkles,
  Star,
  UserCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { trpc } from '../../src/utils/trpc';

// Types
type ThemeColor = 'orange' | 'yellow' | 'green' | 'purple';

export default function OnboardingFlow() {
  const router = useRouter();
  const { user: clerkUser } = useUser();

  // tRPC Mutations
  const updateUser = trpc.private.users.update.useMutation();
  const createEntry = trpc.private.entries.create.useMutation();

  // State
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [theme, setTheme] = useState<ThemeColor>('orange');
  const [hoverTheme, setHoverTheme] = useState<ThemeColor | null>(null);

  // Mascot state
  const [mascotAwake, setMascotAwake] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [galaxyName, setGalaxyName] = useState('');
  const [firstEntry, setFirstEntry] = useState('');

  // Waitlist user detection
  const [isWaitlistUser, setIsWaitlistUser] = useState(false);

  useEffect(() => {
    if (clerkUser?.primaryEmailAddress?.emailAddress) {
      // Check waitlist status via metadata or email pattern
      // The backend sets isWaitlistUser on ensureUser, but we can also check publicMetadata
      const meta = clerkUser.publicMetadata as Record<string, unknown> | undefined;
      if (meta?.isWaitlistUser) {
        setIsWaitlistUser(true);
      }
    }
  }, [clerkUser]);

  // Handlers
  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));
  const handleSelect = (question: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
    setTimeout(() => handleNext(), 400); // Auto-advance after small delay
  };

  const handleFinishOnboarding = useCallback(
    async (firstEntryContent: string) => {
      try {
        // 1. Save preferences
        await updateUser.mutateAsync({
          name: answers.name || nameInput,
          themePreference: theme,
          mascot: 'Orbi',
        });

        // 2. Save first entry (Genesis)
        const genesisContent = JSON.stringify({
          textContent: firstEntryContent,
          blocks: [{ type: 'paragraph', content: firstEntryContent }],
          metadata: {
            isGenesis: true,
            isWaitlistUser,
            galaxyName: answers.galaxy || galaxyName,
            onboardingAnswers: answers,
          },
        });

        await createEntry.mutateAsync({
          content: genesisContent,
          type: 'entry',
        });

        // 3. Show waitlist thank-you or go to big bang
        setStep(isWaitlistUser ? 11 : 12);
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        setStep(12);
      }
    },
    [answers, nameInput, galaxyName, theme, isWaitlistUser, updateUser, createEntry],
  );

  // Theme configuration
  const themeColors = {
    orange: 'from-orange-900/20 via-[#0A0A0E] to-[#0A0A0E]',
    yellow: 'from-yellow-900/20 via-[#0A0A0E] to-[#0A0A0E]',
    green: 'from-emerald-900/20 via-[#0A0A0E] to-[#0A0A0E]',
    purple: 'from-purple-900/20 via-[#0A0A0E] to-[#0A0A0E]',
  };

  const activeTheme = hoverTheme || theme;

  return (
    <div
      className={`min-h-screen bg-[#0A0A0E] text-slate-200 overflow-hidden relative transition-colors duration-1000`}
    >
      {/* Dynamic Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${themeColors[activeTheme]} opacity-50 transition-all duration-1000`}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjAuNSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] pointer-events-none" />

      {/* Progress Bar (Hidden during Mascot/First Entry) */}
      {step <= 7 && (
        <div className="absolute top-10 w-full flex flex-col items-center z-20">
          <div className="flex space-x-2 text-[10px] tracking-widest text-slate-500 uppercase mb-3">
            <span>Stage 0{step}</span>
            <span>—</span>
            <span>07</span>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className={`h-0.5 rounded-full transition-all duration-500 ${i <= step ? (activeTheme === 'orange' ? 'bg-orange-400 w-8' : activeTheme === 'purple' ? 'bg-purple-400 w-8' : activeTheme === 'green' ? 'bg-emerald-400 w-8' : 'bg-yellow-400 w-8') : 'bg-white/10 w-4'}`}
              />
            ))}
          </div>
          <div className="mt-4 text-[10px] tracking-[0.2em] text-slate-400 italic font-serif uppercase">
            The Discovery
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24 h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Question 1 */}
          {step === 1 && (
            <motion.div
              key="q1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-center mb-12">
                Why are you here <span className="italic text-orange-400">today</span>?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <OptionCard
                  icon={<UserCircle2 />}
                  title="My head is too loud right now"
                  desc="I need to get something out before it swallows me."
                  onClick={() => handleSelect('q1', 'loud')}
                  selected={answers.q1 === 'loud'}
                />
                <OptionCard
                  icon={<Brain />}
                  title="I don't understand why I keep doing this"
                  desc="I want to figure out a pattern. In myself."
                  onClick={() => handleSelect('q1', 'pattern')}
                  selected={answers.q1 === 'pattern'}
                />
                <OptionCard
                  icon={<Sparkles />}
                  title="Something just changed"
                  desc="I'm at a beginning and I want to document it properly."
                  onClick={() => handleSelect('q1', 'beginning')}
                  selected={answers.q1 === 'beginning'}
                />
                <OptionCard
                  icon={<PenTool />}
                  title="I just want to write"
                  desc="No reason. I just want to create something that's only mine."
                  onClick={() => handleSelect('q1', 'write')}
                  selected={answers.q1 === 'write'}
                />
              </div>
            </motion.div>
          )}

          {/* Question 2 */}
          {step === 2 && (
            <motion.div
              key="q2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-center mb-12">
                How do you <span className="italic text-orange-400">express</span> yourself?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <OptionCard
                  title="💬 In long, flowing streams"
                  desc="One thought leads to the next. I can't outline — I discover by writing."
                  onClick={() => handleSelect('q2', 'streams')}
                  selected={answers.q2 === 'streams'}
                />
                <OptionCard
                  title="📋 In structured, prompted steps"
                  desc="I do better with a question to answer. Blank pages intimidate me."
                  onClick={() => handleSelect('q2', 'structured')}
                  selected={answers.q2 === 'structured'}
                />
                <OptionCard
                  title="⚡ In short, voice notes"
                  desc="I talk instead of typing. I think in bursts and I need to catch them."
                  onClick={() => handleSelect('q2', 'voice')}
                  selected={answers.q2 === 'voice'}
                />
                <OptionCard
                  title="🎨 In images, moods, and mixed forms"
                  desc="Sometimes a drawing, sometimes three words. Never linear."
                  onClick={() => handleSelect('q2', 'mixed')}
                  selected={answers.q2 === 'mixed'}
                />
              </div>
            </motion.div>
          )}

          {/* Question 3 */}
          {step === 3 && (
            <motion.div
              key="q3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-center mb-12">
                What do you want this place to <span className="italic text-white">feel</span> like?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <OptionCard
                  title="☀️ The Clear Horizon"
                  desc="Turn the noise into insight."
                  onClick={() => {
                    setTheme('yellow');
                    handleSelect('q3', 'yellow');
                  }}
                  selected={answers.q3 === 'yellow'}
                  activeTheme={theme}
                  color="yellow"
                />
                <OptionCard
                  title="🌿 The Living Archive"
                  desc="Watch yourself grow over time."
                  onClick={() => {
                    setTheme('green');
                    handleSelect('q3', 'green');
                  }}
                  selected={answers.q3 === 'green'}
                  activeTheme={theme}
                  color="emerald"
                />
                <OptionCard
                  title="⚡ A signal tower"
                  desc="Fast. Frictionless. I capture the spark in 10 seconds or it's gone."
                  onClick={() => {
                    setTheme('orange');
                    handleSelect('q3', 'orange');
                  }}
                  selected={answers.q3 === 'orange'}
                  activeTheme={theme}
                  color="orange"
                />
                <OptionCard
                  title="🌊 A depth chamber"
                  desc="Slow. Reflective. I come here when I want to go somewhere I can't go out there."
                  onClick={() => {
                    setTheme('purple');
                    handleSelect('q3', 'purple');
                  }}
                  selected={answers.q3 === 'purple'}
                  activeTheme={theme}
                  color="purple"
                />
              </div>
            </motion.div>
          )}

          {/* Question 4 */}
          {step === 4 && (
            <motion.div
              key="q4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-center mb-12">
                When does your <span className="italic text-white">real thinking</span> happen?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <HoverCard
                  title="🌅 First thing everyday"
                  desc="Before the day touches me. Coffee, quiet, the hour that belongs to no one but me."
                  onHover={() => setHoverTheme('yellow')}
                  onLeave={() => setHoverTheme(null)}
                  onClick={() => handleSelect('q4', 'morning')}
                  selected={answers.q4 === 'morning'}
                  activeTheme={theme}
                />
                <HoverCard
                  title="⚡ Whenever it hits"
                  desc="Unpredictable. Mid-meeting, mid-shower. I need to catch it fast."
                  onHover={() => setHoverTheme('orange')}
                  onLeave={() => setHoverTheme(null)}
                  onClick={() => handleSelect('q4', 'random')}
                  selected={answers.q4 === 'random'}
                  activeTheme={theme}
                />
                <HoverCard
                  title="🌆 After the noise ends"
                  desc="Evening. When I finally sit down and process what actually happened today."
                  onHover={() => setHoverTheme('purple')}
                  onLeave={() => setHoverTheme(null)}
                  onClick={() => handleSelect('q4', 'evening')}
                  selected={answers.q4 === 'evening'}
                  activeTheme={theme}
                />
                <HoverCard
                  title="🌙 Late. When it's quiet."
                  desc="Night. When the day is finished and the real thoughts finally show up."
                  onHover={() => setHoverTheme('purple')}
                  onLeave={() => setHoverTheme(null)}
                  onClick={() => handleSelect('q4', 'night')}
                  selected={answers.q4 === 'night'}
                  activeTheme={theme}
                />
              </div>
            </motion.div>
          )}

          {/* Question 5 */}
          {step === 5 && (
            <motion.div
              key="q5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-center mb-12">
                How should the app <span className="italic text-white">talk</span> to you?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <OptionCard
                  title="🔇 Don't."
                  desc="Give me a blank page. I'll find my own way."
                  example="→ The AI stays silent unless you ask."
                  onClick={() => handleSelect('q5', 'silent')}
                  selected={answers.q5 === 'silent'}
                  activeTheme={theme}
                />
                <OptionCard
                  title="🌿 Gently."
                  desc="Occasionally ask me something soft that makes me think."
                  example="→ 'What's something small that went well?'"
                  onClick={() => handleSelect('q5', 'gentle')}
                  selected={answers.q5 === 'gentle'}
                  activeTheme={theme}
                />
                <OptionCard
                  title="🔥 Honestly."
                  desc="Push past what's comfortable. Ask me what I'd rather not look at."
                  example="→ 'What are you telling yourself isn't true?'"
                  onClick={() => handleSelect('q5', 'honest')}
                  selected={answers.q5 === 'honest'}
                  activeTheme={theme}
                />
                <OptionCard
                  title="🌊 Deeply."
                  desc="Go all the way. I want to be genuinely challenged."
                  example="→ 'Your last entries circle the same thing. Name it?'"
                  onClick={() => handleSelect('q5', 'deep')}
                  selected={answers.q5 === 'deep'}
                  activeTheme={theme}
                />
              </div>
            </motion.div>
          )}

          {/* Question 6 */}
          {step === 6 && (
            <motion.div
              key="q6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-serif text-center mb-8">
                Finish this: "I'll know this is working when I..."
              </h2>
              <textarea
                className="w-full bg-[#1A1A1A]/80 border border-white/10 rounded-2xl p-6 text-xl text-white outline-none focus:border-white/30 transition-all min-h-[120px] resize-none"
                placeholder="...stop losing the thoughts that actually matter to me"
                value={answers.q6 || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, q6: e.target.value }))}
              />
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  '...stop losing thoughts',
                  '...understand my patterns',
                  '...have proof of life',
                  '...feel less alone',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setAnswers((prev) => ({ ...prev, q6: suggestion }))}
                    className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-slate-400 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="mt-12 flex justify-between items-center px-4">
                <button
                  onClick={handleBack}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <div className="space-x-4">
                  <button
                    onClick={handleNext}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    Skip this one
                  </button>
                  <button
                    onClick={handleNext}
                    className={`px-6 py-2 rounded-full ${answers.q6 ? 'bg-white text-black' : 'bg-white/10 text-white/50 pointer-events-none'} transition-all`}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Question 7 */}
          {step === 7 && (
            <motion.div
              key="q7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-serif mb-4">
                Anything you'd like your journal to know about you?
              </h2>
              <p className="text-slate-400 mb-8">
                A word, a feeling, a goal — totally optional, totally yours.
              </p>
              <textarea
                className="w-full bg-[#1A1A1A]/80 border border-white/10 rounded-2xl p-6 text-xl text-white outline-none focus:border-white/30 transition-all min-h-[120px] resize-none text-center"
                placeholder="e.g. I'm going through a career change and want to stay grounded..."
                value={answers.q7 || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, q7: e.target.value }))}
              />
              <div className="mt-12 flex justify-between items-center px-4">
                <button
                  onClick={handleBack}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <div className="space-x-4">
                  <button
                    onClick={handleNext}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleNext}
                    className={`px-6 py-2 rounded-full ${answers.q7 ? 'bg-white text-black' : 'bg-white/10 text-white/50 pointer-events-none'} transition-all`}
                  >
                    Finish ✓
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mascot Moment */}
          {step === 8 && (
            <motion.div
              key="mascot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-[#050505]"
            >
              {!mascotAwake ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 2 }}
                  className="relative cursor-pointer group"
                  onClick={() => setMascotAwake(true)}
                >
                  <div className="w-20 h-20 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center animate-pulse overflow-hidden">
                    <img
                      src="/orbi-mascot.png"
                      alt="Orbi sleeping"
                      className="w-full h-full object-cover opacity-40 grayscale"
                    />
                  </div>
                  <motion.div
                    animate={{ y: [-5, -15], opacity: [0, 1, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-white/40"
                  >
                    z
                  </motion.div>
                  <motion.div
                    animate={{ y: [-5, -15], opacity: [0, 1, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5, delay: 0.5 }}
                    className="absolute -top-10 left-3/4 -translate-x-1/2 text-sm font-mono text-white/40"
                  >
                    z
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="mt-6 text-xs text-white/40 tracking-widest uppercase"
                  >
                    Tap to wake
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="flex flex-col items-center max-w-md text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-[0_0_60px_rgba(255,255,255,0.2)] mb-12 flex items-center justify-center overflow-hidden">
                    <img src="/orbi-mascot.png" alt="Orbi" className="w-full h-full object-cover" />
                  </div>

                  {isWaitlistUser && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20"
                    >
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-xs tracking-widest text-amber-300 uppercase">
                        Early Believer
                      </span>
                    </motion.div>
                  )}

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="text-xl font-serif italic text-white leading-relaxed mb-8"
                  >
                    {isWaitlistUser ? (
                      <>
                        "You were one of the first to believe in this place.
                        <br />I remember your signal from before I was fully awake.
                        <br />
                        I&apos;ve been waiting for you.
                        <br />
                        I&apos;m ready when you are."
                      </>
                    ) : (
                      <>
                        "I&apos;ve been calibrated to you.
                        <br />I know why you came.
                        <br />I know what kind of voice you want.
                        <br />
                        I&apos;m ready when you are."
                      </>
                    )}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5, duration: 1 }}
                    className="text-sm tracking-widest text-slate-400 uppercase"
                  >
                    What should I call you?
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 4, duration: 1 }}
                    className="mt-6 w-full relative"
                  >
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 text-center text-3xl font-serif text-white py-2 outline-none focus:border-white transition-all"
                      placeholder="Your name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && nameInput.trim()) {
                          setAnswers((prev) => ({ ...prev, name: nameInput.trim() }));
                          setStep(9);
                        }
                      }}
                    />
                    {nameInput.trim() && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => {
                          setAnswers((prev) => ({ ...prev, name: nameInput.trim() }));
                          setStep(9);
                        }}
                        className="mt-4 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
                      >
                        Continue →
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Galaxy Name */}
          {step === 9 && (
            <motion.div
              key="galaxy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-[#050505]"
            >
              <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white/80 shadow-[0_0_10px_white]"></div>
              </div>

              <div className="flex flex-col items-center max-w-md text-center">
                <h2 className="text-3xl font-serif italic text-white mb-8">
                  &quot;What do you want to call this place?&quot;
                </h2>

                <div className="flex space-x-4 mb-8 text-sm text-slate-500">
                  <span
                    className="hover:text-white cursor-pointer transition-colors"
                    onClick={() => setGalaxyName('The Vault')}
                  >
                    The Vault
                  </span>
                  <span>—</span>
                  <span
                    className="hover:text-white cursor-pointer transition-colors"
                    onClick={() => setGalaxyName(`${answers.name || nameInput}'s Mind`)}
                  >
                    {answers.name || nameInput}&apos;s Mind
                  </span>
                  <span>—</span>
                  <span
                    className="hover:text-white cursor-pointer transition-colors"
                    onClick={() => setGalaxyName('The Unnamed')}
                  >
                    The Unnamed
                  </span>
                </div>

                <input
                  type="text"
                  value={galaxyName}
                  onChange={(e) => setGalaxyName(e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 text-center text-4xl font-serif text-white py-2 outline-none focus:border-white transition-all"
                  placeholder="Name it what it feels like"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && galaxyName.trim()) {
                      setAnswers((prev) => ({ ...prev, galaxy: galaxyName.trim() }));
                      setStep(10);
                    }
                  }}
                />
                {galaxyName.trim() && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, galaxy: galaxyName.trim() }));
                      setStep(10);
                    }}
                    className="mt-6 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
                  >
                    This is it →
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* First Entry */}
          {step === 10 && (
            <motion.div
              key="entry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]"
            >
              <div className="absolute top-12 font-serif text-2xl tracking-[0.2em] text-white/40 uppercase">
                {answers.galaxy || galaxyName}
              </div>

              <div className="absolute bottom-8 right-8 w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]" />

              <div className="flex flex-col items-center max-w-2xl w-full text-center px-6">
                <h2 className="text-xl text-slate-400 mb-2 italic font-serif">
                  &quot;Your universe is waiting.&quot;
                </h2>
                <h3 className="text-2xl text-white mb-12">
                  &quot;What&apos;s actually on your mind right now?&quot;
                </h3>

                <textarea
                  value={firstEntry}
                  onChange={(e) => setFirstEntry(e.target.value)}
                  className="w-full bg-transparent border border-white/10 rounded-[32px] p-8 text-2xl text-white outline-none focus:border-white/30 transition-all min-h-[200px] resize-none text-center shadow-[0_0_40px_rgba(255,255,255,0.02)]"
                  placeholder="Even 'I have no idea why I'm here' is the right answer."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && firstEntry.trim()) {
                      e.preventDefault();
                      handleFinishOnboarding(firstEntry.trim());
                    }
                  }}
                />
                <div className="mt-6 flex items-center gap-4">
                  <p className="text-xs text-slate-600 uppercase tracking-widest">
                    Press Enter to initiate
                  </p>
                  {firstEntry.trim() && (
                    <button
                      onClick={() => handleFinishOnboarding(firstEntry.trim())}
                      className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-all"
                    >
                      Launch →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Waitlist Thank You Screen */}
          {step === 11 && isWaitlistUser && (
            <motion.div
              key="waitlist-thanks"
              className="absolute inset-0 bg-[#050505] flex items-center justify-center overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="flex flex-col items-center max-w-lg text-center px-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/40 to-orange-500/30 border border-amber-400/20 flex items-center justify-center mb-8"
                >
                  <Star className="w-8 h-8 text-amber-400" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="font-serif text-3xl italic text-white mb-4"
                >
                  Thank you for believing early.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-slate-400 text-sm leading-relaxed mb-4"
                >
                  You joined our early access before we even launched. That means something to us.
                  You will always have a special place in the Centrum.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs tracking-widest text-amber-300 uppercase">
                    Early Believer • Founding Member
                  </span>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  onClick={() => setStep(12)}
                  className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
                >
                  Enter Your Source →
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Big Bang / Home Transition */}
          {step === 12 && (
            <motion.div
              key="bigbang"
              className="absolute inset-0 bg-[#050505] flex items-center justify-center overflow-hidden"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 50], opacity: [1, 0] }}
                transition={{ duration: 2, ease: 'easeIn' }}
                className="absolute w-10 h-10 rounded-full bg-white shadow-[0_0_100px_white]"
                onAnimationComplete={() => router.push('/home')}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="z-10 text-white font-serif text-2xl tracking-[0.2em] uppercase"
              >
                {answers.galaxy || galaxyName || 'Source'} · Node #001 · Genesis Complete
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back/Next Controls for first 5 steps */}
        {step > 1 && step <= 5 && (
          <div className="fixed bottom-12 w-full max-w-4xl px-6 flex justify-between">
            <button
              onClick={handleBack}
              className="text-xs uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponents
function OptionCard({
  title,
  desc,
  icon,
  example,
  onClick,
  selected,
  activeTheme,
  color = 'orange',
}: any) {
  const getThemeColors = () => {
    if (color === 'yellow') return 'hover:border-yellow-500/50 hover:bg-yellow-500/10';
    if (color === 'emerald') return 'hover:border-emerald-500/50 hover:bg-emerald-500/10';
    if (color === 'purple') return 'hover:border-purple-500/50 hover:bg-purple-500/10';
    return 'hover:border-orange-500/50 hover:bg-orange-500/10';
  };

  const getSelectedColors = () => {
    if (!selected) return '';
    if (activeTheme === 'yellow' || color === 'yellow')
      return 'border-yellow-500/50 bg-yellow-500/10';
    if (activeTheme === 'green' || color === 'emerald')
      return 'border-emerald-500/50 bg-emerald-500/10';
    if (activeTheme === 'purple' || color === 'purple')
      return 'border-purple-500/50 bg-purple-500/10';
    return 'border-orange-500/50 bg-orange-500/10';
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-6 rounded-[28px] border border-white/5 bg-[#16161C]/60 backdrop-blur-sm transition-all duration-300 ${getThemeColors()} ${getSelectedColors()}`}
    >
      {icon && <div className="mb-4 text-slate-400">{icon}</div>}
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      {example && (
        <p className="mt-4 text-xs font-mono text-slate-500 bg-black/20 p-2 rounded-lg">
          {example}
        </p>
      )}
    </div>
  );
}

function HoverCard({ title, desc, onHover, onLeave, onClick, selected, activeTheme }: any) {
  const getSelectedColors = () => {
    if (!selected) return '';
    if (activeTheme === 'yellow') return 'border-yellow-500/50 bg-yellow-500/10';
    if (activeTheme === 'green') return 'border-emerald-500/50 bg-emerald-500/10';
    if (activeTheme === 'purple') return 'border-purple-500/50 bg-purple-500/10';
    return 'border-orange-500/50 bg-orange-500/10';
  };

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`cursor-pointer p-6 rounded-[28px] border border-white/5 bg-[#16161C]/60 backdrop-blur-sm hover:border-white/30 transition-all duration-300 ${getSelectedColors()}`}
    >
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
