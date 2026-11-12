import React, { useEffect } from 'react';

/**
 * @file AboutModal.jsx
 * @description Modal de créditos institucionales 1:1 (#divModales con `./img/fondo_acerca_txt.jpg`)
 * del Ministerio de Educación Pública de Costa Rica (MEP - DRTE - GESPRO) y la Asesoría Nacional
 * de Francés, con texto accesible `sr-only` para lectores de pantalla y cierre por clic en backdrop o Escape.
 */
export default function AboutModal({ isOpen, onClose }) {
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
      aria-label="À propos"
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
        {/* Lámina oficial de créditos institucionales MEP */}
        <img
          id="imagen_modal"
          src="./img/fondo_acerca_txt.jpg"
          alt="À propos - Crédits Officiels"
          className="w-full h-auto block rounded-[15px]"
        />

        {/* Botón Cerrar (.divs_cerrar) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          title="Fermer À propos"
          className="absolute left-[93%] top-[2%] w-[6%] h-[8%] bg-transparent border-0 p-0 cursor-pointer hover:scale-105 transition-transform focus:outline-none"
        >
          <img
            id="imgCerrar2"
            src="./img/btn_cerrar.png"
            alt="Close"
            className="w-full h-full object-contain rounded-[15%]"
          />
          <span className="sr-only">Fermer</span>
        </button>

        {/* Créditos institucionales accesibles para lectores de pantalla */}
        <div className="sr-only">
          <h2>À propos — Crédits Officiels</h2>
          <p>Ministerio de Educación Pública de Costa Rica (MEP)</p>
          <p>Dirección de Recursos Tecnológicos en Educación — GESPRO</p>
          <p>Asesoría Nacional de Francés DTCED: Eugenia Rodríguez González</p>
          <p>Audio: Béatrice Passot (Colaboradora ACOPROF)</p>
          <p>
            Programadores: Patricia Hernández Conejo, Luis Chacón Campos, Oscar Pérez
            Ramírez
          </p>
          <p>Diseño Gráfico: Karla Guevara Murillo</p>
          <p>Basada en la idea original de: Katherine Williams Jiménez</p>
        </div>
      </div>
    </div>
  );
}
