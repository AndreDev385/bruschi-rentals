import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputComponentProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  required?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  disabled?: boolean;
  className?: string;
  /**
   * When true, the country selector is hidden and the input is locked to
   * the US (+1) country code. Use this for surfaces that must only accept
   * US/NANP numbers (e.g. the public client-registration form).
   */
  forceUS?: boolean;
}

export function PhoneInputComponent({
  name,
  value,
  defaultValue,
  onChange,
  required,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  disabled,
  className,
  forceUS = false,
}: PhoneInputComponentProps) {
  return (
    <div className={cn("w-full", className)}>
      <PhoneInput
        value={value || defaultValue || ""}
        onChange={onChange}
        defaultCountry="us"
        hideDropdown={forceUS}
        disableCountryGuess={forceUS}
        inputProps={{
          name,
          required,
          "aria-invalid": ariaInvalid,
          "aria-describedby": ariaDescribedBy,
          disabled,
        }}
        inputClassName={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-white dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-soft-light px-4 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-s focus:shadow-m",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        )}
      />
    </div>
  );
}
