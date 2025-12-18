import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Loader2 } from "lucide-react";
import NeighborhoodStep from "./NeighborhoodStep";
import ApartmentTypeStep from "./ApartmentTypeStep";
import BudgetStep from "./BudgetStep";
import type { BudgetStepRef } from "./BudgetStep";
import DatePickerStep from "./DatePickerStep";
import ContactFormStep from "./ContactFormStep";
import { fetchPriceRange } from "@/utils/api";
import { StepCompletionContext } from "@/lib/utils";
import type { FormData, Neighborhood } from "@/types";

const steps = [
  { id: 1, component: NeighborhoodStep, title: "Choose Neighborhood" },
  { id: 2, component: ApartmentTypeStep, title: "Apartment Type" },
  { id: 3, component: BudgetStep, title: "Budget" },
  { id: 4, component: DatePickerStep, title: "Move-in Date" },
  { id: 5, component: ContactFormStep, title: "Contact Information" },
];

export const FormWizard: React.FC<{ neighborhoods: Neighborhood[] }> = ({
  neighborhoods,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [origin, setOrigin] = useState<string>("Organic");
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number;
    available: boolean;
  } | null>(null);
  const [isLoadingPriceRange, setIsLoadingPriceRange] = useState(false);
  const budgetStepRef = useRef<BudgetStepRef>(null);

  // Context for step completion tracking without formData re-renders
  const setStepCompleted = useCallback((stepId: number, completed: boolean) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (completed) {
        newSet.add(stepId);
      } else {
        newSet.delete(stepId);
      }
      return newSet;
    });
  }, []);

  const stepCompletionContextValue = {
    completedSteps,
    setStepCompleted,
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read origin from URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const originParam = urlParams.get("origin");
    if (originParam) {
      setOrigin(originParam);
    }
  }, []);

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const fetchPriceRangeForBudget = async (
    neighborhoodId?: string,
    apartmentType?: string,
  ) => {
    const nid = neighborhoodId || formData.neighborhoodId;
    const atype = apartmentType || formData.apartmentType;
    if (!nid || !atype) return;
    setIsLoadingPriceRange(true);
    setPriceRange(null);
    try {
      const range = await fetchPriceRange(nid, atype);
      setPriceRange({
        min: range.min_from,
        max: range.max_to,
        available: range.available,
      });
    } catch (error) {
      setPriceRange(null);
    } finally {
      setIsLoadingPriceRange(false);
    }
  };

  const handleStepComplete = (
    stepId: number,
    data: Partial<FormData> & { autoAdvance?: boolean },
  ) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);
    setCompletedSteps((prev) => new Set(prev).add(stepId));

    // Fetch price range only when ApartmentTypeStep (step 2) is completed
    if (
      stepId === 2 &&
      newFormData.neighborhoodId &&
      newFormData.apartmentType
    ) {
      fetchPriceRangeForBudget(
        newFormData.neighborhoodId,
        newFormData.apartmentType,
      );
    }

    // Auto-advance unless explicitly disabled
    const shouldAutoAdvance = data.autoAdvance !== false;
    if (stepId < 5 && stepId !== 4 && shouldAutoAdvance) {
      setCurrentStep(stepId + 1);
    }
  };

  const handleNext = () => {
    // Extract budget from ref if on step 3
    const additionalData: Partial<FormData> = {};
    if (currentStep === 3) {
      const budget = budgetStepRef.current?.getBudget();
      if (budget !== null) {
        additionalData.budget = budget;
      }
    }

    if (currentStep < totalSteps) {
      // Sync data before advancing
      handleStepComplete(currentStep, additionalData);
      setCurrentStep(currentStep + 1);
    } else {
      // For submit, ensure data is synced
      handleStepComplete(currentStep, additionalData);
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, origin }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Your information has been sent successfully!");
        // Redirect to landing page after successful submission
        setTimeout(() => {
          window.location.href = "/";
        }, 2000); // Small delay to let user see the success message
      } else {
        if (data.error === "EMAIL_EXISTS") {
          toast.error("You're already registered! Please proceed to login.");
        } else {
          toast.error("Failed to submit preferences.");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <StepCompletionContext.Provider value={stepCompletionContextValue}>
      <div className="bg-soft rounded-2xl shadow-l p-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-obsidian">
              Step {currentStep} of {totalSteps}
            </h2>
            <div className="text-sm text-mocha">
              {steps[currentStep - 1].title}
            </div>
          </div>
          <div className="w-full bg-soft-dark shadow-hole rounded-full p-2">
            <div
              className="bg-primary h-3 shadow-s rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form steps */}
        <div className="mb-8">
          <CurrentStepComponent
            ref={currentStep === 3 ? budgetStepRef : undefined}
            onComplete={(data: Partial<FormData>) =>
              handleStepComplete(currentStep, data)
            }
            formData={formData}
            {...(currentStep === 1 ? { neighborhoods } : {})}
            {...(currentStep === 3
              ? {
                  priceRange,
                  isLoadingPriceRange,
                  neighborhoods,
                }
              : {})}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            variant="default"
            disabled={!completedSteps.has(currentStep) || isSubmitting}
          >
            {currentStep === totalSteps && isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {currentStep === totalSteps && isSubmitting
              ? "Submitting..."
              : currentStep === totalSteps
                ? "Submit"
                : "Next"}
          </Button>
        </div>

        <Toaster position="top-center" richColors />
      </div>
    </StepCompletionContext.Provider>
  );
};
