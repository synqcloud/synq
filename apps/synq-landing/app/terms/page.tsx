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

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-8 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-[-0.01em] text-foreground mb-4">
                Terms of Service
              </h1>
              <p className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-section-heading">Agreement to Terms</h2>
                <p className="text-body">
                  By accessing and using Synq's inventory management platform
                  for card game stores, you agree to be bound by these Terms of
                  Service. If you disagree with any part of these terms, you may
                  not access our service.
                </p>
              </section>

              <section>
                <h2 className="text-section-heading">Description of Service</h2>
                <p className="text-body">
                  Synq provides an inventory management platform specifically
                  designed for card game stores. Our service includes inventory
                  tracking, sales management, market integration, and analytics
                  tools to help you manage your business effectively.
                </p>
              </section>

              <section>
                <h2 className="text-section-heading">User Accounts</h2>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p className="leading-relaxed">
                    When you create an account with us, you must provide
                    accurate, complete, and current information. You are
                    responsible for safeguarding your account credentials and
                    for all activities that occur under your account.
                  </p>
                  <p className="leading-relaxed">
                    You agree to notify us immediately of any unauthorized use
                    of your account or any other breach of security.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-section-heading">Acceptable Use</h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="leading-relaxed">
                    • Use the service only for lawful purposes
                  </p>
                  <p className="leading-relaxed">
                    • Provide accurate and complete information
                  </p>
                  <p className="leading-relaxed">
                    • Maintain the security of your account
                  </p>
                  <p className="leading-relaxed">
                    • Not attempt to gain unauthorized access to our systems
                  </p>
                  <p className="leading-relaxed">
                    • Not interfere with or disrupt the service
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-section-heading">Intellectual Property</h2>
                <p className="text-body">
                  The service and its original content, features, and
                  functionality are owned by Synq and are protected by
                  international copyright, trademark, patent, trade secret, and
                  other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-section-heading">Data and Privacy</h2>
                <p className="text-body">
                  Your use of our service is also governed by our Privacy
                  Policy. By using our service, you consent to the collection
                  and use of information as detailed in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-section-heading">Service Availability</h2>
                <p className="text-body">
                  We strive to provide a reliable service but cannot guarantee
                  uninterrupted access. We may need to perform maintenance or
                  updates that temporarily affect service availability.
                </p>
              </section>

              <section>
                <h2 className="text-section-heading">
                  Limitation of Liability
                </h2>
                <p className="text-body">
                  In no event shall Synq be liable for any indirect, incidental,
                  special, consequential, or punitive damages, including without
                  limitation, loss of profits, data, use, goodwill, or other
                  intangible losses, resulting from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-section-heading">Termination</h2>
                <p className="text-body">
                  We may terminate or suspend your account and access to the
                  service immediately, without prior notice, for any reason,
                  including breach of these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-section-heading">Changes to Terms</h2>
                <p className="text-body">
                  We reserve the right to modify these terms at any time. We
                  will notify users of any material changes by posting the new
                  terms on this page.
                </p>
              </section>

              <section>
                <h2 className="text-section-heading">Contact Information</h2>
                <p className="text-body">
                  If you have any questions about these Terms of Service, please
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
