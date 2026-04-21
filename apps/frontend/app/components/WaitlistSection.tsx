'use client';

import { useEffect, useRef, useState } from 'react';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      window.location.href =
        'https://docs.google.com/forms/d/e/1FAIpQLSegPVQKipXygjPx9MI6yCwd8dJuMwIlH3fmUJoq1j9JjD0NDw/viewform?usp=sharing&ouid=118057366711670267557';
    }
  };

  return (
    <section
      ref={sectionRef}
      id="early-access"
      className="relative overflow-hidden bg-[#222222] min-h-[80svh] px-6 py-20 md:px-[60px] md:py-[120px]"
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
          <title>Decorative Clover Element</title>
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
          <title>Decorative Clover Element</title>
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
              border: '1px solid rgba(214,194,163,0.3)',
              borderRadius: '24px',
              padding: '8px 16px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <span
              className="font-urbanist"
              style={{
                fontSize: '11px',
                letterSpacing: '0.12em',
                color: '#D6C2A3',
                fontWeight: 500,
              }}
            >
              NOW OPEN
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="reveal mb-10 md:mb-[64px]">
          <h2
            className="font-playfair font-medium text-center text-[40px] md:text-[80px] leading-[1.05em]"
            style={{
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
            <span style={{ color: '#EFEBDD' }}>become your universe.</span>
          </h2>
        </div>

        {/* Email form */}
        {!submitted ? (
          <>
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
                className="font-urbanist font-bold transition-all duration-300 flex items-center justify-center"
                style={{
                  backgroundColor: '#E07A5F',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '16px 24px',
                  color: '#222222',
                  fontSize: '13px',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  height: '56px',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#d4694e';
                  (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#E07A5F';
                  (e.currentTarget as HTMLElement).style.color = '#222222';
                }}
              >
                JOIN THE CENTRUM
              </button>
            </form>
            <p className="text-center text-xs text-[#A8A8A8] mt-3 font-urbanist">
              Enter your email for updates, or{' '}
              <a href="/sign-up" style={{ color: '#E07A5F' }}>
                create your ID
              </a>{' '}
              to start writing now.
            </p>
          </>
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
        <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center mt-12 md:mt-0">
          <span className="font-urbanist text-[11px] md:text-[13px] tracking-[0.1em] text-[#A8A8A8]">
            EARLY ACCESS OPEN
          </span>
          <span className="hidden sm:inline" style={{ color: '#A8A8A8', opacity: 0.4 }}>
            —
          </span>
          <span className="font-urbanist text-[11px] md:text-[13px] text-[#A8A8A8]">
            Join the Centrum. Human centered design.
          </span>
        </div>
      </div>
    </section>
  );
}
