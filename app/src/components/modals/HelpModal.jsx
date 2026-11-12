import React, { useEffect } from 'react';

/**
 * @file HelpModal.jsx
 * @description Modal de instrucciones 1:1 (#divModales con `./img/fondo_ayuda_txt.png`)
 * para "Le marché aux verbes" (MEP - GESPRO), incluyendo texto accesible `sr-only`
 * para lectores de pantalla y cierre por clic en backdrop o tecla Escape.
 */
export default function HelpModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="divModales"
      role="dialog"
      aria-modal="true"
      aria-label="Comment va-t-on jouer?"
      style={{ zIndex: 2000 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-[2000] flex items-start justify-center bg-black/50 overflow-y-auto animate-modalBackdropFade"
    >
      <div
        data-testid="modal-dialog-box"
        className="relative w-[90%] mx-auto mt-[1%] rounded-[15px] shadow-2xl select-none overflow-hidden animate-modalSlideDown"
      >
        {/* Lámina oficial de instrucciones */}
        <img
          id="imagen_modal"
          src="./img/fondo_ayuda_txt.png"
          alt="Comment va-t-on jouer ?"
          className="w-full h-auto block rounded-[15px]"
        />

        {/* Botón Cerrar (.divs_cerrar) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Compris !"
          title="Fermer l'aide"
          className="absolute left-[93%] top-[2%] w-[6%] h-[8%] bg-transparent border-0 p-0 cursor-pointer hover:scale-105 transition-transform focus:outline-none"
        >
          <img
            id="imgCerrar2"
            src="./img/btn_cerrar.png"
            alt="Close"
            className="w-full h-full object-contain rounded-[15%]"
          />
          <span className="sr-only">Compris !</span>
        </button>

        {/* Contenido textual accesible para lectores de pantalla */}
        <div className="sr-only">
          <h2>Comment va-t-on jouer ?</h2>
          <p>
            Nous allons essayer de trouver toutes les paires possibles pendant que nous
            étudions les différents temps verbaux et leur signification en espagnol.
            Bonne chance !
          </p>
        </div>
      </div>
    </div>
  );
}
