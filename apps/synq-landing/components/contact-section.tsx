"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ContactForm } from "./contact-form";

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.25, 0, 1] },
  },
};

export function ContactSection() {
  return (
    <motion.div
      className="bg-muted/30 py-16"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-4xl mx-auto text-center px-8 lg:px-12">
        <motion.div className="mb-8" variants={fadeInUp}>
          <Image
            src="/brand/synq-icon.png"
            alt="Synq Logo"
            width={32}
            height={32}
            className="h-8 w-auto mx-auto opacity-80"
          />
        </motion.div>
        <ContactForm />
      </div>
    </motion.div>
  );
}
