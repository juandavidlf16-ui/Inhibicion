
import React from 'react';
import { GameStatus } from '../types';

interface GameOverlayProps {
  gameStatus: GameStatus;
  onRestart: () => void;
  onRetry: () => void;
  lossReason: 'time' | 'caught' | null;
  currentLevel?: number;
  lives?: number;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ gameStatus, onRestart, onRetry, lossReason, currentLevel, lives = 1 }) => {

  if (gameStatus === GameStatus.LevelTransition) {
    return (
      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 rounded-2xl backdrop-blur-sm">
        <h2 className="text-6xl font-extrabold text-cyan-400 mb-4 animate-bounce text-shadow">
          ¡Nivel {currentLevel} Completado!
        </h2>
      </div>
    );
  }

  if (gameStatus !== GameStatus.Won && gameStatus !== GameStatus.Lost) {
    return null;
  }

  const lossMessages = {
    time: { title: "¡Se Acabó el Tiempo!" },
    caught: { title: "¡Te Moviste!" },
  };

  const isGameOver = gameStatus === GameStatus.Lost && lives <= 1;

  const getTitle = () => {
    if (isGameOver) return "¡Fin del Juego!";
    if (gameStatus === GameStatus.Won) return "¡Has Ganado el Juego!";
    return lossMessages[lossReason || 'caught'].title;
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 rounded-2xl backdrop-blur-sm text-center p-4">
      <h2 className="text-7xl font-black text-white mb-2 animate-pulse text-shadow">{getTitle()}</h2>
      {isGameOver && <p className="text-2xl font-bold text-yellow-300 mt-2 text-shadow">¡Inténtalo de nuevo! Esta vez con más calma.</p>}
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        {gameStatus === GameStatus.Won && (
          <button
            onClick={onRestart}
            className="px-8 py-3 text-lg font-bold text-gray-900 bg-yellow-400 rounded-lg shadow-lg hover:bg-yellow-300 active:bg-yellow-500 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
          >
            Jugar de Nuevo
          </button>
        )}
        {gameStatus === GameStatus.Lost && (
          <>
            {!isGameOver && (
              <button
                onClick={onRetry}
                className="px-8 py-3 text-lg font-bold text-gray-900 bg-yellow-400 rounded-lg shadow-lg hover:bg-yellow-300 active:bg-yellow-500 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
              >
                Reintentar Nivel
              </button>
            )}
            <button
              onClick={onRestart}
              className="px-8 py-3 text-lg font-bold text-white bg-slate-600 rounded-lg shadow-lg hover:bg-slate-500 active:bg-slate-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
            >
              Menú Principal
            </button>
          </>
        )}
      </div>
    </div>
  );
};
