import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Integrate with external apps.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
