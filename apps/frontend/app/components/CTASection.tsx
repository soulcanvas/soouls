'use client';

import { Button } from '@soulcanvas/ui-kit/Button';
import { Container } from '@soulcanvas/ui-kit/Container';
import { Section } from '@soulcanvas/ui-kit/Section';
import { Heading, Text } from '@soulcanvas/ui-kit/Typography';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

/**
 * CTA Section - Final call-to-action with gradient background.
 * Encourages users to start their journey.
 */
export function CTASection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Section id="cta" background="transparent" padding="xl" animate={false}>
      <Container size="lg">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-teal-600/20 border border-amber-400/20 p-8 md:p-12 lg:p-16"
        >
          {/* Background Glow */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-transparent to-teal-400/5"
            aria-hidden="true"
          />

          <div className="relative z-10 text-center">
            <Heading as="h2" size="xl" className="mb-4">
              Ready to Begin Your Journey?
            </Heading>
            <Text variant="lead" className="mb-8 max-w-2xl mx-auto">
              Join thousands of mindful souls who are discovering themselves through the art of
              journaling. Your oasis awaits.
            </Text>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="min-w-[200px]">
                  Start Free Today
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost" size="lg" className="min-w-[200px]">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
