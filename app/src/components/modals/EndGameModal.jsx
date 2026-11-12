import React, { useEffect } from 'react';
import { MODALITY } from '../../constants/gameConfig.js';

/**
 * @file EndGameModal.jsx
 * @description Modal de finalización de los 7 niveles de "Le marché aux verbes" (#divModales).
 * En modalidad Compétition muestra la lámina oficial de la medalla obtenida (`oro.jpg`, `plata.jpg`, `bronce.jpg`);
 * en modalidad Formation muestra `fondo_menu.jpg` con el cartel central de felicitación y puntaje final.
 */
export default function EndGameModal({
  isOpen,
  modality,
  medal,
  seconds,
  score,
  totalLevels,
  onReturnToMenu,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && onReturnToMenu) {
        onReturnToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onReturnToMenu]);

  if (!isOpen) return null;

  const isCompetition = modality === MODALITY.COMPETITION;
  const modalImageSrc =
    isCompetition && medal ? medal.image : './img/fondo_menu.jpg';
  const modalImageAlt =
    isCompetition && medal ? medal.titleFr : 'Félicitations !';

  return (
    <div
      id="divModales"
      role="dialog"
      aria-modal="true"
      aria-label="Fin du jeu"
      data-testid="end-game-modal"
      style={{ zIndex: 2000 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onReturnToMenu) {
          onReturnToMenu();
        }
      }}
      className="fixed inset-0 z-[2000] flex items-start justify-center bg-black/50 overflow-y-auto animate-modalBackdropFade"
    >
      <div
        data-testid="modal-dialog-box"
        className="relative w-[90%] mx-auto mt-[1%] rounded-[15px] shadow-2xl select-none overflow-hidden animate-modalSlideDown"
      >
        {/* Lámina base de fin de juego (medalla oficial en Compétition o fondo_menu en Formation) */}
        <img
          id="imagen_modal"
          src={modalImageSrc}
          alt={modalImageAlt}
          className="w-full h-auto block rounded-[15px]"
        />

        {/* Cartel central de felicitación en modalidad Formation */}
        {!isCompetition && (
          <div className="absolute top-[36%] left-[20%] w-[60%] h-[36%] bg-[#FFE885]/95 border-4 border-[#0c4a60] rounded-[20px] shadow-2xl flex flex-col items-center justify-center p-4 text-center font-handlee">
            <h2 className="text-[clamp(1.3rem,2.6vw,2.6rem)] font-bold text-[#0c4a60] leading-tight">
              Félicitations !
            </h2>
            <p
              id="resultado_puntos"
              className="text-[clamp(1.1rem,2.2vw,2.2rem)] font-bold text-[orange] mt-2"
            >
              Tu as obtenu {score} points !
            </p>
            <p className="text-[clamp(0.85rem,1.4vw,1.35rem)] font-bold text-[#0c4a60] mt-1">
              Tu as complété les {totalLevels} niveaux du Marché aux Verbes !
            </p>
          </div>
        )}

        {/* Botón Cerrar / Volver al Menú (.divs_cerrar) */}
        <button
          type="button"
          onClick={onReturnToMenu}
          data-testid="btn-return-menu"
          aria-label="Retour au Menu"
          title="Retour au Menu"
          className="absolute left-[93%] top-[2%] w-[6%] h-[8%] bg-transparent border-0 p-0 cursor-pointer hover:scale-105 transition-transform focus:outline-none"
        >
          <img
            id="imgCerrar2"
            src="./img/btn_cerrar.png"
            alt="Close"
            className="w-full h-full object-contain rounded-[15%]"
          />
          <span className="sr-only">Retour au Menu</span>
        </button>

        {/* Resumen accesible para lectores de pantalla y pruebas */}
        <div className="sr-only">
          <h2>Félicitations !</h2>
          {isCompetition && medal && (
            <>
              <h3>{medal.titleFr}</h3>
              <p>{medal.descriptionFr}</p>
              <p>Temps : {seconds} s</p>
              <p>But : {score} points</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
