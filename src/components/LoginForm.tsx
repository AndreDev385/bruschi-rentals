import { actions } from "astro:actions";
import { Info, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SUPPORT_PHONE = "+1 (786) 613-0664";
const SUPPORT_PHONE_TEL = "+17866130664";
const EMAIL_UPGRADE_NOTICE_DISMISSED_KEY = "loginEmailNoticeDismissed";

// Appends the support phone to error messages so users with stuck
// accounts know who to call. Only adds it once per message.
const appendSupportContact = (message: string): string => {
  if (message.includes(SUPPORT_PHONE) || message.includes(SUPPORT_PHONE_TEL)) {
    return message;
  }
  return `${message} If this keeps happening, call ${SUPPORT_PHONE}.`;
};

type LoginStep = "input" | "code";

type GateError =
  | { type: "not_registered" }
  | { type: "email_unverified"; email: string }
  | { type: "generic"; message: string };

export const LoginForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<LoginStep>("input");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [gateError, setGateError] = useState<GateError | null>(null);
  const [showEmailUpgradeNotice, setShowEmailUpgradeNotice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShowEmailUpgradeNotice(
      window.localStorage.getItem(EMAIL_UPGRADE_NOTICE_DISMISSED_KEY) !==
        "true",
    );
  }, []);

  const dismissEmailUpgradeNotice = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        EMAIL_UPGRADE_NOTICE_DISMISSED_KEY,
        "true",
      );
    }
    setShowEmailUpgradeNotice(false);
  };

  const search = window.location.search;

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setGateError(null);
    setIsSendingCode(true);
    try {
      // Pre-check: confirm the email is registered AND verified before
      // asking Auth0 to send a code. This avoids wasting Auth0 budget on
      // unknown / unverified addresses.
      const apiBaseUrl =
        (import.meta.env.PUBLIC_API_BASE_URL as string | undefined) || "";
      const statusResponse = await fetch(
        `${apiBaseUrl}/api/v1/verification/email-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        },
      );

      if (statusResponse.status === 404) {
        setGateError({ type: "not_registered" });
        return;
      }

      if (!statusResponse.ok) {
        setGateError({
          type: "generic",
          message: "Unable to verify your account. Please try again later.",
        });
        return;
      }

      const statusBody = (await statusResponse.json()) as {
        verified?: boolean;
      };

      if (!statusBody.verified) {
        setGateError({ type: "email_unverified", email: email.trim() });
        return;
      }

      const result = await actions.sendLoginCode({ email: email.trim() });

      if (result.data?.success) {
        toast.success("Code sent! Check your email.");
        setCurrentStep("code");
      }
    } catch (error: unknown) {
      console.error("Send code error:", error);
      const rawMessage =
        error instanceof Error
          ? error.message
          : "Failed to send code. Please try again.";
      toast.error(appendSupportContact(rawMessage));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResendEmail = async () => {
    if (!gateError || gateError.type !== "email_unverified" || !gateError.email)
      return;
    setIsResendingEmail(true);
    try {
      const result = await actions.resendEmailVerification({
        email: gateError.email,
      });
      if (result.data?.success) {
        toast.success("Verification email sent. Check your inbox.");
      }
    } catch (error: unknown) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : "Failed to resend verification email.";
      toast.error(appendSupportContact(rawMessage));
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifyingCode(true);
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
        }),
      });

      if (response.redirected) {
        // Successful verification, redirect
        window.location.href = response.url;
      } else {
        const data = await response.json();
        throw new Error(data.error || "Invalid code");
      }
    } catch (error: unknown) {
      console.error("Verify error:", error);
      const rawMessage =
        error instanceof Error
          ? error.message
          : "Invalid code. Please try again.";
      toast.error(appendSupportContact(rawMessage));
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleBackToEmail = () => {
    setCurrentStep("input");
    setCode("");
  };

  const handleCodeInput = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "");
    setCode(digitsOnly);
  };

  return (
    <div className="max-w-md bg-soft rounded-xl shadow-lg p-8">
      {showEmailUpgradeNotice && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p className="flex-1">
            <strong>We&apos;ve upgraded to email login.</strong> Use the email
            on your account to receive a 6-digit code instead of an SMS code.
          </p>
          <button
            type="button"
            onClick={dismissEmailUpgradeNotice}
            aria-label="Dismiss notice"
            className="flex-shrink-0 rounded p-0.5 text-amber-900 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-obsidian mb-2">Log In</h1>
        <p className="text-mocha">Access your personalized rental portal</p>
        <div className="text-xs text-gray-500 bg-soft-dark/30 p-3 rounded-lg">
          <p>
            <strong>Secure Access:</strong> We send a one-time verification code
            to your email to confirm your identity and keep your account secure.
          </p>
        </div>
      </div>

      {currentStep === "input" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (gateError) setGateError(null);
              }}
              required
              disabled={isSendingCode}
              className="text-base"
              placeholder="you@example.com"
            />
          </div>

          <Button
            type="button"
            onClick={handleSendCode}
            className="w-full font-bold"
            size="lg"
            disabled={isSendingCode}
          >
            {isSendingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSendingCode ? "Sending..." : "Send Code"}
          </Button>

          {gateError && (
            <div
              role="alert"
              className="text-sm text-left bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 space-y-2"
            >
              {gateError.type === "not_registered" && (
                <>
                  <p>
                    This email isn&apos;t registered yet. Please complete the
                    preferences form first to create your account.
                  </p>
                  <a
                    href={`/${search}`}
                    className="inline-block font-medium text-primary hover:underline"
                  >
                    Complete the preferences form →
                  </a>
                </>
              )}
              {gateError.type === "email_unverified" && (
                <>
                  <p>
                    Your email isn&apos;t verified yet. We sent you a
                    verification link when you registered — check your inbox
                    (and spam folder).
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-primary hover:underline"
                    onClick={handleResendEmail}
                    disabled={isResendingEmail}
                  >
                    {isResendingEmail && (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    )}
                    {isResendingEmail
                      ? "Sending..."
                      : "Resend verification email"}
                  </Button>
                </>
              )}
              {gateError.type === "generic" && <p>{gateError.message}</p>}
            </div>
          )}
        </div>
      )}

      {currentStep === "code" && (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <p className="text-sm text-mocha">
              We&apos;ve sent a <strong>6-digit code</strong> to{" "}
              <strong>{email}</strong>. Enter it below to continue.
            </p>
          </div>

          <div>
            <Label htmlFor="code">
              <Input
                type="text"
                id="code"
                value={code}
                onChange={(e) => handleCodeInput(e.target.value)}
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                disabled={isVerifyingCode}
                autoFocus
              />
            </Label>
          </div>

          <Button
            type="button"
            onClick={handleVerifyCode}
            disabled={isVerifyingCode}
            className="w-full font-bold"
            size="lg"
          >
            {isVerifyingCode && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isVerifyingCode ? "Verifying..." : "Verify Code"}
          </Button>

          <Button
            type="button"
            onClick={handleBackToEmail}
            disabled={isVerifyingCode}
            className="w-full font-bold"
            variant="link"
          >
            ← Back to email
          </Button>
        </div>
      )}

      <div className="mt-2 text-center">
        <p className="text-sm text-mocha">
          New here?{" "}
          <a
            href={`/more-info${search}`}
            className="text-primary hover:underline"
          >
            Get started
          </a>
        </p>
      </div>
    </div>
  );
};
