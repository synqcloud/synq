"use client";

import { motion } from "framer-motion";
import { Button } from "@synq/ui/component";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const audiences = ["local game stores", "individual sellers", "card shops"];

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % audiences.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [audiences.length]);

  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-24 px-4 sm:px-8 flex flex-col justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, staggerChildren: 0.1, delayChildren: 0.2 }}
        className="text-center max-w-6xl mx-auto mb-8 sm:mb-16"
      >

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1] }}
          className="text-3xl sm:text-2xl lg:text-3xl xl:text-4xl font-light tracking-[-0.01em] text-foreground mb-8 sm:mb-12 leading-[1.2] max-w-5xl mx-auto px-4"
        >
          Inventory software built for{" "}
          <span className="inline-block min-w-[180px] sm:min-w-[200px] text-primary">
            <motion.span
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="inline-block"
            >
              {audiences[currentIndex]}
            </motion.span>
          </span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1], delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4"
        >
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-center text-[10px] uppercase tracking-[0.2em]"
          >
            <a href="#showcase">See Features</a>
          </Button>
          <Button
            asChild
            size="sm"
            className="text-center text-[10px] uppercase tracking-[0.2em]"
          >
            <a href="#contact-form">Contact Us</a>
          </Button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1], delay: 0.2 }}
          className="text-sm text-muted-foreground/80 mb-16"
        >
          Get in touch to learn more about how Synq can help your business.
        </motion.p>
      </motion.div>

      {/* Dashboard Screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1], delay: 0.3 }}
        className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12"
      >
        <div className="relative">
          <motion.img
            src={
              mounted && resolvedTheme === "dark"
                ? "/brand/synq-eyecatcher-dark.png"
                : "/brand/synq-eyecatcher-art.png"
            }
            alt="Synq Dashboard - Portfolio Overview"
            className="w-full h-auto"
            style={{
              minHeight: "300px",
              maxHeight: "600px",
              objectFit: "contain",
              maxWidth: "100%",
              border: "none",
              outline: "none",
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
