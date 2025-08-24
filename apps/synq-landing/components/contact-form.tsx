"use client";

import { useState } from "react";
import { Button } from "@synq/ui/component";
import { Input, Textarea } from "@synq/ui/component";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.25, 0, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [storeType, setStoreType] = useState("");
  const [role, setRole] = useState("");
  const [frustration, setFrustration] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [wantsUpdates, setWantsUpdates] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !storeType) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          email,
          storeType,
          role,
          frustration,
          wantsUpdates,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6" role="status" aria-live="polite">
        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/20">
          <CheckCircle className="w-8 h-8 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-3xl font-light text-foreground mb-4">
            Thanks for sharing!
          </h2>
          <p className="text-muted-foreground mb-4">
            We'll be in touch soon to keep the conversation going.
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-foreground">
            <p className="mb-2">
              📧 <strong>Check your email</strong> - you should receive a
              personal message from me shortly.
            </p>
            <p>
              If you don't see it in your inbox, check your{" "}
              <strong>spam or junk folder</strong>.<br />
              Still nothing? Feel free to reach out directly:
              <a
                href="mailto:iamtelmo@proton.me"
                className="text-primary hover:text-primary/80 font-medium ml-1"
              >
                iamtelmo@proton.me
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="space-y-8"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-[-0.01em] text-foreground mb-6 mt-0">
          Talk to us
        </h2>
        <p className="text-sm font-light tracking-[-0.01em] text-muted-foreground max-w-lg mx-auto mb-8">
          We're building inventory tools for card game stores. No commitment. No
          pressure. If you've got five minutes, tell us what's been frustrating.
        </p>
      </motion.div>

      <motion.form
        id="contact-form"
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto"
        role="form"
        aria-label="Contact us form"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="space-y-4 text-left" variants={staggerContainer}>
          {/* First Name */}
          <motion.div variants={fadeInUp}>
            <label
              htmlFor="firstName-input"
              className="block text-sm font-medium text-foreground mb-2"
            >
              First Name
            </label>
            <Input
              id="firstName-input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
              disabled={isLoading}
            />
          </motion.div>

          {/* Email */}
          <motion.div variants={fadeInUp}>
            <label
              htmlFor="email-input"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Email
            </label>
            <Input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={isLoading}
              aria-describedby={error ? "form-error" : undefined}
              aria-invalid={error ? "true" : "false"}
            />
          </motion.div>

          {/* Store Type */}
          <motion.div variants={fadeInUp}>
            <label
              htmlFor="storeType-select"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Store Type
            </label>
            <select
              id="storeType-select"
              value={storeType}
              onChange={(e) => setStoreType(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring hover:border-input/80 disabled:opacity-50 transition-all duration-200"
            >
              <option value="">Select your store type</option>
              <option value="local-game-store">Local game store</option>
              <option value="online-only">Online-only</option>
              <option value="part-time-seller">Part-time/casual seller</option>
              <option value="events-market-seller">
                Event/convention seller
              </option>
              <option value="other">Other</option>
            </select>
          </motion.div>

          {/* Role or Title (Optional) */}
          <motion.div variants={fadeInUp}>
            <label
              htmlFor="role-input"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Role or Title{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              id="role-input"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Owner, Manager, Solo seller, etc."
              disabled={isLoading}
            />
          </motion.div>

          {/* Biggest Frustration (Optional) */}
          <motion.div variants={fadeInUp}>
            <label
              htmlFor="frustration-input"
              className="block text-sm font-medium text-foreground mb-2"
            >
              What's your biggest frustration today?{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Textarea
              id="frustration-input"
              value={frustration}
              onChange={(e) => setFrustration(e.target.value)}
              placeholder="Share your biggest pain point..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring hover:border-input/80 disabled:opacity-50 transition-all duration-200 min-h-[90px]"
            />
          </motion.div>

          {/* Updates Opt-in */}
          <motion.div variants={fadeInUp} className="flex items-center gap-2">
            <input
              id="updates-checkbox"
              type="checkbox"
              checked={wantsUpdates}
              onChange={(e) => setWantsUpdates(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-primary border-input rounded focus:ring-ring"
            />
            <label
              htmlFor="updates-checkbox"
              className="text-sm text-foreground select-none"
            >
              I'd like early access updates
            </label>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={fadeInUp}>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !firstName || !email || !storeType}
              aria-describedby={isLoading ? "loading-status" : undefined}
              className="w-full text-[10px] uppercase tracking-[0.2em] py-3 h-auto rounded-lg font-medium disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? "Sending..." : "Send it over"}
            </Button>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              id="form-error"
              role="alert"
              aria-live="polite"
              className="text-sm text-destructive mt-2"
              variants={fadeInUp}
            >
              {error}
            </motion.div>
          )}

          {/* Loading status for screen readers */}
          {isLoading && (
            <motion.div
              id="loading-status"
              className="sr-only"
              aria-live="polite"
              variants={fadeInUp}
            >
              Processing your request, please wait...
            </motion.div>
          )}
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
