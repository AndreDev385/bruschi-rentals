export async function fetchPriceRange(
  neighborhoodId: string,
  type: string,
): Promise<{ min_from: number; max_to: number; available: boolean }> {
  const response = await fetch(
    `${import.meta.env.PUBLIC_API_BASE_URL}/api/v1/apartments/price-range?neighborhood_id=${neighborhoodId}&type=${type}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch price range");
  }

  const data = await response.json();

  return data;
}
