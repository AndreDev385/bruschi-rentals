import { PhoneInputComponent } from "@/components/ui/PhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiNoteInput } from "@/components/ui/multi-note-input";
import type { FormData, Neighborhood } from "@/types";

import { useStepCompletion } from "@/lib/utils";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useCallback, useEffect, useState } from "react";

interface ContactFormStepProps {
  onComplete: (data: {
    name: string;
    email?: string;
    phoneNumber: string;
    tourType: "OnSite" | "Virtual";
    notes?: string[];
    termsAccepted: boolean;
  }) => void;
  formData: FormData;
  neighborhoods?: Neighborhood[];
}

const ContactFormStep: React.FC<ContactFormStepProps> = ({
  onComplete,
  formData,
}) => {
  const { setStepCompleted } = useStepCompletion();
  const [formValues, setFormValues] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
    tourType: "OnSite" | "Virtual" | "";
    notes: string[];
    termsAccepted: boolean;
  }>({
    name: formData.name || "",
    email: formData.email || "",
    phoneNumber: formData.phoneNumber || "",
    tourType: (formData.tourType as "OnSite" | "Virtual") || "",
    notes: formData.notes || [],
    termsAccepted: formData.termsAccepted || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isCompleted, setIsCompleted] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formValues.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email is optional, but validate format if provided
    if (
      formValues.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)
    ) {
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

    if (!formValues.termsAccepted) {
      newErrors.termsAccepted =
        "You must accept the terms of service to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formValues]);

  const isFormValid = useCallback(() => {
    // Email is optional, but if provided must be valid
    const emailValid =
      !formValues.email.trim() ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email);

    return (
      formValues.name.trim() &&
      emailValid &&
      formValues.phoneNumber.trim() &&
      isValidPhoneNumber(formValues.phoneNumber) &&
      formValues.tourType &&
      formValues.termsAccepted
    );
  }, [formValues]);

  // Auto-complete when form becomes valid
  useEffect(() => {
    const isValid = isFormValid();
    if (isValid && !isCompleted) {
      onComplete({
        name: formValues.name,
        email: formValues.email || "",
        phoneNumber: formValues.phoneNumber,
        tourType: formValues.tourType as "OnSite" | "Virtual",
        notes: formValues.notes.length > 0 ? formValues.notes : undefined,
        termsAccepted: formValues.termsAccepted,
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
        email: formValues.email || "",
        phoneNumber: formValues.phoneNumber,
        tourType: formValues.tourType as "OnSite" | "Virtual",
        notes: formValues.notes.length > 0 ? formValues.notes : undefined,
        termsAccepted: formValues.termsAccepted,
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    const sanitizedValue =
      field === "email" && typeof value === "string"
        ? value.trim().toLowerCase()
        : value;
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
              required
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
              placeholder="Email Address"
              required
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
              className={`shadow-m hover:shadow-l hover:scale-105 rounded-lg p-4 text-center transition-all cursor-pointer ${formValues.tourType === "OnSite" ? "bg-primary/10" : "bg-soft-light"}`}
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
              <p className="text-mocha font-medium">In person tour</p>
            </label>
            <label
              htmlFor="tourType-virtual"
              className={`shadow-m hover:shadow-l hover:scale-105 rounded-lg p-4 text-center transition-all cursor-pointer ${formValues.tourType === "Virtual" ? "bg-primary/10" : "bg-soft-light"}`}
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
          placeholder="Describe your perfect apartment (optional)"
          onNotesChange={(notes) =>
            setFormValues((prev) => ({ ...prev, notes }))
          }
        />

        <div className="flex items-start space-x-3">
          <input
            id="termsAccepted"
            type="checkbox"
            checked={formValues.termsAccepted}
            onChange={(e) =>
              handleInputChange("termsAccepted", e.target.checked)
            }
            className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="termsAccepted" className="text-sm text-obsidian">
            I agree to the{" "}
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline"
            >
              Privacy Policy
            </a>
            {
              ", including consent to receive SMS messages for authentication codes AND rental recommendations."
            }
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2 ml-7">
          By submitting this form, you consent to receive SMS messages including
          authentication codes AND rental recommendations. Message and data
          rates may apply. Reply STOP to opt-out of recommendation messages
          (authentication codes will still be sent)
        </p>
        {errors.termsAccepted && (
          <p className="text-sm text-red-500 mt-1">{errors.termsAccepted}</p>
        )}
      </form>
    </div>
  );
};

export default ContactFormStep;
