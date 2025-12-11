/**
 * Star Rating Component
 * 
 * Displays a star rating with average score and rating count.
 * Can be used in read-only mode or interactive mode for user input.
 */

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalRatings?: number;
  showYourRating?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
  userRating?: number;
}

export function StarRating({ 
  rating, 
  totalRatings, 
  showYourRating = false, 
  size = 'sm',
  interactive = false,
  onRate,
  userRating
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  const handleStarClick = (starRating: number) => {
    if (interactive && onRate) {
      onRate(starRating);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Star icons */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating) 
                ? 'fill-[#7a8a62] text-[#7a8a62]' 
                : 'fill-none text-muted-foreground/30'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            strokeWidth={1.5}
            onClick={() => handleStarClick(star)}
          />
        ))}
      </div>

      {/* Rating text */}
      <span className={`${textSize} text-foreground/70`} style={{ fontWeight: 500 }}>
        {rating.toFixed(1)}
      </span>

      {/* Rating count */}
      {totalRatings !== undefined && (
        <span className={`${textSize} text-muted-foreground`}>
          ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      )}

      {/* Your rating label */}
      {showYourRating && userRating && (
        <span className={`${textSize} text-muted-foreground`}>
          Your rating
        </span>
      )}
    </div>
  );
}
