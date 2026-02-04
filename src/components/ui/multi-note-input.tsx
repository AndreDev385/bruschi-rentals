import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface MultiNoteInputProps {
  notes: string[];
  onNotesChange: (notes: string[]) => void;
  maxNotes?: number;
  placeholder?: string;
}

export const MultiNoteInput: React.FC<MultiNoteInputProps> = ({
  notes,
  onNotesChange,
  maxNotes = 5,
  placeholder = "Add a note...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addNote = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !notes.includes(trimmed) && notes.length < maxNotes) {
      onNotesChange([...notes, trimmed]);
      setInputValue("");
    }
  };

  const removeNote = (index: number) => {
    onNotesChange(notes.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNote();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div>
      {notes.length < maxNotes && (
        <div className="flex gap-2 mb-1 items-center">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addNote}
            disabled={!inputValue.trim() || notes.includes(inputValue.trim())}
          >
            Add
          </Button>
        </div>
      )}
      <p className="text-xs text-mocha mb-2">
        {notes.length}/{maxNotes} notes. Press Enter or click Add to include.
      </p>
      <div className="flex flex-wrap gap-2 mb-2">
        {notes.map((note, index) => (
          <Badge
            key={note}
            variant="secondary"
            className="inline-flex items-center gap-1 px-2 py-1 text-sm"
          >
            <span>{note}</span>
            <button
              type="button"
              onClick={() => removeNote(index)}
              className="text-muted-foreground hover:text-foreground transition-colors ml-1"
              aria-label={`Remove note: ${note}`}
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};
