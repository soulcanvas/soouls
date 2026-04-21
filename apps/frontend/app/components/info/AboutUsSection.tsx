'use client';

export default function AboutUsSection() {
  return (
    <section id="about-us" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      {/* Background Decoration: Clover Pattern */}
      <div className="absolute top-[10%] left-[-10%] opacity-[0.03] rotate-12 pointer-events-none">
        <svg
          width="600"
          height="600"
          viewBox="0 0 100 100"
          fill="none"
          stroke="#EFEBDD"
          strokeWidth="0.5"
        >
          <path d="M48 48 C 20 8, -5 40, 48 48 Z" />
          <path d="M52 48 C 80 8, 105 40, 52 48 Z" />
          <path d="M52 52 C 80 92, 105 60, 52 52 Z" />
          <path d="M48 52 C 20 92, -5 60, 48 52 Z" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        <div className="max-w-[800px] mb-24">
          <h2 className="font-playfair text-[clamp(48px,6vw,96px)] font-bold text-[#D6C2A3] leading-[1.1] mb-6 italic">
            We built what <br /> we needed
          </h2>
          <p className="font-urbanist text-lg text-[#888888] font-medium tracking-[0.2em] uppercase">
            A space to think without noise
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-12">
            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl">
              <h3 className="font-urbanist text-2xl font-semibold text-[#EFEBDD] mb-4">
                The Origin
              </h3>
              <p className="font-urbanist text-lg text-[#A8A8A8] leading-relaxed">
                Soouls started as a simple tool for personal reflection. We felt overwhelmed by the
                structured, timeline-focused nature of modern digital tools. Deep thinking isn't
                linear; it's an expansion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <span className="text-[#E07A5F] text-2xl">✻</span>
                <h4 className="font-urbanist font-bold text-[#EFEBDD]">Thoughts are nonlinear</h4>
                <p className="font-urbanist text-sm text-[#888888] leading-relaxed">
                  Ideas emerge, overlap, and evolve. Our canvas respects this naturally chaotic
                  process.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[#E07A5F] text-2xl">✧</span>
                <h4 className="font-urbanist font-bold text-[#EFEBDD]">Awareness is peaceful</h4>
                <p className="font-urbanist text-sm text-[#888888] leading-relaxed">
                  By removing notifications and noise, we allow your mind to find its own rhythm.
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-[#E07A5F]/10 blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative p-12 rounded-[56px] bg-[#1D2122] border border-white/[0.05] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
              <blockquote className="space-y-8">
                <p className="font-playfair text-3xl md:text-4xl text-[#D6C2A3] italic leading-tight">
                  "Soouls is not just a product. <br />
                  It's a practice of mindfulness in a digital age."
                </p>
                <footer className="font-urbanist text-[#888888] text-sm tracking-widest uppercase">
                  — The Manifesto
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
