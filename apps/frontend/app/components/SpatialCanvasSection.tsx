'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function SpatialCanvasSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('in-view'), i * 150);
            });
          }
        }
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      className="relative overflow-hidden bg-[#1B242D] min-h-[100svh] px-6 py-20 md:px-[60px] md:py-[120px]"
    >
      {/* Heading Block */}
      <div
        className="reveal mb-12 md:mb-[60px] max-w-[1239px] mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap font-playfair text-[40px] md:text-[64px] leading-[1em] tracking-tight">
          <span className="text-[#EFEBDD]">
            Your
          </span>
          <span
            className="text-[#E07A5F] italic"
            style={{
              textShadow: '0 4px 24px rgba(224,122,95,0.4)',
            }}
          >
            thoughts
          </span>
          <span className="text-[#EFEBDD]">
            don't belong in boxes
          </span>
        </div>
        <p
          className="font-urbanist reveal mt-4 md:mt-6 text-[#D9D9D9] opacity-85 text-[16px] md:text-[22px] leading-[1.4em] tracking-tight max-w-[900px] mx-auto"
        >
          Soouls gives you a spatial entry field where ideas, emotions, voice, notes, sketches,
          and tasks can coexist naturally arranged the way your mind works
        </p>
      </div>

      {/* Spatial Canvas Demo — card cluster */}
      <div
        ref={containerRef}
        className="reveal relative mx-auto w-full max-w-[1200px] h-[900px] md:h-[600px] overflow-hidden"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 0%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        }}
      >
        {/* Text entry card */}
        <motion.div
          drag
          dragConstraints={containerRef}
          whileHover={{ scale: 1.05, zIndex: 50, cursor: 'grab' }}
          whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 50 }}
          className="absolute font-urbanist flex items-center justify-center transition-shadow duration-300 left-[5%] md:left-[10%] top-[3%] md:top-[12%] max-w-[80vw] md:max-w-none bg-[#1C1C1C] rounded-[16px] px-6 py-4 md:px-8 md:py-6 shadow-[0_12px_24px_rgba(0,0,0,0.3)]"
          style={{
            rotate: '-12deg',
          }}
        >
          <p
            style={{
              fontSize: '20px',
              color: '#EFEBDD',
              letterSpacing: '0.01em',
            }}
          >
            Hey! Today I am feeling great.
          </p>
        </motion.div>

        {/* Voice note card */}
        <motion.div
          drag
          dragConstraints={containerRef}
          whileHover={{ scale: 1.05, zIndex: 50, cursor: 'grab' }}
          whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 50 }}
          className="absolute flex items-center transition-shadow duration-300 left-[5%] md:left-[15%] top-[85%] md:top-[70%] w-[300px] md:w-[320px] bg-[#1C1C1C] rounded-[16px] p-4 shadow-[0_12px_24px_rgba(0,0,0,0.3)]"
          style={{
            rotate: '-4deg',
          }}
        >
          <div className="flex items-center gap-3 w-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <title>Voice Note Icon</title>
              <path d="M8 5V19L19 12L8 5Z" fill="#E07A5F" />
            </svg>
            <div className="flex items-center gap-[3px] flex-1">
              {Array.from({ length: 32 }).map((_, j) => {
                const h = 8 + Math.sin(j * 0.5) * 14 + Math.random() * 8;
                // biome-ignore lint/suspicious/noArrayIndexKey: static shapes
                return (
                  <div
                    key={`doodle-bar-${j}`}
                    style={{
                      width: '3px',
                      height: `${Math.max(6, h)}px`,
                      background: j < 12 ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                    }}
                  />
                );
              })}
            </div>
            <span
              style={{
                fontSize: '12px',
                color: '#E07A5F',
                fontFamily: 'Urbanist',
                fontWeight: 600,
              }}
            >
              00:06
            </span>
          </div>
        </motion.div>

        {/* Image card */}
        <motion.div
          drag
          dragConstraints={containerRef}
          whileHover={{ scale: 1.05, zIndex: 50, cursor: 'grab' }}
          whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 50 }}
          className="absolute transition-shadow duration-300 left-[35%] md:left-[45%] top-[55%] md:top-[35%] w-[220px] md:w-[260px] h-[160px] md:h-[190px] bg-[#1C1C1C] rounded-[16px] overflow-hidden flex flex-col justify-end p-4 shadow-[0_12px_24px_rgba(0,0,0,0.3)]"
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, #1B2936 0%, #151C24 60%, #0F1318 100%)', // Simulated desert dusk
              borderBottom: '40px solid #1C1C1C',
            }}
          >
            {/* Simulated dune curves */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '-10%',
                right: '-10%',
                height: '60px',
                background: '#12171C',
                borderRadius: '50% 50% 0 0',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '20%',
                right: '-30%',
                height: '80px',
                background: '#0A0C10',
                borderRadius: '50% 50% 0 0',
              }}
            />
          </div>
          <span
            className="font-urbanist relative z-10"
            style={{ fontSize: '16px', color: '#D8D8D8', textAlign: 'center' }}
          >
            Deserted evening
          </span>
        </motion.div>

        {/* Tasks card */}
        <motion.div
          drag
          dragConstraints={containerRef}
          whileHover={{ scale: 1.05, zIndex: 50, cursor: 'grab' }}
          whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 50 }}
          className="absolute transition-shadow duration-300 font-urbanist left-[15%] md:left-[20%] top-[40%] md:top-[42%] w-[200px] md:w-[260px] bg-[#1C1C1C] rounded-[16px] p-5 md:p-6 shadow-[0_12px_24px_rgba(0,0,0,0.3)]"
        >
          {[
            { label: '2k running' },
            { label: '3 litr water' },
            { label: 'backend integration' },
          ].map((t, i) => {
            // biome-ignore lint/suspicious/noArrayIndexKey: static layout
            return (
              <div key={`task-item-${i}`} className="flex items-center gap-3 mb-4 last:mb-0">
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
                <span style={{ fontSize: '15px', color: '#D8D8D8' }}>{t.label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Highlighted task card */}
        <motion.div
          drag
          dragConstraints={containerRef}
          whileHover={{ scale: 1.05, zIndex: 50, cursor: 'grab' }}
          whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 50 }}
          className="absolute transition-shadow duration-300 font-urbanist left-[15%] md:left-[55%] top-[20%] md:top-[12%] w-[260px] md:w-[290px] rounded-[16px] p-5 md:p-6"
          style={{
            background: 'rgba(28, 28, 28, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(224, 122, 95, 0.5)',
            boxShadow: '0 0 24px rgba(224,122,95,.15)',
          }}
        >
          <p
            className="mb-4"
            style={{
              fontSize: '16px',
              color: '#EFEBDD',
              lineHeight: 1.3,
              fontWeight: 500,
            }}
          >
            I will complete the design system task today
          </p>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <title>Connection Node</title>
              <circle cx="8" cy="8" r="6" stroke="#E5B36A" strokeWidth="1.5" />
              <path d="M8 5V8.5L10 10" stroke="#E5B36A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: '12px', color: '#E5B36A', fontWeight: 500 }}>
              8 hours 24mins left.
            </span>
          </div>
        </motion.div>

        {/* Doodle card */}
        <motion.div
          drag
          dragConstraints={containerRef}
          whileHover={{ scale: 1.05, zIndex: 50, cursor: 'grab' }}
          whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 50 }}
          className="absolute flex items-center justify-center transition-shadow duration-300 right-[5%] md:left-[75%] md:right-auto top-[75%] md:top-[60%] w-[100px] h-[100px] md:w-[140px] md:h-[140px] bg-[#181818] rounded-[16px] shadow-[0_12px_24px_rgba(0,0,0,0.3)]"
          style={{
            rotate: '4deg',
          }}
        >
          {/* Stickman Doodle SVG */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            stroke="#111"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Stickman Doodle</title>
            {/* Headphones */}
            <path d="M20 50 C20 20, 80 20, 80 50" />
            <rect x="15" y="45" width="10" height="20" rx="5" fill="#FFFFFF" />
            <rect x="75" y="45" width="10" height="20" rx="5" fill="#FFFFFF" />
            {/* Head */}
            <path d="M30 60 Q50 65 70 60" /> {/* closed eyes/face line */}
            <circle cx="35" cy="55" r="2" fill="#FFFFFF" stroke="none" />
            <circle cx="65" cy="55" r="2" fill="#FFFFFF" stroke="none" />
            {/* Body */}
            <path d="M50 70 V100" />
            <path d="M50 80 L30 100" />
            {/* Phone holding */}
            <path d="M50 80 L70 90 L65 75" />
            <rect x="62" y="70" width="8" height="14" rx="2" fill="#FFFFFF" stroke="none" />
            {/* Music notes */}
            <path d="M10 20 Q15 15 20 20 V30" strokeWidth="2" />
            <circle cx="18" cy="30" r="3" fill="#FFFFFF" stroke="none" />
            <path d="M85 30 Q90 25 95 35 V45" strokeWidth="2" />
            <circle cx="93" cy="45" r="3" fill="#FFFFFF" stroke="none" />
          </svg>
        </motion.div>

        {/* DRAG • MOVE • CONNECT • REFLECT */}
        <div
          className="absolute flex items-center gap-6 font-urbanist "
          style={{
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            color: '#E5B36A',
          }}
        >
          {['DRAG', '•', 'MOVE', '•', 'CONNECT', '•', 'REFLECT'].map((w, i) => {
            // biome-ignore lint/suspicious/noArrayIndexKey: static word list
            return (
              <span
                key={`action-word-${i}`}
                style={{
                  fontSize: '14px',
                  letterSpacing: '0.15em',
                  color: '#E07A5F',
                  opacity: w === '•' ? 1 : 0.8,
                  fontWeight: 600,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
