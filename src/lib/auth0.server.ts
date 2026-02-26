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
  const response = await authClient.oauth.refreshTokenGrant({
    refresh_token: refreshToken,
  })
  const tokens = response.data
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
  }
}
