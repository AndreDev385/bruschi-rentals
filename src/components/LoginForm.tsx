import { actions } from "astro:actions";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PhoneInputComponent } from "@/components/ui/PhoneInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

//type LoginMethod = "phone" | "email";
type LoginStep = "input" | "code";

type GateError =
  | { type: "not_registered" }
  | { type: "email_unverified"; email: string }
  | { type: "generic"; message: string };

export const LoginForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<LoginStep>("input");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [gateError, setGateError] = useState<GateError | null>(null);

  const search = window.location.search;

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    // Basic phone validation (E.164 format check)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setGateError(null);
    setIsSendingCode(true);
    try {
      // Email-first gate: only proceed if the phone is registered and the
      // associated email is verified. This avoids burning Twilio budget on
      // numbers that shouldn't be receiving codes.
      const verifyUrl = `${import.meta.env.PUBLIC_API_BASE_URL}/api/v1/clients/verify-phone?phone=${encodeURIComponent(phoneNumber.trim())}`;
      const verifyResponse = await fetch(verifyUrl, { method: "GET" });

      if (verifyResponse.status === 404) {
        setGateError({ type: "not_registered" });
        return;
      }

      if (verifyResponse.status === 403) {
        const body = (await verifyResponse.json().catch(() => ({}))) as {
          email?: string;
        };
        setGateError({
          type: "email_unverified",
          email: body.email ?? "",
        });
        return;
      }

      if (!verifyResponse.ok) {
        setGateError({
          type: "generic",
          message: "Unable to verify your account. Please try again later.",
        });
        return;
      }

      const verifyBody = (await verifyResponse.json()) as {
        verified?: boolean;
        email_verified?: boolean;
      };

      if (!verifyBody.verified || !verifyBody.email_verified) {
        setGateError({
          type: "email_unverified",
          email: "",
        });
        return;
      }

      const result = await actions.sendLoginCodeSMS({
        phoneNumber: phoneNumber.trim(),
      });

      if (result.data?.success) {
        toast.success("Code sent! Check your phone.");
        setCurrentStep("code");
      }
    } catch (error: unknown) {
      console.error("Send code error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to send code. Please try again.";

      // Special handling for service unavailable
      if (message.includes("unavailable") || message.includes("timeout")) {
        toast.error(message, {
          duration: 6000, // Show longer for important messages
        });
      } else {
        toast.error(message);
      }
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
      const message =
        error instanceof Error
          ? error.message
          : "Failed to resend verification email.";
      toast.error(message);
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
      const response = await fetch("/api/auth/verify-code-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
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
      const message =
        error instanceof Error
          ? error.message
          : "Invalid code. Please try again.";
      toast.error(message);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleBackToPhone = () => {
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
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-obsidian mb-2">Log In</h1>
        <p className="text-mocha">Access your personalized rental portal</p>
        <div className="text-xs text-gray-500 bg-soft-dark/30 p-3 rounded-lg">
          <p>
            <strong>Secure Access:</strong> We send a one-time verification code
            to your phone to confirm your identity and keep your account secure.
          </p>
        </div>
      </div>

      {currentStep === "input" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <PhoneInputComponent
              name="phoneNumber"
              value={phoneNumber}
              onChange={(value) => {
                setPhoneNumber(value);
                if (gateError) setGateError(null);
              }}
              required
              disabled={isSendingCode}
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
                    This phone number isn&apos;t registered yet. Please complete
                    the preferences form first.
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
                  <p>Please verify your email before logging in.</p>
                  {gateError.email ? (
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
                  ) : (
                    <p className="text-xs text-amber-800">
                      Use the link from your original registration email, or
                      contact support.
                    </p>
                  )}
                </>
              )}
              {gateError.type === "generic" && <p>{gateError.message}</p>}
            </div>
          )}

          <div className="flex justify-center items-center">
            <Button
              className="text-primary hover:underline"
              variant="link"
              onClick={() => setCurrentStep("code")}
            >
              Already have a code?
            </Button>
          </div>
        </div>
      )}

      {currentStep === "code" && (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <p className="text-sm text-mocha">
              We've sent a <strong>6-digit code</strong>. Enter it below to
              continue.
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
            onClick={handleBackToPhone}
            disabled={isVerifyingCode}
            className="w-full font-bold"
            variant="link"
          >
            ← Back to phone number
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
