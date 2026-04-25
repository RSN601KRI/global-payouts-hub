import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
  once?: boolean;
}

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(
  ({ children, delay = 0, y = 20, once = true, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
Reveal.displayName = "Reveal";

interface StaggerProps extends HTMLMotionProps<"div"> {
  delay?: number;
  staggerDelay?: number;
}

export const StaggerGroup = forwardRef<HTMLDivElement, StaggerProps>(
  ({ children, delay = 0.1, staggerDelay = 0.08, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay, delayChildren: delay } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
StaggerGroup.displayName = "StaggerGroup";

export const StaggerItem = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={fadeUp} {...props}>
      {children}
    </motion.div>
  ),
);
StaggerItem.displayName = "StaggerItem";
