import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import {
  MODALITY,
  GAME_PHASES,
  calculateMedal,
} from '../constants/gameConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VERBS_JSON_PATH = path.resolve(__dirname, '../../public/data/verbs.json');
const realVerbs = JSON.parse(fs.readFileSync(VERBS_JSON_PATH, 'utf-8'));

describe('Suite 3: Reglas de Medallas calculateMedal(seconds)', () => {
  it('otorga Medalla de Oro cuando el tiempo es <= 185 segundos (0, 120, 185)', () => {
    expect(calculateMedal(0)).toMatchObject({
      type: 'gold',
      image: './img/oro.jpg',
      titleFr: "Médaille d'Or",
    });
    expect(calculateMedal(120).type).toBe('gold');
    expect(calculateMedal(185).type).toBe('gold');
  });

  it('otorga Medalla de Plata cuando el tiempo está entre 186 y 199 segundos (186, 192, 199)', () => {
    expect(calculateMedal(186)).toMatchObject({
      type: 'silver',
      image: './img/plata.jpg',
      titleFr: "Médaille d'Argent",
    });
    expect(calculateMedal(192).type).toBe('silver');
    expect(calculateMedal(199).type).toBe('silver');
  });

  it('otorga Medalla de Bronce cuando el tiempo es >= 200 segundos (200, 350)', () => {
    expect(calculateMedal(200)).toMatchObject({
      type: 'bronze',
      image: './img/bronce.jpg',
      titleFr: 'Médaille de Bronze',
    });
    expect(calculateMedal(350).type).toBe('bronze');
  });
});

describe('Suite 4: Motor del Juego useGameEngine()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('bloquea inicialmente los modos gramaticales hasta elegir Formation o Compétition', () => {
    const { result } = renderHook(() =>
      useGameEngine({
        initialVerbs: realVerbs,
        autoFetch: false,
        splashDurationMs: 500,
      })
    );

    expect(result.current.phase).toBe(GAME_PHASES.SPLASH);
    expect(result.current.isModeSelectionUnlocked).toBe(false);

    // Transición automática del Splash al Menú Inicial
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.phase).toBe(GAME_PHASES.MENU_INITIAL);
    expect(result.current.isMenuOpen).toBe(true);
    expect(result.current.canCloseMenu).toBe(false);

    // Intentar iniciar partida sin modalidad debe fallar
    let started = false;
    act(() => {
      started = result.current.startGame(1);
    });
    expect(started).toBe(false);
    expect(result.current.phase).toBe(GAME_PHASES.MENU_INITIAL);

    // Seleccionar modalidad Formation desbloquea los modos
    act(() => {
      result.current.selectModality(MODALITY.FORMATION);
    });
    expect(result.current.modality).toBe(MODALITY.FORMATION);
    expect(result.current.isModeSelectionUnlocked).toBe(true);

    // Seleccionar modalidad Compétition también mantiene desbloqueados los modos
    act(() => {
      result.current.selectModality(MODALITY.COMPETITION);
    });
    expect(result.current.modality).toBe(MODALITY.COMPETITION);
    expect(result.current.isModeSelectionUnlocked).toBe(true);
  });

  it('bloquea la columna lateral al seleccionar una tarjeta y permite deseleccionarla con un segundo clic', () => {
    const { result } = renderHook(() =>
      useGameEngine({
        initialVerbs: realVerbs,
        autoFetch: false,
      })
    );

    act(() => {
      result.current.skipSplash();
      result.current.selectModality(MODALITY.FORMATION);
      result.current.startGame(1);
    });

    expect(result.current.phase).toBe(GAME_PHASES.PLAYING);
    expect(result.current.isLeftLocked).toBe(false);
    expect(result.current.isRightLocked).toBe(false);

    const firstLeftCard = result.current.leftCards[0];
    const secondLeftCard = result.current.leftCards[1];

    // Seleccionar primera tarjeta izquierda
    act(() => {
      result.current.selectCard(firstLeftCard);
    });

    expect(result.current.selectedLeft?.uid).toBe(firstLeftCard.uid);
    expect(result.current.isLeftLocked).toBe(true);
    expect(result.current.isRightLocked).toBe(false);

    // Intentar seleccionar otra tarjeta de la misma columna izquierda debe ser rechazado
    let secondAttempt = true;
    act(() => {
      secondAttempt = result.current.selectCard(secondLeftCard);
    });
    expect(secondAttempt).toBe(false);
    expect(result.current.selectedLeft?.uid).toBe(firstLeftCard.uid);

    // Hacer clic de nuevo sobre la misma tarjeta seleccionada la devuelve a la grilla (deselección)
    act(() => {
      result.current.selectCard(firstLeftCard);
    });
    expect(result.current.selectedLeft).toBeNull();
    expect(result.current.isLeftLocked).toBe(false);
  });

  it.each([
    { modeId: 1, expectedDelta: 10 },
    { modeId: 2, expectedDelta: 20 },
    { modeId: 3, expectedDelta: 30 },
  ])(
    'Modo $modeId: suma +$expectedDelta puntos en acierto y resta -$expectedDelta puntos en error con restauración tras errorResetDelayMs',
    ({ modeId, expectedDelta }) => {
      const { result } = renderHook(() =>
        useGameEngine({
          initialVerbs: realVerbs,
          autoFetch: false,
          errorResetDelayMs: 600,
        })
      );

      act(() => {
        result.current.skipSplash();
        result.current.selectModality(MODALITY.FORMATION);
        result.current.startGame(modeId);
      });

      const leftCard0 = result.current.leftCards[0];
      const matchingRightCard = result.current.rightCards.find(
        (c) => c.verbId === leftCard0.verbId
      );

      // 1. Emparejamiento exitoso
      act(() => {
        result.current.selectCard(leftCard0);
        result.current.selectCard(matchingRightCard);
      });

      expect(result.current.score).toBe(expectedDelta);
      expect(result.current.matchedCount).toBe(1);
      expect(result.current.matchedPairs[0]).toEqual({
        verbId: leftCard0.verbId,
        leftText: leftCard0.text,
        rightText: matchingRightCard.text,
      });
      expect(result.current.selectedLeft).toBeNull();
      expect(result.current.selectedRight).toBeNull();

      // 2. Emparejamiento fallido
      const leftCard1 = result.current.leftCards[1];
      const wrongRightCard = result.current.rightCards.find(
        (c) => !c.matched && c.verbId !== leftCard1.verbId
      );

      act(() => {
        result.current.selectCard(leftCard1);
        result.current.selectCard(wrongRightCard);
      });

      expect(result.current.score).toBe(0); // +expectedDelta - expectedDelta = 0
      expect(result.current.feedbackStatus).toBe('error');
      expect(result.current.isLeftLocked).toBe(true);
      expect(result.current.isRightLocked).toBe(true);

      // Tras errorResetDelayMs (600ms), se limpian los slots de Sujet y se desbloquean las columnas
      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(result.current.feedbackStatus).toBe('idle');
      expect(result.current.selectedLeft).toBeNull();
      expect(result.current.selectedRight).toBeNull();
      expect(result.current.isLeftLocked).toBe(false);
      expect(result.current.isRightLocked).toBe(false);
    }
  );

  it('completa los 7 niveles de 9 parejas (63 pares totales), transiciona por LEVEL_COMPLETE y finaliza en GAME_OVER otorgando medalla en Compétition', () => {
    const { result } = renderHook(() =>
      useGameEngine({
        initialVerbs: realVerbs,
        autoFetch: false,
      })
    );

    act(() => {
      result.current.skipSplash();
      result.current.selectModality(MODALITY.COMPETITION);
      result.current.startGame(2); // Modo 2: +20 pts por pareja
    });

    expect(result.current.phase).toBe(GAME_PHASES.PLAYING);
    expect(result.current.level).toBe(1);
    expect(result.current.isTimerRunning).toBe(true);

    // Simular avance del reloj a 150 segundos (rango de Medalla de Oro <= 185s)
    act(() => {
      vi.advanceTimersByTime(150 * 1000);
    });
    expect(result.current.seconds).toBe(150);

    // Jugar los 7 niveles completos
    for (let currentLvl = 1; currentLvl <= 7; currentLvl += 1) {
      expect(result.current.level).toBe(currentLvl);
      expect(result.current.phase).toBe(GAME_PHASES.PLAYING);

      const levelLeftSnapshot = [...result.current.leftCards];
      const levelRightSnapshot = [...result.current.rightCards];

      levelLeftSnapshot.forEach((leftCard) => {
        const rightMatch = levelRightSnapshot.find((rc) => rc.verbId === leftCard.verbId);
        act(() => {
          result.current.selectCard(leftCard);
          result.current.selectCard(rightMatch);
        });
      });

      expect(result.current.matchedCount).toBe(9);

      if (currentLvl < 7) {
        expect(result.current.phase).toBe(GAME_PHASES.LEVEL_COMPLETE);
        act(() => {
          result.current.nextLevel();
        });
      } else {
        expect(result.current.phase).toBe(GAME_PHASES.GAME_OVER);
      }
    }

    // 7 niveles * 9 parejas * 20 pts = 1260 puntos
    expect(result.current.score).toBe(1260);
    expect(result.current.isTimerRunning).toBe(false);
    expect(result.current.medal?.type).toBe('gold');

    // Volver al menú principal desde GAME_OVER
    act(() => {
      result.current.returnToMenu();
    });
    expect(result.current.phase).toBe(GAME_PHASES.MENU_INITIAL);
    expect(result.current.isMenuOpen).toBe(true);
  });
});
