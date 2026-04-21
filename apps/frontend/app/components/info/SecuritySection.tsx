'use client';

import { HiKey, HiLockClosed, HiShieldCheck } from 'react-icons/hi2';

export default function SecuritySection() {
  return (
    <section id="security" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        {/* Header */}
        <div className="max-w-[700px] mb-24">
          <p className="font-urbanist text-xs font-bold text-[#E07A5F] tracking-[0.4em] uppercase mb-4">
            Security first
          </p>
          <h2 className="font-playfair text-[clamp(44px,6vw,92px)] font-bold text-[#D6C2A3] leading-[1.05] italic mb-8">
            Your thoughts are <br /> yours
          </h2>
          <p className="font-urbanist text-xl text-[#888888] leading-relaxed">
            We build with the assumption that your private thoughts shouldn't even be readable by
            us. Security isn't a feature; it's the foundation of tranquility.
          </p>
        </div>

        {/* Security Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: <HiLockClosed className="w-6 h-6" />,
              title: 'Encryption',
              text: 'End-to-end encryption ensures your entries are scrambled before they leave your device.',
            },
            {
              icon: <HiKey className="w-6 h-6" />,
              title: 'Data Protection',
              text: 'State-of-the-art storage policies keep your information isolated and strictly yours.',
            },
            {
              icon: <HiShieldCheck className="w-6 h-6" />,
              title: 'Privacy-First Design',
              text: 'Not one line of code is written without asking: "How does this protect the user?"',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-[#E07A5F]/20 transition-all flex flex-col gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#E07A5F]">
                {item.icon}
              </div>
              <h3 className="font-urbanist text-xl font-bold text-[#EFEBDD]">{item.title}</h3>
              <p className="font-urbanist text-[#888888] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* We don't monetize your mind */}
        <div className="relative p-20 rounded-[64px] bg-[#1D2122] border border-white/[0.05] flex flex-col items-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#E07A5F]/5 via-transparent to-transparent" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block p-4 rounded-full bg-white/5 mb-8 text-[#E07A5F]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8 L12 12 L15 15" />
              </svg>
            </span>
            <h3 className="font-playfair text-4xl md:text-5xl font-bold text-[#EFEBDD] mb-8">
              We don't monetize your mind
            </h3>
            <p className="font-urbanist text-[#A8A8A8] text-lg leading-relaxed mb-12">
              You are our customer, not our product. We will never sell your data, use it for
              advertising, or feed it into large language models without your explicit consent for
              personalized features.
            </p>

            <div className="pt-12 border-t border-white/5">
              <p className="font-urbanist text-xs font-bold text-[#888888] tracking-[0.3em] uppercase mb-6">
                Found a vulnerability?
              </p>
              <a
                href="mailto:safety@soouls.in"
                className="inline-flex px-8 py-4 bg-[#E07A5F] text-[#111111] font-urbanist font-bold rounded-xl hover:bg-[#EFEBDD] transition-colors"
              >
                safety@soouls.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
