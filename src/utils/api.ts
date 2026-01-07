import { toast } from "sonner";

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

// Client options API functions
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export async function fetchClientOptions(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/clients/me/options`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    toast.error("Your session has expired. Redirecting to login...");
    setTimeout(() => (window.location.href = "/login"), 2000);
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch client options");
  }

  return response.json();
}

export async function toggleFavorite(
  optionId: string,
  favorited: boolean,
  accessToken: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/clients/me/options/${optionId}/favorite`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ favorited }),
    },
  );

  if (response.status === 401) {
    toast.error("Your session has expired. Redirecting to login...");
    setTimeout(() => (window.location.href = "/login"), 2000);
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error("Failed to update favorite");
  }

  return response.json();
}

export async function markOptionSeen(
  clientId: string,
  optionId: string,
  accessToken: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/clients/${clientId}/options/${optionId}/seen`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (response.status === 401) {
    toast.error("Your session has expired. Redirecting to login...");
    setTimeout(() => (window.location.href = "/login"), 2000);
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error("Failed to mark option as seen");
  }

  return response.json();
}

export async function fetchClientOptionDetailed(
  optionId: string,
  accessToken: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/clients/me/options/${optionId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (response.status === 401) {
    toast.error("Your session has expired. Redirecting to login...");
    setTimeout(() => (window.location.href = "/login"), 2000);
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch client option details");
  }

  return response.json();
}

export async function updateFeedback(
  optionId: string,
  feedback: string,
  accessToken: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/clients/me/options/${optionId}/feedback`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ feedback }),
    },
  );

  if (response.status === 401) {
    toast.error("Your session has expired. Redirecting to login...");
    setTimeout(() => (window.location.href = "/login"), 2000);
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error("Failed to update feedback");
  }

  return response.json();
}
