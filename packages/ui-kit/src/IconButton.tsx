import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface IconButtonProps extends HTMLMotionProps<"button"> {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  size?: number;
  variant?: "primary" | "ghost" | "danger";
}

const variantStyles = {
  primary: "text-[#e67e65] bg-[#e67e65]/10",
  ghost: "text-gray-500 hover:text-white hover:bg-white/5",
  danger: "text-red-400 hover:bg-red-500/10",
};

/**
 * Reusable Icon Button
 */
export const IconButton = React.memo(
  ({
    icon: Icon,
    label,
    active = false,
    size = 24,
    variant = "ghost",
    className = "",
    ...props
  }: IconButtonProps) => {
    return (
      <motion.button
        aria-label={label}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`
          p-2 rounded-xl transition-colors flex items-center justify-center
          ${active ? variantStyles.primary : variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        <Icon size={size} strokeWidth={1.5} />
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";