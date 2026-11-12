import React, { useState, useEffect } from 'react';
import {
  MODALITY,
  GRAMMAR_MODES,
  GAME_CONSTANTS,
} from '../../constants/gameConfig.js';

const MODE_LEFT_CLASSES = {
  1: 'left-[15%]',
  2: 'left-[40%]',
  3: 'left-[65%]',
};

/**
 * @file MenuModal.jsx
 * @description Modal selector de las 3 opciones del menú principal ("Le marché aux verbes" - MEP).
 * Reproduce con fidelidad visual 1:1 el diseño original (`#divMenu` sobre `./img/fondo_menu.jpg`),
 * obligando a seleccionar primero la modalidad (Formation o Compétition) antes de desbloquear
 * los 3 modos gramaticales (`#opt1`, `#opt2`, `#opt3`).
 */
export default function MenuModal({
  isOpen,
  canCloseMenu,
  modality,
  grammarMode,
  isModeSelectionUnlocked,
  onSelectModality,
  onStartGame,
  onCloseMenu,
}) {
  const [hoveredMode, setHoveredMode] = useState(null);

  useEffect(() => {
    if (!isOpen || !canCloseMenu) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && onCloseMenu) {
        onCloseMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canCloseMenu, onCloseMenu]);

  if (!isOpen) return null;

  const isFormation = modality === MODALITY.FORMATION;
  const isCompetition = modality === MODALITY.COMPETITION;

  return (
    <div
      id="divMenu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu principal"
      style={{ zIndex: 2000 }}
      onClick={(e) => {
        if (canCloseMenu && e.target === e.currentTarget && onCloseMenu) {
          onCloseMenu();
        }
      }}
      className="fixed inset-0 z-[2000] flex items-start justify-center bg-black/50 overflow-y-auto animate-modalBackdropFade"
    >
      <div
        data-testid="modal-dialog-box"
        className="relative w-[90%] mx-auto mt-[1%] rounded-[15px] shadow-2xl select-none overflow-hidden animate-modalSlideDown"
      >
        {/* Imagen base del menú original */}
        <img
          src="./img/fondo_menu.jpg"
          alt="fondo Menu"
          className="w-full h-auto block rounded-[15px]"
        />

        {/* Botón de cerrar (.divs_cerrar: visible únicamente con partida en curso) */}
        {canCloseMenu && (
          <button
            type="button"
            onClick={onCloseMenu}
            aria-label="Fermer le menu"
            title="Fermer le menu"
            className="absolute left-[93%] top-[2%] w-[6%] h-[8%] bg-transparent border-0 p-0 cursor-pointer hover:scale-105 transition-transform focus:outline-none"
          >
            <img
              src="./img/btn_cerrar.png"
              alt="Close"
              className="w-full h-full object-contain rounded-[15%]"
            />
          </button>
        )}

        {/* Las 3 opciones de tiempo verbal (.options: #opt1, #opt2, #opt3) */}
        {[1, 2, 3].map((modeId) => {
          const cfg = GRAMMAR_MODES[modeId];
          const leftClass = MODE_LEFT_CLASSES[modeId];
          const isHovered = hoveredMode === modeId;
          const isCurrentActive = canCloseMenu && grammarMode === modeId;

          const imgSrc = !isModeSelectionUnlocked
            ? cfg.images.disabled
            : isHovered || isCurrentActive
            ? cfg.images.active
            : cfg.images.inactive;

          return (
            <button
              key={modeId}
              type="button"
              disabled={!isModeSelectionUnlocked}
              onMouseEnter={() => setHoveredMode(modeId)}
              onMouseLeave={() => setHoveredMode(null)}
              onFocus={() => setHoveredMode(modeId)}
              onBlur={() => setHoveredMode(null)}
              onClick={() => onStartGame(modeId)}
              data-testid={`btn-mode-${modeId}`}
              aria-label={cfg.name}
              className={`absolute top-[40%] h-[30%] w-[20%] ${leftClass} bg-transparent border-0 p-0 focus:outline-none transition-transform ${
                isModeSelectionUnlocked
                  ? 'cursor-pointer hover:scale-[1.03]'
                  : 'cursor-not-allowed'
              }`}
            >
              <img
                src={imgSrc}
                alt={cfg.name}
                className="w-full h-full object-contain"
              />
              <span className="sr-only">{cfg.name}</span>
            </button>
          );
        })}

        {/* Contenedor inferior de modalidades (.cont_modos) */}
        <div className="absolute top-[81%] left-[33%] w-[35%] h-[18%]">
          {/* 1. Enlace Califícame (#modoCalificame) */}
          <a
            href={GAME_CONSTANTS.CALIFICAME_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Calificame"
            className="absolute left-[0%] top-[10%] w-[32%] h-[54%] cursor-pointer hover:scale-105 transition-transform block"
          >
            <img
              src="./img/calificame_fullcolor2.png"
              alt="Califícame"
              className="w-full h-full object-contain"
            />
          </a>

          {/* 2. Botón Formation (#modoTraining) */}
          <button
            type="button"
            onClick={() => onSelectModality(MODALITY.FORMATION)}
            data-testid="btn-modality-formation"
            aria-pressed={isFormation}
            aria-label="Formation"
            className="absolute left-[33%] top-[10%] w-[32%] h-[54%] bg-transparent border-0 p-0 cursor-pointer hover:scale-105 transition-transform focus:outline-none"
          >
            <img
              src={
                isFormation
                  ? './img/training_activo.png'
                  : './img/training_inactivo.png'
              }
              alt="training"
              className="w-full h-full object-contain"
            />
            <span className="sr-only">Formation</span>
          </button>

          {/* 3. Botón Compétition (#modoCompetition) */}
          <button
            type="button"
            onClick={() => onSelectModality(MODALITY.COMPETITION)}
            data-testid="btn-modality-competition"
            aria-pressed={isCompetition}
            aria-label="Compétition"
            className="absolute left-[66%] top-[10%] w-[32%] h-[54%] bg-transparent border-0 p-0 cursor-pointer hover:scale-105 transition-transform focus:outline-none"
          >
            <img
              src={
                isCompetition
                  ? './img/comp_activo.png'
                  : './img/comp_inactivo.png'
              }
              alt="competition"
              className="w-full h-full object-contain"
            />
            <span className="sr-only">Compétition</span>
          </button>
        </div>
      </div>
    </div>
  );
}
