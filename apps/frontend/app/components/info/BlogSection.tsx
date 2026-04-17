'use client';

export default function BlogSection() {
  const posts = [
    {
      title: 'The Eternal Solitude',
      category: 'PHILOSOPHY',
      image: '/images/blog/books.jpg',
      date: 'MARCH 12, 2026'
    },
    {
      title: 'Fluid Dynamics',
      category: 'SCIENCE',
      image: '/images/blog/water.jpg',
      date: 'MARCH 08, 2026'
    },
    {
      title: 'Blindness of the North',
      category: 'CULTURE',
      image: '/images/blog/candle.jpg',
      date: 'FEB 28, 2026'
    },
    {
      title: 'Earth Metamorphosis',
      category: 'NATURE',
      image: '/images/blog/stone.jpg',
      date: 'FEB 20, 2026'
    },
    {
      title: 'Cosmic Humidity',
      category: 'SPACE',
      image: '/images/blog/telescope.jpg',
      date: 'FEB 14, 2026'
    }
  ];

  return (
    <section id="blog" className="relative w-full py-32 bg-[#161616] overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        {/* Header */}
        <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-2xl">
            <h2 className="font-playfair text-[clamp(48px,6vw,96px)] font-bold text-[#D6C2A3] leading-[1] italic mb-6">
               Thoughts on <br /> thinking
            </h2>
            <p className="font-urbanist text-lg text-[#888888] font-medium tracking-widest uppercase">
               The Soouls Journal
            </p>
          </div>
          <button className="px-8 py-3 rounded-full border border-white/10 text-[#EFEBDD] font-urbanist font-bold text-sm hover:bg-white/5 transition-all">
             View All Articles
          </button>
        </div>

        {/* Featured Post */}
        <div className="group relative w-full h-[600px] mb-12 rounded-[56px] overflow-hidden cursor-pointer">
           <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700 z-10" />
           {/* Placeholder for real image */}
           <div className="absolute inset-0 bg-[#2A3335] group-hover:scale-105 transition-transform duration-1000" />
           <div className="absolute bottom-0 left-0 p-12 md:p-20 z-20 max-w-2xl">
              <span className="font-urbanist text-xs font-bold text-[#E07A5F] tracking-[0.3em] uppercase mb-6 block">Featured Thinking</span>
              <h3 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-6 group-hover:text-[#D6C2A3] transition-colors">
                 The Art of Slow Living in a Fast World
              </h3>
              <p className="font-urbanist text-[#A8A8A8] text-lg mb-8 line-clamp-2">
                 How to reclaim your attention and find stillness in a culture that rewards constant motion.
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20" />
                 <span className="font-urbanist text-[#EFEBDD] text-sm font-bold tracking-widest">BY SOOULS EDITORS</span>
              </div>
           </div>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
           {posts.map((post) => (
             <div key={post.title} className="group cursor-pointer">
                <div className="relative h-[300px] rounded-[32px] overflow-hidden mb-6 bg-white/5 border border-white/5">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                   {/* Placeholder for post image */}
                   <div className="absolute inset-0 bg-[#1D2122] group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="px-2">
                   <div className="flex justify-between items-center mb-4">
                      <span className="font-urbanist text-[10px] font-bold text-[#E07A5F] tracking-[0.2em]">{post.category}</span>
                      <span className="font-urbanist text-[10px] text-[#555555] font-bold">{post.date}</span>
                   </div>
                   <h4 className="font-urbanist text-xl font-bold text-[#EFEBDD] group-hover:text-[#D6C2A3] transition-colors mb-2">
                      {post.title}
                   </h4>
                </div>
             </div>
           ))}
        </div>

        {/* Newsletter: The Weekly Whisper */}
        <div className="relative p-20 rounded-[64px] bg-[#1D2122] border border-white/[0.05] overflow-hidden flex flex-col items-center text-center">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#E07A5F]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
           <h3 className="font-playfair text-4xl font-bold text-[#D6C2A3] mb-6">The Weekly Whisper</h3>
           <p className="font-urbanist text-[#A8A8A8] text-lg mb-10 max-w-lg">
              A curated collection of insights, art, and philosophy delivered to your inbox every Sunday.
           </p>
           <form className="w-full max-w-md flex flex-col md:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[#EFEBDD] font-urbanist focus:outline-none focus:border-[#E07A5F]/50 transition-colors"
              />
              <button 
                type="submit"
                className="px-8 py-4 bg-[#E07A5F] text-[#111111] font-urbanist font-bold rounded-2xl hover:bg-[#EFEBDD] transition-colors shadow-lg shadow-[#E07A5F]/10"
              >
                Whisper to me
              </button>
           </form>
        </div>
      </div>
    </section>
  );
}
