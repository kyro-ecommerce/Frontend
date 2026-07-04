import React from 'react';
import { useState, useEffect } from 'react';

// Star SVG components
const FilledStar = ({ color = "#FFD700" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
      fill={color} 
    />
  </svg>
);

const HalfStar = ({ color = "#FFD700" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M12 2L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
      fill={color} 
    />
  </svg>
);

const EmptyStar = ({ color = "#FFD700" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5"
    />
  </svg>
);

const Rating = ({ 
  value = 0, 
  max = 5, 
  precision = 1,
  name = "rating",
  readOnly = false,
  onChange,
  size = "medium",
  color = "#FFD700",
  emptyColor = "#E5E7EB",
  showLabel = true,
  labelText = "Điểm đánh giá: "
}) => {
  const [rating, setRating] = useState(value);
  const [hoverRating, setHoverRating] = useState(null);

  // Update the rating state if the value prop changes
  useEffect(() => {
    setRating(value);
  }, [value]);

  // Get size in pixels based on size prop
  const getSize = () => {
    switch(size) {
      case "small": return 16;
      case "large": return 32;
      case "medium":
      default: return 24;
    }
  };

  // Handle mouse enter event for each star
  const handleMouseEnter = (index) => {
    if (readOnly) return;
    setHoverRating(index);
  };

  // Handle mouse leave event
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(null);
  };

  // Handle click event for each star
  const handleClick = (index) => {
    if (readOnly) return;
    
    const newRating = index;
    setRating(newRating);
    
    if (onChange) {
      onChange(newRating);
    }
  };

  // Render the appropriate star based on current value
  const renderStar = (index) => {
    const starValue = index + 1;
    const displayRating = hoverRating !== null ? hoverRating : rating;
    
    // Add 1 to account for 0-based index
    if (displayRating >= starValue) {
      return <FilledStar color={color} />;
    } else if (displayRating + (1 - precision) >= starValue) {
      return <HalfStar color={color} />;
    } else {
      return <EmptyStar color={emptyColor} />;
    }
  };

  return (
    <div className="flex items-center">
      {showLabel && <span className="mr-2 font-medium">{labelText}</span>}
      <div 
        className="flex items-center" 
        style={{ cursor: readOnly ? 'default' : 'pointer' }}
        role="radiogroup"
        aria-label={name}
      >
        {[...Array(max)].map((_, index) => (
          <div 
            key={index}
            onMouseEnter={() => handleMouseEnter(index + 1)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index + 1)}
            role={readOnly ? undefined : "radio"}
            aria-checked={Math.ceil(rating) === index + 1}
            tabIndex={readOnly ? undefined : 0}
            style={{ width: getSize(), height: getSize() }}
          >
            {renderStar(index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rating;