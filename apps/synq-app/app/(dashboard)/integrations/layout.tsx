import { CardLayout } from "@/shared/layouts/content/card-layout";
import type { Metadata } from "next";
import { Blocks } from "lucide-react";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Integrate with external apps.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4">
      <CardLayout
        title="Integrations"
        description="Connect your favorite tools and services to streamline your workflow."
        icon={<Blocks strokeWidth={1} />}
      >
        {children}
      </CardLayout>
    </div>
  );
}
