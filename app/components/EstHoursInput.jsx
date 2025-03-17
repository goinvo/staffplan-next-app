import React from 'react';

// This is a wrapper component for estimated hours inputs to ensure proper styling
const EstHoursInput = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`est-hours-input ${className || ''}`}
      {...props}
    />
  );
});

EstHoursInput.displayName = 'EstHoursInput';

export default EstHoursInput;
