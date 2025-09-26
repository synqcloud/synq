import Image from "next/image";
import { Github } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
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
        <div className="flex items-center gap-4">
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
      </div>
    </nav>
  );
}
