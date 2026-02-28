'use client';

import { useEffect, useRef } from 'react';

export default function SundayReviewSection() {
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
      id="sunday-review"
      className="relative"
      style={{
        backgroundColor: '#222222',
        minHeight: '100svh',
        padding: '120px 60px',
      }}
    >
      {/* Decorative blurred circle */}
      <div
        className="absolute"
        style={{
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,194,163,0.15) 0%, rgba(214,194,163,0) 70%)',
          filter: 'blur(80px)',
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left: Sunday Review Card */}
          <div className="reveal flex-1">
            <div
              className="rounded-[32px]"
              style={{
                padding: '48px',
                maxWidth: '560px',
                background: '#1C1C1C',
                border: '1px solid rgba(214,194,163,0.08)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
              }}
            >
              {/* Card header */}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p
                    className="font-urbanist"
                    style={{
                      fontSize: '13px',
                      letterSpacing: '0.1em',
                      color: '#6E6E6E',
                      marginBottom: '4px',
                    }}
                  >
                    NOV, 02, 2023
                  </p>
                  <p
                    className="font-urbanist"
                    style={{ fontSize: '14px', color: '#A8A8A8', letterSpacing: '0.05em' }}
                  >
                    SUNDAY REVIEW
                  </p>
                </div>
                {/* Squiggly / logo mark placeholder */}
                <div style={{ width: 48, height: 48, opacity: 0.4 }}>
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 24C8 24 12 8 24 8C36 8 40 24 40 24C40 24 36 40 24 40C12 40 8 24 8 24Z"
                      stroke="#D6C2A3"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3
                className="font-playfair mb-4"
                style={{
                  fontSize: 'clamp(28px, 3vw, 40px)',
                  lineHeight: '1.1em',
                  letterSpacing: '-0.035em',
                  color: '#D6C2A3',
                }}
              >
                Steady &amp; Resilient
              </h3>

              {/* Body text */}
              <p
                className="font-urbanist"
                style={{
                  fontSize: '20px',
                  lineHeight: '1.6em',
                  letterSpacing: '-0.035em',
                  color: '#A8A8A8',
                }}
              >
                This week, your entries gravitated toward themes of endurance. The silence of the
                desert reflected in your Tuesday voice notes, revealing a growing peace with the
                unknown...
              </p>

              {/* Color bar graphic */}
              <div className="mt-12 flex gap-4">
                {[50, 75, 40, 65, 50, 80, 45].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: h,
                      borderRadius: '6px',
                      background: i % 2 === 0 ? '#504A41' : '#613E34',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Title + Description */}
          <div className="reveal flex-1 lg:max-w-lg">
            <h2
              className="font-playfair mb-8"
              style={{
                fontSize: 'clamp(48px, 6vw, 100px)',
                lineHeight: '1em',
                letterSpacing: '-0.035em',
                color: '#D6C2A3',
              }}
            >
              The Sunday Review
            </h2>
            <p
              className="font-urbanist"
              style={{
                fontSize: 'clamp(18px, 1.8vw, 28px)',
                lineHeight: '1.5em',
                letterSpacing: '-0.035em',
                color: '#EFEBDD',
                opacity: 0.85,
              }}
            >
              A beautifully typeset, single-screen summary of your week. Synthesized by intent —
              delivered with care.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
