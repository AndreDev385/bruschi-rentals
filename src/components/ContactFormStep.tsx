import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInputComponent } from "@/components/ui/PhoneInput";
import { MultiNoteInput } from "@/components/ui/multi-note-input";
import type { FormData, Neighborhood } from "@/types";

import { useState, useEffect, useCallback } from "react";
import { useStepCompletion } from "@/lib/utils";
import { isValidPhoneNumber } from "libphonenumber-js";

interface ContactFormStepProps {
  onComplete: (data: {
    name: string;
    email: string;
    phoneNumber: string;
    tourType: "OnSite" | "Virtual";
    notes?: string[];
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
    notes: string[];
  }>({
    name: "",
    email: "",
    phoneNumber: "",
    tourType: "",
    notes: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    } else if (!isValidPhoneNumber(formValues.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
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
      isValidPhoneNumber(formValues.phoneNumber) &&
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
        notes: formValues.notes.length > 0 ? formValues.notes : undefined,
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
        notes: formValues.notes.length > 0 ? formValues.notes : undefined,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue =
      field === "email" ? value.trim().toLowerCase() : value.trim();
    setFormValues((prev) => ({ ...prev, [field]: sanitizedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-obsidian mb-4">
          How can we reach you?
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">
            <Input
              id="name"
              type="text"
              value={formValues.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
              placeholder="Your Full Name *"
            />
          </Label>
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">
            <Input
              id="email"
              type="email"
              value={formValues.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
              placeholder="Email Address *"
            />
          </Label>
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <PhoneInputComponent
            name="phoneNumber"
            value={formValues.phoneNumber}
            onChange={(value) => handleInputChange("phoneNumber", value)}
            required
            aria-invalid={!!errors.phoneNumber}
            aria-describedby={errors.phoneNumber ? "phone-error" : undefined}
          />
          {errors.phoneNumber && (
            <p id="phone-error" className="text-sm text-red-500 mt-1">
              {errors.phoneNumber}
            </p>
          )}
        </div>

        <fieldset>
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
                <div className="top-0 left-0 size-4 bg-primary shadow-hole rounded-full relative" />
              ) : (
                <div className="top-0 left-0 size-4 bg-soft-dark shadow-hole rounded-full relative" />
              )}
              <div className="flex justify-center">
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
                <div className="top-0 left-0 size-4 bg-primary shadow-hole rounded-full relative" />
              ) : (
                <div className="top-0 left-0 size-4 bg-soft-dark shadow-hole rounded-full relative" />
              )}
              <div className="flex justify-center">
                <img src="/icons8-camera-100.png" alt="" className="size-24" />
              </div>
              <p className="text-mocha font-medium">Virtual tour</p>
            </label>
          </div>
          {errors.tourType && (
            <p className="text-sm text-red-500 mt-1">{errors.tourType}</p>
          )}
        </fieldset>

        <MultiNoteInput
          notes={formValues.notes}
          onNotesChange={(notes) =>
            setFormValues((prev) => ({ ...prev, notes }))
          }
        />
      </form>
    </div>
  );
};

export default ContactFormStep;
