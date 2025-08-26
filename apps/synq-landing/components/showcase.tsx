"use client";

import { motion } from "framer-motion";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function Showcase() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [clickedImage, setClickedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const images = [
    {
      src: "/brand/synq-inventory.png",
      alt: "Inventory Management Dashboard",
      title: "Inventory Management",
      description:
        "Track your card inventory with precision. Monitor stock levels, conditions, and values across all your collections.",
    },
    {
      src: "/brand/synq-transactions.png",
      alt: "Transactions Dashboard",
      title: "Transactions",
      description:
        "Track all your buying and selling activities. Monitor fees, profits, and transaction history with detailed analytics.",
    },
    {
      src: "/brand/synq-library.png",
      alt: "Library Dashboard",
      title: "Card Game Data Access",
      description:
        "Access comprehensive card databases for multiple TCGs. Import card data, and create custom libraries for your specific product groups.",
    },
  ];

  // Core features data
  const coreFeatures = [
    {
      title: "Inventory Management",
      description:
        "Navigate on your card inventory quickly on the inventory panel. Monitor and take actions on stock levels, prices, conditions and more",
      image: "/brand/synq-inventory.png",
      alt: "Inventory Management Dashboard",
      features: [
        "Real-time stock tracking",
        "Physical location tracking",
        "Condition & grading support",
      ],
      cta: "Start managing inventory",
    },
    {
      title: "Transactions",
      description:
        "Track all your buying and selling activities. Monitor fees, profits, and transaction history with detailed analytics.",
      image: "/brand/synq-transactions.png",
      alt: "Transactions Dashboard",
      features: [
        "Buy/sell tracking",
        "Grading submissions",
        "Damage & loss tracking",
        "Returns & refunds",
      ],
      cta: "View transactions",
    },
    {
      title: "Card Game Data Access",
      description:
        "Access comprehensive card databases for multiple TCGs. Import card data, and create custom libraries for your specific product groups.",
      image: "/brand/synq-library.png",
      alt: "Library Dashboard",
      features: [
        "Add existing inventories from library",
        "Create custom product groups",
        "Complete card data & pricing",
      ],
      cta: "Explore library",
    },
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <motion.div
        className="bg-background py-16 border-t border-border"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.25, 0, 1] }}
      >
        <div className="max-w-6xl mx-auto px-8 lg:px-12">
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-[-0.01em] text-foreground mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1] }}
          >
            Core Features
          </motion.h2>
          <motion.p
            className="text-sm font-light tracking-[-0.01em] text-muted-foreground max-w-2xl mx-auto mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1], delay: 0.1 }}
          >
            Preview the core features powering your experience.
          </motion.p>

          <div className="space-y-16">
            {/* Image Carousel - Hidden for now */}
            {/* <motion.div
              className="relative max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.25, 0, 1],
                delay: 0.2
              }}
            >
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 rounded-full p-2 shadow-sm transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 rounded-full p-2 shadow-sm transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>

              <div className="relative">
                <div
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <Image
                    src={images[currentImage].src}
                    alt={images[currentImage].alt}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg shadow-lg object-cover"
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                  <h3 className="text-xl font-light tracking-[-0.01em] text-white mb-2">
                    {images[currentImage].title}
                  </h3>
                  <p className="text-sm font-light tracking-[-0.01em] text-white/80">
                    {images[currentImage].description}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-6">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImage
                        ? "bg-gray-800"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </motion.div> */}

            {/* Core Features Grid */}
            <div className="space-y-16">
              {coreFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={`flex flex-col lg:flex-row lg:items-start lg:gap-12 border border-border rounded-lg p-8 shadow-sm bg-card ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.6,
                    ease: [0.25, 0.25, 0, 1],
                    delay: (index + 1) * 0.1,
                  }}
                >
                  <div className="lg:w-1/2 lg:flex-shrink-0 mb-8 lg:mb-0">
                    <div
                      className="cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setClickedImage({
                          src: feature.image,
                          alt: feature.alt,
                        });
                        setIsImageModalOpen(true);
                      }}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.alt}
                        width={600}
                        height={400}
                        className="w-full h-auto rounded-lg shadow-sm object-cover"
                      />
                    </div>
                  </div>
                  <div className="lg:w-1/2 lg:flex-1">
                    <h3 className="text-2xl font-light tracking-[-0.01em] text-foreground mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-base font-light tracking-[-0.01em] text-muted-foreground mb-8 leading-relaxed">
                      {feature.description}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-base font-light tracking-[-0.01em] text-foreground">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Proof Section */}
            <motion.div
              className="mt-16 pt-16 border-t border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.25, 0, 1],
                delay: 0.4,
              }}
            >
              <div className="text-center mb-12">
                <h2 className="text-xl font-light tracking-[-0.01em] text-foreground mb-4">
                  Real World Results
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  Try it out and tell us what changed for the better since you
                  switched to Synq.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-4">
                  <a
                    href="#contact"
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Contact Us
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                  <span className="text-muted-foreground">or</span>
                  <a
                    href="mailto:hello@synq.com"
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Share Feedback
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 text-foreground hover:text-muted-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <Image
              src={clickedImage?.src || images[currentImage].src}
              alt={clickedImage?.alt || images[currentImage].alt}
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
