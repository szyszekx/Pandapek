import { Star, StarHalf } from "lucide-react";

interface RatingProps {
  value: number;
  size?: number;
}

function Rating({ value, size = 18 }: RatingProps) {
  const safeValue = Number.isFinite(value)
    ? Math.min(5, Math.max(0, value))
    : 0;

  const roundedValue = Math.round(safeValue * 2) / 2;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`${roundedValue}/5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;

        if (roundedValue >= starValue) {
          return (
            <Star
              key={index}
              size={size}
              className="fill-amber-400 text-amber-400"
            />
          );
        }

        if (roundedValue >= starValue - 0.5) {
          return (
            <span
              key={index}
              className="relative inline-flex shrink-0"
              style={{ width: size, height: size }}
            >
              <Star
                size={size}
                className="absolute inset-0 text-amber-400"
              />
              <StarHalf
                size={size}
                className="absolute inset-0 fill-amber-400 text-amber-400"
              />
            </span>
          );
        }

        return (
          <Star
            key={index}
            size={size}
            className="text-amber-400"
          />
        );
      })}
    </div>
  );
}

export default Rating;