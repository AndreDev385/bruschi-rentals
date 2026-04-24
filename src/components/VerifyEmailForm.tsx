import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const VerifyEmailForm: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      // Get token from URL query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("No verification token provided. Please use the link from your email.");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been verified! You can now log in.");
        } else if (response.status === 429) {
          setStatus("error");
          setMessage(data.error || "Too many attempts. Please wait 1 hour before trying again.");
        } else if (response.status === 400) {
          if (data.error?.includes("expired")) {
            setStatus("expired");
            setMessage("Your verification link has expired. Please request a new one from the login page.");
          } else {
            setStatus("error");
            setMessage(data.error || "Invalid verification token.");
          }
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="bg-soft rounded-xl shadow-lg p-8">
      {status === "loading" && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-mocha">Verifying your email...</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h2>
          <p className="text-mocha mb-6">{message}</p>
          <Button
            onClick={() => window.location.href = "/login"}
            className="w-full font-bold"
            size="lg"
          >
            Go to Login
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
          <p className="text-mocha mb-6">{message}</p>
          <Button
            onClick={() => window.location.href = "/login"}
            className="w-full font-bold"
            size="lg"
          >
            Go to Login
          </Button>
        </div>
      )}

      {status === "expired" && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Link Expired</h2>
          <p className="text-mocha mb-6">{message}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm">
            <p className="text-amber-800">
              <strong>Note:</strong> If you haven't verified your phone yet, you'll need to do so after logging in.
            </p>
          </div>
          <Button
            onClick={() => window.location.href = "/login"}
            className="w-full font-bold"
            size="lg"
          >
            Go to Login
          </Button>
        </div>
      )}
    </div>
  );
};