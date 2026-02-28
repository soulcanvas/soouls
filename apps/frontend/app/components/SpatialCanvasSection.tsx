'use client';

import { useEffect, useRef } from 'react';

export default function SpatialCanvasSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('in-view'), i * 150);
            });
          }
        });
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
      className="relative overflow-hidden"
      style={{
        backgroundColor: '#1E2A3A',
        minHeight: '100svh',
        padding: '120px 60px',
      }}
    >
      {/* Heading Block */}
      <div
        className="reveal"
        style={{ maxWidth: '1239px', margin: '0 auto 60px', textAlign: 'center' }}
      >
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {['Your', 'thoughts', "don't belong", 'in boxes'].map((word, i) => (
            <span
              key={i}
              className="font-playfair"
              style={{
                fontSize: 'clamp(36px, 5.5vw, 80px)',
                lineHeight: '1em',
                letterSpacing: '-0.035em',
                color: word === 'thoughts' ? '#E07A5F' : '#D9D9D9',
                textShadow:
                  word === 'thoughts'
                    ? '0px 7px 16px rgba(224,124,96,.22), 0px 29px 29px rgba(224,124,96,.19)'
                    : undefined,
              }}
            >
              {word}
            </span>
          ))}
        </div>
        <p
          className="font-urbanist reveal mt-8"
          style={{
            fontSize: 'clamp(16px, 1.6vw, 26px)',
            lineHeight: '1.5em',
            letterSpacing: '-0.035em',
            color: '#D9D9D9',
            maxWidth: '900px',
            margin: '32px auto 0',
            opacity: 0.85,
          }}
        >
          Soulcanvas gives you a spatial entry field where ideas, emotions, voice, notes, sketches,
          and tasks can coexist — naturally arranged the way your mind works
        </p>
      </div>

      {/* Spatial Canvas Demo — card cluster */}
      <div
        className="reveal relative mx-auto"
        style={{
          maxWidth: '1317px',
          height: '650px',
          background:
            'linear-gradient(156deg, rgba(214,194,163,1) 20%, rgba(214,194,163,1) 45%, rgba(207,188,158,1) 48%, rgba(207,188,158,1) 64%, rgba(207,188,158,1) 66%, rgba(207,188,158,1) 73%, rgba(112,102,85,1) 95%)',
          borderRadius: '32px',
          overflow: 'hidden',
        }}
      >
        {/* Floating demo cards */}

        {/* Text entry card */}
        <div
          className="absolute rounded-2xl font-urbanist"
          style={{
            left: '53px',
            top: '59px',
            width: '336px',
            background: '#222',
            borderRadius: '16px',
            padding: '34px 28px',
          }}
        >
          <p style={{ fontSize: '23px', color: '#D8D8D8', lineHeight: '1.3em', opacity: 0.9 }}>
            Hey! Today I am feeling great.
          </p>
        </div>

        {/* Image card */}
        <div
          className="absolute rounded-2xl"
          style={{
            left: '463px',
            top: '123px',
            width: '301px',
            height: '229px',
            background: '#222',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '16px',
          }}
        >
          {/* Gradient image placeholder */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #2d3540 0%, #445566 40%, #334455 100%)',
              opacity: 0.9,
            }}
          />
          <span
            className="font-urbanist relative z-10"
            style={{ fontSize: '20px', color: '#D8D8D8', textAlign: 'center' }}
          >
            Deserted evening
          </span>
        </div>

        {/* Voice note card */}
        <div
          className="absolute"
          style={{
            left: '59px',
            top: '361px',
            width: '383px',
            background: '#1C1C1C',
            borderRadius: '13px',
            padding: '16px',
          }}
        >
          {/* Waveform visualization */}
          <div className="flex items-center gap-1 mb-2" style={{ height: '56px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: '#222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5 3L14 9L5 15V3Z" fill="#E07A5F" />
              </svg>
            </div>
            {/* Audio bars */}
            <div className="flex items-center gap-px flex-1">
              {Array.from({ length: 30 }).map((_, j) => {
                const h = 8 + Math.sin(j * 0.7) * 16 + Math.random() * 12;
                return (
                  <div
                    key={j}
                    style={{
                      width: 3.2,
                      height: Math.max(8, h),
                      background: j < 8 ? '#E07A5F' : 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                    }}
                  />
                );
              })}
            </div>
            <span style={{ fontSize: 13, color: '#E07A5F', fontFamily: 'Urbanist' }}>00:06</span>
          </div>
        </div>

        {/* Tasks card */}
        <div
          className="absolute rounded-2xl"
          style={{
            left: '463px',
            top: '355px',
            width: '280px',
            background: '#222',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          {[
            { done: false, label: '2k running' },
            { done: false, label: '3 litr water' },
            { done: false, label: 'backend integration' },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div
                style={{ width: 20, height: 20, border: '1px solid #A8A8A8', borderRadius: 5 }}
              />
              <span className="font-urbanist" style={{ fontSize: '15px', color: '#D8D8D8' }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>

        {/* Highlighted task card */}
        <div
          className="absolute"
          style={{
            left: '799px',
            top: '59px',
            width: '295px',
            background: 'rgba(15,15,15,0.5)',
            backdropFilter: 'blur(60px)',
            border: '1px solid #E07A5F',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 5px 12px rgba(224,122,95,.06), 0 22px 22px rgba(224,122,95,.05)',
          }}
        >
          <p
            className="font-urbanist mb-3"
            style={{ fontSize: '18px', color: '#D8D8D8', lineHeight: 1.4 }}
          >
            I will complete the design system task today
          </p>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#A8A8A8" strokeWidth="1.5" />
              <path d="M8 5V8.5L10 10" stroke="#A8A8A8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: '14px', color: '#E07A5F' }}>8 hours 24mins left.</span>
          </div>
        </div>

        {/* DRAG • MOVE • CONNECT • REFLECT */}
        <div
          className="absolute flex items-center gap-4 font-urbanist"
          style={{
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0.59,
            whiteSpace: 'nowrap',
          }}
        >
          {['DRAG', '•', 'MOVE', '•', 'CONNECT', '•', 'REFLECT'].map((w, i) => (
            <span
              key={i}
              style={{
                fontSize: '13px',
                letterSpacing: '0.15em',
                color: '#E07A5F',
              }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
