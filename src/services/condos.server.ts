import { getSecret } from "astro:env/server";
import type { CondoOptionDetailed, CondoOptionRead } from "@/types";

const API_URL = getSecret("API_BASE_URL");

if (!API_URL) {
  throw new Error("API_BASE_URL must be set");
}

export async function listClientCondoOptions(
  accessToken: string,
): Promise<CondoOptionRead[]> {
  if (!API_URL) {
    throw new Error("API_BASE_URL not set");
  }

  const response = await fetch(`${API_URL}/api/v1/clients/me/condo-options`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch client condo options: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data;
}

export async function fetchCondoOption(
  optionId: string,
  accessToken: string,
): Promise<CondoOptionDetailed> {
  const response = await fetch(
    `${API_URL}/api/v1/clients/me/condo-options/${optionId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch condo option details: ${response.status} ${response.statusText}`,
    );
  }
  return await response.json();
}
