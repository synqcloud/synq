import { HStack, VStack, Button } from "@synq/ui/component";
import Link from "next/link";

export default function NotFound() {
  return (
    <HStack justify="center" className="h-screen w-full bg-gray-50">
      <VStack justify="center" className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-600">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link href="/" passHref>
          <Button asChild>
            <span>Go Back Home</span>
          </Button>
        </Link>
      </VStack>
    </HStack>
  );
}
