"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@synq/ui/component";

export function EarlyAccessSection() {
  const features = [
    "7-day free trial of the current development version",
    "Explore experimental features before public release",
    "Directly influence Sync's evolution with your feedback",
    "Get a sneak peek at upcoming improvements",
    "Optionally support the project early",
  ];

  return (
    <motion.div
      className="bg-background py-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.25, 0, 1] }}
    >
      <div className="max-w-4xl mx-auto px-8 lg:px-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1] }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-[-0.01em] text-foreground mb-6">
            Step Inside Sync
          </h2>
          <p className="text-base font-light tracking-[-0.01em] text-muted-foreground max-w-2xl mx-auto">
            Try Sync’s current development state for 7 days. Explore
            experimental features, share feedback, and help shape the future of
            the platform.
          </p>
        </motion.div>

        {/* Experimental Trial Card */}
        <motion.div
          className="relative border border-border rounded-lg bg-card/50 shadow-sm p-10 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1] }}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-medium">
              EXPERIMENTAL
            </span>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-xl font-light tracking-[-0.01em] text-foreground mb-2">
              7-Day Trial
            </h3>
            <p className="text-sm font-light tracking-[-0.01em] text-muted-foreground mb-4">
              Explore, test, and share your insights.
            </p>
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm font-light tracking-[-0.01em] text-foreground">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <Button
            asChild
            className="w-full text-xs uppercase tracking-[0.2em]"
            size="sm"
          >
            <a
              href="https://app.trysynq.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Trial
            </a>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
