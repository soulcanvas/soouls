'use client';

import { useEffect, useRef, useState } from 'react';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="waitlist"
      className="relative overflow-hidden"
      style={{
        backgroundColor: '#222222',
        minHeight: '80svh',
        padding: '120px 60px',
      }}
    >
      {/* Clover / decorative SVG elements (subtle) */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '-5%',
          opacity: 0.05,
          pointerEvents: 'none',
        }}
      >
        <svg
          width="400"
          height="400"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M48 48 C 20 8, -5 40, 48 48 Z"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M52 48 C 80 8, 105 40, 52 48 Z"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M52 52 C 80 92, 105 60, 52 52 Z"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M48 52 C 20 92, -5 60, 48 52 Z"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '0%',
          right: '-5%',
          opacity: 0.05,
          pointerEvents: 'none',
        }}
      >
        <svg
          width="400"
          height="400"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M48 48 C 20 8, -5 40, 48 48 Z"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M52 48 C 80 8, 105 40, 52 48 Z"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M52 52 C 80 92, 105 60, 52 52 Z"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M48 52 C 20 92, -5 60, 48 52 Z"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Limited Onboarding badge */}
        <div className="reveal inline-flex items-center mb-8">
          <div
            style={{
              border: '1px solid #D6C2A3',
              borderRadius: '12px',
              padding: '8px 18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {/* Animated dot */}
            <div className="relative" style={{ width: 8, height: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#D6C2A3',
                  animation: 'ping-dot 1.5s ease-in-out infinite',
                  position: 'absolute',
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#D6C2A3',
                  position: 'relative',
                }}
              />
            </div>
            <span
              className="font-urbanist"
              style={{
                fontSize: '13px',
                letterSpacing: '0.12em',
                color: '#D6C2A3',
                fontWeight: 500,
              }}
            >
              LIMITED ONBOARDING
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="reveal mb-[64px]">
          <h2
            className="font-playfair font-medium text-center"
            style={{
              fontSize: '80px',
              lineHeight: '1.05em',
              letterSpacing: '-0.035em',
            }}
          >
            <span style={{ color: '#EFEBDD' }}>Where your </span>
            <span
              className="font-playfair italic"
              style={{
                color: '#E07A5F',
                textShadow: '0 4px 42px rgba(224, 122, 95, 0.4)',
              }}
            >
              thoughts
            </span>
            <br />
            <span style={{ color: '#EFEBDD' }}>Stop feeling scattered.</span>
          </h2>
        </div>

        {/* Email form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="reveal flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto mb-10"
          >
            <div
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '16px',
                border: '1px solid rgba(214,194,163,0.2)',
                padding: '18px 24px',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="font-urbanist w-full bg-transparent outline-none"
                style={{
                  fontSize: '16px',
                  color: '#EFEBDD',
                  letterSpacing: '-0.02em',
                }}
              />
            </div>
            <button
              type="submit"
              className="font-urbanist font-bold transition-all duration-300"
              style={{
                backgroundColor: '#1C1C1C',
                border: '1px solid #E07A5F',
                borderRadius: '12px',
                padding: '18px 28px',
                color: '#EFEBDD',
                fontSize: '14px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#E07A5F';
                (e.currentTarget as HTMLElement).style.color = '#222';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#1C1C1C';
                (e.currentTarget as HTMLElement).style.color = '#EFEBDD';
              }}
            >
              RESERVE YOUR SPOT
            </button>
          </form>
        ) : (
          <div className="reveal mb-10 py-8">
            <p className="font-playfair" style={{ fontSize: '32px', color: '#D6C2A3' }}>
              You're on the list ✦
            </p>
            <p className="font-urbanist mt-3" style={{ fontSize: '18px', color: '#A8A8A8' }}>
              We'll reach out when your spot is ready.
            </p>
          </div>
        )}

        {/* Meta info row */}
        <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4">
          <span
            className="font-urbanist"
            style={{
              fontSize: '13px',
              letterSpacing: '0.1em',
              color: '#A8A8A8',
            }}
          >
            LAUNCHING FALL 2026
          </span>
          <span style={{ color: '#A8A8A8', opacity: 0.4 }}>—</span>
          <span className="font-urbanist" style={{ fontSize: '13px', color: '#A8A8A8' }}>
            Private early access. Human centered design.
          </span>
        </div>
      </div>
    </section>
  );
}
