"use client";

import { Nav } from "@/components/nav";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.25, 0, 1] },
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-8 lg:px-12">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-[-0.01em] text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground mb-4">
                  Introduction
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Synq ("we," "our," or "us") is committed to protecting your
                  privacy. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our
                  inventory management platform for card game stores.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground mb-4">
                  Information We Collect
                </h2>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Personal Information
                    </h3>
                    <p className="leading-relaxed">
                      We may collect personal information such as your name,
                      email address, store information, and business details
                      when you sign up for our service or contact us.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Usage Information
                    </h3>
                    <p className="leading-relaxed">
                      We collect information about how you use our platform,
                      including inventory data, sales information, and analytics
                      to improve our service.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Technical Information
                    </h3>
                    <p className="leading-relaxed">
                      We may collect technical information such as IP addresses,
                      browser type, and device information for security and
                      service optimization.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground mb-4">
                  How We Use Your Information
                </h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="leading-relaxed">
                    • To provide and maintain our inventory management service
                  </p>
                  <p className="leading-relaxed">
                    • To communicate with you about our service
                  </p>
                  <p className="leading-relaxed">
                    • To improve and develop our platform
                  </p>
                  <p className="leading-relaxed">
                    • To ensure security and prevent fraud
                  </p>
                  <p className="leading-relaxed">
                    • To comply with legal obligations
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground mb-4">
                  Data Security
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We implement appropriate security measures to protect your
                  personal information against unauthorized access, alteration,
                  disclosure, or destruction. However, no method of transmission
                  over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground mb-4">
                  Data Sharing
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties without your consent, except as
                  described in this policy or as required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground mb-4">
                  Your Rights
                </h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="leading-relaxed">
                    • Access your personal information
                  </p>
                  <p className="leading-relaxed">
                    • Correct inaccurate information
                  </p>
                  <p className="leading-relaxed">
                    • Request deletion of your data
                  </p>
                  <p className="leading-relaxed">
                    • Opt-out of marketing communications
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground mb-4">
                  Contact Us
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please
                  contact us at{" "}
                  <a
                    href="mailto:iamtelmo@proton.me"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    iamtelmo@proton.me
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
