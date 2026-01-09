"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  VStack,
} from "@synq/ui/component";
import { Wrench } from "lucide-react";
import Image from "next/image";
import { SynqIcon } from "@/shared/icons/icons";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/brand/synq-art.png"
          alt="Background"
          fill
          className="object-cover opacity-10"
        />
      </div>
      <div className="absolute inset-0 bg-background/10" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-lg shadow-2xl border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <VStack gap={6} align="center">
              <div className="w-12 h-12">
                <SynqIcon />
              </div>
              <VStack gap={3} align="center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-2">
                  <Wrench className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl font-light">
                  Under Maintenance
                </CardTitle>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                  We&apos;re currently performing scheduled maintenance to
                  improve your experience. We&apos;ll be back online shortly.
                </p>
              </VStack>
            </VStack>
          </CardHeader>

          <CardContent className="pt-0">
            <VStack gap={6}>
              <div className="text-center py-6 px-4 rounded-lg bg-muted/20 border border-border/30">
                <VStack gap={3} align="center">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Thank you for your patience. If you have any urgent
                    concerns, please contact our support team.
                  </p>
                </VStack>
              </div>
            </VStack>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenancePage;
