'use client';

import { useEffect, useRef } from 'react';

interface JournalCard {
  id: string;
  date: string;
  text: string;
  highlighted?: boolean;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
}

const CARDS: JournalCard[] = [
  {
    id: 'c1',
    date: 'July 6',
    text: 'Getting it done today without any delay in results',
    style: {
      top: '25%',
      right: '12%',
      '--rotate': '-3deg',
    } as React.CSSProperties,
    size: 'md',
  },
  {
    id: 'c2',
    date: 'August 4',
    text: 'The scent of rain in the canyon was unlike anything ive felt.',
    style: {
      top: '15%',
      right: '35%',
      '--rotate': '2deg',
    } as React.CSSProperties,
    size: 'sm',
  },
  {
    id: 'c3',
    date: 'October 3',
    text: 'Finally, the clarity I was looking for.',
    style: {
      top: '35%',
      right: '5%',
      '--rotate': '-1deg',
    } as React.CSSProperties,
    size: 'lg',
  },
  {
    id: 'c4',
    date: 'July 6',
    text: 'Getting it done today without any delay in results',
    style: {
      top: '55%',
      right: '25%',
      '--rotate': '4deg',
    } as React.CSSProperties,
    size: 'lg',
  },
  {
    id: 'c5',
    date: 'August 4',
    text: 'The scent of rain in the canyon was unlike anything ive felt.',
    style: {
      top: '35%',
      right: '45%',
      '--rotate': '-2deg',
    } as React.CSSProperties,
    size: 'md',
  },
  {
    id: 'c6',
    date: 'Midnight Echoes',
    text: 'Why does the silence here feels so heavy yet so hollow?',
    highlighted: true,
    style: {
      top: '45%',
      right: '32%',
      '--rotate': '3deg',
    } as React.CSSProperties,
    size: 'lg',
  },
];

function FloatingCard({ card }: { card: JournalCard }) {
  const sizeMap = {
    // 133x69
    sm: {
      width: 133,
      fontSize: '9px',
      dateFontSize: '12.63px',
      padding: '10px 13px',
      gap: '9px',
      stroke: '0.45px',
      blur: '27px',
    },
    // 159x87
    md: {
      width: 159,
      fontSize: '10.78px',
      dateFontSize: '15px',
      padding: '17px 15px',
      gap: '11px',
      stroke: '0.54px',
      blur: '32.3px',
    },
    // 295x162
    lg: {
      width: 295,
      fontSize: '20px',
      dateFontSize: '28px',
      padding: '33px 29px',
      gap: '20px',
      stroke: '1px',
      blur: '60px',
    },
  };
  const s = sizeMap[card.size ?? 'md'];

  return (
    <div
      className="absolute rounded-[24px]" // Made sure corners match
      style={{
        ...card.style,
        width: s.width,
        padding: s.padding,
        background: card.highlighted ? 'rgba(15,15,15,0.5)' : 'rgba(15, 15, 15, 0.5)',
        backdropFilter: `blur(${s.blur})`,
        WebkitBackdropFilter: `blur(${s.blur})`,
        animation: `card-float ${3 + Math.random() * 2}s ease-in-out infinite`,
        border: card.highlighted
          ? `${s.stroke} solid rgba(224,122,95,0.4)`
          : `${s.stroke} solid rgba(34,34,34,1)`,
        boxShadow: card.highlighted
          ? '0px 5px 12px 0px rgba(224, 122, 95, 0.06), 0px 22px 22px 0px rgba(224, 122, 95, 0.05), 0px 49px 29px 0px rgba(224, 122, 95, 0.03), 0px 87px 35px 0px rgba(224, 122, 95, 0.01), 0px 136px 38px 0px rgba(224, 122, 95, 0)'
          : '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: s.gap,
        }}
      >
        <span
          className="font-playfair"
          style={{
            fontSize: s.dateFontSize,
            color: '#EFEBDD',
            lineHeight: '1em',
            letterSpacing: '-0.035em',
            textAlign: 'right',
          }}
        >
          {card.date}
        </span>
        <p
          className="font-urbanist"
          style={{
            fontSize: s.fontSize,
            color: '#A8A8A8',
            lineHeight: '1em',
            letterSpacing: '-0.035em',
            textAlign: 'right',
          }}
        >
          {card.text}
        </p>
      </div>
    </div>
  );
}

export default function RiverOfTimeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('in-view'), i * 120);
            });
          }
        });
      },
      { threshold: 0.15 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Parallax on cards
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !cardsRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const progress = -rect.top / (rect.height + window.innerHeight);
      cardsRef.current.style.transform = `translateY(${progress * -80}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="product"
      className="relative overflow-hidden flex items-center w-full"
      style={{
        backgroundColor: '#222222',
        minHeight: '982px',
        padding: '0 60px',
      }}
    >
      {/* Left Column — Text */}
      <div
        ref={leftRef}
        className="relative z-10 flex flex-col justify-start"
        style={{ width: '100%', maxWidth: '650px', marginLeft: '80px' }}
      >
        <div className="reveal" style={{ marginBottom: '22px' }}>
          <h2
            className="font-playfair"
            style={{
              fontSize: '80px',
              lineHeight: '1em',
              letterSpacing: '-0.035em',
              color: '#D6C2A3',
            }}
          >
            The River of Time
          </h2>
        </div>

        <div className="reveal" style={{ marginBottom: '60px' }}>
          <p
            className="font-urbanist"
            style={{
              fontSize: '24px',
              lineHeight: '1.4em',
              letterSpacing: '-0.035em',
              color: '#EFEBDD',
              opacity: 0.85,
            }}
          >
            A seamless, non-linear architecture that lets your life flow naturally. Forget
            chronological constraints — connect moments by their emotional resonance
          </p>
        </div>

        {/* Feature tag */}
        <div className="reveal">
          <div className="flex items-center gap-[12px] mb-[12px]">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #E07A5F 0%, rgba(224,122,95,0) 70%)',
                boxShadow:
                  '0px 7px 16px 0px rgba(224, 124, 96, 0.22), 0px 29px 29px 0px rgba(224, 124, 96, 0.19), 0px 65px 39px 0px rgba(224, 124, 96, 0.11), 0px 115px 46px 0px rgba(224, 124, 96, 0.03), 0px 180px 50px 0px rgba(224, 124, 96, 0)',
                flexShrink: 0,
              }}
            />
            <span
              className="font-playfair"
              style={{
                fontSize: '32px',
                lineHeight: '1em',
                color: '#E07A5F',
                letterSpacing: '-0.035em',
              }}
            >
              Dynamic Synthesis
            </span>
          </div>
          <p
            className="font-urbanist"
            style={{
              fontSize: '20px',
              lineHeight: '1em',
              letterSpacing: '-0.035em',
              color: '#EFEBDD',
              opacity: 0.8,
              maxWidth: '500px',
              marginLeft: '44px',
            }}
          >
            Our engine suggests connections based on semantic meaning and mood, not just dates.
          </p>
        </div>
      </div>

      {/* Right: Floating journal cards */}
      <div
        ref={cardsRef}
        className="absolute right-0 top-0 h-full parallax-layer"
        style={{ width: '55%', minHeight: '982px' }}
      >
        {CARDS.map((card) => (
          <FloatingCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
