/**
 * @file gameConfig.js
 * @description Constantes inmutables de dominio, modos gramaticales, temas visuales y reglas de medallas
 * para "Le marché aux verbes" (MEP - GESPRO).
 */

export const MODALITY = Object.freeze({
  FORMATION: 'formation',
  COMPETITION: 'competition',
});

export const GAME_PHASES = Object.freeze({
  SPLASH: 'SPLASH',
  MENU_INITIAL: 'MENU_INITIAL',
  PLAYING: 'PLAYING',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
});

export const GAME_CONSTANTS = Object.freeze({
  TOTAL_LEVELS: 7,
  CARDS_PER_LEVEL: 9,
  TOTAL_GAME_VERBS: 63,
  SPLASH_DURATION_MS: 2000,
  ERROR_FEEDBACK_DURATION_MS: 600,
  GAME_OVER_DELAY_MS: 800,
  CALIFICAME_URL: 'https://recursos.mep.go.cr/0_calificame/app/index.html?id_app=1',
});

export const MEDAL_THRESHOLDS = Object.freeze({
  GOLD_MAX_SECONDS: 185,
  SILVER_MAX_SECONDS: 199,
});

export const GRAMMAR_MODES = Object.freeze({
  1: {
    id: 1,
    name: 'Espagnol – Présent',
    leftField: 'esp',
    rightField: 'pre',
    leftLabel: 'Espagnol',
    rightLabel: 'Présent',
    leftHasAudio: false,
    rightHasAudio: true,
    pointsDelta: 10,
    backgroundImage: './img/fondo_pantalla_spanishpair.jpg',
    images: {
      active: './img/opt1_activo.png',
      inactive: './img/opt1_inactivo.png',
      disabled: './img/opt1_gris.png',
      legacyBg: './img/fondo_pantalla_spanishpair.jpg',
    },
    theme: {
      name: 'blue',
      boardBg: 'bg-[#157A9E]',
      boardGradient: 'from-cyan-800 via-[#157A9E] to-sky-900',
      cardBg: 'bg-[#1B63E9] hover:bg-blue-600',
      cardActiveBg: 'bg-blue-500 ring-4 ring-amber-300',
      cardText: 'text-white',
      cardBorder: 'border-white/90',
      headerAccent: 'bg-sky-800 border-sky-400',
      columnHeaderBg: 'bg-sky-900/85 text-white border-sky-300',
      badgeColor: 'bg-blue-600 text-white',
    },
  },
  2: {
    id: 2,
    name: 'Futur simple – Présent',
    leftField: 'pre',
    rightField: 'fut',
    leftLabel: 'Présent',
    rightLabel: 'Futur simple',
    leftHasAudio: true,
    rightHasAudio: true,
    pointsDelta: 20,
    backgroundImage: './img/fondo_pantalla_futuro.jpg',
    images: {
      active: './img/opt2_activo.png',
      inactive: './img/opt2_inactivo.png',
      disabled: './img/opt2_gris.png',
      legacyBg: './img/fondo_pantalla_futuro.jpg',
    },
    theme: {
      name: 'emerald',
      boardBg: 'bg-[#0E8345]',
      boardGradient: 'from-emerald-800 via-[#0E8345] to-green-900',
      cardBg: 'bg-[#D4E157] hover:bg-lime-300',
      cardActiveBg: 'bg-lime-200 ring-4 ring-amber-400',
      cardText: 'text-slate-900',
      cardBorder: 'border-white/95',
      headerAccent: 'bg-emerald-800 border-emerald-400',
      columnHeaderBg: 'bg-emerald-900/85 text-white border-lime-300',
      badgeColor: 'bg-emerald-600 text-white',
    },
  },
  3: {
    id: 3,
    name: 'Passé composé – Présent',
    leftField: 'pre',
    rightField: 'pas',
    leftLabel: 'Présent',
    rightLabel: 'Passé composé',
    leftHasAudio: true,
    rightHasAudio: true,
    pointsDelta: 30,
    backgroundImage: './img/fondo_pantalla_pasado.jpg',
    images: {
      active: './img/opt3_activo.png',
      inactive: './img/opt3_inactivo.png',
      disabled: './img/opt3_gris.png',
      legacyBg: './img/fondo_pantalla_pasado.jpg',
    },
    theme: {
      name: 'purple',
      boardBg: 'bg-[#5B2C6F]',
      boardGradient: 'from-purple-900 via-[#5B2C6F] to-fuchsia-950',
      cardBg: 'bg-[#8E44AD] hover:bg-purple-600',
      cardActiveBg: 'bg-purple-500 ring-4 ring-amber-300',
      cardText: 'text-white',
      cardBorder: 'border-white/90',
      headerAccent: 'bg-purple-900 border-purple-400',
      columnHeaderBg: 'bg-purple-950/85 text-white border-purple-300',
      badgeColor: 'bg-purple-700 text-white',
    },
  },
});

/**
 * Obtiene la configuración de un modo gramatical por su ID (1, 2 o 3).
 * @param {number} modeId
 * @returns {object}
 */
export function getGrammarModeConfig(modeId) {
  return GRAMMAR_MODES[modeId] || GRAMMAR_MODES[1];
}

/**
 * Calcula la medalla obtenida en modalidad Compétition según el tiempo en segundos.
 * Regla oficial MEP:
 * - Oro: <= 185 s
 * - Plata: 186 s .. 199 s
 * - Bronce: >= 200 s
 *
 * @param {number} seconds - Tiempo total en segundos al finalizar los 7 niveles.
 * @returns {{ type: 'gold'|'silver'|'bronze', image: string, titleFr: string, titleEs: string, descriptionFr: string }}
 */
export function calculateMedal(seconds) {
  const safeSeconds = Number.isFinite(seconds) && seconds >= 0 ? Math.floor(seconds) : 0;

  if (safeSeconds <= MEDAL_THRESHOLDS.GOLD_MAX_SECONDS) {
    return {
      type: 'gold',
      image: './img/oro.jpg',
      titleFr: "Médaille d'Or",
      titleEs: 'Medalla de Oro',
      descriptionFr: 'Félicitations ! Tu as complété le marché aux verbes en un temps record !',
    };
  }

  if (safeSeconds <= MEDAL_THRESHOLDS.SILVER_MAX_SECONDS) {
    return {
      type: 'silver',
      image: './img/plata.jpg',
      titleFr: "Médaille d'Argent",
      titleEs: 'Medalla de Plata',
      descriptionFr: "Très bon travail ! Tu es tout près de la médaille d'or !",
    };
  }

  return {
    type: 'bronze',
    image: './img/bronce.jpg',
    titleFr: 'Médaille de Bronze',
    titleEs: 'Medalla de Bronce',
    descriptionFr: 'Bravo pour avoir terminé les 7 niveaux ! Continue à pratiquer pour améliorer ton temps.',
  };
}
