import Link from "next/link";
import { motion } from "framer-motion";

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// Section wrapper for scroll-triggered animation
function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.25, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StoryContent() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="relative mx-auto text-center"
    >
      {/* Problem Section */}
      <Section className="max-w-4xl mx-auto space-y-12 mb-16 text-left">
        <div id="problem" className="space-y-4">
          <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground mt-6">
            The Problem
          </h2>
          <div className="space-y-4 text-base font-light tracking-[-0.01em] text-muted-foreground">
            <p>
              The card market remains large and active, with millions of
              transactions each month on TCGPlayer (US) and Cardmarket (Europe).
              This market is heavily supported by local shops who often rely on
              spreadsheets, manual processes. Many generic inventory systems
              don't adequately address unique card shop needs.
            </p>
          </div>
        </div>

        {/* Solution Section */}
        <Section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground mt-8">
            Our approach
          </h2>
          <div className="space-y-4 text-base font-light tracking-[-0.01em] text-muted-foreground">
            <p>
              This software aims to make business operations easier and more
              efficient. No more adapting generic tools. Synq is designed
              specifically for how card game sellers operate.
            </p>
            <p>
              Built with direct input from store owners and sellers. We're
              learning on the go and adapting based on real feedback. Whether
              you run a shop, sell at events, or manage a collection from home,
              we want to make your life easier.
            </p>
            <p>We want to hear about your experience.</p>
            <p className="text-sm text-muted-foreground italic underline">
              <Link href="#contact">Share your setup with us here</Link>
            </p>
          </div>
        </Section>

        {/* Open Source Section */}
        <Section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground mt-8">
            Open Source
          </h2>
          <div className="space-y-4 text-base font-light tracking-[-0.01em] text-muted-foreground">
            <p>
              Synq is open source because you should own your data. If you have
              developer skills, you can self-host on your own servers and keep
              complete control over your inventory and infrastructure.
            </p>
            <p className="text-sm text-muted-foreground italic underline">
              <Link
                href="https://github.com/synqcloud/synq"
                target="_blank"
                rel="noopener noreferrer"
              >
                Check out the code on GitHub
              </Link>
            </p>
          </div>
        </Section>

        {/* Soft visual separator before form headline */}
        <div className="flex justify-center items-center my-6">
          <div className="h-px w-16 bg-border rounded-full" />
        </div>
      </Section>
    </motion.div>
  );
}
