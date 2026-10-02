"use client";

import { useRef, useState } from "react";
import { ChevronRight, Star, X } from "lucide-react";

const LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];
const MAX_COMMENT = 500;

type RatingProps = {
  initialRating?: number;
  onSubmit?: (data: { rating: number; comment: string }) => Promise<void> | void;
};

const Rating = ({ initialRating = 0, onSubmit }: RatingProps) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  const active =  rating;

  const openModal = () => {
    setError("");
    dialogRef.current?.showModal();
  };

  const closeModal = () => dialogRef.current?.close();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await onSubmit?.({ rating, comment: comment.trim() });
      setSubmitted(true);
      setComment("");
      closeModal();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <p className="text-sm font-medium" aria-live="polite">
        Thanks for your feedback! 🎉
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p id="rating-label" className="text-sm font-medium">
        Rate Cerebre Plus
      </p>

      <div
        role="group"
        aria-labelledby="rating-label"
        className="flex items-center gap-1"
      >
        {LABELS.map((label, index) => {
          const value = index + 1;
          return (
            <button
              key={value}
              type="button"
              aria-label={`${value} ${value === 1 ? "star" : "stars"}, ${label}`}
              aria-pressed={value <= rating}
              onClick={() => setRating(value)}
              className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  value <= active
                    ? "fill-yellow-500 text-yellow-500"
                    : "fill-transparent text-muted-foreground/50"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="min-h-5 text-sm text-muted-foreground" aria-live="polite">
          {active ? LABELS[active - 1] : "Tap a star to share your experience"}
        </p>

       {LABELS[active - 1] && (<button
          type="button"
          onClick={openModal}
          disabled={rating === 0}
          aria-label="Continue and tell us why"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 disabled:pointer-events-none disabled:opacity-40"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </button>)}
      </div>

      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-md border-black/50 rounded-xl border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Tell us more</h2>
              <div className="mt-1 flex items-center gap-1 text-yellow-500">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? "fill-yellow-500" : "fill-transparent opacity-40"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {LABELS[rating - 1]}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="rounded-md p-1 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="rating-comment" className="text-sm font-medium">
              Why did you give this rating?{" "}
              <span className="font-normal text-muted-foreground"></span>
            </label>
            <textarea
              id="rating-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={MAX_COMMENT}
              rows={4}
              placeholder="What did you like, or what could be better?"
              className="resize-none rounded-md border bg-transparent p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
            />
            <span className="self-end text-xs text-muted-foreground">
              {comment.length}/{MAX_COMMENT}
            </span>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={comment.trim().length === 0 || submitting}
              className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default Rating;