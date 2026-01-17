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

import { decodeJwt } from "jose";

export const prerender = false;

export const POST = async ({ request }: { request: Request }) => {
  try {
    const { phoneNumber, code } = await request.json();

    if (
      !phoneNumber ||
      !code ||
      typeof phoneNumber !== "string" ||
      typeof code !== "string"
    ) {
      return Response.json(
        { error: "Phone number and code are required" },
        { status: 400 },
      );
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return Response.json(
        { error: "Invalid phone number format" },
        { status: 400 },
      );
    }

    // Validate code: 6 digits
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(code)) {
      return Response.json({ error: "Code must be 6 digits" }, { status: 400 });
    }

    // Rate limit: 5 attempts per minute per phone
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";
    const rateKey = `${phoneNumber}:${ip}`;
    if (!checkRateLimit(rateKey, 5, 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    // Verify code and get tokens via direct API call
    const requestBody = new URLSearchParams({
      grant_type: "http://auth0.com/oauth/grant-type/passwordless/otp",
      client_id: import.meta.env.AUTH0_CLIENT_ID,
      client_secret: import.meta.env.AUTH0_CLIENT_SECRET,
      username: phoneNumber,
      otp: code,
      realm: "sms",
      scope: "openid profile email phone",
      audience: import.meta.env.AUTH0_AUDIENCE,
    });

    const tokenResponse = await fetch(
      `https://${import.meta.env.AUTH0_DOMAIN}/oauth/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: requestBody,
      },
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      let errorMessage = "Invalid code";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage =
          errorData.error_description || errorData.error || "Invalid code";
      } catch {
        // ignore
      }
      throw new Error(errorMessage);
    }

    const tokens = await tokenResponse.json();

    // Decode id_token to get user info
    const idTokenPayload = decodeJwt(tokens.id_token);

    if (!idTokenPayload.sub) {
      throw new Error("Invalid token payload");
    }

    // Create session with phone number as primary identifier
    const session = {
      user: {
        id: idTokenPayload.sub,
        email: (idTokenPayload.email as string) || "",
        phone: (idTokenPayload.phone_number as string) || phoneNumber,
        name: (idTokenPayload.name as string) || "",
        role: "client",
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };

    // WARNING: Using plain JSON for session storage - this is insecure and should be replaced with proper encryption in production
    const baseUrl = import.meta.env.AUTH0_BASE_URL || "http://localhost:4321";
    const isProd = import.meta.env.PROD;
    const cookieValue = `auth-session=${encodeURIComponent(JSON.stringify(session))}; HttpOnly; Path=/; ${isProd ? "Secure;" : ""} SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`;

    const response = new Response(null, {
      status: 302,
      headers: {
        Location: `${baseUrl}/portal`,
        "Set-Cookie": cookieValue,
      },
    });

    return response;
  } catch (error: unknown) {
    console.error("Code verification error:", error);

    // Handle specific Auth0 errors
    let errorMessage = "Invalid code or expired";
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

    return Response.json({ error: errorMessage }, { status: 400 });
  }
};
