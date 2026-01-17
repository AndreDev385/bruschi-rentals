import type { APIContext } from "astro";
export interface User {
	id: string;
	email: string;
	name?: string;
	role?: string;
}

export interface AuthSession {
	user: User;
	accessToken: string;
	refreshToken?: string;
	expiresIn?: number; // seconds until expiry
}

// Check if user is authenticated
export async function getSession(
	context: unknown,
): Promise<AuthSession | null> {
	// Handle both API context and Astro page context
	let sessionCookie: string | undefined;

	if (
		context &&
		typeof context === "object" &&
		"cookies" in context &&
		context.cookies &&
		typeof context.cookies === "object" &&
		"get" in context.cookies &&
		typeof context.cookies.get === "function"
	) {
		try {
			// Astro page context - cookies.get returns an AstroCookie object
			const cookieObj = context.cookies.get("auth-session");
			if (cookieObj && typeof cookieObj === "object" && "value" in cookieObj) {
				sessionCookie = cookieObj.value;
			}
		} catch (error) {
			console.error("Error accessing cookies");
		}
	} else {
		// Fallback: check request headers for cookie
		if (
			context &&
			typeof context === "object" &&
			"request" in context &&
			context.request &&
			typeof context.request === "object" &&
			"headers" in context.request &&
			context.request.headers &&
			typeof context.request.headers === "object" &&
			"get" in context.request.headers &&
			typeof context.request.headers.get === "function"
		) {
			const cookieHeader = context.request.headers.get("cookie");
			if (cookieHeader && typeof cookieHeader === "string") {
				const cookies = cookieHeader
					.split(";")
					.reduce((acc: Record<string, string>, cookie: string) => {
						const [key, value] = cookie.trim().split("=");
						acc[key] = decodeURIComponent(value || "");
						return acc;
					}, {});
				sessionCookie = cookies["auth-session"];
			}
		}
	}

	if (!sessionCookie || typeof sessionCookie !== "string") {
		// No session cookie found - user is not authenticated (this is normal for public pages)
		return null;
	}

	try {
		console.log("Raw sessionCookie:", String(sessionCookie)?.substring(0, 100)); // Log first 100 chars for debugging
		// Decode the cookie value if encoded
		sessionCookie = decodeURIComponent(sessionCookie);
		console.log(
			"Decoded sessionCookie:",
			String(sessionCookie)?.substring(0, 100),
		); // Log decoded first 100 chars
		// WARNING: Using plain JSON for session storage - this is insecure and should be replaced with proper encryption in production
		const session = JSON.parse(sessionCookie);
		console.log("Parsed session successfully");
		return session;
	} catch (error) {
		console.error(
			"Error parsing session:",
			error instanceof Error ? error.message : String(error),
			"Raw cookie:",
			String(sessionCookie)?.substring(0, 100),
		);
		return null;
	}
}

// Set session in cookies
export function setSession(context: APIContext, session: AuthSession): void {
	// WARNING: Using plain JSON for session storage - this is insecure and should be replaced with proper encryption in production
	context.cookies.set(
		"auth-session",
		encodeURIComponent(JSON.stringify(session)),
		{
			httpOnly: true,
			secure: import.meta.env.PROD,
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		},
	);
}

// Clear session
export function clearSession(context: APIContext): void {
	context.cookies.delete("auth-session");
}

// Get logout URL
export function getLogoutUrl(): string {
	return `https://${import.meta.env.AUTH0_DOMAIN}/v2/logout?${new URLSearchParams(
		{
			client_id: import.meta.env.AUTH0_CLIENT_ID,
			returnTo: import.meta.env.AUTH0_BASE_URL,
		},
	)}`;
}
