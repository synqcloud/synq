import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Discrepancies and updates monitoring",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
