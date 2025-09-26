"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@synq/ui/component";

export function PricingSection() {
  const plans = [
    {
      name: "Shop",
      price: "-",
      period: "",
      description: "For established shops",
      features: [
        "Unlimited SKUs per month",
        "Multi-user access",
        "Advanced integrations",
        "Custom reportings",
        "Dedicated support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      price: "-",
      period: "",
      description: "For growing card shops",
      features: [
        "Up to 2,000 SKUs per month",
        "Advanced inventory features",
        "Grading submission tracking",
        "Profit analytics",
        "Export capabilities",
        "Priority support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Starter",
      price: "-",
      period: "",
      description: "Perfect for individual sellers",
      features: [
        "Up to 500 SKUs per month",
        "Basic inventory tracking",
        "Buy/sell transactions",
        "Basic reporting",
      ],
      cta: "Get Started",
      popular: false,
    },
  ];

  return (
    <motion.div
      className="bg-background py-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.25, 0, 1] }}
    >
      <div className="max-w-6xl mx-auto px-8 lg:px-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1] }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-[-0.01em] text-foreground mb-6">
            Simple Pricing
          </h2>
          <p className="text-base font-light tracking-[-0.01em] text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include core
            features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative border border-border rounded-lg ${
                index === 0
                  ? "bg-card/50 shadow-sm border-primary/20 p-10 h-[500px]"
                  : index === 1
                    ? "bg-card/50 p-8 h-[450px]"
                    : "bg-card/50 p-6 h-[400px]"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.25, 0, 1],
                delay: index * 0.1,
              }}
            >
              <div className={`${index === 0 ? "flex flex-col h-full" : ""}`}>
                {index === 0 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-medium">
                      PREMIUM
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-light tracking-[-0.01em] text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm font-light tracking-[-0.01em] text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-light tracking-[-0.01em] text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-light tracking-[-0.01em] text-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className={index === 0 ? "mt-auto" : ""}>
                  <Button
                    asChild
                    className={`w-full text-xs uppercase tracking-[0.2em] ${
                      index === 0 ? "" : "variant-outline"
                    }`}
                    size="sm"
                  >
                    <a href="#contact">{plan.cta}</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1], delay: 0.3 }}
        >
          <p className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
            Beta users get 50% off for the first 6 months
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
