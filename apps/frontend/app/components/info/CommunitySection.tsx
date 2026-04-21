'use client';

import { SiDiscord, SiInstagram, SiX } from 'react-icons/si';

export default function CommunitySection() {
  return (
    <section id="community" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-playfair text-[clamp(44px,6vw,92px)] font-bold text-[#EFEBDD] leading-[1.05] italic mb-8">
            You're not <br /> alone in this
          </h2>
          <p className="font-urbanist text-xl text-[#888888] mb-16 max-w-2xl leading-relaxed">
            Join a sanctuary of thinkers, creators, and seekers who believe in slow evolution and
            profound focus.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
              {
                icon: <SiDiscord className="w-8 h-8" />,
                label: 'Discord',
                text: 'Chat with the community and team.',
                href: 'https://discord.gg/soouls',
                color: '#5865F2',
              },
              {
                icon: <SiX className="w-8 h-8" />,
                label: 'X / Twitter',
                text: 'Daily insights and product updates.',
                href: 'https://x.com/soouls_app',
                color: '#FFFFFF',
              },
              {
                icon: <SiInstagram className="w-8 h-8" />,
                label: 'Instagram',
                text: 'Visual meditations and stories.',
                href: 'https://instagram.com/soouls.in',
                color: '#E1306C',
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="p-12 rounded-[56px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all flex flex-col items-center gap-6 group"
              >
                <div
                  className="p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform"
                  style={{ color: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-urbanist text-2xl font-bold text-[#EFEBDD] mb-2">
                    {item.label}
                  </h3>
                  <p className="font-urbanist text-[#A8A8A8] leading-relaxed">{item.text}</p>
                </div>
                <span className="font-urbanist text-xs font-bold text-[#D6C2A3] uppercase tracking-widest mt-auto group-hover:text-[#E07A5F]">
                  Join sanctuary →
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
