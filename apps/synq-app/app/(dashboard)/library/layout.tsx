import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library",
  description: "Add a game to your inventory",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
