import React from 'react';

/**
 * @file AboutModal.jsx
 * @description Modal de créditos institucionales 1:1 (#divModales con `./img/fondo_acerca_txt.jpg`)
 * del Ministerio de Educación Pública de Costa Rica (MEP - DRTE - GESPRO) y la Asesoría Nacional
 * de Francés, con texto accesible `sr-only` para lectores de pantalla.
 */
export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      id="divModales"
      role="dialog"
      aria-modal="true"
      aria-label="À propos"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto pt-[1%] px-2"
    >
      <div className="relative w-[90%] max-w-[1400px] mx-auto rounded-[15px] shadow-2xl select-none overflow-hidden">
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
