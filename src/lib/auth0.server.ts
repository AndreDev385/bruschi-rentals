import { AuthenticationClient, ManagementClient } from "auth0";

export const authClient = new AuthenticationClient({
  domain: import.meta.env.AUTH0_DOMAIN,
  clientId: import.meta.env.AUTH0_CLIENT_ID,
  clientSecret: import.meta.env.AUTH0_CLIENT_SECRET,
});

export const managementClient = new ManagementClient({
  domain: import.meta.env.AUTH0_DOMAIN,
  clientId: import.meta.env.AUTH0_CLIENT_ID,
  clientSecret: import.meta.env.AUTH0_CLIENT_SECRET,
});

export async function refreshAccessToken(refreshToken: string) {
  try {
    const tokens = await authClient.refreshToken({
      refresh_token: refreshToken,
    });
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token, // May be the same or new
      expiresIn: tokens.expires_in,
    };
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
}
