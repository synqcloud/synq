import { HTMLMotionProps, MotionProps } from "framer-motion";

// Make a custom type that correctly extends HTMLMotionProps
export type MotionDivProps = HTMLMotionProps<"div"> &
  MotionProps & {
    className?: string;
  };

// Animation variants - more subtle
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};
