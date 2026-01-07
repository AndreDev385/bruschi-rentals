// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export const prerender = false;

import { authClient } from "@/lib/auth0.server";

export const POST = async ({ request }: { request: Request }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Rate limit: 5 attempts per minute per email
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";
    const rateKey = `${email}:${ip}`;
    if (!checkRateLimit(rateKey, 5, 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    // Send passwordless email with code
    await authClient.passwordless.sendEmail({
      email,
      send: "code",
    });

    return Response.json({ success: true, message: "Login email sent" });
  } catch (error: unknown) {
    console.error("Passwordless login error:", error);

    // Handle specific Auth0 errors
    let errorMessage = "Failed to send login email";
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error && "response" in error) {
      const err = error as {
        response?: { data?: { error_description?: string } };
      };
      if (err.response?.data?.error_description) {
        errorMessage = err.response.data.error_description;
      }
    }

    return Response.json({ error: errorMessage }, { status: 500 });
  }
};
