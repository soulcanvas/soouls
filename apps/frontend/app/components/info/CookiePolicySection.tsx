'use client';

export default function CookiePolicySection() {
  return (
    <section id="cookie-policy" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        <div className="max-w-3xl">
          <h2 className="font-playfair text-[clamp(44px,6vw,92px)] font-bold text-[#EFEBDD] leading-[1.05] italic mb-16">
            Cookie Policy
          </h2>
          
          <div className="space-y-12 prose prose-invert font-urbanist text-[#A8A8A8] text-lg leading-relaxed">
             <p>
               At Soouls, we believe in radical transparency. Most websites use cookies to track your behavior across the web. 
               We don't.
             </p>
             
             <h3 className="text-[#D6C2A3] text-2xl font-bold">Strictly Necessary Cookies</h3>
             <p>
               We only use cookies that are essential for the site to function — such as maintaining your authentication session. 
               These do not track your activity or identify you for any purpose other than providing our service.
             </p>

             <h3 className="text-[#D6C2A3] text-2xl font-bold">No Marketing or Analytics</h3>
             <p>
               We do not use third-party analytics cookies or marketing cookies. Your digital thoughts remain 
               undisturbed by trackers.
             </p>
          </div>
        </div>
      </div>
    </section>
  );
}
