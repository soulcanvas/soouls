'use client';

export default function PrivacyPolicySection() {
  return (
    <section id="privacy-policy" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-24">
          <h2 className="font-playfair text-[clamp(48px,6vw,96px)] font-bold text-[#E07A5F] leading-[1.1] mb-8 italic">
            Privacy Policy
          </h2>
          <p className="font-urbanist text-2xl text-[#EFEBDD] leading-relaxed font-light italic opacity-90">
            "Your thoughts are sacred. In this digital sanctuary, we treat your reflections with the same reverence you bring to the page."
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
          <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/[0.05] h-full">
            <h3 className="font-urbanist text-[11px] font-bold text-[#888888] tracking-[0.3em] uppercase mb-8">What we collect</h3>
            <ul className="space-y-6">
              {[
                'Names and emails for waitlist access only.',
                'Only the data you choose to sync as an encrypted hash.',
                'Zero trackers. Zero ads. Zero third-party analytics.'
              ].map((item) => (
                <li key={item} className="flex gap-4 font-urbanist text-[#A8A8A8] text-lg">
                  <span className="text-[#E07A5F]">✻</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-10 rounded-[48px] bg-[#1D2122] border border-[#E07A5F]/10 h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="#E07A5F" strokeWidth="1">
                   <path d="M50 0 L50 100 M0 50 L100 50 M15 15 L85 85 M85 15 L15 85" strokeDasharray="4 4"/>
                </svg>
             </div>
             <h4 className="font-urbanist text-[11px] font-bold text-[#E07A5F] tracking-[0.3em] uppercase mb-8">The Second Boundary</h4>
             <p className="font-urbanist text-[#D6C2A3] text-xl leading-relaxed mb-6 font-medium italic">
               We believe in sovereignty over your own digital mind.
             </p>
             <ul className="space-y-4 font-urbanist text-[#A8A8A8] text-base">
                <li>• No selling data – ever.</li>
                <li>• No marketing lists or spam.</li>
                <li>• Pure, unadulterated focus.</li>
             </ul>
          </div>
        </div>

        {/* Uncompromising Security Banner */}
        <div className="relative group mb-32 p-16 rounded-[64px] bg-black/40 border border-white/[0.03] flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
                <h3 className="font-urbanist text-3xl font-bold text-[#EFEBDD] mb-4">Uncompromising Security</h3>
                <p className="font-urbanist text-[#A8A8A8] text-lg leading-relaxed max-w-xl">
                    Every meditation and entry is encrypted before it leaves your device. 
                    We use industry-standard AES-256 encryption, ensuring that even in the unlikely 
                    event of a breach, your thoughts remain unreadable ciphers to everyone but you.
                </p>
            </div>
            <div className="w-full md:w-[300px] h-[200px] rounded-3xl overflow-hidden bg-[#161616] relative">
               {/* Visual representation of "security/light" */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E07A5F]/20 to-transparent animate-pulse" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[80%] h-[1px] bg-white/20 shadow-[0_0_20px_white]" />
               </div>
            </div>
        </div>

        {/* Sovereignty Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            <div>
               <h4 className="font-urbanist text-[11px] font-bold text-[#E07A5F] tracking-[0.3em] uppercase mb-8">Your Sovereignty</h4>
               <p className="font-urbanist text-lg text-[#A8A8A8] leading-relaxed">
                  You are in control. You can export your data anytime. 
                  You can delete your account and its associated encryption keys, 
                  rendering all data on our servers useless and purged.
               </p>
            </div>
            <div className="flex flex-col justify-end">
               <p className="font-urbanist text-[12px] text-[#888888] font-bold tracking-[0.1em] uppercase border-t border-white/10 pt-8 italic">
                  Effective as of Soouls launch, 2026.
               </p>
            </div>
        </div>
      </div>
    </section>
  );
}
