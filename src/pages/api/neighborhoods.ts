import { listNeighborhoods } from "@/services/neighborhoods.server";

export const GET = async () => {
  try {
    const neighborhoods = await listNeighborhoods();
    return Response.json(neighborhoods);
  } catch (error) {
    console.error("Error fetching neighborhoods:", error);
    return Response.json(
      { error: "Failed to fetch neighborhoods" },
      { status: 500 },
    );
  }
};
