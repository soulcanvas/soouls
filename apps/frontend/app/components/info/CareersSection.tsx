'use client';

export default function CareersSection() {
  const vacancies = [
    {
      title: 'Experience Designer',
      type: 'FULL-TIME',
      location: 'REMOTE',
      description: 'Crafting the calmest digital experiences ever made.',
    },
    {
      title: 'Core Engineer',
      type: 'FULL-TIME',
      location: 'REMOTE',
      description: 'Building the highly performant, local-first engine behind our canvas.',
    },
  ];

  return (
    <section id="careers" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
          <div className="max-w-2xl">
            <h2 className="font-playfair text-[clamp(44px,6vw,84px)] font-bold text-[#EFEBDD] leading-[1.1] mb-6">
              Come build something <br /> that matters
            </h2>
            <p className="font-urbanist text-[16px] text-[#E07A5F] font-bold tracking-[0.2em] uppercase">
              Remote-first team
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end text-left md:text-right">
            <p className="font-urbanist text-lg text-[#888888] max-w-[340px] leading-relaxed italic">
              "We are looking for souls who find beauty in precision and purpose in silence."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
          {/* Values Grid */}
          <div className="grid grid-cols-1 gap-12">
            {[
              { 
                label: 'Small team', 
                text: 'We are lean by choice. Every individual has massive agency and ownership.' 
              },
              { 
                label: 'Thoughtful work', 
                text: 'We don\'t ship just to ship. We ship when the experience feels right.' 
              },
              { 
                label: 'Quality over speed', 
                text: 'Our deadlines are human. Our standards are atmospheric.' 
              },
            ].map((value) => (
              <div key={value.label} className="border-l-2 border-[#E07A5F]/30 pl-8">
                <h4 className="font-urbanist font-bold text-[#EFEBDD] text-lg mb-2 uppercase tracking-widest">{value.label}</h4>
                <p className="font-urbanist text-[#A8A8A8] text-base leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>

          {/* Vacancies */}
          <div className="space-y-6">
            <h3 className="font-urbanist text-xs font-bold text-[#888888] tracking-[0.3em] uppercase mb-8">Current Vacancies</h3>
            {vacancies.map((job) => (
              <div 
                key={job.title}
                className="group relative p-8 rounded-[32px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-[#E07A5F]/20 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-urbanist text-2xl font-semibold text-[#EFEBDD]">{job.title}</h4>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-[#E07A5F] border border-[#E07A5F]/30 px-2 py-1 rounded">
                      {job.type}
                    </span>
                  </div>
                </div>
                <p className="font-urbanist text-[#A8A8A8] mb-6">{job.description}</p>
                <span className="font-urbanist text-xs font-bold text-[#D6C2A3] uppercase tracking-widest group-hover:text-[#E07A5F] transition-colors">
                  View position →
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Join the Sanctuary */}
        <div className="relative p-16 rounded-[64px] bg-[#1D2122] border border-white/[0.05] flex flex-col items-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#E07A5F]/10 to-transparent opacity-30" />
          <div className="relative z-10">
            <h3 className="font-playfair text-5xl font-bold text-[#D6C2A3] italic mb-6">Join the sanctuary</h3>
            <p className="font-urbanist text-[#A8A8A8] text-lg mb-10 max-w-lg">
              Don't see a role that fits? We are always looking for passionate thinkers and builders.
            </p>
            <button className="px-10 py-5 bg-[#E07A5F] text-[#111111] font-urbanist font-bold rounded-2xl hover:bg-[#EFEBDD] transition-colors">
              Send us your story
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
