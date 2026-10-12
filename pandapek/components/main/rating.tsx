import { Star } from "lucide-react";

function Rating({ value }: { value: number }) {
  return (
    <div className="flex gap-1" aria-label={`${value}/5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={18}
          className={
            index < value
              ? "fill-amber-400 text-amber-400"
              : "text-amber-400"
          }
        />
      ))}
    </div>
  );
}

export default Rating;