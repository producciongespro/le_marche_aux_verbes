import React from 'react';

/**
 * @file VerbCard.jsx
 * @description Tarjeta individual (.cartas) con las proporciones, márgenes y textura 1:1
 * (`./img/fondo_tarjetas.png`) del recurso original del MEP.
 * Soporta Drag & Drop HTML5 y Clic/Teclado accesible, dejando su ranura vacía fija al emparejarse.
 */
export default function VerbCard({
  card,
  modeConfig,
  isSelected,
  isLocked,
  onSelectCard,
  onDragStart,
}) {
  if (!card) return null;

  const isDisabled = isLocked && !isSelected;
  const isDraggable = !isLocked || isSelected;
  const isConjugatedRight = card.side === 'right' && modeConfig?.id !== 1;

  // Cuando la tarjeta ya fue emparejada, conserva exactamente el mismo espacio (.cartas) invisible
  if (card.matched) {
    return (
      <div
        aria-hidden="true"
        className="inline-block align-top invisible pointer-events-none w-[26%] h-[26%] ml-[1.8%] mt-[3.0%] mr-[5%] mb-[2.5%] box-border"
      />
    );
  }

  return (
    <button
      type="button"
      draggable={isDraggable}
      onDragStart={(e) => onDragStart && onDragStart(e, card)}
      onClick={() => onSelectCard && onSelectCard(card)}
      disabled={isDisabled}
      aria-pressed={isSelected}
      data-testid={`card-${card.uid}`}
      style={{
        width: '26%',
        height: '26%',
        marginLeft: '1.8%',
        marginTop: '3.0%',
        marginRight: '5%',
        marginBottom: '2.5%',
        paddingTop: isConjugatedRight ? '2%' : '7%',
        backgroundColor: '#1B63E9',
        backgroundImage: "url('./img/fondo_tarjetas.png')",
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        borderRadius: '16px',
        border: '1px solid #fff',
        color: '#000',
      }}
      className={`cartas inline-flex flex-col items-center justify-start align-top box-border z-[99] px-1 font-handlee font-bold text-center text-[clamp(0.72rem,1.05vw,1.05rem)] leading-tight select-none focus:outline-none transition-transform ${
        isSelected ? 'opacity-0' : 'opacity-100'
      } ${
        isDisabled
          ? 'cursor-not-allowed'
          : 'cursor-pointer hover:scale-[1.02]'
      }`}
    >
      <span className="w-full break-words leading-tight text-black">
        {card.text}
      </span>
    </button>
  );
}
