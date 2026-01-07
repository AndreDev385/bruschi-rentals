import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { actions } from "astro:actions";

interface FeedbackFormProps {
  optionId: string;
  initialFeedback: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  optionId,
  initialFeedback,
}) => {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [submitted, setSubmitted] = useState(!!initialFeedback);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await actions.submitFeedback({ optionId, feedback });
      setSubmitted(true);
      toast.success("Feedback submitted successfully!");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <h3 className="text-xl font-semibold">What do you think?</h3>
      {submitted ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your feedback: {feedback}
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Edit
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            disabled={loading}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none disabled:opacity-50"
            placeholder="Share your thoughts about this option..."
          />
          <Button type="submit" disabled={loading} className="mt-3">
            {loading && <Loader2 className="animate-spin size-4 mr-2" />}
            Submit Feedback
          </Button>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;
