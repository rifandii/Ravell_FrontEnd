import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const, // Custom easeOutQuart curve
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
      }
    : pageVariants;

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full flex flex-col flex-grow"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
