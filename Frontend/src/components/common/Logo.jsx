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
      src="/cleaning-expert-logo.png"
      alt="Cleaning Expert Services"
      className={`${className} aspect-square object-cover rounded-full shadow-sm border border-gray-100`}
      {...props}
    />
  );
});

Logo.displayName = 'Logo';

export default Logo;
