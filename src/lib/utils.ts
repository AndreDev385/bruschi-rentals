import { snakeCase } from "change-case";
import { type ClassValue, clsx } from "clsx";
import { createContext, useContext } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function toSnakeCase(str: string): string {
	return snakeCase(str);
}

export function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) => {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => func(...args), wait);
	};
}

// Context for step completion tracking without formData re-renders
interface StepCompletionContextType {
	completedSteps: Set<number>;
	setStepCompleted: (stepId: number, completed: boolean) => void;
}

export const StepCompletionContext =
	createContext<StepCompletionContextType | null>(null);

export function useStepCompletion() {
	const context = useContext(StepCompletionContext);
	if (!context) {
		throw new Error(
			"useStepCompletion must be used within a StepCompletionProvider",
		);
	}
	return context;
}

/**
 * Sanitizes a phone number by removing all non-digit characters except the leading +
 * and validates E.164 format: +[1-9]\d{1,14}$
 *
 * @param phone - The phone number to sanitize
 * @returns The sanitized phone number in E.164 format
 * @throws Error if the phone number is invalid
 */
export function sanitizePhoneNumber(phone: string): string {
	if (!phone) {
		throw new Error("Phone number is required");
	}

	// Trim whitespace
	const trimmed = phone.trim();

	// Phone must start with +
	if (!trimmed.startsWith("+")) {
		throw new Error("Phone number must start with +");
	}

	// Remove all characters except digits and the leading +
	const sanitized = `+${trimmed.slice(1).replace(/\D/g, "")}`;

	// Validate E.164 format: +[1-9]\d{1,14}$
	const e164Regex = /^\+[1-9]\d{1,14}$/;
	if (!e164Regex.test(sanitized)) {
		throw new Error("Invalid phone number format (E.164 required)");
	}

	return sanitized;
}
