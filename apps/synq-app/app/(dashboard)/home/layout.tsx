import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
  description: "Synq overview",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
