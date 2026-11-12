/**
 * @file verbService.js
 * @description Servicio de carga de datos JSON vía fetch(), validación de contrato,
 * barajado puro Fisher-Yates y generación de tarjetas por nivel y modo gramatical.
 */

import { GAME_CONSTANTS, getGrammarModeConfig } from '../constants/gameConfig.js';

/**
 * Valida si un objeto cumple con el contrato de un registro de verbo.
 * @param {any} item
 * @returns {boolean}
 */
export function isValidVerbRecord(item) {
  if (!item || typeof item !== 'object') return false;
  const hasRequiredStrings =
    typeof item.id === 'number' &&
    typeof item.esp === 'string' &&
    item.esp.trim().length > 0 &&
    typeof item.pre === 'string' &&
    item.pre.trim().length > 0 &&
    typeof item.pas === 'string' &&
    item.pas.trim().length > 0 &&
    typeof item.fut === 'string' &&
    item.fut.trim().length > 0;

  if (!hasRequiredStrings) return false;

  const hasValidAudio =
    item.audio &&
    typeof item.audio === 'object' &&
    typeof item.audio.pre === 'string' &&
    typeof item.audio.pas === 'string' &&
    typeof item.audio.fut === 'string';

  return Boolean(hasValidAudio);
}

/**
 * Carga asíncronamente el catálogo de verbos desde el archivo JSON estático.
 * @param {string} [url='./data/verbs.json']
 * @returns {Promise<Array<object>>}
 */
export async function fetchVerbs(url = './data/verbs.json') {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al cargar verbos desde ${url}: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length < GAME_CONSTANTS.TOTAL_GAME_VERBS) {
    throw new Error(
      `El archivo JSON de verbos es inválido o tiene menos de ${GAME_CONSTANTS.TOTAL_GAME_VERBS} verbos.`
    );
  }

  const invalidItem = data.find((item) => !isValidVerbRecord(item));
  if (invalidItem) {
    throw new Error(`Registro de verbo inválido detectado en el catálogo JSON (id: ${invalidItem?.id}).`);
  }

  return data;
}

/**
 * Algoritmo de barajado Fisher-Yates puro (inmutable).
 * Retorna un nuevo arreglo con los elementos desordenados aleatoriamente.
 * @template T
 * @param {Array<T>} items
 * @param {() => number} [randomFn=Math.random]
 * @returns {Array<T>}
 */
export function shuffleArray(items, randomFn = Math.random) {
  if (!Array.isArray(items)) return [];
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Obtiene el segmento de verbos para un nivel dado (1 a 7), garantizando que no se repitan
 * verbos entre niveles dentro de una misma partida.
 * @param {Array<object>} shuffledVerbs - Lista barajada de verbos de la partida.
 * @param {number} level - Nivel actual (1..7).
 * @param {number} [cardsPerLevel=GAME_CONSTANTS.CARDS_PER_LEVEL]
 * @returns {Array<object>}
 */
export function getLevelSlice(
  shuffledVerbs,
  level,
  cardsPerLevel = GAME_CONSTANTS.CARDS_PER_LEVEL
) {
  if (!Array.isArray(shuffledVerbs) || shuffledVerbs.length === 0) return [];
  const safeLevel = Math.max(1, Math.min(Number(level) || 1, GAME_CONSTANTS.TOTAL_LEVELS));
  const startIndex = (safeLevel - 1) * cardsPerLevel;
  return shuffledVerbs.slice(startIndex, startIndex + cardsPerLevel);
}

// Alias de compatibilidad semántica con SPEC / IMPLEMENTATION_PLAN
export const getLevelVerbs = getLevelSlice;

/**
 * Construye los arreglos de tarjetas izquierda y derecha para un nivel y modo gramatical.
 * - leftCards mantiene el orden del segmento del nivel.
 * - rightCards se baraja de forma independiente con Fisher-Yates.
 *
 * @param {Array<object>} levelVerbs - Los 9 verbos correspondientes al nivel.
 * @param {number} grammarMode - Modo gramatical (1, 2 o 3).
 * @param {() => number} [randomFn=Math.random]
 * @returns {{ leftCards: Array<object>, rightCards: Array<object> }}
 */
export function buildLevelCards(levelVerbs, grammarMode = 1, randomFn = Math.random) {
  if (!Array.isArray(levelVerbs)) {
    return { leftCards: [], rightCards: [] };
  }

  const modeConfig = getGrammarModeConfig(grammarMode);

  const leftCards = levelVerbs.map((verb) => ({
    uid: `left-${verb.id}`,
    verbId: verb.id,
    id: verb.id,
    side: 'left',
    text: verb[modeConfig.leftField],
    audioFile: modeConfig.leftHasAudio ? verb.audio?.[modeConfig.leftField] || null : null,
    matched: false,
  }));

  const shuffledForRight = shuffleArray(levelVerbs, randomFn);

  const rightCards = shuffledForRight.map((verb) => ({
    uid: `right-${verb.id}`,
    verbId: verb.id,
    id: verb.id,
    side: 'right',
    text: verb[modeConfig.rightField],
    audioFile: modeConfig.rightHasAudio ? verb.audio?.[modeConfig.rightField] || null : null,
    matched: false,
  }));

  return { leftCards, rightCards };
}
