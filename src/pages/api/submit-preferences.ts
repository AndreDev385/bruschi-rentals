export const prerender = false;
import { getSecret } from "astro:env/server";
import { v4 as uuidv4 } from "uuid";

const API_URL = getSecret("API_BASE_URL");

if (!API_URL) {
  throw new Error("API_BASE_URL must be set");
}

export const POST = async ({ request }: { request: Request }) => {
  try {
    const formData = await request.json();

    // Transform data to match new API structure
    const transformedData = {
      client: {
        id: uuidv4(),
        name: formData.name,
        email: formData.email,
        phone_number: formData.phoneNumber,
        notes: [], // Always empty array as per requirements
      },
      origin_name: formData.origin ?? "Organic", // From query param or default
      preferences: {
        neighborhood_id: formData.neighborhoodId,
        apartment_type: formData.apartmentType,
        budget: formData.budget,
        move_in_date: formData.moveInDate,
        tour_type: formData.tourType,
        notes: formData.notes ?? [],
      },
    };

    // Send to new external backend endpoint
    const response = await fetch(`${API_URL}/api/v1/clients/public`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      // Handle specific error case for existing email
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.message === "A client with this email already exists") {
          return Response.json(
            {
              error: "EMAIL_EXISTS",
              message:
                "A client with this email already exists. You're already registered and can proceed to login.",
            },
            { status: 400 },
          );
        }
      }
      throw new Error(`Failed to submit preferences: ${response.status}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error submitting preferences:", error);
    return Response.json(
      { error: "Failed to submit preferences" },
      { status: 500 },
    );
  }
};
