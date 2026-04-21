'use client';

export default function DocumentationSection() {
  const docs = [
    {
      title: 'Getting Started',
      text: 'Learn the core principles of using Soouls for deep reflection.',
    },
    {
      title: 'Privacy & Security',
      text: 'Detailed Technical deep-dive into our encryption architecture.',
    },
    { title: 'Local-First Sync', text: 'How we manage your data across devices seamlessly.' },
    { title: 'Keyboard Shortcuts', text: 'Master the flow with power-user navigation guides.' },
  ];

  return (
    <section id="documentation" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        <div className="max-w-[700px] mb-24">
          <h2 className="font-playfair text-[clamp(44px,6vw,92px)] font-bold text-[#D6C2A3] leading-[1.05] italic mb-8">
            Knowledge base
          </h2>
          <p className="font-urbanist text-xl text-[#888888] leading-relaxed">
            Everything you need to master your digital sanctuary. Detailed guides, technical
            references, and philosophy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {docs.map((doc) => (
            <div
              key={doc.title}
              className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-[#E07A5F]/20 transition-all cursor-pointer group"
            >
              <h3 className="font-urbanist text-xl font-bold text-[#EFEBDD] mb-4 group-hover:text-[#E07A5F] transition-colors">
                {doc.title}
              </h3>
              <p className="font-urbanist text-sm text-[#888888] leading-relaxed mb-8">
                {doc.text}
              </p>
              <span className="font-urbanist text-xs font-bold text-[#A8A8A8] uppercase tracking-widest group-hover:text-white transition-colors">
                Read Guide →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
