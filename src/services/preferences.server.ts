import { getSecret } from "astro:env/server";
import type { ClientPreferencesRead } from "@/types";

const API_URL = getSecret("API_BASE_URL");

if (!API_URL) {
  throw new Error("API_BASE_URL must be set");
}

export async function fetchClientPreferences(
  accessToken: string,
): Promise<ClientPreferencesRead[]> {
  if (!API_URL) {
    throw new Error("API_BASE_URL not set");
  }

  const response = await fetch(`${API_URL}/api/v1/clients/me/preferences`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch client preferences: ${response.status} ${response.statusText}`,
    );
  }

  const data: ClientPreferencesRead[] = await response.json();
  return data.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
