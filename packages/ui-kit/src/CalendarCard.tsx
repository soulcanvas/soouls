import React from "react";
import { motion } from "framer-motion";

interface CalendarCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "compact";
}

const variantStyles = {
  default: "p-10",
  compact: "p-6",
};

/**
 * Glassmorphism Calendar Container
 */
export const CalendarCard = ({
  children,
  className = "",
  variant = "default",
}: CalendarCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        w-full max-w-4xl
        bg-[#121212]/90
        backdrop-blur-3xl
        border border-white/10
        rounded-[40px]
        shadow-2xl
        relative z-10
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};