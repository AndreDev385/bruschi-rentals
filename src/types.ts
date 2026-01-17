import { z } from "astro/zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { sanitizePhoneNumber } from "./lib/utils";

export const NeighborhoodSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
});

export type Neighborhood = z.infer<typeof NeighborhoodSchema>;

export const SendLoginCodeSchema = z.object({
	email: z.string().email("Invalid email format"),
});

export type SendLoginCodeInput = z.infer<typeof SendLoginCodeSchema>;

export const SubmitPreferencesSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email").optional().or(z.literal("")), // Email is optional
	phoneNumber: z
		.string()
		.transform((val) => {
			try {
				return sanitizePhoneNumber(val);
			} catch {
				return val; // Return as-is if sanitization fails, validation will catch it
			}
		})
		.refine(isValidPhoneNumber, { message: "Invalid phone number" }),
	origin: z.string().default("Organic"),
	neighborhoodId: z.string().uuid("Invalid neighborhood ID"),
	neighborhoodName: z.string().optional(),
	apartmentType: z.enum(["Studio", "OneBed", "TwoBeds", "ThreeOrMoreBeds"]),
	budget: z.number().positive("Budget must be positive"),
	moveInDate: z.string().min(1, "Move-in date is required"),
	tourType: z.enum(["OnSite", "Virtual"]),
	notes: z.array(z.string()).optional(),
	termsAccepted: z.boolean().optional(),
});

export type FormData = Partial<z.infer<typeof SubmitPreferencesSchema>>;

// Client Option types matching backend
export type ClientOption = {
	id: string;
	client_id: string;
	apartment_id: string;
	selected_by: string;
	seen: boolean;
	favorited: boolean;
	feedback: string;
	seen_at: string;
	created_at: string;
	updated_at: string;
};

export type ClientOptionRead = ClientOption & {
	building_name: string;
	apartment_type: string;
	price_range: PriceRange;
	selected_by_name: string;
	building_images: string[];
	building_amenities: string[];
	neighborhood_name: string;
};

export type ApartmentType = {
	id: string;
	name: string;
};

export type PriceRange = {
	from: number;
	to: number;
};

export const ToggleFavoriteSchema = z.object({
	optionId: z.string(),
});

export type ToggleFavoriteInput = z.infer<typeof ToggleFavoriteSchema>;

export const SubmitFeedbackSchema = z.object({
	optionId: z.string(),
	feedback: z.string(),
});

export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;

export type Promotion = {
	contract_min_months: number;
	contract_max_months?: number;
	free_months_count: number;
	free_month_numbers: number[];
	description: string;
};

export type ClientPreferencesRead = {
	id: string;
	client_id: string;
	version: number;
	neighborhood_name: string;
	apartment_type: "Studio" | "OneBed" | "TwoBeds" | "ThreeOrMoreBeds";
	budget: number;
	tour_type: "OnSite" | "Virtual";
	move_in_date: string;
	notes: string[];
	created_at: string;
	created_by: string | null;
};

// Client Option detailed for detailed view
export type ClientOptionDetailed = ClientOption & {
	building_name: string;
	apartment_type: string;
	price_range: PriceRange;
	selected_by_name: string;
	apartment_images: string[];
	apartment_videos: string[];
	building_images: string[];
	building_videos: string[];
	building_amenities: string[];
	building_promotions: Promotion[];
	fees_and_parking_price: number;
	neighborhood_name: string;
	is_high_rise: boolean;
	has_view: boolean;
};
