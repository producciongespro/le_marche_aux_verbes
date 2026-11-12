import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isValidVerbRecord,
  fetchVerbs,
  shuffleArray,
  getLevelSlice,
  getLevelVerbs,
  buildLevelCards,
} from '../services/verbService.js';
import { GAME_CONSTANTS } from '../constants/gameConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const VERBS_JSON_PATH = path.join(PUBLIC_DIR, 'data', 'verbs.json');
const AUDIO_DIR = path.join(PUBLIC_DIR, 'audio');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');

const realVerbs = JSON.parse(fs.readFileSync(VERBS_JSON_PATH, 'utf-8'));

describe('Suite 1: Integridad del Catálogo Real public/data/verbs.json y Activos Multimedia', () => {
  it('contiene exactamente 82 verbos únicos y el duplicado id: 46 fue eliminado', () => {
    expect(Array.isArray(realVerbs)).toBe(true);
    expect(realVerbs).toHaveLength(82);

    const ids = realVerbs.map((v) => v.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(82);
    expect(uniqueIds.has(46)).toBe(false);
  });

  it('todos los registros cumplen el contrato de isValidVerbRecord()', () => {
    realVerbs.forEach((verb) => {
      expect(isValidVerbRecord(verb)).toBe(true);
    });
  });

  it('ningún campo de texto (esp, pre, pas, fut) contiene etiquetas <br> ni espacios sobrantes al inicio o final', () => {
    realVerbs.forEach((verb) => {
      ['esp', 'pre', 'pas', 'fut'].forEach((field) => {
        const value = verb[field];
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
        expect(value).not.toMatch(/<br\s*\/?>/i);
        expect(value).toBe(value.trim());
      });
    });
  });

  it('contiene las 4 correcciones ortográficas y tipográficas especificadas en SPEC 3.2', () => {
    const verb38 = realVerbs.find((v) => v.id === 38);
    const verb53 = realVerbs.find((v) => v.id === 53);
    const verb60 = realVerbs.find((v) => v.id === 60);
    const verb63 = realVerbs.find((v) => v.id === 63);

    expect(verb38?.esp).toBe('quedarse');
    expect(verb53?.fut).toBe("J'aurai");
    expect(verb60?.pre).toBe('écrire');
    expect(verb63?.pas).toBe("J'ai rempli");
  });

  it('el 100% de los 246 enlaces de pronunciación (audio.pre, audio.pas, audio.fut) existen físicamente en public/audio/', () => {
    const existingAudioFiles = new Set(fs.readdirSync(AUDIO_DIR));
    let checkedLinks = 0;
    const missingLinks = [];

    realVerbs.forEach((verb) => {
      ['pre', 'pas', 'fut'].forEach((tense) => {
        const audioFilename = verb.audio?.[tense];
        checkedLinks += 1;
        if (!audioFilename || !existingAudioFiles.has(audioFilename)) {
          missingLinks.push(`id:${verb.id} (${tense}) -> ${audioFilename}`);
        }
      });
    });

    expect(checkedLinks).toBe(246);
    expect(missingLinks).toEqual([]);
  });

  it('existen físicamente los activos de música de fondo y efectos de sonido en public/assets/', () => {
    const requiredAssets = [
      'pacificSun.mp3',
      'let_your_body.mp3',
      'try_again.mp3',
      'correct.mp3',
      'alert1.wav',
    ];

    requiredAssets.forEach((assetFile) => {
      const fullPath = path.join(ASSETS_DIR, assetFile);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });
});

describe('Suite 2: Funciones de Servicio verbService.js', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isValidVerbRecord rechaza objetos incompletos o mal formados', () => {
    expect(isValidVerbRecord(null)).toBe(false);
    expect(isValidVerbRecord({})).toBe(false);
    expect(
      isValidVerbRecord({
        id: 1,
        esp: 'comer',
        pre: 'manger',
        pas: "J'ai mangé",
        fut: 'Je mangerai',
        audio: null,
      })
    ).toBe(false);
  });

  it('fetchVerbs() carga y valida exitosamente el catálogo JSON usando fetch()', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => realVerbs,
    });

    const data = await fetchVerbs('./data/verbs.json');
    expect(fetchSpy).toHaveBeenCalledWith('./data/verbs.json');
    expect(data).toHaveLength(82);
    expect(data[0].esp).toBe('mirar');
  });

  it('fetchVerbs() lanza un error descriptivo cuando la respuesta HTTP no es ok (ej. 404)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    await expect(fetchVerbs('./data/missing.json')).rejects.toThrow(/HTTP 404/);
  });

  it('fetchVerbs() lanza un error si el catálogo tiene menos de 63 verbos requeridos para los 7 niveles', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => realVerbs.slice(0, 10),
    });

    await expect(fetchVerbs('./data/verbs.json')).rejects.toThrow(/menos de 63 verbos/);
  });

  it('shuffleArray() baraja con Fisher-Yates de forma inmutable conservando todos los elementos', () => {
    const original = realVerbs.slice(0, 15);
    const snapshot = [...original];

    // Generador determinista para garantizar cambio de orden reproducible
    let seed = 1;
    const deterministicRandom = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const shuffled = shuffleArray(original, deterministicRandom);

    // No muta el arreglo original
    expect(original).toEqual(snapshot);
    expect(shuffled).not.toBe(original);

    // Conserva longitud y exactamente los mismos elementos
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.map((v) => v.id).sort((a, b) => a - b)).toEqual(
      original.map((v) => v.id).sort((a, b) => a - b)
    );

    // El orden cambió respecto al original
    expect(shuffled.map((v) => v.id)).not.toEqual(original.map((v) => v.id));

    // Entrada inválida devuelve arreglo vacío
    expect(shuffleArray(null)).toEqual([]);
  });

  it('getLevelSlice() / getLevelVerbs() particiona 7 niveles de 9 verbos (63 verbos únicos sin repetición)', () => {
    const shuffled = shuffleArray(realVerbs);
    const seenIds = new Set();

    for (let level = 1; level <= GAME_CONSTANTS.TOTAL_LEVELS; level += 1) {
      const slice = getLevelSlice(shuffled, level);
      expect(slice).toHaveLength(GAME_CONSTANTS.CARDS_PER_LEVEL);
      expect(getLevelVerbs(shuffled, level)).toEqual(slice);

      slice.forEach((verb) => {
        expect(seenIds.has(verb.id)).toBe(false);
        seenIds.add(verb.id);
      });
    }

    expect(seenIds.size).toBe(GAME_CONSTANTS.TOTAL_GAME_VERBS); // 7 * 9 = 63
    expect(getLevelSlice([], 1)).toEqual([]);
  });

  it('buildLevelCards() genera tarjetas para Modo 1 (Espagnol - Présent) con audio solo a la derecha', () => {
    const sample9 = realVerbs.slice(0, 9);
    const { leftCards, rightCards } = buildLevelCards(sample9, 1);

    expect(leftCards).toHaveLength(9);
    expect(rightCards).toHaveLength(9);

    // Columna izquierda mantiene el orden del segmento y muestra español sin audio
    expect(leftCards[0]).toMatchObject({
      uid: `left-${sample9[0].id}`,
      verbId: sample9[0].id,
      side: 'left',
      text: sample9[0].esp,
      audioFile: null,
      matched: false,
    });

    // Columna derecha contiene los mismos 9 verbos en Présent con audio.pre
    const rightMatch = rightCards.find((c) => c.verbId === sample9[0].id);
    expect(rightMatch).toMatchObject({
      uid: `right-${sample9[0].id}`,
      verbId: sample9[0].id,
      side: 'right',
      text: sample9[0].pre,
      audioFile: sample9[0].audio.pre,
      matched: false,
    });
  });

  it('buildLevelCards() genera tarjetas para Modo 2 (Futur simple - Présent) con audio en ambas columnas', () => {
    const sample9 = realVerbs.slice(0, 9);
    const { leftCards, rightCards } = buildLevelCards(sample9, 2);

    expect(leftCards[0]).toMatchObject({
      side: 'left',
      text: sample9[0].pre,
      audioFile: sample9[0].audio.pre,
    });

    const rightMatch = rightCards.find((c) => c.verbId === sample9[0].id);
    expect(rightMatch).toMatchObject({
      side: 'right',
      text: sample9[0].fut,
      audioFile: sample9[0].audio.fut,
    });
  });

  it('buildLevelCards() genera tarjetas para Modo 3 (Passé composé - Présent) con audio en ambas columnas', () => {
    const sample9 = realVerbs.slice(0, 9);
    const { leftCards, rightCards } = buildLevelCards(sample9, 3);

    expect(leftCards[0]).toMatchObject({
      side: 'left',
      text: sample9[0].pre,
      audioFile: sample9[0].audio.pre,
    });

    const rightMatch = rightCards.find((c) => c.verbId === sample9[0].id);
    expect(rightMatch).toMatchObject({
      side: 'right',
      text: sample9[0].pas,
      audioFile: sample9[0].audio.pas,
    });
  });
});
