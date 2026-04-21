import React from 'react';

export default function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin-loader ${className}`}
    />
  );
}
