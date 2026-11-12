/**
 * @file useAudioManager.js
 * @description Custom Hook para gestión centralizada de audio HTML5:
 * - Pronunciación de verbos en francés (./audio/*.mp3) sin solapamiento.
 * - Efectos de sonido (./assets/try_again.mp3, alert1.wav, correct.mp3, hit1.wav).
 * - Música de fondo en bucle según modalidad (pacificSun.mp3 en Formation, let_your_body.mp3 en Compétition).
 * - Manejo seguro de promesas de reproducción para navegadores con bloqueo de autoplay y entornos JSDOM.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { MODALITY } from '../constants/gameConfig.js';

const SFX_MAP = Object.freeze({
  try_again: 'try_again.mp3',
  'try_again.mp3': 'try_again.mp3',
  correct: 'correct.mp3',
  'correct.mp3': 'correct.mp3',
  alert1: 'alert1.wav',
  'alert1.wav': 'alert1.wav',
  hit1: 'hit1.wav',
  'hit1.wav': 'hit1.wav',
});

const BG_MUSIC_MAP = Object.freeze({
  [MODALITY.FORMATION]: './assets/pacificSun.mp3',
  [MODALITY.COMPETITION]: './assets/let_your_body.mp3',
});

/**
 * Ejecuta .play() de forma segura sobre una instancia de Audio,
 * atrapando rechazos por políticas de autoplay o limitaciones de JSDOM.
 * @param {HTMLAudioElement | null} audioInstance
 */
function safePlay(audioInstance) {
  if (!audioInstance || typeof audioInstance.play !== 'function') return;
  try {
    const playPromise = audioInstance.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Silencioso en caso de bloqueo de autoplay del navegador o entorno de pruebas
      });
    }
  } catch {
    // Entornos sin soporte multimedia nativo
  }
}

/**
 * Detiene y rebobina una instancia de Audio de forma segura.
 * @param {HTMLAudioElement | null} audioInstance
 */
function safeStop(audioInstance) {
  if (!audioInstance) return;
  try {
    if (typeof audioInstance.pause === 'function') {
      audioInstance.pause();
    }
    audioInstance.currentTime = 0;
  } catch {
    // Ignorar en entornos simulados donde currentTime sea de solo lectura
  }
}

/**
 * Crea una instancia de HTMLAudioElement de forma segura.
 * @param {string} src
 * @returns {HTMLAudioElement | null}
 */
function createAudioElement(src) {
  if (typeof Audio === 'undefined') return null;
  try {
    const audio = new Audio(src);
    audio.preload = 'auto';
    return audio;
  } catch {
    return null;
  }
}

export function useAudioManager(initialAudioOn = true) {
  const [audioOn, setAudioOn] = useState(Boolean(initialAudioOn));
  const audioOnRef = useRef(Boolean(initialAudioOn));
  const activeVerbAudioRef = useRef(null);
  const activeSfxAudioRef = useRef(null);
  const bgMusicAudioRef = useRef(null);
  const currentModalityRef = useRef(null);
  const isBgMusicDesiredRef = useRef(false);

  // Mantener ref sincronizada para lecturas inmediatas en callbacks
  useEffect(() => {
    audioOnRef.current = audioOn;
  }, [audioOn]);

  /**
   * Reproduce la locución en francés de un verbo desde ./audio/<audioFile>.
   * Detiene cualquier locución de verbo previa para evitar solapamiento.
   */
  const playVerbAudio = useCallback((audioFile) => {
    if (!audioFile || typeof audioFile !== 'string') return false;
    if (!audioOnRef.current) return false;

    if (activeVerbAudioRef.current) {
      safeStop(activeVerbAudioRef.current);
    }

    const cleanPath = audioFile.startsWith('./') || audioFile.startsWith('/')
      ? audioFile
      : `./audio/${audioFile}`;

    const verbAudio = createAudioElement(cleanPath);
    if (!verbAudio) return false;

    activeVerbAudioRef.current = verbAudio;
    safePlay(verbAudio);
    return true;
  }, []);

  /**
   * Reproduce un efecto de sonido desde ./assets/<sfxName>.
   */
  const playSfx = useCallback((sfxName) => {
    if (!sfxName || typeof sfxName !== 'string') return false;
    if (!audioOnRef.current) return false;

    const resolvedFile = SFX_MAP[sfxName] || sfxName;
    const cleanPath = resolvedFile.startsWith('./') || resolvedFile.startsWith('/')
      ? resolvedFile
      : `./assets/${resolvedFile}`;

    if (activeSfxAudioRef.current) {
      safeStop(activeSfxAudioRef.current);
    }

    const sfxAudio = createAudioElement(cleanPath);
    if (!sfxAudio) return false;

    activeSfxAudioRef.current = sfxAudio;
    safePlay(sfxAudio);
    return true;
  }, []);

  /**
   * Detiene la música de fondo actual.
   */
  const stopBackgroundMusic = useCallback(() => {
    isBgMusicDesiredRef.current = false;
    if (bgMusicAudioRef.current) {
      safeStop(bgMusicAudioRef.current);
      bgMusicAudioRef.current = null;
    }
  }, []);

  /**
   * Inicia o cambia la música de fondo según la modalidad ('formation' | 'competition').
   */
  const startBackgroundMusic = useCallback((modality) => {
    const targetModality = modality || currentModalityRef.current || MODALITY.FORMATION;
    currentModalityRef.current = targetModality;
    isBgMusicDesiredRef.current = true;

    if (bgMusicAudioRef.current) {
      safeStop(bgMusicAudioRef.current);
      bgMusicAudioRef.current = null;
    }

    if (!audioOnRef.current) return false;

    const musicSrc = BG_MUSIC_MAP[targetModality] || BG_MUSIC_MAP[MODALITY.FORMATION];
    const bgAudio = createAudioElement(musicSrc);
    if (!bgAudio) return false;

    bgAudio.loop = true;
    bgAudio.volume = 0.35;
    bgMusicAudioRef.current = bgAudio;
    safePlay(bgAudio);
    return true;
  }, []);

  /**
   * Sincroniza la música de fondo según modalidad y estado de juego.
   */
  const syncBackgroundMusic = useCallback(
    (modality, shouldPlay = true) => {
      if (shouldPlay) {
        return startBackgroundMusic(modality);
      }
      stopBackgroundMusic();
      return false;
    },
    [startBackgroundMusic, stopBackgroundMusic]
  );

  /**
   * Alterna el estado general de audio (On / Off), pausando o reanudando la música de fondo.
   */
  const toggleAudio = useCallback(() => {
    setAudioOn((prev) => {
      const nextState = !prev;
      audioOnRef.current = nextState;

      if (!nextState) {
        if (activeVerbAudioRef.current) {
          safeStop(activeVerbAudioRef.current);
        }
        if (bgMusicAudioRef.current) {
          safeStop(bgMusicAudioRef.current);
        }
      } else if (isBgMusicDesiredRef.current && currentModalityRef.current) {
        const musicSrc =
          BG_MUSIC_MAP[currentModalityRef.current] || BG_MUSIC_MAP[MODALITY.FORMATION];
        const bgAudio = createAudioElement(musicSrc);
        if (bgAudio) {
          bgAudio.loop = true;
          bgAudio.volume = 0.35;
          bgMusicAudioRef.current = bgAudio;
          safePlay(bgAudio);
        }
      }

      return nextState;
    });
  }, []);

  // Limpieza al desmontar el hook
  useEffect(() => {
    return () => {
      safeStop(activeVerbAudioRef.current);
      safeStop(activeSfxAudioRef.current);
      safeStop(bgMusicAudioRef.current);
    };
  }, []);

  return {
    audioOn,
    setAudioOn,
    playVerbAudio,
    playSfx,
    startBackgroundMusic,
    stopBackgroundMusic,
    syncBackgroundMusic,
    toggleAudio,
    toggleMute: toggleAudio,
  };
}
