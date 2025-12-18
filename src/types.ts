import { z } from "astro/zod";

export const NeighborhoodSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type Neighborhood = z.infer<typeof NeighborhoodSchema>;

export type FormData = {
  neighborhoodId?: string;
  neighborhoodName?: string;
  apartmentType?: "Studio" | "OneBed" | "TwoBeds" | "ThreeOrMoreBeds";
  budget?: number;
  moveInDate?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  tourType?: "OnSite" | "Virtual";
  notes?: string;
};
