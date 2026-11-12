import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../App.jsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VERBS_JSON_PATH = path.resolve(__dirname, '../../public/data/verbs.json');
const realVerbs = JSON.parse(fs.readFileSync(VERBS_JSON_PATH, 'utf-8'));

describe('Suite 5: Pruebas de Integración de Componentes e Interacción E2E (<App />)', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => realVerbs,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra el SplashScreen inicial, permite omitirlo, abre MenuModal con los 3 modos bloqueados y los desbloquea al elegir Formation o Compétition', async () => {
    render(<App />);

    // 1. Verificar pantalla Splash
    expect(
      screen.getByRole('region', { name: /Pantalla de bienvenida Le marché aux verbes/i })
    ).toBeInTheDocument();

    // Esperar a que termine la carga del fetch mockeado
    await waitFor(() => {
      expect(screen.getByText(/Bienvenue au Marché aux Verbes !/i)).toBeInTheDocument();
    });

    // 2. Omitir el Splash haciendo clic en "Entrer au marché"
    fireEvent.click(screen.getByRole('button', { name: /Entrer au marché/i }));

    // 3. Verificar que se abre el MenuModal y que los 3 modos están inicialmente deshabilitados
    const menuDialog = screen.getByRole('dialog', { name: /Menu principal/i });
    expect(menuDialog).toBeInTheDocument();

    const btnMode1 = screen.getByTestId('btn-mode-1');
    const btnMode2 = screen.getByTestId('btn-mode-2');
    const btnMode3 = screen.getByTestId('btn-mode-3');

    expect(btnMode1).toBeDisabled();
    expect(btnMode2).toBeDisabled();
    expect(btnMode3).toBeDisabled();

    // 4. Seleccionar modalidad Formation -> se habilitan los 3 botones de modo
    const btnFormation = screen.getByTestId('btn-modality-formation');
    fireEvent.click(btnFormation);
    expect(btnFormation).toHaveAttribute('aria-pressed', 'true');
    expect(btnMode1).not.toBeDisabled();
    expect(btnMode2).not.toBeDisabled();
    expect(btnMode3).not.toBeDisabled();

    // 5. Cambiar a modalidad Compétition -> siguen habilitados
    const btnCompetition = screen.getByTestId('btn-modality-competition');
    fireEvent.click(btnCompetition);
    expect(btnCompetition).toHaveAttribute('aria-pressed', 'true');
    expect(btnFormation).toHaveAttribute('aria-pressed', 'false');
    expect(btnMode1).not.toBeDisabled();
  });

  it('inicia partida en Modo 1, muestra encabezado "Sujet", "Niveau: 1 / 7", "But: 0", y permite emparejar tarjetas por Clic y por Drag & Drop actualizando la bandeja inferior', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Bienvenue au Marché aux Verbes !/i)).toBeInTheDocument();
    });

    // Omitir Splash, elegir Formation e iniciar Modo 1 (Espagnol - Présent)
    fireEvent.click(screen.getByRole('button', { name: /Entrer au marché/i }));
    fireEvent.click(screen.getByTestId('btn-modality-formation'));
    fireEvent.click(screen.getByTestId('btn-mode-1'));

    // El modal de menú debe cerrarse al iniciar la partida
    expect(screen.queryByRole('dialog', { name: /Menu principal/i })).not.toBeInTheDocument();

    // Verificar encabezados e indicadores de la zona central Sujet
    const dropZone = screen.getByTestId('sujet-dropzone');
    expect(within(dropZone).getByRole('heading', { name: 'Sujet' })).toBeInTheDocument();
    expect(screen.getByTestId('level-indicator')).toHaveTextContent('Niveau: 1 / 7');
    expect(screen.getByTestId('score-indicator')).toHaveTextContent('But: 0');

    // Localizar una tarjeta de la columna izquierda y su pareja exacta en la columna derecha
    const leftSection = screen.getByRole('region', { name: 'Espagnol' });
    const leftButtons = within(leftSection).getAllByRole('button');
    expect(leftButtons).toHaveLength(9);

    const firstLeftBtn = leftButtons[0];
    const firstVerbId = Number(firstLeftBtn.getAttribute('data-testid').replace('card-left-', ''));
    const matchingRightBtn = screen.getByTestId(`card-right-${firstVerbId}`);

    const expectedLeftText = firstLeftBtn.textContent.trim();
    const expectedRightText = matchingRightBtn.textContent.replace('🔊', '').trim();

    // --- EMPAREJAMIENTO 1: Por Clic (selectCard) ---
    fireEvent.click(firstLeftBtn);
    expect(screen.getByTestId('sujet-slot-left')).toHaveTextContent(expectedLeftText);

    fireEvent.click(matchingRightBtn);

    // El puntaje sube +10 y el par aparece en tray-slot-0
    expect(screen.getByTestId('score-indicator')).toHaveTextContent('But: 10');
    const traySlot0 = screen.getByTestId('tray-slot-0');
    expect(traySlot0).toHaveTextContent(expectedLeftText);
    expect(traySlot0).toHaveTextContent(expectedRightText);

    // --- EMPAREJAMIENTO 2: Por Drag & Drop hacia Sujet (sujet-dropzone) ---
    const secondLeftBtn = leftButtons[1];
    const secondVerbId = Number(secondLeftBtn.getAttribute('data-testid').replace('card-left-', ''));
    const secondRightBtn = screen.getByTestId(`card-right-${secondVerbId}`);

    const secondLeftText = secondLeftBtn.textContent.trim();
    const secondRightText = secondRightBtn.textContent.replace('🔊', '').trim();

    const dragStoreLeft = {};
    const dataTransferLeft = {
      setData: (type, val) => {
        dragStoreLeft[type] = val;
      },
      getData: (type) => dragStoreLeft[type] || '',
    };

    fireEvent.dragStart(secondLeftBtn, { dataTransfer: dataTransferLeft });
    fireEvent.dragEnter(dropZone, { dataTransfer: dataTransferLeft });
    fireEvent.dragOver(dropZone, { dataTransfer: dataTransferLeft });
    fireEvent.drop(dropZone, { dataTransfer: dataTransferLeft });

    expect(screen.getByTestId('sujet-slot-left')).toHaveTextContent(secondLeftText);

    const dragStoreRight = {};
    const dataTransferRight = {
      setData: (type, val) => {
        dragStoreRight[type] = val;
      },
      getData: (type) => dragStoreRight[type] || '',
    };

    fireEvent.dragStart(secondRightBtn, { dataTransfer: dataTransferRight });
    fireEvent.drop(dropZone, { dataTransfer: dataTransferRight });

    // El puntaje sube a 20 y la segunda pareja ocupa tray-slot-1
    expect(screen.getByTestId('score-indicator')).toHaveTextContent('But: 20');
    const traySlot1 = screen.getByTestId('tray-slot-1');
    expect(traySlot1).toHaveTextContent(secondLeftText);
    expect(traySlot1).toHaveTextContent(secondRightText);
  });

  it('abre y cierra los modales de Aide y À propos, corrige el título "Sujet" en Modo 3 y alterna el botón de silencio (Audio encendido / Audio apagado)', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Bienvenue au Marché aux Verbes !/i)).toBeInTheDocument();
    });

    // Iniciar partida en modalidad Compétition y Modo 3 (Passé composé - Présent)
    fireEvent.click(screen.getByRole('button', { name: /Entrer au marché/i }));
    fireEvent.click(screen.getByTestId('btn-modality-competition'));
    fireEvent.click(screen.getByTestId('btn-mode-3'));

    // En modo Compétition se muestra el cronómetro digital
    expect(screen.getByTestId('competition-timer')).toBeInTheDocument();

    // En Modo 3 el encabezado central es "Sujet" (corrigiendo el bug "Texto" del proyecto original)
    const dropZone = screen.getByTestId('sujet-dropzone');
    expect(within(dropZone).getByRole('heading', { name: 'Sujet' })).toBeInTheDocument();

    // 1. Abrir y cerrar modal de Aide (verificando z-index superior a las tarjetas .cartas)
    const sampleCard = within(screen.getByRole('region', { name: 'Présent' })).getAllByRole(
      'button'
    )[0];
    const cardZIndex = Number(sampleCard.style.zIndex || 99);

    fireEvent.click(screen.getByRole('button', { name: 'Aide' }));
    const helpDialog = screen.getByRole('dialog', { name: /Comment va-t-on jouer\?/i });
    expect(helpDialog).toBeInTheDocument();
    expect(Number(helpDialog.style.zIndex)).toBeGreaterThan(cardZIndex);
    expect(helpDialog).toHaveClass('animate-modalBackdropFade');
    expect(within(helpDialog).getByTestId('modal-dialog-box')).toHaveClass(
      'animate-modalSlideDown'
    );
    expect(within(helpDialog).getByText(/Bonne chance !/i)).toBeInTheDocument();

    fireEvent.click(within(helpDialog).getByRole('button', { name: /Compris !/i }));
    expect(screen.queryByRole('dialog', { name: /Comment va-t-on jouer\?/i })).not.toBeInTheDocument();

    // 2. Abrir y cerrar modal de À propos (Créditos oficiales MEP, verificando z-index superior y animación)
    fireEvent.click(screen.getByRole('button', { name: 'À propos' }));
    const aboutDialog = screen.getByRole('dialog', { name: /À propos/i });
    expect(aboutDialog).toBeInTheDocument();
    expect(Number(aboutDialog.style.zIndex)).toBeGreaterThan(cardZIndex);
    expect(aboutDialog).toHaveClass('animate-modalBackdropFade');
    expect(within(aboutDialog).getByTestId('modal-dialog-box')).toHaveClass(
      'animate-modalSlideDown'
    );
    expect(
      within(aboutDialog).getByText(/Ministerio de Educación Pública de Costa Rica/i)
    ).toBeInTheDocument();
    expect(within(aboutDialog).getByText(/Eugenia Rodríguez González/i)).toBeInTheDocument();

    fireEvent.click(within(aboutDialog).getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByRole('dialog', { name: /À propos/i })).not.toBeInTheDocument();

    // 3. Alternar botón de Audio (Audio encendido <-> Audio apagado)
    const audioBtnOn = screen.getByRole('button', { name: 'Audio encendido' });
    expect(audioBtnOn).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(audioBtnOn);
    const audioBtnOff = screen.getByRole('button', { name: 'Audio apagado' });
    expect(audioBtnOff).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(audioBtnOff);
    expect(screen.getByRole('button', { name: 'Audio encendido' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
