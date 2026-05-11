import React, { forwardRef } from 'react';

/**
 * Centralized Logo Component
 * Usage: <Logo className="h-8 w-auto" />
 * Supports ref for animations
 */
const Logo = forwardRef(({ className = "h-8 w-auto", ...props }, ref) => {
  return (
    <img
      ref={ref}
      src="/nexora-go-logo.png"
      alt="Nexora Go"
      className={`${className} object-cover rounded-full overflow-hidden border border-gray-100`}
      {...props}
      onError={(e) => {
        // Fallback to a stable placeholder if the custom one fails
        e.target.src = "https://img.icons8.com/color/96/n.png";
      }}
    />
  );
});

Logo.displayName = 'Logo';

export default Logo;
