/**
 * @file useTimer.js
 * @description Custom Hook de cronómetro ascendente en segundos para la modalidad Compétition.
 * Reemplaza el antiguo Web Worker (reloj.js) con limpieza estricta de intervalos en React.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Formatea segundos en formato MM:SS para apoyo visual accesible.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTimeMMSS(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function useTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback((initial = 0) => {
    setIsRunning(false);
    setSeconds(Number.isFinite(initial) && initial >= 0 ? Math.floor(initial) : 0);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  return {
    seconds,
    formattedTime: formatTimeMMSS(seconds),
    isRunning,
    startTimer,
    pauseTimer,
    stopTimer: pauseTimer,
    resetTimer,
  };
}
