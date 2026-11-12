import React from 'react';

/**
 * @file SplashScreen.jsx
 * @description Pantalla inicial 1:1 de "Le marché aux verbes" (MEP - GESPRO).
 * Muestra la ilustración original `./img/fondo_splash.jpg` a pantalla completa (100% viewport)
 * con transición automática tras 2 segundos o acceso inmediato por clic/teclado.
 */
export default function SplashScreen({ isLoadingVerbs, onSkip }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onSkip) onSkip();
    }
  };

  return (
    <main
      className="fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none cursor-pointer"
      onClick={onSkip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Pantalla de bienvenida Le marché aux verbes"
    >
      <img
        src="./img/fondo_splash.jpg"
        alt="start Background"
        className="w-full h-full object-fill block"
      />

      {/* Elementos accesibles para lectores de pantalla (ocultos visualmente) */}
      <div className="sr-only">
        <p>
          {isLoadingVerbs
            ? 'Chargement des verbes...'
            : 'Bienvenue au Marché aux Verbes !'}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onSkip) onSkip();
          }}
        >
          Entrer au marché
        </button>
      </div>
    </main>
  );
}
