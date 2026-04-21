import React from 'react';

export default function Topbar({ left, right }) {
  return (
    <header className="fixed top-0 w-full flex items-center justify-between px-8 py-4 bg-neutral-950/80 backdrop-blur-xl z-50">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center shadow-[0_0_20px_rgba(232,97,26,0.4)]">
          <span className="text-xs font-black text-black font-headline">Z</span>
        </div>
        {left}
      </div>
      {right}
      <div className="absolute bottom-0 left-0 bg-gradient-to-b from-neutral-800 to-transparent h-px w-full" />
    </header>
  );
}
