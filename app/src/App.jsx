import React from 'react';
import { useGameEngine } from './hooks/useGameEngine.js';
import { GAME_PHASES } from './constants/gameConfig.js';
import SplashScreen from './components/game/SplashScreen.jsx';
import HeaderBar from './components/layout/HeaderBar.jsx';
import GameBoard from './components/game/GameBoard.jsx';
import MatchedPairsTray from './components/game/MatchedPairsTray.jsx';
import MenuModal from './components/modals/MenuModal.jsx';
import HelpModal from './components/modals/HelpModal.jsx';
import AboutModal from './components/modals/AboutModal.jsx';
import EndGameModal from './components/modals/EndGameModal.jsx';

/**
 * @file App.jsx
 * @description Componente raíz de "Le marché aux verbes" (MEP - GESPRO).
 * Orquesta el motor de juego (`useGameEngine`) con la arquitectura modular de componentes
 * estilizados en Tailwind CSS con fidelidad visual 1:1 respecto al recurso original.
 */
export default function App() {
  const engine = useGameEngine();

  const {
    phase,
    isLoadingVerbs,
    loadError,
    modality,
    isModeSelectionUnlocked,
    grammarMode,
    modeConfig,
    level,
    totalLevels,
    score,
    leftCards,
    rightCards,
    selectedLeft,
    selectedRight,
    isLeftLocked,
    isRightLocked,
    matchedPairs,
    feedbackStatus,
    showTutorialArrows,
    seconds,
    formattedTime,
    medal,
    audioOn,
    isMenuOpen,
    canCloseMenu,
    isHelpOpen,
    isAboutOpen,
    selectModality,
    startGame,
    selectCard,
    dropCard,
    previewCardAudio,
    nextLevel,
    returnToMenu,
    openMenu,
    closeMenu,
    openHelp,
    closeHelp,
    openAbout,
    closeAbout,
    toggleAudio,
    skipSplash,
  } = engine;

  const handleDragStart = (event, card) => {
    if (event?.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(card));
    }
    previewCardAudio(card);
  };

  if (phase === GAME_PHASES.SPLASH) {
    return (
      <SplashScreen
        isLoadingVerbs={isLoadingVerbs}
        onSkip={skipSplash}
      />
    );
  }

  if (phase === GAME_PHASES.MENU_INITIAL) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none">
        <img
          src="./img/fondo_splash.jpg"
          alt="start Background"
          className="fixed inset-0 w-screen h-screen object-fill block"
        />

        {loadError && (
          <div
            role="alert"
            className="relative z-40 m-4 p-4 rounded-2xl bg-red-600 text-white font-extrabold text-center shadow-xl border-2 border-white"
          >
            {loadError}
          </div>
        )}

        <MenuModal
          isOpen={isMenuOpen}
          canCloseMenu={canCloseMenu}
          modality={modality}
          grammarMode={grammarMode}
          isModeSelectionUnlocked={isModeSelectionUnlocked}
          onSelectModality={selectModality}
          onStartGame={startGame}
          onCloseMenu={closeMenu}
        />
      </div>
    );
  }

  return (
    <div
      id="contenedor_principal"
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-[#16748C] font-handlee"
    >
      {/* Fondo ilustrado 1:1 del modo gramatical activo (#contenedor_fondos) */}
      <div
        id="contenedor_fondos"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      >
        <img
          id="fondo_pantalla"
          src={modeConfig?.backgroundImage || modeConfig?.images?.legacyBg}
          alt="background"
          className="w-full h-full object-fill block"
        />
      </div>

      {/* Barra superior con reloj y botones de acceso (#encabezado) */}
      <HeaderBar
        modeConfig={modeConfig}
        modality={modality}
        seconds={seconds}
        formattedTime={formattedTime}
        onOpenHelp={openHelp}
        onOpenMenu={openMenu}
        onOpenAbout={openAbout}
      />

      {/* Alerta en caso de error de red al cargar verbs.json */}
      {loadError && (
        <div
          role="alert"
          className="relative z-40 m-4 p-4 rounded-2xl bg-red-600 text-white font-extrabold text-center shadow-xl border-2 border-white"
        >
          {loadError}
        </div>
      )}

      {/* Tablero principal de 3 zonas (#izquierdo | #principal | #derecho) */}
      <GameBoard
        phase={phase}
        modeConfig={modeConfig}
        level={level}
        totalLevels={totalLevels}
        score={score}
        leftCards={leftCards}
        rightCards={rightCards}
        selectedLeft={selectedLeft}
        selectedRight={selectedRight}
        isLeftLocked={isLeftLocked}
        isRightLocked={isRightLocked}
        feedbackStatus={feedbackStatus}
        showTutorialArrows={showTutorialArrows}
        onSelectCard={selectCard}
        onDropCard={dropCard}
        onDragStart={handleDragStart}
        onNextLevel={nextLevel}
      />

      {/* Bandeja inferior de 9 parejas resueltas (#pie) */}
      <MatchedPairsTray matchedPairs={matchedPairs} />

      {/* Switch de sonido inferior derecho (#switch_audio) */}
      <button
        id="switch_audio"
        type="button"
        onClick={toggleAudio}
        aria-label={audioOn ? 'Audio encendido' : 'Audio apagado'}
        aria-pressed={audioOn}
        title={audioOn ? 'Couper le son' : 'Activer le son'}
        className="absolute top-[96.8%] left-[90.5%] w-[4%] h-[3%] z-30 cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
      >
        <img
          id="img_audio"
          src={audioOn ? './img/icon_volumen1.png' : './img/icon_volumen2.png'}
          alt={audioOn ? 'Audio encendido' : 'Audio apagado'}
          className="w-full h-full object-contain block"
        />
      </button>

      {/* Modal de Menú Principal */}
      <MenuModal
        isOpen={isMenuOpen}
        canCloseMenu={canCloseMenu}
        modality={modality}
        grammarMode={grammarMode}
        isModeSelectionUnlocked={isModeSelectionUnlocked}
        onSelectModality={selectModality}
        onStartGame={startGame}
        onCloseMenu={closeMenu}
      />

      {/* Modal de Instrucciones / Aide */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={closeHelp}
      />

      {/* Modal de Créditos Oficiales MEP / À propos */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={closeAbout}
      />

      {/* Modal de Fin de Juego (Medallas Compétition o Resumen Formation) */}
      <EndGameModal
        isOpen={phase === GAME_PHASES.GAME_OVER}
        modality={modality}
        medal={medal}
        seconds={seconds}
        score={score}
        totalLevels={totalLevels}
        onReturnToMenu={returnToMenu}
      />
    </div>
  );
}
