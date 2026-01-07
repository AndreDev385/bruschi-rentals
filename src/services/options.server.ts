import { getSecret } from "astro:env/server";
import type { ClientOptionRead, ClientOptionDetailed } from "@/types";

const API_URL = getSecret("API_BASE_URL");

if (!API_URL) {
  throw new Error("API_BASE_URL must be set");
}

export async function listClientOptions(
  accessToken: string,
): Promise<ClientOptionRead[]> {
  if (!API_URL) {
    throw new Error("API_BASE_URL not set");
  }

  const response = await fetch(`${API_URL}/api/v1/clients/me/options`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch client options: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data;
}

export async function fetchClientOption(
  id: string,
  accessToken: string,
): Promise<ClientOptionDetailed> {
  const response = await fetch(`${API_URL}/api/v1/clients/me/options/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch option details: ${response.status} ${response.statusText}`,
    );
  }
  return await response.json();
}
