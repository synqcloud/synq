"use client";

import { motion } from "framer-motion";
import {
  Check,
  RefreshCw,
  DollarSign,
  Package,
  Shield,
  Zap,
  BarChart3,
  Bell,
  Users,
  Lock,
  Palette,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@synq/ui/component";

export function Showcase() {
  return (
    <div className="bg-background">
      {/* Social Proof / Trust Badges */}
      <section className="py-16 px-4 sm:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-sm font-light text-muted-foreground mb-8">
              Trusted by leading TCG sellers
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-muted" />
                <span className="text-sm font-medium text-foreground">
                  TCGPlayer
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-muted" />
                <span className="text-sm font-medium text-foreground">
                  Cardmarket
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-muted" />
                <span className="text-sm font-medium text-foreground">
                  eBay
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Value Prop - "Synq comes in three flavors" */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-[-0.02em] text-foreground mb-4">
              Synq comes in three flavors.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Flavor 1 - Web App */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-orange-500/5 via-pink-500/5 to-orange-500/5 p-8 hover:shadow-lg transition-shadow"
            >
              <div className="relative z-10">
                {/* Screenshot placeholder */}
                <div className="mb-6 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Package className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-xs text-muted-foreground">
                        Dashboard Interface
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-medium text-foreground mb-3">
                  Web App
                </h3>
                <p className="text-base font-light text-muted-foreground mb-6 leading-relaxed">
                  Sync inventory across marketplaces from your browser. Manage
                  listings, update prices, and track sales in real-time.
                </p>
                <Button variant="default" size="sm">
                  Sign up to try
                </Button>
              </div>
            </motion.div>

            {/* Flavor 2 - API Integration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 p-8 hover:shadow-lg transition-shadow"
            >
              <div className="relative z-10">
                {/* Screenshot placeholder */}
                <div className="mb-6 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                    <div className="text-center p-8">
                      <RefreshCw className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-xs text-muted-foreground">
                        API Integration
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-medium text-foreground mb-3">
                  API Access
                </h3>
                <p className="text-base font-light text-muted-foreground mb-6 leading-relaxed">
                  Integrate Synq into your existing tools and workflows. Build
                  custom solutions with our developer-friendly API.
                </p>
                <Button variant="default" size="sm">
                  Sign up to try
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                quote:
                  "Synq has completely transformed how I manage my inventory across TCGPlayer and eBay. What used to take hours now takes minutes.",
                author: "Sarah Chen",
                role: "TCG Seller",
                initial: "S",
              },
              {
                quote:
                  "The auto-sync feature is a game changer. I never have to worry about overselling or manually updating quantities anymore.",
                author: "Mike Rodriguez",
                role: "Card Shop Owner",
                initial: "M",
              },
              {
                quote:
                  "Finally, a tool that understands the TCG market. The pricing suggestions based on market data have increased my profits significantly.",
                author: "Alex Kim",
                role: "Individual Seller",
                initial: "A",
              },
              {
                quote:
                  "Integration was seamless. Within 30 minutes I had all my marketplaces connected and syncing perfectly.",
                author: "Jamie Taylor",
                role: "Online Retailer",
                initial: "J",
              },
              {
                quote:
                  "The time I save with Synq allows me to focus on sourcing better inventory instead of managing spreadsheets.",
                author: "Chris Martinez",
                role: "Local Game Store",
                initial: "C",
              },
              {
                quote:
                  "Best investment for my card business. The ROI paid for itself in the first month from time savings alone.",
                author: "Dana Wilson",
                role: "TCG Dealer",
                initial: "D",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-lg border border-border bg-card"
              >
                <p className="text-sm font-light text-foreground mb-4 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">
                      {testimonial.initial}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* "Built for sellers who want to ship better products, faster" */}
      <section className="py-24 px-4 sm:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-light tracking-[-0.02em] text-foreground mb-4">
              Built for sellers who want to
              <br />
              ship better products, faster.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: RefreshCw,
                title: "Auto-Sync",
                description:
                  "Sync inventory changes across all marketplaces automatically in real-time.",
              },
              {
                icon: Lock,
                title: "Secure Authentication",
                description:
                  "Enterprise-grade security with encrypted API connections to protect your accounts.",
              },
              {
                icon: Globe,
                title: "Multi-Platform",
                description:
                  "Support for TCGPlayer, Cardmarket, eBay and more marketplaces coming soon.",
              },
              {
                icon: Bell,
                title: "Smart Notifications",
                description:
                  "Get alerts for low stock, price changes, and sync status updates.",
              },
              {
                icon: Palette,
                title: "Custom Themes",
                description:
                  "Personalize your dashboard with light and dark themes that match your workflow.",
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description:
                  "Track sales performance, inventory turnover, and profit margins across platforms.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-lg border border-border bg-card"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Spotlight with Image */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-lg border border-border overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10">
                <div className="aspect-[4/3] flex items-center justify-center p-8">
                  <div className="text-center">
                    <DollarSign className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Pricing Dashboard
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-light tracking-[-0.02em] text-foreground mb-4">
                Smart Pricing
              </h2>
              <p className="text-lg font-light text-muted-foreground mb-6 leading-relaxed">
                Update prices across all your marketplaces with one click. Our
                algorithm analyzes market data to suggest optimal pricing
                strategies.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Bulk price updates across platforms",
                  "Market-based pricing suggestions",
                  "Competitive analysis tools",
                  "Automated repricing rules",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-base font-light text-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Button variant="default" size="lg">
                Learn more about pricing
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reversed Feature Spotlight */}
      <section className="py-24 px-4 sm:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl sm:text-4xl font-light tracking-[-0.02em] text-foreground mb-4">
                Inventory Insights
              </h2>
              <p className="text-lg font-light text-muted-foreground mb-6 leading-relaxed">
                Get a complete view of your inventory performance. Track which
                cards are selling, identify slow movers, and optimize your stock
                levels.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Real-time inventory analytics",
                  "Sales velocity tracking",
                  "Profitability reports",
                  "Stock level recommendations",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-base font-light text-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Button variant="default" size="lg">
                See analytics features
              </Button>
            </motion.div>

            {/* Right side - Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative order-1 lg:order-2"
            >
              <div className="rounded-lg border border-border overflow-hidden bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10">
                <div className="aspect-[4/3] flex items-center justify-center p-8">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Analytics Dashboard
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
