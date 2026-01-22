'use client';

import { Card } from '@soulcanvas/ui-kit/Card';
import { Container } from '@soulcanvas/ui-kit/Container';
import { Section } from '@soulcanvas/ui-kit/Section';
import { Heading, Text } from '@soulcanvas/ui-kit/Typography';
import { motion, useReducedMotion } from 'framer-motion';

const features = [
  {
    icon: '✨',
    title: 'Daily Journaling',
    description:
      'Express your thoughts and feelings through beautiful, guided journaling prompts designed to unlock your inner wisdom.',
  },
  {
    icon: '🎨',
    title: 'Mood Visualization',
    description:
      'Watch your emotional journey come to life through stunning 3D visualizations and interactive mood tracking.',
  },
  {
    icon: '🔮',
    title: 'AI Insights',
    description:
      'Discover patterns and receive personalized insights powered by advanced AI that understands your unique journey.',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    description:
      'Track your growth over time with comprehensive analytics and celebrate your personal milestones.',
  },
  {
    icon: '🌙',
    title: 'Mindful Prompts',
    description:
      'Receive daily prompts crafted to inspire reflection, gratitude, and self-discovery on your path to wellness.',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    description:
      'Your thoughts are yours alone. End-to-end encryption ensures your journal remains completely private.',
  },
];

/**
 * Features Section - Grid of key features with icons and descriptions.
 * Uses staggered animations and responsive grid layout.
 */
export function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <Section id="features" background="darker" padding="xl" animate={false}>
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
              Why Choose SoulCanvas
            </Text>
            <Heading as="h2" size="2xl" gradient>
              Features That Inspire
            </Heading>
            <Text variant="lead" className="mt-4 max-w-2xl mx-auto">
              Discover the tools designed to nurture your mind, track your growth, and illuminate
              your path to inner peace.
            </Text>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={shouldReduceMotion ? {} : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={shouldReduceMotion ? {} : itemVariants}>
              <Card
                variant="glass"
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
