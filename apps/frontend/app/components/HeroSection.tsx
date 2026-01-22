'use client';

import { Button } from '@soulcanvas/ui-kit/Button';
import { Container } from '@soulcanvas/ui-kit/Container';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Hero Section - Full-screen hero with background image and CTA.
 * Uses parallax effect and smooth animations.
 */
export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const reducedVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const variants = shouldReduceMotion ? reducedVariants : itemVariants;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/50 to-slate-900"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <Container size="lg" className="relative z-10 text-center py-20">
        <motion.div
          variants={shouldReduceMotion ? reducedVariants : containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6 md:gap-8"
        >
          {/* Logo */}
          <motion.div variants={variants} className="mb-4">
            <svg
              className="w-16 h-16 md:w-20 md:h-20 text-amber-100/80"
              viewBox="0 0 100 100"
              fill="currentColor"
              aria-hidden="true"
            >
              {/* Tree of Life Logo */}
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
              />
              <path
                d="M50 90 L50 50 M50 50 Q30 40 25 25 M50 50 Q70 40 75 25 M50 50 Q35 35 30 15 M50 50 Q65 35 70 15 M50 50 Q45 30 50 10 M50 50 Q55 30 50 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <ellipse
                cx="50"
                cy="25"
                rx="30"
                ry="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.5"
              />
            </svg>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={variants}
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-wide text-white text-pretty"
            style={{ fontFamily: 'serif', letterSpacing: '0.1em' }}
          >
            SOUL CANVAS
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={variants}
            className="text-xl md:text-2xl lg:text-3xl text-amber-100/90 italic font-light"
            style={{ fontFamily: 'serif' }}
          >
            Find Your Oasis Within
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={variants} className="mt-4 md:mt-8">
            <Link href="/sign-up">
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-4 text-lg uppercase tracking-widest border-amber-100/50 text-amber-100 hover:bg-amber-100/10 hover:border-amber-100"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </Container>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={shouldReduceMotion ? {} : { y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      >
        <svg
          className="w-6 h-6 text-amber-100/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </section>
  );
}
