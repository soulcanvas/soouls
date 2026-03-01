"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface NavLink {
  label: string;
  href: string;
}

interface LandingNavbarProps {
  links?: NavLink[];
}

const defaultLinks: NavLink[] = [
  { label: "Product", href: "#product" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "Sunday Review", href: "#sunday-review" },
  { label: "Waitlist", href: "#waitlist" },
];

export default function LandingNavbar({
  links = defaultLinks,
}: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Become floating after 60px
      setScrolled(currentY > 60);

      // Hide when scrolling down fast, show when scrolling up
      if (currentY > lastScrollY.current + 8 && currentY > 200) {
        setHidden(true);
      } else if (currentY < lastScrollY.current - 4) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed left-1/2 -translate-x-1/2 z-50
        transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        flex flex-row items-center
        ${hidden ? "-translate-y-32 opacity-0" : "translate-y-0 opacity-100"}
      `}
      style={{
        // Initially at y=66px and 1239px wide (matching Figma perfectly)
        // When scrolled, shrink to a floating pill
        top: scrolled ? "24px" : "66px",
        width: scrolled ? "880px" : "1239px",
        padding: scrolled ? "16px 32px" : "0px 0px",
        borderRadius: scrolled ? "40px" : "0px",
        background: scrolled ? "rgba(42, 51, 53, 0.75)" : "transparent",
        backdropFilter: scrolled ? "blur(32px) saturate(1.2)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(32px) saturate(1.2)" : "none",
        boxShadow: scrolled
          ? "0px 22px 48px 0px rgba(0, 0, 0, 0.16), 0px 88px 88px 0px rgba(0, 0, 0, 0.14)"
          : "none",
        border: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
      }}
    >
      <nav className="flex items-center justify-between w-full h-full">
        {/* Logo */}
        <div className="flex-shrink-0" style={{ width: "200px" }}>
          <span
            className="font-playfair font-bold"
            style={{
              fontFamily: "ABC Whyte Inktrap, sans-serif",
              color: "#D6C2A3",
              fontSize: scrolled ? "22px" : "28px",
              lineHeight: "1em",
              letterSpacing: "-0.035em",
              transition: "all 0.5s ease",
            }}
          >
            Soulcanvas
          </span>
        </div>

        {/* Nav Links — centered */}
        <div
          className="hidden md:flex flex-row items-center justify-center flex-1"
          style={{
            gap: scrolled ? "36px" : "48px",
            transition: "all 0.5s ease",
          }}
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-urbanist"
              style={{
                color: scrolled ? "#EFEBDD" : "#A8A8A8",
                fontSize: scrolled ? "16px" : "18px",
                lineHeight: "1.2em",
                transition: "color 0.2s, font-size 0.5s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = scrolled
                  ? "#EFEBDD"
                  : "#A8A8A8";
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Right */}
        <div
          className="flex flex-row items-center justify-end gap-[24px]"
          style={{ width: "200px" }}
        >
          <Link
            href="/sign-in"
            className="font-urbanist font-semibold"
            style={{
              color: "#E07C60",
              fontSize: scrolled ? "16px" : "18px",
              lineHeight: "1em",
              letterSpacing: "-0.035em",
              transition: "all 0.5s ease",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "#EFEBDD")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "#E07C60")
            }
          >
            Login
          </Link>

          <Link
            href="/sign-up"
            className="font-urbanist font-semibold transition-all duration-300 flex justify-center items-center"
            style={{
              backgroundColor: "#E07C60",
              color: "#222222",
              fontSize: scrolled ? "15px" : "16px",
              lineHeight: "1em",
              letterSpacing: "-0.035em",
              padding: scrolled ? "10px 18px" : "12px 20px",
              borderRadius: "12px",
              gap: "7.5px",
              transition: "all 0.5s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "#d4694e";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "#E07C60";
            }}
          >
            Start Writing
          </Link>
        </div>
      </nav>
    </header>
  );
}
