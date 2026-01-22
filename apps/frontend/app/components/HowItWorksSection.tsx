'use client';

import { Container } from '@soulcanvas/ui-kit/Container';
import { Section } from '@soulcanvas/ui-kit/Section';
import { Heading, Text } from '@soulcanvas/ui-kit/Typography';
import { motion, useReducedMotion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Create Your Space',
    description:
      'Sign up and personalize your journaling experience. Set your intentions and create a sacred space for self-reflection.',
  },
  {
    number: '02',
    title: 'Write & Reflect',
    description:
      'Express yourself freely with guided prompts or freeform entries. Let your thoughts flow without judgment.',
  },
  {
    number: '03',
    title: 'Discover Patterns',
    description:
      'AI-powered insights reveal patterns in your emotions and thoughts, helping you understand yourself deeper.',
  },
  {
    number: '04',
    title: 'Grow & Transform',
    description:
      'Track your progress, celebrate milestones, and witness your personal transformation over time.',
  },
];

/**
 * How It Works Section - Step-by-step guide with numbered cards.
 * Features timeline-style layout with connecting lines.
 */
export function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Section id="how-it-works" background="gradient" padding="xl" animate={false}>
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Text variant="small" className="uppercase tracking-widest text-amber-400 mb-4">
              Your Journey
            </Text>
            <Heading as="h2" size="2xl" gradient>
              How It Works
            </Heading>
            <Text variant="lead" className="mt-4 max-w-2xl mx-auto">
              Begin your transformative journey in four simple steps.
            </Text>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent -translate-y-1/2"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 h-full hover:border-amber-400/30 transition-colors duration-300">
                  {/* Step Number */}
                  <div className="relative z-10 mb-6">
                    <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-3 text-pretty">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{step.description}</p>
                </div>

                {/* Connecting dot (Desktop) */}
                <div
                  className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 z-20"
                  style={{ top: '-8px' }}
                  aria-hidden="true"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
