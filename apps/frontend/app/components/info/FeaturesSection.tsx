'use client';

export default function FeaturesSection() {
  return (
    <section id="features" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Visual Block */}
          <div className="relative h-[500px] rounded-[56px] overflow-hidden group">
            <div className="absolute inset-0 bg-[#0A0A0A]/40 z-10" />
            {/* Visual: Desk Lamp/Minimal setup representation */}
            <div className="absolute inset-0 bg-[#1D2122] flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute top-[20%] left-[30%] w-[150px] h-[150px] bg-white opacity-20 blur-[80px]" />
                <div className="absolute top-[15%] left-[25%] w-12 h-12 bg-white/10 rounded-full border border-white/20 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white/40 rounded-full" />
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 left-12 z-20">
              <span className="font-urbanist text-xs font-bold text-[#D6C2A3] tracking-[0.3em] uppercase mb-4 block">
                Minimal Setup
              </span>
              <h3 className="font-playfair text-3xl font-bold text-white italic">
                Archive in a glance.
              </h3>
            </div>
          </div>

          {/* Right: Text Blocks */}
          <div className="space-y-16">
            <div className="max-w-md">
              <h4 className="font-urbanist text-[11px] font-bold text-[#E07A5F] tracking-[0.3em] uppercase mb-6">
                Minimal System Requirements
              </h4>
              <p className="font-urbanist text-lg text-[#A8A8A8] leading-relaxed">
                Soouls is designed to be lightweight. If you can see the stars through your window,
                you can run our archive. Just a modern browser and a moment of silence.
              </p>
            </div>

            <div className="max-w-md">
              <h4 className="font-urbanist text-[11px] font-bold text-[#E07A5F] tracking-[0.3em] uppercase mb-6">
                Sync Note
              </h4>
              <h3 className="font-playfair text-4xl md:text-5xl font-bold text-[#D6C2A3] italic leading-tight mb-4">
                Everything stays with you. <br /> Seamlessly.
              </h3>
              <p className="font-urbanist text-base text-[#888888] leading-relaxed">
                Our local-first architecture ensures that your data is always accessible, even
                without an internet connection. Real-time sync works in the background to keep all
                your devices in harmony.
              </p>
            </div>

            <div className="pt-8 border-t border-white/5">
              <button className="px-10 py-5 bg-[#E07A5F] text-[#111111] font-urbanist font-bold rounded-2xl hover:bg-[#EFEBDD] transition-colors shadow-lg shadow-[#E07A5F]/10">
                Start Writing on Web
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
