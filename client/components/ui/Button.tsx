import React from 'react';
import { cn } from '../../utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

// Combining framer motion props with standard button props
type CombinedProps = ButtonProps & HTMLMotionProps<"button">;

export const Button: React.FC<CombinedProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-zinc-50 text-zinc-900 hover:bg-zinc-200 shadow-sm",
    secondary: "bg-zinc-800 text-zinc-50 hover:bg-zinc-700 shadow-sm border border-zinc-700",
    outline: "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-50",
    ghost: "hover:bg-zinc-800 text-zinc-50",
    destructive: "bg-red-900/50 text-red-200 hover:bg-red-900/70 border border-red-900"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-8 text-base",
    icon: "h-9 w-9"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};
