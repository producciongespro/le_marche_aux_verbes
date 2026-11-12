/**
 * @file useGameEngine.js
 * @description Motor principal de estado y reglas de negocio para "Le marché aux verbes".
 * Integra verbService, useAudioManager y useTimer implementando la máquina de estados SDD:
 * SPLASH -> MENU_INITIAL -> PLAYING <-> LEVEL_COMPLETE -> GAME_OVER
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MODALITY,
  GAME_PHASES,
  GAME_CONSTANTS,
  getGrammarModeConfig,
  calculateMedal,
} from '../constants/gameConfig.js';
import {
  fetchVerbs,
  shuffleArray,
  getLevelSlice,
  buildLevelCards,
} from '../services/verbService.js';
import { useAudioManager } from './useAudioManager.js';
import { useTimer } from './useTimer.js';

export function useGameEngine(options = {}) {
  const {
    initialVerbs = null,
    autoFetch = true,
    verbsUrl = './data/verbs.json',
    splashDurationMs = GAME_CONSTANTS.SPLASH_DURATION_MS,
    errorResetDelayMs = GAME_CONSTANTS.ERROR_FEEDBACK_DURATION_MS,
  } = options;

  // Sub-hooks de dominio
  const audioManager = useAudioManager(true);
  const {
    audioOn,
    playVerbAudio,
    playSfx,
    startBackgroundMusic,
    stopBackgroundMusic,
    toggleAudio,
  } = audioManager;

  const timer = useTimer(0);
  const {
    seconds,
    formattedTime,
    isRunning: isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
  } = timer;

  // Catálogo de verbos y estado de carga
  const [verbsCatalog, setVerbsCatalog] = useState(() =>
    Array.isArray(initialVerbs) ? initialVerbs : []
  );
  const [isLoadingVerbs, setIsLoadingVerbs] = useState(
    () => !Array.isArray(initialVerbs) && Boolean(autoFetch)
  );
  const [loadError, setLoadError] = useState(null);

  // Fase y modales
  const [phase, setPhase] = useState(GAME_PHASES.SPLASH);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Configuración de partida
  const [modality, setModality] = useState(null);
  const [grammarMode, setGrammarMode] = useState(1);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  // Tablero y tarjetas del nivel actual
  const [shuffledGameVerbs, setShuffledGameVerbs] = useState([]);
  const [leftCards, setLeftCards] = useState([]);
  const [rightCards, setRightCards] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [feedbackStatus, setFeedbackStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [showTutorialArrows, setShowTutorialArrows] = useState(false);

  // Referencias síncronas para evitar cierres obsoletos (stale closures) en llamadas consecutivas
  const verbsCatalogRef = useRef(verbsCatalog);
  const shuffledVerbsRef = useRef(shuffledGameVerbs);
  const phaseRef = useRef(phase);
  const modalityRef = useRef(modality);
  const grammarModeRef = useRef(grammarMode);
  const levelRef = useRef(level);
  const selectedLeftRef = useRef(selectedLeft);
  const selectedRightRef = useRef(selectedRight);
  const matchedPairsRef = useRef(matchedPairs);
  const feedbackStatusRef = useRef(feedbackStatus);
  const hasShownTutorialRef = useRef(false);

  const splashTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const tutorialTimeoutRef = useRef(null);

  // Sincronización de refs con el estado
  useEffect(() => {
    verbsCatalogRef.current = verbsCatalog;
  }, [verbsCatalog]);

  useEffect(() => {
    shuffledVerbsRef.current = shuffledGameVerbs;
  }, [shuffledGameVerbs]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    modalityRef.current = modality;
  }, [modality]);

  useEffect(() => {
    grammarModeRef.current = grammarMode;
  }, [grammarMode]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    selectedLeftRef.current = selectedLeft;
  }, [selectedLeft]);

  useEffect(() => {
    selectedRightRef.current = selectedRight;
  }, [selectedRight]);

  useEffect(() => {
    matchedPairsRef.current = matchedPairs;
  }, [matchedPairs]);

  useEffect(() => {
    feedbackStatusRef.current = feedbackStatus;
  }, [feedbackStatus]);

  // Limpieza de temporizadores internos
  const clearPendingTimeouts = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    if (tutorialTimeoutRef.current) {
      clearTimeout(tutorialTimeoutRef.current);
      tutorialTimeoutRef.current = null;
    }
  }, []);

  // Carga inicial de verbos mediante fetch()
  useEffect(() => {
    if (Array.isArray(initialVerbs) && initialVerbs.length > 0) {
      verbsCatalogRef.current = initialVerbs;
      setVerbsCatalog(initialVerbs);
      setIsLoadingVerbs(false);
      return undefined;
    }

    if (!autoFetch) {
      return undefined;
    }

    let isMounted = true;
    setIsLoadingVerbs(true);
    setLoadError(null);

    fetchVerbs(verbsUrl)
      .then((data) => {
        if (!isMounted) return;
        verbsCatalogRef.current = data;
        setVerbsCatalog(data);
        setIsLoadingVerbs(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err?.message || 'Error al cargar los verbos.');
        setIsLoadingVerbs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialVerbs, autoFetch, verbsUrl]);

  // Transición automática de SPLASH -> MENU_INITIAL
  useEffect(() => {
    if (phase !== GAME_PHASES.SPLASH) return undefined;

    splashTimeoutRef.current = setTimeout(() => {
      if (phaseRef.current === GAME_PHASES.SPLASH) {
        phaseRef.current = GAME_PHASES.MENU_INITIAL;
        setPhase(GAME_PHASES.MENU_INITIAL);
        setIsMenuOpen(true);
      }
    }, splashDurationMs);

    return () => {
      if (splashTimeoutRef.current) {
        clearTimeout(splashTimeoutRef.current);
        splashTimeoutRef.current = null;
      }
    };
  }, [phase, splashDurationMs]);

  // Limpieza global al desmontar
  useEffect(() => {
    return () => {
      if (splashTimeoutRef.current) clearTimeout(splashTimeoutRef.current);
      clearPendingTimeouts();
    };
  }, [clearPendingTimeouts]);

  /**
   * Permite omitir la pantalla de Splash inmediatamente.
   */
  const skipSplash = useCallback(() => {
    if (splashTimeoutRef.current) {
      clearTimeout(splashTimeoutRef.current);
      splashTimeoutRef.current = null;
    }
    if (phaseRef.current === GAME_PHASES.SPLASH) {
      phaseRef.current = GAME_PHASES.MENU_INITIAL;
      setPhase(GAME_PHASES.MENU_INITIAL);
      setIsMenuOpen(true);
    }
  }, []);

  /**
   * Selecciona la modalidad de juego ('formation' | 'competition').
   * Desbloquea la selección de los 3 modos gramaticales en el menú.
   */
  const selectModality = useCallback((newModality) => {
    if (newModality !== MODALITY.FORMATION && newModality !== MODALITY.COMPETITION) {
      return false;
    }
    modalityRef.current = newModality;
    setModality(newModality);
    return true;
  }, []);

  /**
   * Inicia una nueva partida (Hard Reset) en el modo gramatical indicado (1, 2 o 3).
   * Requiere que se haya seleccionado previamente una modalidad ('formation' o 'competition').
   */
  const startGame = useCallback(
    (modeId, overrideModality = null) => {
      const targetModality = overrideModality || modalityRef.current;
      if (targetModality !== MODALITY.FORMATION && targetModality !== MODALITY.COMPETITION) {
        return false;
      }

      const numericMode = Number(modeId);
      if (![1, 2, 3].includes(numericMode)) {
        return false;
      }

      const catalog = verbsCatalogRef.current;
      if (!Array.isArray(catalog) || catalog.length < GAME_CONSTANTS.CARDS_PER_LEVEL) {
        return false;
      }

      if (splashTimeoutRef.current) {
        clearTimeout(splashTimeoutRef.current);
        splashTimeoutRef.current = null;
      }
      clearPendingTimeouts();

      // Actualizar modalidad si vino por parámetro
      if (overrideModality) {
        modalityRef.current = targetModality;
        setModality(targetModality);
      }

      // Barajar el banco completo de verbos (Fisher-Yates inmutable)
      const shuffled = shuffleArray(catalog);
      shuffledVerbsRef.current = shuffled;
      setShuffledGameVerbs(shuffled);

      // Configurar nivel 1
      const level1Verbs = getLevelSlice(shuffled, 1, GAME_CONSTANTS.CARDS_PER_LEVEL);
      const { leftCards: newLeft, rightCards: newRight } = buildLevelCards(
        level1Verbs,
        numericMode
      );

      grammarModeRef.current = numericMode;
      levelRef.current = 1;
      selectedLeftRef.current = null;
      selectedRightRef.current = null;
      matchedPairsRef.current = [];
      feedbackStatusRef.current = 'idle';
      phaseRef.current = GAME_PHASES.PLAYING;

      setGrammarMode(numericMode);
      setLevel(1);
      setScore(0);
      setLeftCards(newLeft);
      setRightCards(newRight);
      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchedPairs([]);
      setFeedbackStatus('idle');
      setIsMenuOpen(false);
      setPhase(GAME_PHASES.PLAYING);

      // Cronómetro según modalidad
      resetTimer(0);
      if (targetModality === MODALITY.COMPETITION) {
        startTimer();
      }

      // Música de fondo según modalidad
      startBackgroundMusic(targetModality);

      // Mostrar flechas guía en la primera partida como en el original
      if (!hasShownTutorialRef.current) {
        hasShownTutorialRef.current = true;
        setShowTutorialArrows(true);
        tutorialTimeoutRef.current = setTimeout(() => {
          setShowTutorialArrows(false);
        }, 4000);
      } else {
        setShowTutorialArrows(false);
      }

      return true;
    },
    [clearPendingTimeouts, resetTimer, startTimer, startBackgroundMusic]
  );

  /**
   * Avanza al siguiente nivel (Soft Reset: conserva puntaje, modalidad, modo y reloj).
   */
  const nextLevel = useCallback(() => {
    const currentLevel = levelRef.current;
    if (currentLevel >= GAME_CONSTANTS.TOTAL_LEVELS) {
      return false;
    }

    clearPendingTimeouts();

    const nextLvl = currentLevel + 1;
    const shuffled = shuffledVerbsRef.current;
    const nextLevelVerbs = getLevelSlice(shuffled, nextLvl, GAME_CONSTANTS.CARDS_PER_LEVEL);
    const { leftCards: newLeft, rightCards: newRight } = buildLevelCards(
      nextLevelVerbs,
      grammarModeRef.current
    );

    levelRef.current = nextLvl;
    selectedLeftRef.current = null;
    selectedRightRef.current = null;
    matchedPairsRef.current = [];
    feedbackStatusRef.current = 'idle';
    phaseRef.current = GAME_PHASES.PLAYING;

    setLevel(nextLvl);
    setLeftCards(newLeft);
    setRightCards(newRight);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setFeedbackStatus('idle');
    setPhase(GAME_PHASES.PLAYING);

    return true;
  }, [clearPendingTimeouts]);

  /**
   * Reproduce el audio de una tarjeta si corresponde (por ejemplo al iniciar arrastre).
   */
  const previewCardAudio = useCallback(
    (card) => {
      if (!card || card.matched) return false;
      if (card.audioFile) {
        return playVerbAudio(card.audioFile);
      }
      return false;
    },
    [playVerbAudio]
  );

  /**
   * Deselecciona manualmente la tarjeta de un lado en Sujet si aún no se está evaluando un par.
   */
  const deselectCard = useCallback((side) => {
    if (feedbackStatusRef.current === 'error') return false;
    if (side === 'left' && selectedLeftRef.current && !selectedRightRef.current) {
      selectedLeftRef.current = null;
      setSelectedLeft(null);
      return true;
    }
    if (side === 'right' && selectedRightRef.current && !selectedLeftRef.current) {
      selectedRightRef.current = null;
      setSelectedRight(null);
      return true;
    }
    return false;
  }, []);

  /**
   * Evalúa el par de tarjetas colocadas en la zona central Sujet.
   */
  const evaluatePair = useCallback(
    (leftCard, rightCard) => {
      const modeConfig = getGrammarModeConfig(grammarModeRef.current);
      const isMatch = leftCard.verbId === rightCard.verbId;

      if (isMatch) {
        const matchedVerbId = leftCard.verbId;

        // 1. Incrementar puntaje
        setScore((prev) => prev + modeConfig.pointsDelta);

        // 2. Marcar ambas tarjetas como emparejadas en las grillas
        setLeftCards((prev) =>
          prev.map((c) => (c.verbId === matchedVerbId ? { ...c, matched: true } : c))
        );
        setRightCards((prev) =>
          prev.map((c) => (c.verbId === matchedVerbId ? { ...c, matched: true } : c))
        );

        // 3. Agregar a la bandeja inferior de 9 parejas resueltas
        const newPair = {
          verbId: matchedVerbId,
          leftText: leftCard.text,
          rightText: rightCard.text,
        };
        const updatedPairs = [...matchedPairsRef.current, newPair];
        matchedPairsRef.current = updatedPairs;
        setMatchedPairs(updatedPairs);

        // 4. Limpiar slots de Sujet y actualizar estado de feedback
        selectedLeftRef.current = null;
        selectedRightRef.current = null;
        feedbackStatusRef.current = 'success';
        setSelectedLeft(null);
        setSelectedRight(null);
        setFeedbackStatus('success');

        // 5. Verificar si se completaron las 9 parejas del nivel
        if (updatedPairs.length >= GAME_CONSTANTS.CARDS_PER_LEVEL) {
          if (levelRef.current < GAME_CONSTANTS.TOTAL_LEVELS) {
            playSfx('alert1.wav');
            phaseRef.current = GAME_PHASES.LEVEL_COMPLETE;
            setPhase(GAME_PHASES.LEVEL_COMPLETE);
          } else {
            pauseTimer();
            stopBackgroundMusic();
            playSfx('alert1.wav');
            phaseRef.current = GAME_PHASES.GAME_OVER;
            setPhase(GAME_PHASES.GAME_OVER);
          }
        }
      } else {
        // Caso de error: los verbos no coinciden
        playSfx('try_again.mp3');
        setScore((prev) => prev - modeConfig.pointsDelta);

        feedbackStatusRef.current = 'error';
        setFeedbackStatus('error');

        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }

        errorTimeoutRef.current = setTimeout(() => {
          selectedLeftRef.current = null;
          selectedRightRef.current = null;
          feedbackStatusRef.current = 'idle';
          setSelectedLeft(null);
          setSelectedRight(null);
          setFeedbackStatus('idle');
          errorTimeoutRef.current = null;
        }, errorResetDelayMs);
      }
    },
    [playSfx, pauseTimer, stopBackgroundMusic, errorResetDelayMs]
  );

  /**
   * Procesa la selección o caída de una tarjeta hacia la zona central Sujet.
   * @param {object} card - Tarjeta seleccionada ({ uid, verbId, side, text, audioFile, matched })
   * @param {object} [interactionOptions]
   * @param {boolean} [interactionOptions.isDrop=false] - Si proviene de un evento onDrop
   * @param {boolean} [interactionOptions.skipAudio=false] - Si el audio ya se reprodujo en onDragStart
   */
  const handleCardInteraction = useCallback(
    (card, interactionOptions = {}) => {
      const { isDrop = false, skipAudio = false } = interactionOptions;

      if (phaseRef.current !== GAME_PHASES.PLAYING) return false;
      if (feedbackStatusRef.current === 'error') return false;
      if (!card || card.matched) return false;

      // Ocultar flechas de tutorial al interactuar
      setShowTutorialArrows(false);

      const currentLeft = selectedLeftRef.current;
      const currentRight = selectedRightRef.current;

      // Si el usuario hace clic sobre la misma tarjeta que ya está en Sujet (y el otro lado está vacío),
      // permite devolverla a su grilla (mejora UX accesible especificada en SPEC 4.5.2).
      if (!isDrop) {
        if (card.side === 'left' && currentLeft?.uid === card.uid && !currentRight) {
          selectedLeftRef.current = null;
          setSelectedLeft(null);
          return true;
        }
        if (card.side === 'right' && currentRight?.uid === card.uid && !currentLeft) {
          selectedRightRef.current = null;
          setSelectedRight(null);
          return true;
        }
      }

      // Regla de bloqueo por columna: no se puede tomar una segunda tarjeta del mismo lado
      // cuando ya hay una tarjeta de ese lado esperando en Sujet.
      if (card.side === 'left' && currentLeft !== null) {
        return false;
      }
      if (card.side === 'right' && currentRight !== null) {
        return false;
      }

      // Reproducir locución en francés si la tarjeta tiene audio asociado
      if (card.audioFile && !skipAudio) {
        playVerbAudio(card.audioFile);
      }

      if (card.side === 'left') {
        selectedLeftRef.current = card;
        setSelectedLeft(card);
        if (currentRight !== null) {
          evaluatePair(card, currentRight);
        } else {
          feedbackStatusRef.current = 'idle';
          setFeedbackStatus('idle');
        }
        return true;
      }

      if (card.side === 'right') {
        selectedRightRef.current = card;
        setSelectedRight(card);
        if (currentLeft !== null) {
          evaluatePair(currentLeft, card);
        } else {
          feedbackStatusRef.current = 'idle';
          setFeedbackStatus('idle');
        }
        return true;
      }

      return false;
    },
    [playVerbAudio, evaluatePair]
  );

  const selectCard = useCallback(
    (card, opts = {}) => handleCardInteraction(card, { ...opts, isDrop: false }),
    [handleCardInteraction]
  );

  const dropCard = useCallback(
    (card, opts = {}) => handleCardInteraction(card, { ...opts, isDrop: true }),
    [handleCardInteraction]
  );

  /**
   * Controles de apertura y cierre de modales (Menú, Ayuda, Acerca de).
   */
  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    // En MENU_INITIAL no se puede cerrar el menú sin haber iniciado una partida
    if (phaseRef.current === GAME_PHASES.MENU_INITIAL || phaseRef.current === GAME_PHASES.SPLASH) {
      return false;
    }
    setIsMenuOpen(false);
    return true;
  }, []);

  const openHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  const openAbout = useCallback(() => {
    setIsAboutOpen(true);
  }, []);

  const closeAbout = useCallback(() => {
    setIsAboutOpen(false);
  }, []);

  /**
   * Regresa al menú principal tras finalizar los 7 niveles (GAME_OVER).
   */
  const returnToMenu = useCallback(() => {
    clearPendingTimeouts();
    pauseTimer();
    stopBackgroundMusic();
    phaseRef.current = GAME_PHASES.MENU_INITIAL;
    setPhase(GAME_PHASES.MENU_INITIAL);
    setIsMenuOpen(true);
  }, [clearPendingTimeouts, pauseTimer, stopBackgroundMusic]);

  const dismissTutorialArrows = useCallback(() => {
    setShowTutorialArrows(false);
  }, []);

  // Propiedades derivadas
  const modeConfig = useMemo(() => getGrammarModeConfig(grammarMode), [grammarMode]);
  const isModeSelectionUnlocked = Boolean(modality);
  const isLeftLocked = Boolean(selectedLeft) || feedbackStatus === 'error';
  const isRightLocked = Boolean(selectedRight) || feedbackStatus === 'error';
  const canCloseMenu =
    phase === GAME_PHASES.PLAYING || phase === GAME_PHASES.LEVEL_COMPLETE;

  const medal = useMemo(() => {
    if (modality !== MODALITY.COMPETITION) return null;
    return calculateMedal(seconds);
  }, [modality, seconds]);

  return {
    // Estado general y datos
    phase,
    verbsCatalog,
    isLoadingVerbs,
    loadError,

    // Configuración de partida
    modality,
    isModeSelectionUnlocked,
    grammarMode,
    modeConfig,
    level,
    totalLevels: GAME_CONSTANTS.TOTAL_LEVELS,
    score,

    // Estado del tablero y emparejamiento
    leftCards,
    rightCards,
    selectedLeft,
    selectedRight,
    isLeftLocked,
    isRightLocked,
    matchedPairs,
    matchedCount: matchedPairs.length,
    feedbackStatus,
    showTutorialArrows,

    // Cronómetro y medallas
    seconds,
    formattedTime,
    isTimerRunning,
    medal,

    // Audio
    audioOn,
    toggleAudio,
    toggleMute: toggleAudio,
    playVerbAudio,
    playSfx,

    // Estado y control de modales
    isMenuOpen,
    canCloseMenu,
    isHelpOpen,
    isAboutOpen,
    openMenu,
    closeMenu,
    openHelp,
    closeHelp,
    openAbout,
    closeAbout,

    // Acciones del motor de juego
    selectModality,
    startGame,
    selectCard,
    dropCard,
    deselectCard,
    previewCardAudio,
    nextLevel,
    returnToMenu,
    skipSplash,
    dismissTutorialArrows,
  };
}
