"use client";

import { motion } from "framer-motion";
import { Button } from "@synq/ui/component";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { ArrowRight, Check, RefreshCw, TrendingUp, Zap } from "lucide-react";

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const marketplaces = ["TCGPlayer", "Cardmarket", "eBay"];

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % marketplaces.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [marketplaces.length]);

  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-24 px-4 sm:px-8 flex flex-col justify-center min-h-screen bg-transparent">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, staggerChildren: 0.1, delayChildren: 0.2 }}
        className="text-center max-w-6xl mx-auto mb-8 sm:mb-16"
      >
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1] }}
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light tracking-[-0.02em] text-foreground mb-6 sm:mb-8 leading-[1.1] max-w-5xl mx-auto px-4"
        >
          <span className="block mb-2">Sync your TCG singles across</span>
          <span className="block text-primary font-normal">
            <motion.span
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="inline-block"
            >
              {marketplaces[currentIndex]}
            </motion.span>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1], delay: 0.1 }}
          className="text-lg sm:text-xl font-light text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4"
        >
          Manage inventory and sync listings for TCG singles in one place. No
          more manual updates across platforms.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1], delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 px-4"
        >
          <Button asChild size="lg" className="text-sm font-medium">
            <a href="#contact" className="inline-flex items-center">
              Start for Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-sm font-medium"
          >
            <a href="#features">See How It Works</a>
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1], delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-16"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            <span>Free 7-day trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Dashboard Screenshot with Floating Elements */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1], delay: 0.4 }}
        className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 relative"
      >
        <div className="relative">
          <Image
            src={
              mounted && resolvedTheme === "dark"
                ? "/brand/synq-eyecatcher-dark.png"
                : "/brand/synq-eyecatcher-light.png"
            }
            alt="Synq Dashboard - Marketplace Sync Overview"
            width={1200}
            height={800}
            className="w-full h-auto shadow-2xl rounded-lg border border-border"
            priority
          />

          {/* Floating Stat Card - Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="hidden lg:block absolute -left-6 xl:-left-12 top-1/4 bg-card border border-border rounded-lg p-4 shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Sync Speed
              </span>
            </div>
            <div className="text-2xl font-semibold text-foreground">2 min</div>
            <div className="text-xs text-muted-foreground">avg sync time</div>
          </motion.div>

          {/* Floating Stat Card - Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="hidden lg:block absolute -right-6 xl:-right-12 bottom-1/4 bg-card border border-border rounded-lg p-4 shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Active Sellers
              </span>
            </div>
            <div className="text-2xl font-semibold text-foreground">500+</div>
            <div className="text-xs text-muted-foreground">and growing</div>
          </motion.div>

          {/* Floating Stat Card - Top Center (Mobile Friendly) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="hidden md:block absolute -top-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-4 py-2 shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Auto-Sync Enabled
                </div>
                <div className="text-sm font-semibold text-foreground">
                  3 Marketplaces
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Social Proof / Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1], delay: 0.6 }}
        className="text-center mt-16 sm:mt-20"
      >
        <p className="text-xs sm:text-sm font-light tracking-wide text-muted-foreground uppercase mb-8">
          Trusted by sellers managing thousands of listings
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-semibold text-foreground mb-1">
              15+ hrs
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Saved per week
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-semibold text-foreground mb-1">
              99.9%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Sync accuracy
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-semibold text-foreground mb-1">
              500+
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Active sellers
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
