"use client";

import { useState } from "react";
import Image from "next/image";
import { Github, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full px-8 lg:px-12 py-6 border-b border-border/20 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Image
            src="/brand/synq-icon.png"
            alt="Synq Logo"
            width={28}
            height={28}
            className="h-7 w-auto opacity-80"
          />
          <span className="hidden md:inline-block text-sm font-light tracking-[-0.01em] text-muted-foreground whitespace-nowrap align-middle">
            Inventory management for card game stores.
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#features"
            className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#contact"
            className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact Us
          </a>
          <a
            href="#early-access"
            className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Early Access
          </a>
          <ThemeToggle />
          {/*<a
            href="https://github.com/synqcloud/synq"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>*/}
        </div>

        {/* Mobile Navigation Controls */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={toggleMenu}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-muted z-40">
          <div className="flex flex-col items-center justify-start bg-muted py-8 px-8 gap-6">
            <a
              href="#features"
              onClick={closeMenu}
              className="text-lg font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#contact"
              onClick={closeMenu}
              className="text-lg font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Us
            </a>
            <a
              href="#early-access"
              onClick={closeMenu}
              className="text-lg font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Early Access
            </a>
            {/*<a
              href="https://github.com/synqcloud/synq"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>*/}
          </div>
        </div>
      )}
    </nav>
  );
}
