import React, { useState, useEffect } from 'react';
import VerbGrid from './VerbGrid.jsx';
import SujetDropZone from './SujetDropZone.jsx';

/**
 * @file GameBoard.jsx
 * @description Tablero principal 1:1 con las 3 zonas posicionadas exactamente sobre las ranuras
 * del fondo ilustrado: Grilla Izquierda 3x3 (#izquierdo) | Zona Central ("Sujet" #principal) | Grilla Derecha 3x3 (#derecho).
 */
export default function GameBoard({
  phase,
  modeConfig,
  level,
  totalLevels,
  score,
  leftCards,
  rightCards,
  selectedLeft,
  selectedRight,
  isLeftLocked,
  isRightLocked,
  feedbackStatus,
  showTutorialArrows,
  onSelectCard,
  onDropCard,
  onDragStart,
  onNextLevel,
}) {
  const [pointerPlacedLeftUid, setPointerPlacedLeftUid] = useState(null);
  const [pointerPlacedRightUid, setPointerPlacedRightUid] = useState(null);

  useEffect(() => {
    if (!selectedLeft) {
      setPointerPlacedLeftUid(null);
    }
  }, [selectedLeft]);

  useEffect(() => {
    if (!selectedRight) {
      setPointerPlacedRightUid(null);
    }
  }, [selectedRight]);

  const handlePointerDropCard = (card) => {
    if (!card) return;
    if (card.side === 'left') {
      setPointerPlacedLeftUid(card.uid);
    } else {
      setPointerPlacedRightUid(card.uid);
    }
    if (onDropCard) {
      onDropCard(card, { skipAudio: true });
    }
  };

  return (
    <main className="contents">
      {/* Columna Izquierda: Grilla 3x3 (#izquierdo) */}
      <VerbGrid
        side="left"
        label={modeConfig?.leftLabel}
        cards={leftCards}
        selectedCard={selectedLeft}
        isLocked={isLeftLocked}
        modeConfig={modeConfig}
        hasAudio={Boolean(modeConfig?.leftHasAudio)}
        onSelectCard={onSelectCard}
        onPointerDropCard={handlePointerDropCard}
        onDragStart={onDragStart}
      />

      {/* Columna Central: Puesto de emparejamiento "Sujet" (#principal) */}
      <SujetDropZone
        phase={phase}
        modeConfig={modeConfig}
        level={level}
        totalLevels={totalLevels}
        score={score}
        selectedLeft={selectedLeft}
        selectedRight={selectedRight}
        isLeftPointerPlaced={Boolean(
          selectedLeft && pointerPlacedLeftUid === selectedLeft.uid
        )}
        isRightPointerPlaced={Boolean(
          selectedRight && pointerPlacedRightUid === selectedRight.uid
        )}
        feedbackStatus={feedbackStatus}
        showTutorialArrows={showTutorialArrows}
        onSelectCard={onSelectCard}
        onDropCard={onDropCard}
        onNextLevel={onNextLevel}
      />

      {/* Columna Derecha: Grilla 3x3 (#derecho) */}
      <VerbGrid
        side="right"
        label={modeConfig?.rightLabel}
        cards={rightCards}
        selectedCard={selectedRight}
        isLocked={isRightLocked}
        modeConfig={modeConfig}
        hasAudio={Boolean(modeConfig?.rightHasAudio)}
        onSelectCard={onSelectCard}
        onPointerDropCard={handlePointerDropCard}
        onDragStart={onDragStart}
      />
    </main>
  );
}
