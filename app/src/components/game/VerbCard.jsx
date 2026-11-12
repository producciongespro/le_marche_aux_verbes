import React, { useState, useRef, useEffect } from 'react';

const ROW_TOP_POSITIONS = ['3.26%', '36.45%', '69.64%'];
const COL_LEFT_POSITIONS = ['2.16%', '34.87%', '67.57%'];

/**
 * @file VerbCard.jsx
 * @description Tarjeta individual (.cartas) posicionada con coordenadas porcentuales exactas
 * (`top` respecto al alto y `left` respecto al ancho de `.contenedor`) para garantizar que en las
 * 3 filas y 3 columnas siempre quede perfectamente contenida dentro de su cajita en el fondo ilustrado,
 * corrigiendo el desfase vertical de las filas 2 y 3 que ocurría en el CSS original por usar márgenes en %.
 */
export default function VerbCard({
  card,
  slotIndex = 0,
  modeConfig,
  isSelected,
  isLocked,
  onSelectCard,
  onPointerDropCard,
  onDragStart,
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPointerPlaced, setIsPointerPlaced] = useState(false);

  const buttonRef = useRef(null);
  const suppressClickRef = useRef(false);
  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
  });

  useEffect(() => {
    if (!isSelected) {
      setOffset({ x: 0, y: 0 });
      setIsPointerPlaced(false);
    }
  }, [isSelected]);

  if (!card || card.matched) return null;

  const isDisabled = isLocked && !isSelected;
  const isConjugatedRight = card.side === 'right' && modeConfig?.id !== 1;

  const handlePointerDown = (event) => {
    if (isDisabled) return;
    if (typeof event.button === 'number' && event.button !== 0) return;

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origX: offset.x,
      origY: offset.y,
      moved: false,
    };

    if (event.currentTarget?.setPointerCapture && event.pointerId !== undefined) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Ignorar en entornos sintéticos sin soporte de pointer capture
      }
    }

    // Reproducir locución del verbo al iniciar el agarre, igual que jQuery UI draggable start
    if (onDragStart) {
      onDragStart(null, card);
    }
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) return;

    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;

    if (!dragRef.current.moved && Math.hypot(dx, dy) > 3) {
      dragRef.current.moved = true;
      setIsDragging(true);
    }

    if (dragRef.current.moved) {
      setOffset({
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      });
    }
  };

  const finishPointerInteraction = (event) => {
    if (!dragRef.current.active) return;

    const wasMoved = dragRef.current.moved;
    dragRef.current.active = false;
    setIsDragging(false);

    if (event.currentTarget?.releasePointerCapture && event.pointerId !== undefined) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Ignorar si ya fue liberado
      }
    }

    if (!wasMoved) {
      return;
    }

    suppressClickRef.current = true;

    // Verificar intersección geométrica con #principal ("Sujet"), igual que jQuery UI droppable (intersect)
    const cardRect = buttonRef.current?.getBoundingClientRect();
    const dropEl = document.getElementById('principal');
    const dropRect = dropEl?.getBoundingClientRect();

    let isOverDropZone = false;
    if (cardRect && dropRect && dropRect.width > 0 && dropRect.height > 0) {
      const overlapX = Math.max(
        0,
        Math.min(cardRect.right, dropRect.right) - Math.max(cardRect.left, dropRect.left)
      );
      const overlapY = Math.max(
        0,
        Math.min(cardRect.bottom, dropRect.bottom) - Math.max(cardRect.top, dropRect.top)
      );
      isOverDropZone =
        overlapX >= cardRect.width * 0.2 && overlapY >= cardRect.height * 0.2;
    }

    if (isOverDropZone) {
      setIsPointerPlaced(true);
      if (!isSelected && onPointerDropCard) {
        onPointerDropCard(card);
      }
    } else {
      setOffset({ x: 0, y: 0 });
      setIsPointerPlaced(false);
      if (isSelected && onSelectCard) {
        onSelectCard(card);
      }
    }
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (onSelectCard) {
      onSelectCard(card);
    }
  };

  // Si fue seleccionada por Clic (sin arrastre por puntero), se oculta en la grilla y se muestra en el slot central
  const hideInGridForClickSelection = isSelected && !isPointerPlaced && !isDragging;
  const row = Math.min(2, Math.max(0, Math.floor(slotIndex / 3)));
  const col = Math.min(2, Math.max(0, slotIndex % 3));

  return (
    <button
      ref={buttonRef}
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerInteraction}
      onPointerCancel={finishPointerInteraction}
      onDragStart={(e) => {
        // En navegador real bloqueamos el fantasma nativo HTML5; en tests sintéticos mantenemos dataTransfer
        if (e?.dataTransfer) {
          onDragStart && onDragStart(e, card);
        } else if (e?.preventDefault) {
          e.preventDefault();
        }
      }}
      onClick={handleClick}
      disabled={isDisabled}
      aria-pressed={isSelected}
      data-testid={`card-${card.uid}`}
      style={{
        position: 'absolute',
        top: ROW_TOP_POSITIONS[row],
        left: COL_LEFT_POSITIONS[col],
        width: '25.45%',
        height: '24.23%',
        paddingTop: isConjugatedRight ? '2%' : '7%',
        backgroundColor: '#1B63E9',
        backgroundImage: "url('./img/fondo_tarjetas.png')",
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        borderRadius: '16px',
        border: '1px solid #fff',
        color: '#000',
        transform:
          offset.x !== 0 || offset.y !== 0
            ? `translate3d(${offset.x}px, ${offset.y}px, 0)`
            : undefined,
        zIndex: isDragging ? 1000 : isPointerPlaced ? 500 : 99,
        touchAction: 'none',
      }}
      className={`cartas flex flex-col items-center justify-start box-border px-1 font-handlee font-bold text-center text-[clamp(0.72rem,1.05vw,1.05rem)] leading-tight select-none focus:outline-none ${
        isDragging ? 'cursor-grabbing shadow-2xl' : 'transition-transform duration-150'
      } ${hideInGridForClickSelection ? 'opacity-0' : 'opacity-100'} ${
        isDisabled ? 'cursor-not-allowed' : 'cursor-grab'
      }`}
    >
      <span className="w-full break-words leading-tight text-black pointer-events-none">
        {card.text}
      </span>
    </button>
  );
}
