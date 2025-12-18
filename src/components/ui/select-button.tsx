import { cn } from "@/lib/utils";

interface SelectButtonProps {
  isSelected: boolean;
  onClick: () => void;
  className?: string;
  value: string;
}

const SelectButton: React.FC<SelectButtonProps> = ({
  isSelected,
  onClick,
  className,
  value,
}) => {
  return (
    <button
      type="button"
      className={cn(
        "p-4 rounded-lg transition-all text-center bg-soft-light shadow-m",
        isSelected
          ? "bg-primary text-white"
          : "hover:bg-primary hover:text-white",
        className,
      )}
      onClick={onClick}
    >
      {value}
    </button>
  );
};

export { SelectButton };
