"use client";

import { Nav } from "../components/nav";
import { StoryContent } from "../components/story-content";
import { Showcase } from "../components/showcase";
import { ContactSection } from "../components/contact-section";
import { HeroSection } from "../components/hero-section";
import { Footer } from "../components/footer";

export default function HomePage() {
  return (
    <div>
      <Nav />

      {/* Hero Section */}
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

      {/* Contact Form Section - Last */}
      <section id="contact" className="py-24 bg-muted/30">
        <ContactSection />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
