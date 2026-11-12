import React from 'react';
import VerbCard from './VerbCard.jsx';

/**
 * @file VerbGrid.jsx
 * @description Contenedor lateral 3x3 (.laterales: #izquierdo / #derecho) superpuesto con precisión 1:1
 * sobre las 9 ranuras ilustradas en el fondo del modo gramatical activo.
 */
export default function VerbGrid({
  side = 'left',
  label,
  cards = [],
  selectedCard = null,
  isLocked = false,
  modeConfig,
  onSelectCard,
  onDragStart,
}) {
  const isLeft = side === 'left';

  return (
    <section
      id={isLeft ? 'izquierdo' : 'derecho'}
      aria-label={label}
      className={`laterales absolute top-[20%] h-[57%] w-[35%] pl-[2%] ml-[3%] box-border z-10 ${
        isLeft ? 'left-[0%]' : 'left-[60.5%]'
      }`}
    >
      {/* Encabezado accesible para lectores de pantalla (el título visual forma parte del fondo ilustrado) */}
      <h2 className="sr-only">{label}</h2>

      {/* Contenedor interno de las 9 tarjetas (.contenedor) */}
      <div
        id={isLeft ? 'contendorIzquierdo' : 'contendorDerecho'}
        className="contenedor absolute top-[9.9%] left-[0.2%] w-full h-[92.5%]"
      >
        {cards.map((card) => {
          const isSelected = selectedCard?.uid === card.uid;
          return (
            <VerbCard
              key={card.uid}
              card={card}
              modeConfig={modeConfig}
              isSelected={isSelected}
              isLocked={isLocked}
              onSelectCard={onSelectCard}
              onDragStart={onDragStart}
            />
          );
        })}
      </div>
    </section>
  );
}
