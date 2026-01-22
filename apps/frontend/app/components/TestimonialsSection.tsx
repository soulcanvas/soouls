'use client';

import { Container } from '@soulcanvas/ui-kit/Container';
import { Section } from '@soulcanvas/ui-kit/Section';
import { Heading, Text } from '@soulcanvas/ui-kit/Typography';
import { motion, useReducedMotion } from 'framer-motion';

const testimonials = [
  {
    quote:
      "SoulCanvas has transformed my daily routine. The AI insights helped me understand patterns I never noticed before. It's like having a wise friend who truly listens.",
    author: 'Sarah M.',
    role: 'Mindfulness Practitioner',
    avatar: '👩‍🦰',
  },
  {
    quote:
      "I've tried many journaling apps, but none compare to the beautiful experience of SoulCanvas. The 3D visualizations make reflecting on my journey magical.",
    author: 'Michael T.',
    role: 'Creative Director',
    avatar: '👨‍🎨',
  },
  {
    quote:
      "The privacy features gave me the confidence to be completely honest in my entries. It's become my safe space for self-discovery and healing.",
    author: 'Emma L.',
    role: 'Therapist',
    avatar: '👩‍⚕️',
  },
];

/**
 * Testimonials Section - User quotes with avatars.
 * Features card layout with hover effects.
 */
export function TestimonialsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Section id="testimonials" background="darker" padding="xl" animate={false}>
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Text variant="small" className="uppercase tracking-widest text-amber-400 mb-4">
              What Our Users Say
            </Text>
            <Heading as="h2" size="2xl" gradient>
              Stories of Transformation
            </Heading>
            <Text variant="lead" className="mt-4 max-w-2xl mx-auto">
              Join thousands who have found their inner peace through mindful journaling.
            </Text>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 hover:border-amber-400/30 transition-colors duration-300"
              >
                {/* Quote */}
                <div className="mb-6">
                  <svg
                    className="w-8 h-8 text-amber-400/50 mb-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-slate-300 leading-relaxed italic">"{testimonial.quote}"</p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="text-3xl" aria-hidden="true">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
