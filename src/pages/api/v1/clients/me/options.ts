import type { APIRoute } from "astro";
import type { ClientOptionRead } from "@/types";

const mockOptions: ClientOptionRead[] = [
  {
    id: "1",
    client_id: "client1",
    apartment_id: "apt1",
    selected_by: "user1",
    seen: false,
    favorited: false,
    feedback: "",
    seen_at: "2023-01-01T00:00:00Z",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    building_name: "Sunset Towers",
    apartment_type: "Studio",
    price_range: { from: 1500, to: 1800 },
    selected_by_name: "Paulina",
    building_images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    ],
    building_amenities: ["Gym", "Pool", "Parking", "Laundry"],
    neighborhood_name: "Sunset District",
  },
  {
    id: "2",
    client_id: "client1",
    apartment_id: "apt2",
    selected_by: "user1",
    seen: false,
    favorited: true,
    feedback: "",
    seen_at: "2023-01-01T00:00:00Z",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    building_name: "Ocean View Apartments",
    apartment_type: "OneBed",
    price_range: { from: 2200, to: 2500 },
    selected_by_name: "Paulina",
    building_images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    ],
    building_amenities: ["Ocean View", "Balcony", "Gym", "Concierge"],
    neighborhood_name: "Marina District",
  },
  {
    id: "3",
    client_id: "client1",
    apartment_id: "apt3",
    selected_by: "user1",
    seen: false,
    favorited: false,
    feedback: "",
    seen_at: "2023-01-01T00:00:00Z",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    building_name: "Downtown Lofts",
    apartment_type: "TwoBeds",
    price_range: { from: 2800, to: 3200 },
    selected_by_name: "Paulina",
    building_images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4d7?w=800&h=600&fit=crop",
    ],
    building_amenities: [
      "Rooftop Terrace",
      "Gym",
      "Parking",
      "Pet Friendly",
      "In-unit Laundry",
    ],
    neighborhood_name: "Downtown",
  },
];

export const GET: APIRoute = async ({ request }) => {
  // Check auth header
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // For mock, accept any token
  return new Response(JSON.stringify(mockOptions), { status: 200 });
};
