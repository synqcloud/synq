import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create new transaction",
  description: "Create a new transaction",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
