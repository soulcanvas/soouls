"use client";

import { useEffect, useRef } from "react";

export default function SpatialCanvasSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("in-view"), i * 150);
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
        backgroundColor: "#1B242D", // Exact dark slate background from image
        minHeight: "100svh",
        padding: "120px 60px",
      }}
    >
      {/* Heading Block */}
      <div
        className="reveal"
        style={{
          maxWidth: "1239px",
          margin: "0 auto 60px",
          textAlign: "center",
        }}
      >
        <div className="flex items-center justify-center gap-3 flex-wrap font-playfair">
          <span
            style={{
              fontSize: "64px",
              color: "#EFEBDD",
              letterSpacing: "-0.03em",
            }}
          >
            Your
          </span>
          <span
            style={{
              fontSize: "64px",
              color: "#E07A5F",
              letterSpacing: "-0.03em",
              textShadow: "0 4px 24px rgba(224,122,95,0.4)",
            }}
          >
            thoughts
          </span>
          <span
            style={{
              fontSize: "64px",
              color: "#EFEBDD",
              letterSpacing: "-0.03em",
            }}
          >
            don't belong in boxes
          </span>
        </div>
        <p
          className="font-urbanist reveal mt-6"
          style={{
            fontSize: "22px",
            lineHeight: "1.4em",
            letterSpacing: "-0.03em",
            color: "#D9D9D9",
            maxWidth: "900px",
            margin: "24px auto 0",
            opacity: 0.85,
          }}
        >
          Soulcanvas gives you a spatial entry field where ideas, emotions,
          voice, notes, sketches, and tasks can coexist naturally arranged the
          way your mind works
        </p>
      </div>

      {/* Spatial Canvas Demo — card cluster */}
      <div
        className="reveal relative mx-auto"
        style={{
          maxWidth: "1200px",
          height: "600px",
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Text entry card */}
        <div
          className="absolute font-urbanist flex items-center justify-center transition-transform hover:scale-105 duration-300"
          style={{
            left: "12%",
            top: "25%",
            background: "#1C1C1C",
            borderRadius: "16px",
            padding: "24px 32px",
            transform: "rotate(-12deg)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
          }}
        >
          <p
            style={{
              fontSize: "20px",
              color: "#EFEBDD",
              letterSpacing: "0.01em",
            }}
          >
            Hey! Today I am feeling great.
          </p>
        </div>

        {/* Voice note card */}
        <div
          className="absolute flex items-center transition-transform hover:scale-105 duration-300"
          style={{
            left: "10%",
            top: "65%",
            width: "320px",
            background: "#1C1C1C",
            borderRadius: "16px",
            padding: "16px 20px",
            transform: "rotate(-4deg)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center gap-3 w-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 5V19L19 12L8 5Z" fill="#E07A5F" />
            </svg>
            <div className="flex items-center gap-[3px] flex-1">
              {Array.from({ length: 32 }).map((_, j) => {
                const h = 8 + Math.sin(j * 0.5) * 14 + Math.random() * 8;
                return (
                  <div
                    key={j}
                    style={{
                      width: "3px",
                      height: `${Math.max(6, h)}px`,
                      background: j < 12 ? "#FFFFFF" : "rgba(255,255,255,0.3)",
                      borderRadius: "2px",
                    }}
                  />
                );
              })}
            </div>
            <span
              style={{
                fontSize: "12px",
                color: "#E07A5F",
                fontFamily: "Urbanist",
                fontWeight: 600,
              }}
            >
              00:06
            </span>
          </div>
        </div>

        {/* Image card */}
        <div
          className="absolute transition-transform hover:scale-105 duration-300"
          style={{
            left: "38%",
            top: "30%",
            width: "260px",
            height: "190px",
            background: "#1C1C1C",
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "16px",
            boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, #1B2936 0%, #151C24 60%, #0F1318 100%)", // Simulated desert dusk
              borderBottom: "40px solid #1C1C1C",
            }}
          >
            {/* Simulated dune curves */}
            <div
              style={{
                position: "absolute",
                bottom: "40px",
                left: "-10%",
                right: "-10%",
                height: "60px",
                background: "#12171C",
                borderRadius: "50% 50% 0 0",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "40px",
                left: "20%",
                right: "-30%",
                height: "80px",
                background: "#0A0C10",
                borderRadius: "50% 50% 0 0",
              }}
            />
          </div>
          <span
            className="font-urbanist relative z-10"
            style={{ fontSize: "16px", color: "#D8D8D8", textAlign: "center" }}
          >
            Deserted evening
          </span>
        </div>

        {/* Tasks card */}
        <div
          className="absolute rounded-2xl transition-transform hover:scale-105 duration-300 font-urbanist"
          style={{
            left: "55%",
            top: "60%",
            width: "260px",
            background: "#1C1C1C",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
          }}
        >
          {[
            { label: "2k running" },
            { label: "3 litr water" },
            { label: "backend integration" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-3 mb-4 last:mb-0">
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid #E5B36A",
                  borderRadius: "3px",
                }}
              />
              <span style={{ fontSize: "16px", color: "#D8D8D8" }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>

        {/* Highlighted task card */}
        <div
          className="absolute transition-transform hover:scale-105 duration-300 font-urbanist"
          style={{
            left: "58%",
            top: "18%",
            width: "290px",
            background: "rgba(28, 28, 28, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(224, 122, 95, 0.5)",
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "0 0 24px rgba(224,122,95,.15)",
          }}
        >
          <p
            className="mb-4"
            style={{
              fontSize: "16px",
              color: "#EFEBDD",
              lineHeight: 1.3,
              fontWeight: 500,
            }}
          >
            I will complete the design system task today
          </p>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#E5B36A" strokeWidth="1.5" />
              <path
                d="M8 5V8.5L10 10"
                stroke="#E5B36A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{ fontSize: "12px", color: "#E5B36A", fontWeight: 500 }}
            >
              8 hours 24mins left.
            </span>
          </div>
        </div>

        {/* Doodle card */}
        <div
          className="absolute flex items-center justify-center transition-transform hover:scale-105 duration-300"
          style={{
            left: "80%",
            top: "40%",
            width: "140px",
            height: "140px",
            background: "#181818",
            borderRadius: "16px",
            boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
            transform: "rotate(4deg)",
          }}
        >
          {/* Stickman Doodle SVG */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
            <rect
              x="62"
              y="70"
              width="8"
              height="14"
              rx="2"
              fill="#FFFFFF"
              stroke="none"
            />
            {/* Music notes */}
            <path d="M10 20 Q15 15 20 20 V30" strokeWidth="2" />
            <circle cx="18" cy="30" r="3" fill="#FFFFFF" stroke="none" />
            <path d="M85 30 Q90 25 95 35 V45" strokeWidth="2" />
            <circle cx="93" cy="45" r="3" fill="#FFFFFF" stroke="none" />
          </svg>
        </div>

        {/* DRAG • MOVE • CONNECT • REFLECT */}
        <div
          className="absolute flex items-center gap-6 font-urbanist"
          style={{
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          {["DRAG", "•", "MOVE", "•", "CONNECT", "•", "REFLECT"].map((w, i) => (
            <span
              key={i}
              style={{
                fontSize: "14px",
                letterSpacing: "0.15em",
                color: w === "•" ? "rgba(224, 122, 95, 0.5)" : "#E07A5F",
                fontWeight: 600,
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
