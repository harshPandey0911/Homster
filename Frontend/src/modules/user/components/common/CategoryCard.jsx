import React, { useState, useRef, memo, useEffect } from 'react';
import { gsap } from 'gsap';
import { createRipple } from '../../../../utils/gsapAnimations';

import { themeColors } from '../../../../theme';

const CategoryCard = memo(({ icon, title, onClick, hasSaleBadge = false, index = 0 }) => {
  const cardRef = useRef(null);

  // Simple entrance animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          delay: index * 0.05,
          ease: 'power2.out',
        }
      );
    }
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="flex flex-col items-center justify-start cursor-pointer relative category-card-container group active:scale-95 w-full py-1"
      onClick={onClick}
      style={{
        opacity: 0, // Start hidden for GSAP
      }}
    >
      <div
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-3 relative transition-all duration-300 group-hover:scale-110"
        style={{
          background: 'rgba(37, 99, 235, 0.15)',
          border: '1px solid rgba(37, 99, 235, 0.1)'
        }}
      >
        <div className="w-[40px] h-[40px] flex items-center justify-center">
          {icon || (
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        
        {hasSaleBadge && (
          <div
            className="absolute top-0 right-0 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md z-10"
            style={{
              background: '#EF4444', // Red for sale
            }}
          >
            OFF
          </div>
        )}
      </div>
      <span
        className="text-[13px] text-center text-gray-800 font-bold leading-tight tracking-tight mt-1 transition-colors duration-300 w-full line-clamp-1 px-1"
      >
        {title}
      </span>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;

