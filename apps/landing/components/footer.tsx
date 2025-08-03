import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background/80 backdrop-blur-sm py-6 border-t border-border/20">
      <div className="max-w-6xl mx-auto px-8 lg:px-12">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
              © 2025 Synq
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#showcase"
              className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#learn-more"
              className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Our Story
            </a>
            <a
              href="/privacy"
              className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </a>
            <a
              href="https://github.com/synqcloud/synq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Copyright centered on mobile */}
          <div className="flex justify-center mb-4">
            <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
              © 2025 Synq
            </span>
          </div>

          {/* Navigation links centered and evenly spaced */}
          <div className="flex justify-center items-center gap-6">
            <a
              href="#showcase"
              className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#learn-more"
              className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Our Story
            </a>
            <a
              href="/privacy"
              className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </a>
            <a
              href="https://github.com/synqcloud/synq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
