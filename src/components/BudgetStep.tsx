import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input } from "@/components/ui/input";
import { SelectButton } from "@/components/ui/select-button";
import { Info } from "lucide-react";
import { useStepCompletion } from "@/lib/utils";
import type { FormData, Neighborhood } from "@/types";

interface BudgetStepProps {
  onComplete: (data: { budget: number; autoAdvance?: boolean }) => void;
  formData: FormData;
  neighborhoods?: Neighborhood[];
  priceRange?: { min: number; max: number; available: boolean } | null;
  isLoadingPriceRange?: boolean;
}

export interface BudgetStepRef {
  getBudget: () => number | null;
}

const BudgetStep = forwardRef<BudgetStepRef, BudgetStepProps>(
  (
    { onComplete, formData, neighborhoods, priceRange, isLoadingPriceRange },
    ref,
  ) => {
    const [customError, setCustomError] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { setStepCompleted } = useStepCompletion();

    // Expose getBudget method to parent
    useImperativeHandle(
      ref,
      () => ({
        getBudget: () => {
          const value = inputRef.current?.value || "";
          const numValue = Number.parseInt(value);
          return Number.isNaN(numValue) ? null : numValue;
        },
      }),
      [],
    );

    const budgetOptions = useMemo(() => {
      if (!priceRange) return [];
      const options: number[] = [priceRange.min];
      let current = priceRange.min + 500;
      while (current < priceRange.max && options.length < 5) {
        options.push(current);
        current += 500;
      }
      if (options[options.length - 1] !== priceRange.max) {
        options.push(priceRange.max);
      }
      return options;
    }, [priceRange]);

    useEffect(() => {
      // Set initial value for uncontrolled input
      if (
        inputRef.current &&
        priceRange &&
        formData.budget &&
        !budgetOptions.includes(formData.budget)
      ) {
        inputRef.current.value = formData.budget.toString();
      }
    }, [priceRange, formData.budget, budgetOptions]);

    const getReadableType = useCallback((type: string) => {
      switch (type) {
        case "Studio":
          return "studio";
        case "OneBed":
          return "1 bedroom apartment";
        case "TwoBeds":
          return "2 bedroom apartment";
        case "ThreeOrMoreBeds":
          return "3+ bedroom apartment";
        default:
          return type;
      }
    }, []);

    const getNeighborhoodName = useCallback(() => {
      if (!neighborhoods || !formData.neighborhoodId) return "";
      const neighborhood = neighborhoods.find(
        (n) => n.id === formData.neighborhoodId,
      );
      return neighborhood ? neighborhood.name : "";
    }, [neighborhoods, formData.neighborhoodId]);

    const handleCardClick = (budget: number) => {
      onComplete({ budget, autoAdvance: true });
      setStepCompleted(3, true);
    };

    // Check validity and update completion status immediately
    const checkValidity = useCallback(() => {
      const value = inputRef.current?.value || "";
      const numValue = Number.parseInt(value);

      if (
        !Number.isNaN(numValue) &&
        priceRange &&
        numValue >= priceRange.min &&
        numValue <= priceRange.max
      ) {
        return true;
      }
      return false;
    }, [priceRange]);

    // Update completion status when input changes
    const handleCustomChange = useCallback(() => {
      const isValid = checkValidity();
      setStepCompleted(3, isValid); // Budget step is step 3
    }, [checkValidity, setStepCompleted]);

    const handleCustomBlur = useCallback(() => {
      const value = inputRef.current?.value || "";
      const numValue = Number.parseInt(value);

      if (!Number.isNaN(numValue) && priceRange) {
        if (numValue < priceRange.min) {
          const type = getReadableType(formData.apartmentType || "");
          const neighborhood = getNeighborhoodName();
          setCustomError(
            `Most properties in ${neighborhood} for a ${type} start at $${priceRange.min}. If that doesn't fit your budget, we might not be the best option.`,
          );
          setStepCompleted(3, false);
        } else if (numValue > priceRange.max) {
          setCustomError(
            `We currently don't have options above $${priceRange.max}. Please select a lower budget or contact us for more options.`,
          );
          setStepCompleted(3, false);
        } else {
          setCustomError("");
          setStepCompleted(3, true);
        }
      } else if (value.trim() && Number.isNaN(numValue)) {
        setCustomError("Please enter a valid number.");
        setStepCompleted(3, false);
      } else {
        setCustomError("");
        setStepCompleted(3, false);
      }
    }, [
      priceRange,
      formData.apartmentType,
      getReadableType,
      getNeighborhoodName,
      setStepCompleted,
    ]);

    if (isLoadingPriceRange) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-obsidian mb-2">
              What's your monthly budget?
            </h3>
            <p className="text-mocha">Loading available budgets...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      );
    }

    if (priceRange && !priceRange.available) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-obsidian mb-2">
              What's your monthly budget?
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-auto max-w-md">
              <p className="text-yellow-800 font-medium">
                There are no options available for those preferences at the
                moment.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!priceRange) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-obsidian mb-2">
              What's your monthly budget?
            </h3>
            <p className="text-mocha">Unable to load budget options.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-obsidian mb-2">
            What's your monthly budget?
          </h3>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
          {budgetOptions.map((budget) => (
            <SelectButton
              key={budget}
              isSelected={formData.budget === budget}
              onClick={() => handleCardClick(budget)}
              value={`$${budget}`}
            />
          ))}
        </div>

        <div className="text-center">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mocha font-medium">
                $
              </span>
              <Input
                ref={inputRef}
                type="number"
                placeholder="Or type it here"
                min={priceRange.min}
                step="50"
                defaultValue={
                  formData.budget && !budgetOptions.includes(formData.budget)
                    ? formData.budget.toString()
                    : ""
                }
                onChange={handleCustomChange}
                onBlur={handleCustomBlur}
                className={`pl-8 ${customError ? "border-red-500" : ""}`}
              />
            </div>
            {customError && (
              <p className="text-sm text-red-500 mt-2">{customError}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-auto max-w-md mt-4">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Keep in mind that most buildings require proof of income that is
                3x the monthly rent total.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

BudgetStep.displayName = "BudgetStep";

export default BudgetStep;
