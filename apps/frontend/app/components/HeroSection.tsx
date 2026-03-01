"use client";

import { useEffect, useRef } from "react";

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !contentRef.current) return;
      const scrollY = window.scrollY;
      const sectionTop = sectionRef.current.offsetTop;
      const relativeScroll = scrollY - sectionTop;

      // Parallax effect for the text content
      contentRef.current.style.transform = `translateY(${relativeScroll * 0.15}px)`;
      contentRef.current.style.opacity = `${Math.max(0, 1 - relativeScroll / 500)}`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full overflow-hidden bg-[#222222]"
      style={{
        height: "100svh",
        minHeight: "700px",
      }}
    >
      {/* Hero Background Video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 w-full h-full"
          dangerouslySetInnerHTML={{
            __html: `
              <video
                autoplay
                loop
                muted
                playsinline
                poster="/hero-bg-figma.png"
                class="w-full h-full object-cover"
                style="width: 100%; height: 100%; object-fit: cover;"
              >
                <source src="/images/red_sun_remix.mp4" type="video/mp4" />
              </video>
            `,
          }}
        />
        {/* Dark overlay to make the white text readable */}
        <div className="absolute inset-0 bg-black/30 z-[1]" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
      >
        <div className="flex flex-col items-center">
          <span
            className="font-urbanist font-bold text-white tracking-tight"
            style={{ fontSize: "clamp(40px, 8vw, 80px)", lineHeight: "1em" }}
          >
            Welcome to a
          </span>

          <div className="flex flex-wrap justify-center items-center gap-4 mt-3 mb-8">
            <span
              className="font-playfair font-bold italic text-[#E07A5F]"
              style={{
                fontSize: "clamp(46px, 9vw, 92px)",
                lineHeight: "1em",
                textShadow: "0px 7px 16px rgba(224, 124, 96, 0.4)",
              }}
            >
              quieter
            </span>
            <span
              className="font-urbanist font-bold text-white tracking-tight"
              style={{ fontSize: "clamp(40px, 8vw, 80px)", lineHeight: "1em" }}
            >
              way to think.
            </span>
          </div>
        </div>

        <p
          className="font-urbanist font-normal mb-11 text-[#EFEBDD] opacity-90 max-w-[760px]"
          style={{ fontSize: "20px", lineHeight: "1.5em" }}
        >
          Non-linear journaling designed for depth. Capture your thoughts as
          they happen, not just when they fit a timeline. Build a map of your
          mind.
        </p>

        <a
          href="/sign-up"
          className="font-urbanist font-semibold bg-[#E07A5F] text-[#222222] px-8 h-16 rounded-xl flex items-center transition-transform hover:scale-105 active:scale-95"
          style={{ fontSize: "20px" }}
        >
          Start Writing
        </a>

        <p className="font-playfair italic mt-10 text-[#D9D9D9] opacity-80 text-2xl">
          No cards, No noise, Just your story
        </p>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 6V22M14 22L8 16M14 22L20 16"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
