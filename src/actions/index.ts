import { ActionError, defineAction } from "astro:actions";
import { getSecret } from "astro:env/server";
import { getSession, setSession } from "@/lib/auth";
import { handleAuthError } from "@/lib/auth-utils";
import { authClient } from "@/lib/auth0.server";
import { sanitizePhoneNumber } from "@/lib/utils";
import {
  SendLoginCodeSchema,
  SubmitFeedbackSchema,
  SubmitPreferencesSchema,
  ToggleFavoriteSchema,
} from "@/types";
import type { APIContext } from "astro";
import { z } from "astro/zod";
import { v4 as uuidv4 } from "uuid";

const API_URL = getSecret("API_BASE_URL");

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

if (!API_URL) {
  throw new Error("API_BASE_URL must be set");
}

export const server = {
  submitPreferences: defineAction({
    input: SubmitPreferencesSchema,
    handler: async (input: z.infer<typeof SubmitPreferencesSchema>) => {
      try {
        // Sanitize phone number before sending to backend
        let sanitizedPhone: string;
        try {
          sanitizedPhone = sanitizePhoneNumber(input.phoneNumber);
        } catch (error) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message:
              "Invalid phone number format. Please use international format with + prefix.",
          });
        }

        // Transform data to match new API structure
        const transformedData = {
          client: {
            id: uuidv4(),
            name: input.name,
            email: input.email,
            phone_number: sanitizedPhone,
            notes: [], // Always empty array as per requirements
          },
          origin_name: input.origin,
          preferences: {
            neighborhood_id: input.neighborhoodId,
            apartment_type: input.apartmentType,
            budget: input.budget,
            move_in_date: input.moveInDate,
            tour_type: input.tourType,
            notes: input.notes ?? [],
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
          const errorData = await response.json();

          // Handle specific error cases
          if (response.status === 409) {
            if (errorData.error === "email already exists") {
              throw new ActionError({
                code: "CONFLICT",
                message:
                  "You're already registered with this email! Please proceed to login.",
              });
            }
            if (errorData.error === "phone number already exists") {
              throw new ActionError({
                code: "CONFLICT",
                message:
                  "You're already registered with this phone number! Please proceed to login.",
              });
            }
          }

          // Handle validation errors (400)
          if (response.status === 400) {
            throw new ActionError({
              code: "BAD_REQUEST",
              message:
                errorData.error ||
                "Invalid request data. Please check all fields and try again.",
            });
          }

          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Failed to submit preferences. Please try again.",
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }
        console.error("Error submitting preferences:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while submitting.",
        });
      }
    },
  }),

  sendLoginCode: defineAction({
    input: SendLoginCodeSchema,
    handler: async (input, context) => {
      try {
        const { email } = input;

        // Rate limit: 5 attempts per minute per email
        const ip =
          context.request.headers.get("x-forwarded-for") ||
          context.request.headers.get("cf-connecting-ip") ||
          "unknown";
        const rateKey = `${email}:${ip}`;
        if (!checkRateLimit(rateKey, 5, 60 * 1000)) {
          throw new ActionError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many attempts. Please try again later.",
          });
        }

        // Send passwordless email with code
        await authClient.passwordless.sendEmail({
          email,
          send: "code",
        });

        return { success: true, message: "Login email sent" };
      } catch (error: unknown) {
        if (error instanceof ActionError) {
          throw error;
        }

        console.error("Passwordless login error:", error);

        // Handle specific Auth0 errors
        let errorMessage = "Failed to send login email";
        if (error instanceof Error && error.message) {
          errorMessage = error.message;
        } else if (typeof error === "object" && error && "response" in error) {
          const err = error as {
            response?: { data?: { error_description?: string } };
          };
          if (err.response?.data?.error_description) {
            errorMessage = err.response.data.error_description;
          }
        }

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        });
      }
    },
  }),

  sendLoginCodeSMS: defineAction({
    input: z.object({
      phoneNumber: z
        .string()
        .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format"),
    }),
    handler: async (input, context) => {
      try {
        // Sanitize phone number
        let sanitizedPhone: string;
        try {
          sanitizedPhone = sanitizePhoneNumber(input.phoneNumber);
        } catch (error) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message:
              "Invalid phone number format. Please use international format with + prefix.",
          });
        }

        // Rate limit: 5 attempts per minute per phone
        const ip =
          context.request.headers.get("x-forwarded-for") ||
          context.request.headers.get("cf-connecting-ip") ||
          "unknown";
        const rateKey = `${sanitizedPhone}:${ip}`;
        if (!checkRateLimit(rateKey, 5, 60 * 1000)) {
          throw new ActionError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many attempts. Please try again later.",
          });
        }

        // Send passwordless SMS with code
        await authClient.passwordless.sendSMS(
          {
            phone_number: sanitizedPhone,
          },
          {
            timeoutInSeconds: 10, // Reduce timeout to 10s to fail faster
          },
        );

        return { success: true, message: "Login code sent via SMS" };
      } catch (error: unknown) {
        if (error instanceof ActionError) {
          throw error;
        }

        console.error("Passwordless SMS login error:", error);

        // Handle specific Auth0 errors
        let errorMessage = "Failed to send login SMS";
        let errorCode: "INTERNAL_SERVER_ERROR" | "SERVICE_UNAVAILABLE" =
          "INTERNAL_SERVER_ERROR";

        if (error instanceof Error) {
          // Check for timeout errors
          if (
            error.message.includes("timeout") ||
            error.message.includes("timed out") ||
            error.name === "TimeoutError"
          ) {
            errorMessage =
              "SMS service is currently unavailable. Please try email login instead or contact support.";
            errorCode = "SERVICE_UNAVAILABLE";
          } else if (error.message) {
            errorMessage = error.message;
          }
        } else if (typeof error === "object" && error && "response" in error) {
          const err = error as {
            response?: { data?: { error_description?: string } };
          };
          if (err.response?.data?.error_description) {
            errorMessage = err.response.data.error_description;
          }
        }

        throw new ActionError({
          code: errorCode,
          message: errorMessage,
        });
      }
    },
  }),

  toggleFavorite: defineAction({
    input: ToggleFavoriteSchema,
    handler: async (input: { optionId: string }, context) => {
      try {
        // Get the user session to access the access token
        const session = await getSession(context);

        if (!session) {
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to perform this action.",
          });
        }

        const { optionId } = input;

        let currentSession = session;

        // First, get the current option to know its current favorite status
        let getResponse: Response;

        try {
          getResponse = await fetch(
            `${API_URL}/api/v1/clients/me/options/${optionId}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            },
          );
        } catch (error) {
          const authResult = await handleAuthError(
            error as Error,
            context,
            session.refreshToken,
          );

          if (authResult.shouldRetry && authResult.newTokens) {
            // Update session
            const updatedSession = {
              ...session,
              accessToken: authResult.newTokens.accessToken,
              refreshToken: authResult.newTokens.refreshToken,
              expiresIn: authResult.newTokens.expiresIn,
            };
            setSession(context as APIContext, updatedSession);
            currentSession = updatedSession;

            // Retry
            getResponse = await fetch(
              `${API_URL}/api/v1/clients/me/options/${optionId}`,
              {
                headers: {
                  Authorization: `Bearer ${updatedSession.accessToken}`,
                },
              },
            );
          } else if (authResult.shouldRedirect) {
            throw new ActionError({
              code: "UNAUTHORIZED",
              message: "Session expired. Please log in again.",
            });
          } else {
            throw error;
          }
        }

        if (!getResponse.ok) {
          if (getResponse.status === 401) {
            throw new ActionError({
              code: "UNAUTHORIZED",
              message: "Session expired. Please log in again.",
            });
          }
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Option not found.",
          });
        }

        const option = await getResponse.json();
        const newFavorited = !option.favorited;

        // Now toggle the favorite status
        let patchResponse: Response;

        try {
          patchResponse = await fetch(
            `${API_URL}/api/v1/clients/me/options/${optionId}/favorite`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${currentSession.accessToken}`,
              },
              body: JSON.stringify({ favorited: newFavorited }),
            },
          );
        } catch (error) {
          const authResult = await handleAuthError(
            error as Error,
            context,
            currentSession.refreshToken,
          );

          if (authResult.shouldRetry && authResult.newTokens) {
            // Update session
            const updatedSession = {
              ...currentSession,
              accessToken: authResult.newTokens.accessToken,
              refreshToken: authResult.newTokens.refreshToken,
              expiresIn: authResult.newTokens.expiresIn,
            };
            setSession(context as APIContext, updatedSession);
            currentSession = updatedSession;

            // Retry
            patchResponse = await fetch(
              `${API_URL}/api/v1/clients/me/options/${optionId}/favorite`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${updatedSession.accessToken}`,
                },
                body: JSON.stringify({ favorited: newFavorited }),
              },
            );
          } else if (authResult.shouldRedirect) {
            throw new ActionError({
              code: "UNAUTHORIZED",
              message: "Session expired. Please log in again.",
            });
          } else {
            throw error;
          }
        }

        if (!patchResponse.ok) {
          if (patchResponse.status === 401) {
            throw new ActionError({
              code: "UNAUTHORIZED",
              message: "Session expired. Please log in again.",
            });
          }
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Failed to update favorite status.",
          });
        }

        return { favorited: newFavorited };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }

        console.error("Error toggling favorite:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while updating favorite status.",
        });
      }
    },
  }),

  submitFeedback: defineAction({
    input: SubmitFeedbackSchema,
    handler: async (input: { optionId: string; feedback: string }, context) => {
      try {
        // Get the user session to access the access token
        const session = await getSession(context);

        if (!session) {
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to perform this action.",
          });
        }

        const { optionId, feedback } = input;

        let currentSession = session;

        let patchResponse: Response;

        try {
          patchResponse = await fetch(
            `${API_URL}/api/v1/clients/me/options/${optionId}/feedback`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${currentSession.accessToken}`,
              },
              body: JSON.stringify({ feedback }),
            },
          );
        } catch (error) {
          const authResult = await handleAuthError(
            error as Error,
            context,
            currentSession.refreshToken,
          );

          if (authResult.shouldRetry && authResult.newTokens) {
            // Update session
            const updatedSession = {
              ...currentSession,
              accessToken: authResult.newTokens.accessToken,
              refreshToken: authResult.newTokens.refreshToken,
              expiresIn: authResult.newTokens.expiresIn,
            };
            setSession(context as APIContext, updatedSession);
            currentSession = updatedSession;

            // Retry
            patchResponse = await fetch(
              `${API_URL}/api/v1/clients/me/options/${optionId}/feedback`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${updatedSession.accessToken}`,
                },
                body: JSON.stringify({ feedback }),
              },
            );
          } else if (authResult.shouldRedirect) {
            throw new ActionError({
              code: "UNAUTHORIZED",
              message: "Session expired. Please log in again.",
            });
          } else {
            throw error;
          }
        }

        if (!patchResponse.ok) {
          if (patchResponse.status === 401) {
            throw new ActionError({
              code: "UNAUTHORIZED",
              message: "Session expired. Please log in again.",
            });
          }
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Failed to submit feedback.",
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        });
      }
    },
  }),
};
