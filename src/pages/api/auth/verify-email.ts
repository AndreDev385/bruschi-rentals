import { getSecret } from "astro:env/server";

const API_URL = getSecret("API_BASE_URL");

if (!API_URL) {
  throw new Error("API_BASE_URL must be set");
}

export const prerender = false;

export const POST = async ({ request }: { request: Request }) => {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return Response.json(
        { error: "Token is required" },
        { status: 400 },
      );
    }

    // Call backend to verify email
    const response = await fetch(`${API_URL}/api/v1/clients/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific errors
      let errorMessage = "Verification failed";
      
      if (response.status === 429) {
        // Rate limited - show user-friendly message
        return Response.json(
          { error: data.error || "Too many attempts. Please wait 1 hour before trying again." },
          { status: 429 },
        );
      } else if (response.status === 400) {
        if (data.error?.includes("expired")) {
          return Response.json(
            { error: "verification code has expired" },
            { status: 400 },
          );
        }
        errorMessage = data.error || "Invalid token";
      } else if (response.status === 404) {
        errorMessage = "Invalid or expired token";
      }
      
      return Response.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    return Response.json({
      success: true,
      message: "Email verified successfully",
      ...data,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return Response.json(
      { error: "An error occurred during verification" },
      { status: 500 },
    );
  }
};