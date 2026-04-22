import React from 'react';

export default function Topbar({ left, right }) {
  return (
    <header className="fixed top-0 w-full flex items-center justify-between px-8 py-4 bg-white/95 backdrop-blur-xl z-50 border-b border-outline-variant shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(224,96,32,0.35)]">
          <span className="text-xs font-black text-white font-headline">Z</span>
        </div>
        {left}
      </div>
      {right}
    </header>
  );
}
