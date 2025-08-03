import { themeQuartz } from "ag-grid-community";

// Extract CSS custom properties from globals.css
const getComputedStyleValue = (property: string): string => {
  if (typeof window !== "undefined") {
    return window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim();
  }
  // Fallback values for SSR
  return "";
};

// Convert CSS custom property to hex color
const cssVarToHex = (property: string): string => {
  const value = getComputedStyleValue(property);
  if (!value) return "#000000";

  // Handle HSL values like "220 90% 60%"
  if (value.includes(" ")) {
    const parts = value.split(" ").map(Number);
    if (parts.length >= 3) {
      const [h, s, l] = parts;
      if (h !== undefined && s !== undefined && l !== undefined) {
        return hslToHex(h, s, l);
      }
    }
  }

  return value;
};

// Convert HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Create custom theme based on globals.css values
export const createCustomTheme = () => {
  return themeQuartz.withParams({
    // Background colors
    backgroundColor: cssVarToHex("--background"),
    foregroundColor: cssVarToHex("--foreground"),

    // Border colors
    borderColor: cssVarToHex("--border"),

    // Chrome (header/footer) background
    chromeBackgroundColor: cssVarToHex("--muted"),

    // Spacing
    spacing: 12,

    // Font settings
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",

    // Border radius
    borderRadius: "0.625rem",
  });
};

// Export the theme instance
export const customTheme = createCustomTheme();
