import { getSecret } from "astro:env/server";
import { NeighborhoodSchema, type Neighborhood } from "@/types";

const API_URL = getSecret("API_BASE_URL");

if (!API_URL) {
  throw new Error("API_BASE_URL must be set");
}

export async function listNeighborhoods(): Promise<Neighborhood[]> {
  const response = await fetch(`${API_URL}/api/v1/neighborhoods`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch neighborhoods: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return NeighborhoodSchema.array().parse(data);
}
