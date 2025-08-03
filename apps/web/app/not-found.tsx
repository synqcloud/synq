import Link from "next/link";
import { Card, Button } from "@synq/ui/component";
import { AlertCircle } from "lucide-react";

export default async function NotFound() {
  return (
    <div className="h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Page Not Found
        </h2>
        <p className="text-muted-foreground">
          We couldn&apos;t find the page you&apos;re looking for. Please check
          the URL or go back home.
        </p>
        <Button asChild className="mt-4">
          <Link href="/home">Return to Dashboard</Link>
        </Button>
      </Card>
    </div>
  );
}
