'use client';

import { useEffect, useRef } from 'react';

export default function SundayReviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

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
      id="sunday-review"
      className="relative flex items-center overflow-hidden w-full"
      style={{
        background: 'linear-gradient(to bottom, #1B1E23 0%, #2A2118 45%, #C29557 100%)',
        minHeight: '100svh',
      }}
    >
      <div className="absolute inset-0 px-6 py-20 lg:px-[60px] lg:py-[120px] pointer-events-none" />
      {/* Soft ambient light overlay for extra richness from the bottom */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 60%, rgba(255, 220, 150, 0.25) 100%)',
          mixBlendMode: 'color-dodge',
        }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col-reverse lg:flex-row gap-12 lg:gap-[80px] items-center justify-between px-6 lg:px-0 py-20 lg:py-0">
        {/* Left: Sunday Review App Canvas Card */}
        <div className="reveal flex justify-center w-full lg:w-1/2">
          {/* Card Container */}
          <div
            className="relative font-urbanist w-full max-w-[410px]"
            style={{
              background: 'linear-gradient(145deg, #1C1B19 0%, #151412 100%)', // Rich dark coffee/slate
              borderRadius: '28px',
              padding: '32px 24px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            {/* Header: SUNDAY REVIEW | NOV. 02, 2023 */}
            <div className="flex justify-between items-center mb-10">
              <span
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  color: '#A8A8A8',
                  fontWeight: 400,
                }}
              >
                SUNDAY REVIEW
              </span>
              <span
                className="font-playfair"
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  color: '#8E8E8E',
                  fontWeight: 400,
                }}
              >
                NOV. 02, 2023
              </span>
            </div>

            {/* Title */}
            <h3
              className="font-playfair font-normal mb-5"
              style={{
                fontSize: '36px',
                lineHeight: '1em',
                letterSpacing: '-0.01em',
                color: '#E5D4B3',
              }}
            >
              Steady & <span className="italic">Resilient</span>
            </h3>

            {/* Paragraph */}
            <p
              style={{
                fontSize: '15px',
                lineHeight: '1.4em',
                color: '#A0A09B',
                letterSpacing: '-0.01em',
                fontWeight: 300,
              }}
            >
              This week, your entries gravitated toward themes of endurance. The silence of the
              desert reflected in your Tuesday voice notes, revealing a growing peace with the
              unknown..
            </p>

            {/* Divider lines */}
            <div className="flex gap-4 mt-8 mb-6 opacity-40">
              <div style={{ height: '1px', background: '#E5D4B3', flex: 1.5 }} />
              <div style={{ height: '1px', background: '#E5D4B3', flex: 1 }} />
            </div>

            {/* Graph Card Component */}
            <div
              className="mt-6 rounded-2xl relative"
              style={{
                background: '#161513',
                padding: '24px 24px',
                border: '1px solid rgba(255,255,255,0.02)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              <h4
                style={{
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  color: '#6A6559',
                  marginBottom: '32px',
                  fontWeight: 600,
                }}
              >
                WEEKLY EMOTIONAL TRAJECTORY
              </h4>

              {/* Advanced SVG Line Chart based on screenshot */}
              <div className="relative w-full h-[60px] mb-8">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 300 60"
                  preserveAspectRatio="none"
                  style={{ overflow: 'visible' }}
                >
                  <title>Weekly Emotional Trajectory Graph</title>
                  {/* The connected golden path */}
                  <path
                    d="M 5 35 L 50 48 L 100 30 L 140 42 L 190 25 L 240 20 L 295 28"
                    fill="none"
                    stroke="#D8C8A3"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data Point Dots */}
                  <circle cx="5" cy="35" r="2.5" fill="#161513" stroke="#D8C8A3" strokeWidth="1" />
                  <circle cx="50" cy="48" r="2.5" fill="#161513" stroke="#D8C8A3" strokeWidth="1" />
                  <circle
                    cx="100"
                    cy="30"
                    r="2.5"
                    fill="#161513"
                    stroke="#D8C8A3"
                    strokeWidth="1"
                  />
                  <circle
                    cx="140"
                    cy="42"
                    r="2.5"
                    fill="#161513"
                    stroke="#D8C8A3"
                    strokeWidth="1"
                  />
                  <circle
                    cx="190"
                    cy="25"
                    r="2.5"
                    fill="#161513"
                    stroke="#D8C8A3"
                    strokeWidth="1"
                  />
                  <circle
                    cx="240"
                    cy="20"
                    r="2.5"
                    fill="#161513"
                    stroke="#D8C8A3"
                    strokeWidth="1"
                  />
                  <circle
                    cx="295"
                    cy="28"
                    r="2.5"
                    fill="#161513"
                    stroke="#D8C8A3"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* Data Labels Grid */}
              <div
                className="flex flex-col gap-3"
                style={{
                  fontSize: '8.5px',
                  letterSpacing: '0.05em',
                  color: '#666',
                }}
              >
                <div className="flex flex-row gap-6">
                  <span>
                    MON <span style={{ color: '#333' }}>—</span> REFLECTIVE
                  </span>
                  <span>
                    TUE <span style={{ color: '#333' }}>—</span> OVERWHELMED
                  </span>
                </div>
                <div className="flex flex-row gap-6">
                  <span>
                    WED <span style={{ color: '#333' }}>—</span> GROUNDED
                  </span>
                  <span>
                    THU <span style={{ color: '#333' }}>—</span> RESTLESS
                  </span>
                  <span>
                    FRI <span style={{ color: '#333' }}>—</span> FOCUSED
                  </span>
                </div>
                <div className="flex flex-row gap-6">
                  <span>
                    SAT <span style={{ color: '#333' }}>—</span> CALM
                  </span>
                  <span>
                    SUN <span style={{ color: '#333' }}>—</span> CENTERED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Typography Match */}
        <div className="reveal flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <h2
            className="font-playfair font-normal"
            style={{
              fontSize: 'clamp(40px, 6vw, 96px)', // Scaled massively based on image
              lineHeight: '1em',
              letterSpacing: '-0.035em',
              color: '#E5D4B3', // Matching golden font hue
              marginBottom: '24px',
            }}
          >
            The Sunday Review
          </h2>
          <p
            className="font-urbanist mt-6"
            style={{
              fontSize: 'clamp(16px, 2vw, 24px)',
              lineHeight: '1.4em',
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              maxWidth: '540px',
              fontWeight: 400,
            }}
          >
            A beautifully typeset, single-screen summary of your week. Synthesized by intent,
            delivered with care.
          </p>
        </div>
      </div>
    </section>
  );
}
