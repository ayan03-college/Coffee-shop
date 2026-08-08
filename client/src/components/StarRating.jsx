import { Star } from 'lucide-react';

export default function StarRating({ rating, onChange, size = 18, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(star)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star
            size={size}
            className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-coffee-latte'}
          />
        </button>
      ))}
    </div>
  );
}
