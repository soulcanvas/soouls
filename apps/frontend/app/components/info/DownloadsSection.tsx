'use client';

import {
  HiComputerDesktop,
  HiDevicePhoneMobile,
  HiDeviceTablet,
  HiGlobeAlt,
} from 'react-icons/hi2';

export default function DownloadsSection() {
  const cards = [
    {
      id: 'web',
      icon: <HiGlobeAlt className="w-8 h-8 text-[#E07A5F]" />,
      title: 'Web App',
      subtitle: 'ACCESS VIA BROWSER',
      badge: 'AVAILABLE',
      badgeColor: 'rgba(224, 122, 95, 0.15)',
      badgeTextColor: '#E07A5F',
      linkText: 'Launch App →',
      linkHref: '/home',
      isComingSoon: false,
    },
    {
      id: 'ios',
      icon: <HiDevicePhoneMobile className="w-8 h-8 text-[#A8A8A8]" />,
      title: 'iOS',
      subtitle: 'IPHONE AND IPAD',
      badge: 'COMING SOON',
      badgeColor: 'rgba(255, 255, 255, 0.05)',
      badgeTextColor: '#888888',
      isComingSoon: true,
    },
    {
      id: 'android',
      icon: <HiDeviceTablet className="w-8 h-8 text-[#A8A8A8]" />,
      title: 'Android',
      subtitle: 'PHONES AND TABLETS',
      badge: 'COMING SOON',
      badgeColor: 'rgba(255, 255, 255, 0.05)',
      badgeTextColor: '#888888',
      isComingSoon: true,
    },
    {
      id: 'desktop',
      icon: <HiComputerDesktop className="w-8 h-8 text-[#A8A8A8]" />,
      title: 'Desktop',
      subtitle: 'MACOS AND WINDOWS',
      badge: 'COMING SOON',
      badgeColor: 'rgba(255, 255, 255, 0.05)',
      badgeTextColor: '#888888',
      isComingSoon: true,
    },
  ];

  return (
    <section id="downloads" className="relative w-full py-24 bg-[#161616] overflow-hidden">
      {/* Noise Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 flex flex-col items-center">
        <h2 className="font-urbanist text-[clamp(40px,5vw,64px)] font-medium text-[#EFEBDD] text-center mb-4 tracking-tight leading-none">
          Available where you are
        </h2>
        <p className="font-urbanist text-[16px] text-[#888888] text-center mb-16 max-w-[600px] font-medium uppercase tracking-widest">
          Your thoughts, always within reach
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`
                group relative flex flex-col justify-between p-8 rounded-[32px] 
                transition-all duration-500 ease-out
                ${card.isComingSoon ? 'bg-white/[0.02] grayscale opacity-70' : 'bg-[#1D2122] hover:bg-[#23292a]'}
                border border-white/[0.05] hover:border-white/[0.1]
                h-[280px]
              `}
              style={{
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
              }}
            >
              {/* Card Decoration */}
              {!card.isComingSoon && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A5F]/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
              )}

              <div className="flex flex-col">
                <div className="flex items-start justify-between mb-8">
                  <div className="p-3 bg-white/5 rounded-2xl">{card.icon}</div>
                  <span
                    className="px-3 py-1 rounded-full font-urbanist font-bold text-[10px] tracking-[0.1em]"
                    style={{
                      backgroundColor: card.badgeColor,
                      color: card.badgeTextColor,
                    }}
                  >
                    {card.badge}
                  </span>
                </div>

                <h3 className="font-urbanist text-2xl font-semibold text-[#EFEBDD] mb-1">
                  {card.title}
                </h3>
                <p className="font-urbanist text-[11px] font-bold text-[#888888] tracking-widest uppercase mb-4">
                  {card.subtitle}
                </p>
              </div>

              {!card.isComingSoon && card.linkText ? (
                <a
                  href={card.linkHref}
                  className="font-urbanist text-[#E07A5F] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  {card.linkText}
                </a>
              ) : (
                <div className="h-4" /> // Spacer for aesthetic consistency
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
