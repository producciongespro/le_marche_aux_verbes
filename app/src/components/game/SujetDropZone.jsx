import React, { useState, useEffect } from 'react';
import { GAME_PHASES } from '../../constants/gameConfig.js';

/**
 * @file SujetDropZone.jsx
 * @description Zona central de emparejamiento (#principal) superpuesta 1:1 sobre el recuadro
 * amarillo central del fondo ilustrado.
 * Corrige el rótulo "Texto" de `fondo_pantalla_pasado.jpg` en Modo 3 mostrando "Sujet",
 * renderiza los marcadores `#nivel` y `#puntaje` en naranja sobre sus casillas originales,
 * muestra las flechas guía temporales (`.flechas`) y el botón `#contenedor_boton_next`.
 */
export default function SujetDropZone({
  phase,
  modeConfig,
  level,
  totalLevels,
  score,
  selectedLeft,
  selectedRight,
  isLeftPointerPlaced = false,
  isRightPointerPlaced = false,
  feedbackStatus,
  showTutorialArrows,
  onSelectCard,
  onDropCard,
  onNextLevel,
}) {
  const [arrowsVisible, setArrowsVisible] = useState(true);

  useEffect(() => {
    if (!showTutorialArrows) {
      setArrowsVisible(false);
      return undefined;
    }
    setArrowsVisible(true);
    const timerId = setTimeout(() => {
      setArrowsVisible(false);
    }, 3500);
    return () => clearTimeout(timerId);
  }, [showTutorialArrows]);

  const handleDragEnter = (event) => {
    event.preventDefault();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    try {
      const raw = event.dataTransfer.getData('application/json');
      if (!raw) return;
      const card = JSON.parse(raw);
      if (onDropCard) {
        onDropCard(card, { skipAudio: true });
      }
    } catch {
      // Ignorar arrastres externos que no sean tarjetas JSON válidas
    }
  };

  const isError = feedbackStatus === 'error';
  const isLevelComplete = phase === GAME_PHASES.LEVEL_COMPLETE;
  const isMode3 = modeConfig?.id === 3;
  const isRightConjugated = modeConfig?.id !== 1;

  return (
    <section
      id="principal"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-testid="sujet-dropzone"
      aria-label="Sujet"
      className={`absolute top-[27%] left-[38%] w-[24%] h-[50%] z-10 box-border ${
        isError ? 'animate-shake' : ''
      }`}
    >
      {/* Encabezado "Sujet": visible como parche sobre "Texto" en Modo 3, sr-only en Modos 1 y 2 */}
      {isMode3 ? (
        <div className="absolute top-[2%] left-[25%] w-[50%] h-[14%] bg-[#FFE885] flex items-center justify-center pointer-events-none">
          <h2 className="font-handlee font-bold text-[#0c4a60] text-[clamp(1.2rem,2.3vw,2.2rem)] leading-none">
            Sujet
          </h2>
        </div>
      ) : (
        <h2 className="sr-only">Sujet</h2>
      )}

      {/* Flechas animadas de tutorial inicial (.flechas) */}
      {showTutorialArrows && arrowsVisible && !selectedLeft && !selectedRight && (
        <>
          <div
            id="flecha_izquierda"
            aria-hidden="true"
            className="flechas absolute top-[10%] left-[60%] w-[46%] h-[39%] pointer-events-none z-20"
          >
            <img
              src="./img/img_flecha_izq.png"
              alt="flecha izquierda"
              className="w-full h-full object-contain block"
            />
          </div>
          <div
            id="flecha_derecha"
            aria-hidden="true"
            className="flechas absolute top-[40%] left-[-4%] w-[46%] h-[39%] pointer-events-none z-20"
          >
            <img
              src="./img/img_flecha_der.png"
              alt="flecha derecha"
              className="w-full h-full object-contain block"
            />
          </div>
        </>
      )}

      {/* Slot Izquierdo en Sujet */}
      <div
        data-testid="sujet-slot-left"
        role="button"
        tabIndex={selectedLeft ? 0 : -1}
        title={
          selectedLeft
            ? 'Cliquez pour retirer cette carte'
            : `Emplacement : ${modeConfig?.leftLabel || 'Gauche'}`
        }
        onClick={() => selectedLeft && onSelectCard && onSelectCard(selectedLeft)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && selectedLeft && onSelectCard) {
            e.preventDefault();
            onSelectCard(selectedLeft);
          }
        }}
        style={
          selectedLeft && !isLeftPointerPlaced
            ? {
                paddingTop: '7%',
                backgroundColor: '#1B63E9',
                backgroundImage: "url('./img/fondo_tarjetas.png')",
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                borderRadius: '16px',
                border: '1px solid #fff',
                color: '#000',
              }
            : undefined
        }
        className={`absolute top-[24%] left-[10%] w-[36%] h-[38%] box-border px-1 font-handlee font-bold text-center text-[clamp(0.72rem,1.05vw,1.05rem)] leading-tight flex flex-col items-center justify-start ${
          selectedLeft && !isLeftPointerPlaced
            ? 'opacity-100 cursor-pointer z-20 shadow-md'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {selectedLeft ? (
          <span className="w-full break-words leading-tight text-black">
            {selectedLeft.text}
          </span>
        ) : (
          <span className="sr-only">{modeConfig?.leftLabel}</span>
        )}
      </div>

      {/* Slot Derecho en Sujet */}
      <div
        data-testid="sujet-slot-right"
        role="button"
        tabIndex={selectedRight ? 0 : -1}
        title={
          selectedRight
            ? 'Cliquez pour retirer cette carte'
            : `Emplacement : ${modeConfig?.rightLabel || 'Droite'}`
        }
        onClick={() => selectedRight && onSelectCard && onSelectCard(selectedRight)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && selectedRight && onSelectCard) {
            e.preventDefault();
            onSelectCard(selectedRight);
          }
        }}
        style={
          selectedRight && !isRightPointerPlaced
            ? {
                paddingTop: isRightConjugated ? '2%' : '7%',
                backgroundColor: '#1B63E9',
                backgroundImage: "url('./img/fondo_tarjetas.png')",
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                borderRadius: '16px',
                border: '1px solid #fff',
                color: '#000',
              }
            : undefined
        }
        className={`absolute top-[24%] left-[54%] w-[36%] h-[38%] box-border px-1 font-handlee font-bold text-center text-[clamp(0.72rem,1.05vw,1.05rem)] leading-tight flex flex-col items-center justify-start ${
          selectedRight && !isRightPointerPlaced
            ? 'opacity-100 cursor-pointer z-20 shadow-md'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {selectedRight ? (
          <span className="w-full break-words leading-tight text-black">
            {selectedRight.text}
          </span>
        ) : (
          <span className="sr-only">{modeConfig?.rightLabel}</span>
        )}
      </div>

      {/* Botón interactivo "Niveau suivant" (#contenedor_boton_next) */}
      {isLevelComplete && (
        <button
          id="contenedor_boton_next"
          type="button"
          onClick={onNextLevel}
          data-testid="btn-next-level"
          aria-label="Niveau suivant"
          className="absolute top-[20%] left-[6%] w-[88%] h-[48%] z-30 bg-transparent border-0 p-0 cursor-pointer hover:scale-105 transition-transform focus:outline-none"
        >
          <img
            src="./img/img_btn_next_level.png"
            alt="Next level"
            className="w-full h-full object-contain block"
          />
          <span className="sr-only">Niveau suivant</span>
        </button>
      )}

      {/* Marcador de Nivel (#nivel) en color orange sobre su casilla ilustrada */}
      <div
        id="nivel"
        data-testid="level-indicator"
        className="absolute left-[35%] top-[83%] font-handlee font-bold text-[orange] text-[clamp(0.9rem,1.4vw,1.35rem)] leading-none"
      >
        <span className="sr-only">Niveau: </span>
        {level}
        <span className="sr-only"> / {totalLevels}</span>
      </div>

      {/* Marcador de Puntaje (#puntaje) en color orange sobre su casilla ilustrada */}
      <div
        id="puntaje"
        data-testid="score-indicator"
        className="absolute left-[80%] top-[83%] font-handlee font-bold text-[orange] text-[clamp(0.9rem,1.4vw,1.35rem)] leading-none"
      >
        <span className="sr-only">But: </span>
        {score}
      </div>
    </section>
  );
}
