'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react'

export default function CanvasPage() {
    const router = useRouter();
    const { user } = useUser();
    return (
        <div
            className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
            {/* Background watermark */}
            <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none opacity-35 select-none z-0 overflow-hidden whitespace-nowrap">
                <span
                    className="text-[22vw] leading-none text-transparent tracking-tighter"
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        WebkitTextStroke: '1.5px rgba(255,255,255,0.55)',
                    }}
                >
                    Soulcanvas
                </span>
            </div>

            {/* Header */}
            <header className="px-8 py-6 flex justify-between items-center relative z-10">

                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => router.back()}>
                        Home
                    </button>
                    <span>/</span>
                    <span className="text-[#FF5C35]">Canvas</span>
                </div>

                {user?.imageUrl && (
                    <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full border border-white/10"
                    />
                )}

            </header>

          <main className="flex-1 w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col mt-14 pb-8">
  
<div className="flex flex-col md:flex-row gap-6 flex-1">
  
  {/* Smaller panel (1 part) */}
  <div className="flex-[1] rounded-[28px] bg-[#141414] border border-white/[0.08] shadow-2xl flex overflow-hidden">
  {/* search bar */}
    <div className="p-6 border-b border-white/[0.08]">
    <Search />
     <input
        type="text"
        placeholder="Search for entries..."
        className="w-full px-4 py-2 rounded-2xl bg-[#1a1a1a] border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50"
      />
    </div>
  </div>

  {/* Bigger panel (2 parts) */}
  <div className="flex-[2] rounded-[28px] bg-[#141414] border border-white/[0.08] shadow-2xl flex overflow-hidden">
  </div>

</div>

</main>
        </div>
                )
}