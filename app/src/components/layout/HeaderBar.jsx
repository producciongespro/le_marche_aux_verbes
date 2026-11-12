import React, { useState } from 'react';
import { MODALITY } from '../../constants/gameConfig.js';

/**
 * @file HeaderBar.jsx
 * @description Barra superior 1:1 (#encabezado.sup_inf) superpuesta sobre la ilustración
 * del mercado francés, con el cronómetro (#reloj) en modo Compétition y los 3 botones
 * gráficos originales (.accesos: #btnAyuda, #btnMenu, #btnAcerca).
 */
export default function HeaderBar({
  modality,
  seconds,
  formattedTime,
  onOpenHelp,
  onOpenMenu,
  onOpenAbout,
}) {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const isCompetition = modality === MODALITY.COMPETITION;

  return (
    <header
      id="encabezado"
      className="sup_inf absolute top-[0%] left-[2.5%] w-[96%] h-[20%] z-20 box-border pointer-events-none"
    >
      {/* Reloj (#reloj): visible únicamente en modalidad Compétition */}
      {isCompetition && (
        <div
          id="reloj"
          data-testid="competition-timer"
          aria-label="Chronomètre"
          className="pointer-events-auto absolute left-[46%] top-[55%] w-[6%] h-[42%] text-white text-center border-2 border-white rounded-[10%] flex items-center justify-center font-handlee font-bold text-[clamp(0.85rem,1.5vw,1.5rem)] bg-[#16748C]/40"
        >
          <span>{seconds}</span>
          <span className="sr-only"> s ({formattedTime})</span>
        </div>
      )}

      {/* Contenedor de los 3 botones de acceso (.accesos) */}
      <div className="accesos pointer-events-auto absolute top-[63%] left-[59%] w-[35%] h-[55%] flex items-start">
        {/* 1. Botón Aide (#btnAyuda) */}
        <button
          id="btnAyuda"
          type="button"
          onClick={onOpenHelp}
          onMouseEnter={() => setHoveredBtn('help')}
          onMouseLeave={() => setHoveredBtn(null)}
          onFocus={() => setHoveredBtn('help')}
          onBlur={() => setHoveredBtn(null)}
          aria-label="Aide"
          title="Comment va-t-on jouer ? (Aide)"
          className="acceso relative w-[23%] h-[55%] mt-[2%] ml-[-4%] bg-transparent border-0 p-0 cursor-pointer focus:outline-none"
        >
          <img
            src={
              hoveredBtn === 'help'
                ? './img/btn_ayuda_activo.png'
                : './img/btn_ayuda_inactivo.png'
            }
            alt="Help"
            className="w-full h-full object-fill block"
          />
          <span className="sr-only">Aide</span>
        </button>

        {/* 2. Botón Menu (#btnMenu) */}
        <button
          id="btnMenu"
          type="button"
          onClick={onOpenMenu}
          onMouseEnter={() => setHoveredBtn('menu')}
          onMouseLeave={() => setHoveredBtn(null)}
          onFocus={() => setHoveredBtn('menu')}
          onBlur={() => setHoveredBtn(null)}
          aria-label="Menu"
          title="Ouvrir le menu principal"
          className="acceso relative w-[23%] h-[55%] mt-[2%] bg-transparent border-0 p-0 cursor-pointer focus:outline-none"
        >
          <img
            src={
              hoveredBtn === 'menu'
                ? './img/btn_menu_activo.png'
                : './img/btn_menu_inactivo.png'
            }
            alt="Menu"
            className="w-full h-full object-fill block"
          />
          <span className="sr-only">Menu</span>
        </button>

        {/* 3. Botón À propos (#btnAcerca) */}
        <button
          id="btnAcerca"
          type="button"
          onClick={onOpenAbout}
          onMouseEnter={() => setHoveredBtn('about')}
          onMouseLeave={() => setHoveredBtn(null)}
          onFocus={() => setHoveredBtn('about')}
          onBlur={() => setHoveredBtn(null)}
          aria-label="À propos"
          title="Crédits et informations (À propos)"
          className="acceso relative w-[23%] h-[55%] mt-[2%] bg-transparent border-0 p-0 cursor-pointer focus:outline-none"
        >
          <img
            src={
              hoveredBtn === 'about'
                ? './img/btn_acerca de_activo.png'
                : './img/btn_acerca_de_inactivo.png'
            }
            alt="About"
            className="w-full h-full object-fill block"
          />
          <span className="sr-only">À propos</span>
        </button>
      </div>
    </header>
  );
}
