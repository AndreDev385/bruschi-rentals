import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";

import { Button } from "@/components/ui/button";
import { PhoneInputComponent } from "@/components/ui/PhoneInput";

interface PhoneNumberPromptProps {
  onSubmit: (phoneNumber: string) => Promise<void>;
  email: string;
}

export const PhoneNumberPrompt: React.FC<PhoneNumberPromptProps> = ({
  onSubmit,
  email,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(phoneNumber);
      toast.success("Phone number added successfully!");
    } catch (error) {
      console.error("Failed to add phone number:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add phone number. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-soft rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-obsidian mb-4">
          Add Your Phone Number
        </h2>
        <p className="text-mocha mb-6">
          We've updated our system to use phone number authentication. Please
          add your phone number to continue accessing your account.
        </p>
        <p className="text-sm text-mocha mb-6">
          Currently logged in as: <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <PhoneInputComponent
              name="phoneNumber"
              value={phoneNumber}
              onChange={setPhoneNumber}
              required
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold"
            size="lg"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </form>

        <p className="text-xs text-mocha mt-4 text-center">
          Your phone number will be used for secure login via SMS code.
        </p>
      </div>
    </div>
  );
};
