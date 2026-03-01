"use client";

import { SiX, SiLinkedin, SiInstagram } from "react-icons/si";

export default function FooterSection() {
  return (
    <footer
      id="footer"
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "#161616", // Adjusted slightly darker to match image
        minHeight: "507px",
        padding: "40px 0",
      }}
    >
      {/* Noise Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          opacity: 0.08,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      {/* Top content - Header, Links, Socials */}
      <div className="relative z-20 w-full max-w-[1100px] mx-auto px-8 flex justify-between items-start pt-24 pb-32">
        {/* Left: Brand & Description */}
        <div className="flex flex-col max-w-[380px]">
          {/* Exact Clover Logo SVG */}
          <div className="mb-[20px]">
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Four hearts making a clover, outline exact match to image */}
              <path
                d="M48 48 C 20 8, -5 40, 48 48 Z"
                stroke="#E6D3B8"
                strokeWidth="3"
                fill="none"
                strokeLinejoin="round"
              />
              <path
                d="M52 48 C 80 8, 105 40, 52 48 Z"
                stroke="#E6D3B8"
                strokeWidth="3"
                fill="none"
                strokeLinejoin="round"
              />
              <path
                d="M52 52 C 80 92, 105 60, 52 52 Z"
                stroke="#E6D3B8"
                strokeWidth="3"
                fill="none"
                strokeLinejoin="round"
              />
              <path
                d="M48 52 C 20 92, -5 60, 48 52 Z"
                stroke="#E6D3B8"
                strokeWidth="3"
                fill="none"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="font-urbanist tracking-tight mb-3"
            style={{ fontSize: "32px", color: "#E0DECE", fontWeight: 500 }}
          >
            Soulcanvas
          </span>
          <p
            className="font-urbanist"
            style={{
              fontSize: "12px",
              color: "#A8A8A8",
              lineHeight: "1.4em",
              letterSpacing: "0.01em",
              opacity: 0.8,
            }}
          >
            Transforming the act of daily documentation into a highly
            <br />
            aesthetic, deeply meaningful experience
          </p>
        </div>

        {/* Center: Links */}
        <div className="flex flex-col gap-[20px] mt-[88px] ml-[-60px]">
          {["TEAM", "PHILOSOPHY", "PRIVACY"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="font-urbanist tracking-wide hover:text-white transition-colors duration-200"
              style={{ fontSize: "13px", color: "#D8D8D8", fontWeight: 600 }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right: Socials & Copyright */}
        <div className="flex flex-col items-end mt-[88px]">
          <div className="flex items-center gap-[24px] mt-[44px] mb-[28px]">
            {/* X (Twitter) */}
            <a
              href="https://twitter.com/soulcanvas_app"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              <SiX size={18} color="#D8D8D8" />
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/soulcanvas"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              <SiLinkedin size={20} color="#D8D8D8" />
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com/soulcanvas_app"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              <SiInstagram size={20} color="#D8D8D8" />
            </a>
          </div>
          <span
            className="font-urbanist mt-auto"
            style={{
              fontSize: "11px",
              color: "#888888",
              letterSpacing: "0.02em",
              fontWeight: 500,
            }}
          >
            All rights reserved © SOULCANVAS 2026
          </span>
        </div>
      </div>

      {/* Stacked Text block matching Figma */}
      <div className="absolute bottom-[-60px] left-0 right-0 z-10 flex flex-col items-center justify-center pointer-events-none opacity-20">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="font-playfair"
            style={{
              fontFamily: "ABC Whyte Inktrap, sans-serif",
              fontSize: "300px",
              lineHeight: "150px",
              letterSpacing: "-0.035em",
              fontWeight: 800,
              color: "transparent",
              WebkitTextStroke: "1px #FFFFFF",
              userSelect: "none",
              textTransform: "none",
            }}
          >
            Soulcanvas
          </span>
        ))}
      </div>
    </footer>
  );
}
