import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "success" | "warning";
  className?: string;
}

const styles = {
  default: "text-gray-500",
  outline: "bg-white/5 text-gray-400 border border-white/5 px-2 py-1 rounded-md",
  success: "text-green-400",
  warning: "text-yellow-400",
};

/**
 * Label / Status Badge
 */
export const Badge = ({
  children,
  variant = "default",
  className = "",
}: BadgeProps) => {
  return (
    <div className="text-center">
      <span
        className={`
          text-[10px]
          font-bold
          tracking-[0.3em]
          uppercase
          ${styles[variant]}
          ${className}
        `}
      >
        {children}
      </span>
    </div>
  );
};