import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { actions } from "astro:actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginStep = "email" | "code";

export const LoginForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const search = window.location.search;

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSendingCode(true);
    try {
      const result = await actions.sendLoginCode({ email: email.trim() });

      if (result.data?.success) {
        toast.success("Code sent! Check your email.");
        setCurrentStep("code");
      }
    } catch (error: unknown) {
      console.error("Send code error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to send code. Please try again.";
      toast.error(message);
    } finally {
      setIsSendingCode(false);
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
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
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

  const handleBackToEmail = () => {
    setCurrentStep("email");
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
        <h1 className="text-3xl font-bold text-obsidian mb-4">Welcome Back</h1>
        <p className="text-mocha">Access your personalized rental options</p>
      </div>

      {currentStep === "email" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={isSendingCode}
              />
            </Label>
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
        </div>
      )}

      {currentStep === "code" && (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <p className="text-sm text-mocha">
              We've sent a 6-digit code to <strong>{email}</strong>. Enter it
              below to continue.
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

      <div className="mt-6 text-center">
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
