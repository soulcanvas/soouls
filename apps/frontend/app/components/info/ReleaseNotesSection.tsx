'use client';

export default function ReleaseNotesSection() {
  const releases = [
    {
      version: 'v0.8.4',
      date: 'APRIL 2026',
      title: 'The Calm Update',
      changes: [
        'Improved typography rendering',
        'New meditation background sounds',
        'Enhanced local-first sync stability',
      ],
    },
    {
      version: 'v0.8.0',
      date: 'MARCH 2026',
      title: 'Public Alpha Launch',
      changes: [
        'Initial release to waitlist',
        'Core canvas functionality',
        'End-to-end encryption layer',
      ],
    },
  ];

  return (
    <section id="release-notes" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        <div className="max-w-2xl mb-24">
          <h2 className="font-playfair text-[clamp(48px,6vw,96px)] font-bold text-[#EFEBDD] leading-[1] italic mb-8">
            Release Notes
          </h2>
          <p className="font-urbanist text-lg text-[#888888]">
            Charting our evolution. From the first line of code to a sanctuary for deep thoughts.
          </p>
        </div>

        <div className="space-y-12">
          {releases.map((release) => (
            <div key={release.version} className="relative pl-12 border-l border-white/10 group">
              {/* Timeline Dot */}
              <div className="absolute left-[-5px] top-2 w-[10px] h-[10px] rounded-full bg-[#E07A5F] shadow-[0_0_15px_#E07A5F/50] group-hover:scale-150 transition-transform" />

              <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] tracking-[0.3em] uppercase mb-2 block">
                      {release.date}
                    </span>
                    <h3 className="font-urbanist text-3xl font-bold text-[#EFEBDD]">
                      {release.title}
                    </h3>
                  </div>
                  <span className="font-urbanist text-xs font-bold text-[#A8A8A8] border border-white/10 px-4 py-2 rounded-full tracking-widest">
                    {release.version}
                  </span>
                </div>

                <ul className="space-y-4">
                  {release.changes.map((change) => (
                    <li key={change} className="flex gap-4 font-urbanist text-[#A8A8A8] text-base">
                      <span className="text-[#E07A5F]/50">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
