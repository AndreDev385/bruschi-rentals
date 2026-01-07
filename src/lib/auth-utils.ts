import type { APIContext } from "astro";
import { clearSession } from "./auth";
import { refreshAccessToken } from "./auth0.server";

type ContextWithCookies = {
  cookies: {
    delete: (name: string) => void;
  };
};

export interface AuthErrorResult {
  shouldRedirect: boolean;
  shouldRetry?: boolean;
  newTokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
  };
}

/**
 * Handles authentication errors (401) by attempting token refresh or clearing session.
 * Returns instructions on how to proceed.
 */
export async function handleAuthError(
  error: Error,
  context: ContextWithCookies,
  refreshToken?: string,
): Promise<AuthErrorResult> {
  // Check if it's a 401/Unauthorized error
  const isAuthError =
    error.message.includes("401") ||
    error.message.includes("Unauthorized") ||
    (error.message.includes("token") && error.message.includes("invalid"));

  if (!isAuthError) {
    return { shouldRedirect: false };
  }

  // Attempt refresh if refresh token available
  if (refreshToken) {
    try {
      console.log("Attempting token refresh...");
      const newTokens = await refreshAccessToken(refreshToken);
      console.log("Token refresh successful");
      return {
        shouldRedirect: false,
        shouldRetry: true,
        newTokens: {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresIn: newTokens.expiresIn,
        },
      };
    } catch (refreshError) {
      console.error("Token refresh failed, clearing session:", refreshError);
    }
  }

  // Clear session and redirect
  console.log("Clearing session and redirecting to login");
  clearSession(context as APIContext);
  return { shouldRedirect: true };
}
