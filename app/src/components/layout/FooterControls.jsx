import React from 'react';

/**
 * @file FooterControls.jsx
 * @description Barra informativa inferior de apoyo y accesibilidad del recurso educativo MEP.
 */
export default function FooterControls({ matchedCount = 0, totalPairs = 9 }) {
  return (
    <div className="w-full px-4 py-1.5 bg-slate-950/90 border-t border-white/10 text-[11px] sm:text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
        <span>
          Astuce : Glissez-déposez ou cliquez sur une carte de chaque colonne vers{' '}
          <strong className="text-amber-300">Sujet</strong>.
        </span>
      </div>
      <div className="font-bold text-amber-200">
        Paires du niveau : {matchedCount} / {totalPairs}
      </div>
    </div>
  );
}
