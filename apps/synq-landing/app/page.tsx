import { Nav } from "../components/nav";
import { StoryContent } from "../components/story-content";
import { Showcase } from "../components/showcase";
import { ContactSection } from "../components/contact-section";
import { HeroSection } from "../components/hero-section";
import { Footer } from "../components/footer";
import { EarlyAccessSection } from "@/components/early-access-section";

import { Metadata } from "next";
import { SchemaMarkup } from "@/components/schema-markup";

export const metadata: Metadata = {
  title:
    "TCG Inventory Management Software for Card Shops | Pokemon, Magic, Yu-Gi-Oh | Synq",
  description:
    "Complete inventory solution for Pokemon, Magic: The Gathering, and Yu-Gi-Oh card shops. Track stock, manage sales, integrate with TCGPlayer & Cardmarket. Start free 7-day trial.",
  alternates: {
    canonical: "https://www.trysynq.com",
  },
};

export default function HomePage() {
  return (
    <>
      {/*<SchemaMarkup />*/}
      <div>
        <Nav />

        {/* Hero Section */}
        <main>
          <HeroSection />

          {/* Showcase Section */}
          <section id="features" className="py-24">
            <Showcase />
          </section>

          {/* Learn More Section */}
          <section id="about-us" className="py-24 bg-muted/30">
            <div className="max-w-5xl mx-auto px-8 lg:px-12">
              <div className="text-center mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-[-0.01em] text-foreground mb-6">
                  Why we're building this
                </h2>
              </div>
              <StoryContent />
            </div>
          </section>

          {/* Early Access Pricing Section */}
          <section id="early-access" className="py-24 bg-muted/30">
            <EarlyAccessSection />
          </section>

          {/* Contact Form Section - Last */}
          <section id="contact" className="py-24 bg-muted/30">
            <ContactSection />
          </section>
        </main>
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
