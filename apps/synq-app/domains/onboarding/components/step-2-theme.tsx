"use client";
import React from "react";
import { StepWrapper } from "@/domains/onboarding/components/step-wrapper";
import { Button, Card } from "@synq/ui/component";
import { useOnboarding } from "@/domains/onboarding/hooks/use-onboarding";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Step2Theme() {
  const { completeCurrentStep, next } = useOnboarding();
  const { theme, setTheme } = useTheme();
  const [selection, setSelection] = React.useState<"light" | "dark" | null>(
    null,
  );

  function selectTheme(t: "light" | "dark") {
    setSelection(t);
    setTheme(t);
  }

  function handleContinue() {
    completeCurrentStep();
    next();
  }

  const isSelected = (t: "light" | "dark") => selection === t || theme === t;

  return (
    <StepWrapper title="Choose your style">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.p
          className="text-muted-foreground mb-6"
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          Change your theme at any time via the command menu or settings.
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-6 mx-auto"
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <ThemeCard
            label="Light"
            selected={isSelected("light")}
            onClick={() => selectTheme("light")}
            imageSrc="/onboarding/theme-selector-light.jpg"
          />
          <ThemeCard
            label="Dark"
            selected={isSelected("dark")}
            onClick={() => selectTheme("dark")}
            imageSrc="/onboarding/theme-selector-dark.jpg"
          />
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col items-center"
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <Button
            variant="outline"
            onClick={handleContinue}
            disabled={!isSelected("light") && !isSelected("dark")}
          >
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </StepWrapper>
  );
}

function ThemeCard({
  label,
  selected,
  onClick,
  imageSrc,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  imageSrc: string;
}) {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl focus:outline-none"
    >
      <Card
        className={`px-6 py-4 flex flex-col items-center justify-center border transition-all duration-200 ${
          selected
            ? "border-primary/60 ring-1 ring-primary/30"
            : "border-border"
        }`}
      >
        <div className="w-full h-full rounded-md overflow-hidden border border-border bg-card relative">
          {/* Loading placeholder */}
          <motion.div
            className="absolute inset-0 bg-muted flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: imageLoaded ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Image
              src={imageSrc}
              alt={label}
              width={640}
              height={256}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              priority
            />
          </motion.div>
        </div>
        <div
          className={`mt-4 text-sm transition-colors duration-200 ${
            selected ? "text-primary" : "text-foreground"
          }`}
        >
          {label}
        </div>
      </Card>
    </button>
  );
}
