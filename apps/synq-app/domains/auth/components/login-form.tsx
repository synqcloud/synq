"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@synq/ui/utils";
import {
  Button,
  Input,
  Label,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Separator,
} from "@synq/ui/component";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserService } from "@synq/supabase/services";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Spinner } from "@synq/ui/component";
import { SynqIcon } from "@/shared/icons/icons";

const RESEND_COOLDOWN = 60; // seconds

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSendingCode(true);
    try {
      await UserService.signInWithOTP(email);
      setShowOTP(true);
      setCountdown(RESEND_COOLDOWN);
      toast.success("Verification code sent to your email.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send verification code",
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await UserService.signInWithOTP(email);
      setCountdown(RESEND_COOLDOWN);
      toast.success("Verification code sent to your email.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to resend verification code",
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsVerifying(true);
    try {
      const { redirectTo } = await UserService.verifyOTP(email, otp);
      router.push(redirectTo);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid verification code",
      );
      setIsVerifying(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 w-full max-w-sm mx-auto animate-in fade-in duration-500",
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        <HeaderSection />

        <GoogleLoginButton />

        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        {showOTP ? (
          <OTPForm
            otp={otp}
            countdown={countdown}
            isResending={isResending}
            onOtpChange={setOtp}
            onSubmit={handleOTPSubmit}
            onResend={handleResend}
            isVerifying={isVerifying}
          />
        ) : (
          <EmailForm
            email={email}
            onEmailChange={setEmail}
            onSubmit={handleEmailSubmit}
            isSendingCode={isSendingCode}
          />
        )}
      </div>

      <PolicyLinks />
    </div>
  );
}

const HeaderSection = () => (
  <div className="flex flex-col items-center gap-4">
    <SynqIcon className="w-10 h-10" />
    <div className="flex flex-col items-center gap-1">
      <h1 className="text-2xl font-light tracking-tight">Welcome to Synq</h1>
      <p className="text-sm text-muted-foreground text-center">
        Enter your email to sign in or create a new account
      </p>
    </div>
  </div>
);
const GoogleLoginButton = () => {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const { url } = await UserService.signInWithGoogle();
      // Redirect user to the Google OAuth URL Supabase provides
      window.location.href = url;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google sign-in failed",
      );
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full h-10"
      onClick={handleGoogleLogin}
    >
      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </Button>
  );
};

const OTPForm = ({
  otp,
  countdown,
  isResending,
  onOtpChange,
  onSubmit,
  onResend,
  isVerifying,
}: {
  otp: string;
  countdown: number;
  isResending: boolean;
  onOtpChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  isVerifying: boolean;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground text-center">
          Enter the 6-digit code sent to your email
        </p>
        <p className="text-xs text-muted-foreground text-center">
          The code will expire in 1 hour
        </p>
      </div>
      <form onSubmit={onSubmit} className="w-full">
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          value={otp}
          onChange={onOtpChange}
          className="flex flex-col gap-4 justify-center"
        >
          <InputOTPGroup className="gap-2 justify-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="w-12 h-12 text-lg"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button
          type="submit"
          className="w-full mt-4"
          disabled={otp.length !== 6 || isVerifying}
        >
          {isVerifying ? (
            <div className="flex items-center gap-2">
              <Spinner /> Verifying...
            </div>
          ) : (
            "Verify Code"
          )}
        </Button>
      </form>
      <ResendButton
        countdown={countdown}
        isResending={isResending}
        onResend={onResend}
      />
    </div>
  );
};

const ResendButton = ({
  countdown,
  isResending,
  onResend,
}: {
  countdown: number;
  isResending: boolean;
  onResend: () => void;
}) => (
  <div className="flex items-center gap-2 text-sm">
    <p className="text-muted-foreground">Didn&apos;t receive the code?</p>
    {countdown > 0 ? (
      <p className="text-muted-foreground">Resend in {countdown}s</p>
    ) : (
      <Button
        variant="link"
        className="h-auto p-0 text-sm"
        onClick={onResend}
        disabled={isResending}
      >
        {isResending ? (
          <>
            <Spinner /> Resending...
          </>
        ) : (
          "Resend code"
        )}
      </Button>
    )}
  </div>
);

const EmailForm = ({
  email,
  onEmailChange,
  onSubmit,
  isSendingCode,
}: {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSendingCode: boolean;
}) => (
  <form onSubmit={onSubmit}>
    <div className="flex flex-col gap-6 mt-4">
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="m@example.com"
          autoComplete="email"
          required
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ll send you a code to sign in or create your account
        </p>
      </div>
      <Button
        type="submit"
        className="w-full h-10"
        disabled={isSendingCode || !email}
      >
        {isSendingCode ? (
          <>
            <Spinner /> Sending code...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  </form>
);

const PolicyLinks = () => (
  <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
    By continuing, you agree to our{" "}
    <a href="https://www.trysynq.com/terms">Terms of Service</a> and{" "}
    <a href="https://www.trysynq.com/privacy">Privacy Policy</a>.
  </div>
);
