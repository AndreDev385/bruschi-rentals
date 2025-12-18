import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { snakeCase } from "change-case";
import { createContext, useContext } from "react";

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
