import React from 'react';

// Custom Sprint icon component
export const SprintIcon = ({ className, size = 24, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 5v14" />
      <path d="M4 5h6l4 4" />
      <path d="M14 9h6" />
      <path d="M4 19h6" />
      <path d="M10 19l4-4h6" />
    </svg>
  );
};