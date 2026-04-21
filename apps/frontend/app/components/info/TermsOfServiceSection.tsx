'use client';

export default function TermsOfServiceSection() {
  return (
    <section id="terms-of-service" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        <div className="max-w-3xl">
          <h2 className="font-playfair text-[clamp(44px,6vw,92px)] font-bold text-[#D6C2A3] italic leading-tight mb-16">
            Terms of <br /> Service
          </h2>

          <div className="space-y-16">
            <div className="prose prose-invert max-w-none font-urbanist text-[#A8A8A8] text-lg leading-relaxed">
              <h3 className="text-[#EFEBDD] text-2xl font-bold mb-6">1. Acceptance of Terms</h3>
              <p>
                By accessing or using Soouls, you agree to be bound by these terms. If you disagree
                with any part of the terms, you may not access the service.
              </p>

              <h3 className="text-[#EFEBDD] text-2xl font-bold mb-6 mt-12">
                2. Digital Sovereignty
              </h3>
              <p>
                We believe your thoughts are yours. Our service is designed to give you maximum
                control over your own data. However, you are responsible for maintaining the
                confidentiality of your account and encryption keys.
              </p>

              <h3 className="text-[#EFEBDD] text-2xl font-bold mb-6 mt-12">3. Acceptable Use</h3>
              <p>
                You agree to use Soouls only for lawful purposes and in a way that does not infringe
                the rights of, restrict or inhibit anyone else's use and enjoyment of the service.
              </p>
            </div>

            <div className="pt-12 border-t border-white/5">
              <p className="font-urbanist text-xs text-[#555555] font-bold tracking-[0.2em] uppercase">
                Last Updated: April 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
