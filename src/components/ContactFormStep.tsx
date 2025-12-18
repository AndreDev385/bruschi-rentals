import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormData, Neighborhood } from "@/types";
import { Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useStepCompletion } from "@/lib/utils";

interface ContactFormStepProps {
  onComplete: (data: {
    name: string;
    email: string;
    phoneNumber: string;
    tourType: "OnSite" | "Virtual";
    notes?: string;
  }) => void;
  formData: FormData;
  neighborhoods?: Neighborhood[];
}

const ContactFormStep: React.FC<ContactFormStepProps> = ({ onComplete }) => {
  const { setStepCompleted } = useStepCompletion();
  const [formValues, setFormValues] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
    tourType: "OnSite" | "Virtual" | "";
    notes: string;
  }>({
    name: "",
    email: "",
    phoneNumber: "",
    tourType: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNotes, setShowNotes] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formValues.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formValues.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formValues.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formValues.tourType) {
      newErrors.tourType = "Please select a tour type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formValues]);

  const isFormValid = useCallback(() => {
    return (
      formValues.name.trim() &&
      formValues.email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email) &&
      formValues.phoneNumber.trim() &&
      formValues.tourType
    );
  }, [formValues]);

  // Auto-complete when form becomes valid
  useEffect(() => {
    const isValid = isFormValid();
    if (isValid && !isCompleted) {
      onComplete({
        name: formValues.name,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        tourType: formValues.tourType as "OnSite" | "Virtual",
        notes: formValues.notes || undefined,
      });
      setIsCompleted(true);
      setStepCompleted(5, true); // ContactFormStep is step 5
    } else if (!isValid && isCompleted) {
      setIsCompleted(false);
      setStepCompleted(5, false);
    }
  }, [formValues, isCompleted, onComplete, setStepCompleted, isFormValid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onComplete({
        name: formValues.name,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        tourType: formValues.tourType as "OnSite" | "Virtual",
        notes: formValues.notes || undefined,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-obsidian mb-2">
          Almost there! Tell us how to reach you
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-obsidian">
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={formValues.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-obsidian">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formValues.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={errors.email ? "border-red-500" : ""}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phoneNumber" className="text-obsidian">
            Phone Number *
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formValues.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            className={errors.phoneNumber ? "border-red-500" : ""}
            placeholder="(555) 123-4567"
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        <fieldset>
          <legend className="text-obsidian font-medium mb-4">
            Tour Type *
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <label
              htmlFor="tourType-onsite"
              className={`shadow-m shadow-m hover:shadow-l hover:scale-105 rounded-lg p-4 text-center transition-all cursor-pointer ${formValues.tourType === "OnSite" ? "bg-primary/10" : "bg-soft-light"}`}
            >
              <input
                id="tourType-onsite"
                type="radio"
                name="tourType"
                value="OnSite"
                checked={formValues.tourType === "OnSite"}
                onChange={(e) => handleInputChange("tourType", e.target.value)}
                className="sr-only"
              />
              {formValues.tourType === "OnSite" ? (
                <div className="top-0 right-0 size-4 bg-primary rounded-full mx-auto mb-2" />
              ) : (
                <div className="top-0 right-0 size-4 border-2 border-gray-300 rounded-full mx-auto mb-2" />
              )}
              <div className="flex justify-center mb-2">
                <img
                  src="/icons8-location-100.png"
                  alt=""
                  className="size-24"
                />
              </div>
              <p className="text-mocha font-medium">On site tour</p>
            </label>
            <label
              htmlFor="tourType-virtual"
              className={`shadow-m shadow-m hover:shadow-l hover:scale-105 rounded-lg p-4 text-center transition-all cursor-pointer ${formValues.tourType === "Virtual" ? "bg-primary/10" : "bg-soft-light"}`}
            >
              <input
                id="tourType-virtual"
                type="radio"
                name="tourType"
                value="Virtual"
                checked={formValues.tourType === "Virtual"}
                onChange={(e) => handleInputChange("tourType", e.target.value)}
                className="sr-only"
              />
              {formValues.tourType === "Virtual" ? (
                <div className="top-0 right-0 size-4 bg-primary rounded-full mx-auto mb-2" />
              ) : (
                <div className="top-0 right-0 size-4 border-2 border-gray-300 rounded-full mx-auto mb-2" />
              )}
              <div className="flex justify-center mb-2">
                <img src="/icons8-camera-100.png" alt="" className="size-24" />
              </div>
              <p className="text-mocha font-medium">Virtual tour</p>
            </label>
          </div>
          {errors.tourType && (
            <p className="text-sm text-red-500 mt-1">{errors.tourType}</p>
          )}
        </fieldset>

        {showNotes ? (
          <div>
            <Label htmlFor="notes" className="text-obsidian">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={formValues.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any special requirements or preferences..."
              rows={3}
              className="resize-none"
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setShowNotes(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Any additional information
          </Button>
        )}
      </form>
    </div>
  );
};

export default ContactFormStep;
