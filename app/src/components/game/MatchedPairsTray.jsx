import React from 'react';
import { GAME_CONSTANTS } from '../../constants/gameConfig.js';

/**
 * @file MatchedPairsTray.jsx
 * @description Bandeja inferior 1:1 (#pie.sup_inf) superpuesta sobre las 18 casillas amarillas
 * (9 columnas x 2 filas) ilustradas en la parte inferior del fondo del mercado.
 */
export default function MatchedPairsTray({ matchedPairs = [] }) {
  const totalSlots = GAME_CONSTANTS.CARDS_PER_LEVEL;

  return (
    <footer
      id="pie"
      aria-label="Paires résolues"
      className="sup_inf absolute top-[81%] left-[2.5%] w-[96%] h-[16%] text-center box-border z-10 pointer-events-none"
    >
      {Array.from({ length: totalSlots }).map((_, idx) => {
        const pair = matchedPairs[idx];

        return (
          <div
            key={pair ? `pair-${pair.verbId}-${idx}` : `empty-${idx}`}
            data-testid={`tray-slot-${idx}`}
            className="espacioCartasAcomodadas inline-block align-top relative w-[10.1%] h-[86%] mr-[0.85%] mt-[0.2%] text-center font-handlee font-bold text-black text-[clamp(0.62rem,0.95vw,1.1rem)] leading-tight"
          >
            {/* Fila superior (#aEsp0..8) sobre la casilla amarilla superior */}
            <div
              id={`aEsp${idx}`}
              className="w-full h-[47%] flex items-center justify-center px-0.5 overflow-hidden"
            >
              <span className="truncate">{pair ? pair.leftText : '.'}</span>
            </div>

            {/* Fila inferior (#aIng0..8) sobre la casilla amarilla inferior */}
            <div
              id={`aIng${idx}`}
              className="w-full h-[47%] mt-[4%] flex items-center justify-center px-0.5 overflow-hidden"
            >
              <span className="truncate">{pair ? pair.rightText : '.'}</span>
            </div>
          </div>
        );
      })}
    </footer>
  );
}
