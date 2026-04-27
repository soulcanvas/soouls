'use client';

export default function ContactSection() {
  return (
    <section id="contact" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="font-playfair text-[clamp(44px,6vw,84px)] font-bold text-[#D6C2A3] italic leading-tight mb-8">
              Reach out from <br /> the silence
            </h2>
            <p className="font-urbanist text-xl text-[#A8A8A8] mb-12 max-w-md">
              Whether you have a question, a suggestion, or just want to share your thoughts — we
              are listening.
            </p>

            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] tracking-[0.3em] uppercase">
                  Email
                </span>
                <a
                  href="mailto:hello@soouls.in"
                  className="font-urbanist text-2xl font-semibold text-[#EFEBDD] hover:text-[#E07A5F] transition-colors"
                >
                  hello@soouls.in
                </a>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] tracking-[0.3em] uppercase">
                  X (formerly Twitter)
                </span>
                <a
                  href="https://x.com/soouls_app"
                  target="_blank"
                  className="font-urbanist text-2xl font-semibold text-[#EFEBDD] hover:text-[#E07A5F] transition-colors"
                  rel="noreferrer"
                >
                  @soouls_app
                </a>
              </div>
            </div>
          </div>

          <div className="p-12 rounded-[56px] bg-[#1D2122] border border-white/[0.05] relative overflow-hidden">
            <div className="relative z-10">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contactName" className="font-urbanist text-xs font-bold text-[#888888] tracking-widest uppercase ml-2">
                      Name
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[#EFEBDD] font-urbanist focus:outline-none focus:border-[#E07A5F]/40"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contactEmail" className="font-urbanist text-xs font-bold text-[#888888] tracking-widest uppercase ml-2">
                      Email
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[#EFEBDD] font-urbanist focus:outline-none focus:border-[#E07A5F]/40"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-urbanist text-xs font-bold text-[#888888] tracking-widest uppercase ml-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[#EFEBDD] font-urbanist focus:outline-none focus:border-[#E07A5F]/40 resize-none"
                  />
                </div>
                <button className="w-full py-5 bg-[#E07A5F] text-[#111111] font-urbanist font-bold rounded-2xl hover:bg-[#EFEBDD] transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
