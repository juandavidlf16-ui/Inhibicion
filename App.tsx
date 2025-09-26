
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Character, LightStatus, Difficulty } from './types';
import { GameOverlay } from './components/GameOverlay';
import { PlayerTrack } from './components/PlayerTrack';
import { FlagBearer } from './components/Doll';
import { RunnerCharacter, WaverCharacter } from './components/characters';
import { useSounds } from './hooks/useSounds';

// Constants
const TRACK_LENGTH = 100;
const PLAYER_ACCELERATION = 0.012;
const PLAYER_MAX_SPEED = 0.35;

const difficultyLevels: Difficulty[] = [
  { level: 1, gameDuration: 70, minGreenLight: 5000, maxGreenLight: 7000, minRedLight: 2500, maxRedLight: 3500, dollTurnSpeed: 500, changeThreshold: 75 },
  { level: 2, gameDuration: 60, minGreenLight: 4000, maxGreenLight: 6000, minRedLight: 2600, maxRedLight: 4000, dollTurnSpeed: 450, changeThreshold: 65 },
  { level: 3, gameDuration: 50, minGreenLight: 3000, maxGreenLight: 5000, minRedLight: 2800, maxRedLight: 4500, dollTurnSpeed: 380, changeThreshold: 55 },
  { level: 4, gameDuration: 45, minGreenLight: 2500, maxGreenLight: 4000, minRedLight: 3000, maxRedLight: 5000, dollTurnSpeed: 300, changeThreshold: 45 },
  { level: 5, gameDuration: 40, minGreenLight: 2000, maxGreenLight: 3000, minRedLight: 3500, maxRedLight: 5500, dollTurnSpeed: 250, changeThreshold: 35 },
  { level: 6, gameDuration: 35, minGreenLight: 1500, maxGreenLight: 2500, minRedLight: 4000, maxRedLight: 6000, dollTurnSpeed: 200, changeThreshold: 25 },
  { level: 7, gameDuration: 30, minGreenLight: 1200, maxGreenLight: 2000, minRedLight: 4500, maxRedLight: 6500, dollTurnSpeed: 160, changeThreshold: 20 },
];

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.NotStarted);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [playerVelocity, setPlayerVelocity] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [lightStatus, setLightStatus] = useState<LightStatus>(LightStatus.Green);
  const [isDollTurning, setIsDollTurning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lossReason, setLossReason] = useState<'time' | 'caught' | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [dangerPercentage, setDangerPercentage] = useState(0);
  const [lives, setLives] = useState(0);
  const [maxLives, setMaxLives] = useState(0);
  const [isRunButtonPressed, setIsRunButtonPressed] = useState(false);

  const { playClick, playStart, playGreenLight, playRedLight, playWin, playLose, playCaught, playMove, stopMove } = useSounds();

  const playerPositionRef = useRef(0);
  const playerVelocityRef = useRef(0);
  const gameIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const lightCheckIntervalRef = useRef<number | null>(null);
  const redLightTimeoutRef = useRef<number | null>(null);
  const rightArrowPressed = useRef(false);
  const greenLightStartTimeRef = useRef<number | null>(null);
  
  const stopRunning = useCallback(() => {
    rightArrowPressed.current = false;
    setIsRunButtonPressed(false);
    stopMove();
  }, [stopMove]);

  const startRunning = useCallback(() => {
    if (gameStatus !== GameStatus.InProgress) return;
    if (!rightArrowPressed.current) {
      rightArrowPressed.current = true;
      playMove();
    }
  }, [gameStatus, playMove]);

  const handleRunButtonActivate = useCallback(() => {
    if (gameStatus === GameStatus.InProgress) {
      setIsRunButtonPressed(true);
      startRunning();
    }
  }, [gameStatus, startRunning]);

  const handleRunButtonRelease = useCallback(() => {
    stopRunning();
  }, [stopRunning]);

  const cleanupTimers = useCallback(() => {
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (lightCheckIntervalRef.current) clearInterval(lightCheckIntervalRef.current);
    if (redLightTimeoutRef.current) clearTimeout(redLightTimeoutRef.current);
    stopRunning();
  }, [stopRunning]);

  const resetGame = useCallback(() => {
      cleanupTimers();
      playerPositionRef.current = 0;
      playerVelocityRef.current = 0;
      setPlayerPosition(0);
      setPlayerVelocity(0);
      setLightStatus(LightStatus.Green);
      setIsDollTurning(false);
      setLossReason(null);
      rightArrowPressed.current = false;
      setDangerPercentage(0);
      greenLightStartTimeRef.current = null;
      setIsRunButtonPressed(false);
  }, [cleanupTimers]);
  
  const setupLevel = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    resetGame();
    setTimeLeft(difficulty.gameDuration);
    setGameStatus(GameStatus.InProgress);
    playStart();
  }, [resetGame, playStart]);
  
  const handleRetry = useCallback(() => {
    playClick();
    setLives(prev => prev - 1);
    const currentDifficulty = difficultyLevels[currentLevel - 1];
    setupLevel(currentDifficulty);
  }, [currentLevel, setupLevel, playClick]);
  
  const startNextLevel = useCallback(() => {
    const nextLevelValue = currentLevel + 1;
    if (nextLevelValue > difficultyLevels.length) {
        setGameStatus(GameStatus.Won);
        return;
    }
    setCurrentLevel(nextLevelValue);
    const nextDifficulty = difficultyLevels[nextLevelValue - 1];
    setupLevel(nextDifficulty);
  }, [currentLevel, setupLevel]);
  
    // Sound effect for win/loss
    useEffect(() => {
        if (gameStatus === GameStatus.Lost) {
            stopMove();
            if (lossReason === 'caught') {
                playCaught();
            } else {
                playLose();
            }
        } else if (gameStatus === GameStatus.Won) {
            stopMove();
            playWin();
        }
    }, [gameStatus, lossReason, playCaught, playLose, playWin, stopMove]);

    // Light change cycle manager
    useEffect(() => {
      if (gameStatus !== GameStatus.InProgress || !selectedDifficulty) {
          return;
      }
  
      const triggerGreenLight = () => {
          setIsDollTurning(true);
          setTimeout(() => {
              setLightStatus(LightStatus.Green);
              setIsDollTurning(false);
          }, selectedDifficulty.dollTurnSpeed);
      };
  
      const triggerRedLight = () => {
          if (lightCheckIntervalRef.current) clearInterval(lightCheckIntervalRef.current);
          
          setIsDollTurning(true);
          setTimeout(() => {
              setLightStatus(LightStatus.Red);
              setIsDollTurning(false);
          }, selectedDifficulty.dollTurnSpeed);
      };
  
      if (lightStatus === LightStatus.Green) {
          greenLightStartTimeRef.current = Date.now();
          playGreenLight();
  
          lightCheckIntervalRef.current = window.setInterval(() => {
              const elapsedTime = Date.now() - (greenLightStartTimeRef.current ?? Date.now());
              const { minGreenLight, maxGreenLight, changeThreshold } = selectedDifficulty;
  
              if (elapsedTime >= maxGreenLight) {
                  triggerRedLight();
                  return;
              }
  
              if (elapsedTime >= minGreenLight) {
                  const currentPercentage = (elapsedTime / maxGreenLight) * 100;
                  if (currentPercentage >= changeThreshold) {
                      const checkInterval = 100; // ms, interval duration
                      const baseProbability = (currentPercentage - changeThreshold) / (100 - changeThreshold);
                      const chancePerSecond = baseProbability ** 2;
                      const chancePerInterval = chancePerSecond * (checkInterval / 1000);
                      
                      if (Math.random() < chancePerInterval) {
                          triggerRedLight();
                      }
                  }
              }
          }, 100);
  
      } else { // lightStatus is Red
          greenLightStartTimeRef.current = null;
          setDangerPercentage(0);
          playRedLight();
  
          // The duration of the red light will now be random between 1 and 6 seconds.
          // To make shorter waits more common and the game more dynamic, the random
          // distribution is skewed towards the lower end of the range.
          const randomFactor = Math.random() * Math.random();
          const redDuration = randomFactor * (6000 - 1000) + 1000;
  
          redLightTimeoutRef.current = window.setTimeout(triggerGreenLight, redDuration);
      }
  
      return () => {
          if (lightCheckIntervalRef.current) clearInterval(lightCheckIntervalRef.current);
          if (redLightTimeoutRef.current) clearTimeout(redLightTimeoutRef.current);
      }
  
  }, [gameStatus, lightStatus, selectedDifficulty, playGreenLight, playRedLight]);

  // Main Game Loop (Physics and UI updates)
  useEffect(() => {
    if (gameStatus === GameStatus.InProgress) {
      // Game Timer
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setLossReason('time');
            setGameStatus(GameStatus.Lost);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Physics and Game Logic Loop
      gameIntervalRef.current = window.setInterval(() => {
        if (rightArrowPressed.current) {
          playerVelocityRef.current += PLAYER_ACCELERATION;
          playerVelocityRef.current = Math.min(playerVelocityRef.current, PLAYER_MAX_SPEED);
        } else {
          playerVelocityRef.current = 0;
        }
        
        if (playerVelocityRef.current > 0.01 && lightStatus === LightStatus.Red && !isDollTurning) {
          setLossReason('caught');
          setGameStatus(GameStatus.Lost);
        }

        if (lightStatus === LightStatus.Green && greenLightStartTimeRef.current && selectedDifficulty) {
          const elapsedTime = Date.now() - greenLightStartTimeRef.current;
          const percentage = Math.min(100, (elapsedTime / selectedDifficulty.maxGreenLight) * 100);
          setDangerPercentage(percentage);
        }
  
        playerPositionRef.current += playerVelocityRef.current;
        playerPositionRef.current = Math.min(playerPositionRef.current, TRACK_LENGTH);
        
        setPlayerPosition(playerPositionRef.current);
        setPlayerVelocity(playerVelocityRef.current);
      }, 1000 / 60); // 60 FPS
    }
    
    return cleanupTimers;
  }, [gameStatus, cleanupTimers, lightStatus, isDollTurning, selectedDifficulty]);
  
  // Win Condition Check
  useEffect(() => {
    if (playerPosition >= TRACK_LENGTH) {
      cleanupTimers();
      if (currentLevel < difficultyLevels.length) {
        setGameStatus(GameStatus.LevelTransition);
      } else {
        setGameStatus(GameStatus.Won);
      }
    }
  }, [playerPosition, currentLevel, cleanupTimers]);

  // Level Transition Handler
  useEffect(() => {
    if (gameStatus === GameStatus.LevelTransition) {
        const transitionTimeout = setTimeout(() => {
            startNextLevel();
        }, 3000); // 3-second transition

        return () => clearTimeout(transitionTimeout);
    }
  }, [gameStatus, startNextLevel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        startRunning();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stopRunning();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopRunning();
    };
  }, [startRunning, stopRunning]);

  const returnToMenu = () => {
    playClick();
    setGameStatus(GameStatus.NotStarted);
    setSelectedCharacter(null);
    setSelectedDifficulty(null);
    setCurrentLevel(1);
    resetGame();
    setMaxLives(0);
    setLives(0);
  };

  useEffect(() => {
    if (gameStatus !== GameStatus.InProgress) {
      stopRunning();
    }
  }, [gameStatus, stopRunning]);
  
  const handleCharacterSelect = (character: Character) => {
    playClick();
    setSelectedCharacter(character);
    setCurrentLevel(1);
    const initialDifficulty = difficultyLevels[0];
    setupLevel(initialDifficulty);
  }

  const handleLifeSelect = (numLives: number) => {
    playClick();
    setMaxLives(numLives);
    setLives(numLives);
  };
  
  const LivesDisplay = () => (
      <div className="flex flex-col items-center justify-center w-32 h-24 bg-slate-900/50 rounded-lg border border-slate-700 z-20 shadow-lg p-2">
           <span className="text-sm font-bold text-slate-400 uppercase tracking-wider text-shadow">Vidas</span>
           <div className="flex gap-1 mt-2">
              {Array.from({ length: maxLives }).map((_, i) => (
                <span key={i} className={`text-3xl transition-colors ${i < lives ? 'text-red-500' : 'text-slate-600'}`} style={{filter: 'drop-shadow(0 0 3px #ef4444)'}}>♥</span>
              ))}
           </div>
      </div>
  );

  const TimerDisplay = () => (
      <div className="flex flex-col items-center justify-center w-32 h-24 bg-slate-900/50 rounded-lg border border-slate-700 z-20 shadow-lg p-2">
           <span className="text-sm font-bold text-slate-400 uppercase tracking-wider text-shadow">Tiempo</span>
           <span className={`text-4xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'} text-shadow`}>
              {timeLeft}
          </span>
      </div>
  );

  const DangerIndicator: React.FC<{ percentage: number }> = ({ percentage }) => {
      const getDangerColor = () => {
          if (percentage > 75) return 'text-red-500';
          if (percentage > 40) return 'text-yellow-400';
          return 'text-green-400';
      };

      return (
          <div className="flex flex-col items-center justify-center w-32 h-24 bg-slate-900/50 rounded-lg border border-slate-700 z-20 shadow-lg p-2">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider text-shadow">Peligro Rojo</span>
              <span className={`text-4xl font-black ${getDangerColor()} text-shadow`}>
                  {Math.floor(percentage)}%
              </span>
          </div>
      );
  };

  const LevelDisplay = () => (
    <div className="flex flex-col items-center justify-center w-32 h-24 bg-slate-900/50 rounded-lg border border-slate-700 z-20 shadow-lg p-2">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider text-shadow">Nivel</span>
        <span className="text-4xl font-black text-cyan-400 text-shadow">{currentLevel}</span>
    </div>
  );

  const LifeSelectionScreen = () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/80 via-slate-950/85 to-amber-900/80"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[120%] h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <h1 className="text-7xl font-black text-slate-100 tracking-wider mb-4 text-shadow" style={{ WebkitTextStroke: '2px #1e293b' }}>Luz Roja, Luz Verde</h1>
          <p className="text-slate-300/90 mb-8 text-lg font-semibold max-w-2xl">¿Cuántas oportunidades necesitas para superar los 7 niveles? Cada intento suma experiencia.</p>
          <div className="flex flex-col sm:flex-row gap-8">
            {[1, 2, 3].map(num => (
              <button
                key={num}
                onClick={() => handleLifeSelect(num)}
                className="flex flex-col items-center justify-center p-6 border-4 rounded-xl transition-all w-48 text-center bg-slate-900/70 shadow-[0_15px_35px_rgba(15,118,110,0.35)] border-slate-700 hover:border-cyan-400 hover:scale-105"
                aria-label={`Jugar con ${num} ${num === 1 ? 'vida' : 'vidas'}`}
              >
                <span className="text-5xl font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">{num}</span>
                <span className="mt-2 font-bold text-slate-200 uppercase tracking-wide">{num === 1 ? 'Vida' : 'Vidas'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
  );

  const CharacterSelectionScreen = () => (
     <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-amber-900/70"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[110%] h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-7xl font-black text-slate-100 tracking-wider mb-4 text-shadow" style={{ WebkitTextStroke: '2px #1e293b' }}>Luz Roja, Luz Verde</h1>
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 max-w-2xl text-center mb-8 shadow-[0_25px_45px_rgba(30,64,175,0.35)] backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-yellow-300 mb-2">Cómo Jugar</h2>
          <p className="text-slate-300 text-left space-y-2">
            <span><strong>Objetivo:</strong> Supera los 7 niveles y llega a la meta final antes de que se acabe el tiempo.</span>
            <br/>
            <span><strong>Reglas:</strong> ¡Corre durante la LUZ VERDE y quédate QUIETO durante la LUZ ROJA! Si te mueves durante la luz roja, pierdes una vida.</span>
             <br/>
            <span><strong>Control:</strong> Mantén pulsada la <strong>Flecha Derecha</strong> para correr.</span>
             <br/>
            <span><strong>¡Ojo al Peligro!:</strong> El indicador de "Peligro Rojo" muestra la probabilidad de que la luz cambie. ¡Cuanto más alto sea el porcentaje, más arriesgado es seguir corriendo!</span>
          </p>
        </div>
        <p className="text-slate-200/90 mb-8 text-lg font-semibold">Elige tu personaje para empezar y prepárate para el reto.</p>
        <div className="flex flex-col sm:flex-row gap-8 mb-12">
            <div
              onClick={() => handleCharacterSelect(Character.Runner)}
              className={`cursor-pointer p-6 border-4 rounded-2xl transition-all w-48 text-center bg-slate-900/70 shadow-[0_15px_35px_rgba(56,189,248,0.35)] ${selectedCharacter === Character.Runner ? 'border-cyan-400 scale-105' : 'border-slate-700 hover:border-cyan-400 hover:scale-105'}`}
              aria-label="Seleccionar El Corredor" role="button"
            >
                <RunnerCharacter isMoving={true} />
                <p className="mt-2 font-bold text-cyan-400">El Corredor</p>
            </div>
            <div
              onClick={() => handleCharacterSelect(Character.Waver)}
              className={`cursor-pointer p-6 border-4 rounded-2xl transition-all w-48 text-center bg-slate-900/70 shadow-[0_15px_35px_rgba(253,224,71,0.35)] ${selectedCharacter === Character.Waver ? 'border-yellow-400 scale-105' : 'border-slate-700 hover:border-yellow-400 hover:scale-105'}`}
              aria-label="Seleccionar El Saludador" role="button"
            >
                <WaverCharacter isMoving={true} />
                <p className="mt-2 font-bold text-yellow-400">El Saludador</p>
            </div>
        </div>
        </div>
    </div>
  );
  
  const GameScreen = () => (
     <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden relative p-4">
        <GameOverlay gameStatus={gameStatus} onRestart={returnToMenu} onRetry={handleRetry} lossReason={lossReason} currentLevel={currentLevel} lives={lives} />

        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-slate-900 to-amber-900 opacity-90"></div>
          <div className="absolute inset-x-0 top-10 h-40 bg-gradient-to-b from-slate-800/80 via-slate-900/60 to-transparent shadow-inner"></div>
          <div className="absolute inset-x-0 top-0 h-56" style={{
            backgroundImage: 'repeating-linear-gradient(-45deg, rgba(148, 163, 184, 0.18) 0, rgba(148, 163, 184, 0.18) 12px, transparent 12px, transparent 24px)'
          }}></div>
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-amber-900/70 via-amber-800/40 to-transparent"></div>
          <div className="absolute inset-x-0 top-24 h-24 flex justify-around px-8 opacity-70">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="w-24 h-16 bg-slate-700/60 rounded-full blur-2xl"></div>
            ))}
          </div>
        </div>

        <div className="absolute top-4 left-4 flex gap-4">
          <LevelDisplay />
          <LivesDisplay />
        </div>
        
        <div className="absolute top-4 right-4 flex gap-4">
          <TimerDisplay />
          <DangerIndicator percentage={dangerPercentage} />
        </div>
        
        {/* Red light screen tint */}
        <div className={`absolute inset-0 bg-red-800/50 z-10 transition-opacity duration-300 ${lightStatus === LightStatus.Red && !isDollTurning ? 'opacity-100' : 'opacity-0'} pointer-events-none`}></div>

        <div className="w-full text-center mb-4 z-20">
            <h1 className="text-5xl font-extrabold tracking-wider text-shadow">
                {lightStatus === LightStatus.Green ? 
                  <span className="text-green-400">¡Luz Verde - Corre!</span> : 
                  <span className="text-red-500">¡Luz Roja - Quieto!</span>}
            </h1>
            <p className="text-slate-400 text-lg mt-2">
              Mantén <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">Flecha Derecha</kbd> para correr. ¡Suelta para parar!
            </p>
        </div>

        <div className="w-full max-w-7xl h-64 border-y-4 border-amber-900/50 relative flex items-center p-4 perspective-800"
          style={{
            backgroundColor: '#5a3723',
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35), transparent 45%),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 6%, transparent 6%, transparent 12%),
              radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0, transparent 55%),
              radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0, transparent 55%)`,
            backgroundSize: '100% 100%, 140px 100%, 100% 100%, 100% 100%',
            boxShadow: 'inset 0 12px 18px rgba(0,0,0,0.6), inset 0 -12px 18px rgba(0,0,0,0.6)'
          }}
        >
            <div className="absolute inset-0 flex justify-between px-16 pointer-events-none">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="w-1 h-full bg-white/25 rounded-full"></div>
              ))}
            </div>
            <div className="absolute inset-x-10 top-8 h-2 bg-white/40 rounded-full blur-[1px] pointer-events-none"></div>
            <div className="absolute inset-x-6 bottom-10 h-3 bg-amber-700/60 rounded-full blur-sm pointer-events-none"></div>
            <PlayerTrack
              progress={playerPosition}
              selectedCharacter={selectedCharacter!}
              isMoving={playerVelocity > 0.01 && lightStatus === LightStatus.Green}
            />
             <FlagBearer 
                lightStatus={lightStatus} 
                isTurning={isDollTurning} 
                turnSpeed={selectedDifficulty?.dollTurnSpeed || 500} 
            />
        </div>

        <div className="mt-10 z-20 flex flex-col items-center gap-3">
          <button
            onMouseDown={(e) => { e.preventDefault(); handleRunButtonActivate(); }}
            onMouseUp={(e) => { e.preventDefault(); handleRunButtonRelease(); }}
            onMouseLeave={(e) => { e.preventDefault(); handleRunButtonRelease(); }}
            onTouchStart={(e) => { e.preventDefault(); handleRunButtonActivate(); }}
            onTouchEnd={(e) => { e.preventDefault(); handleRunButtonRelease(); }}
            onTouchCancel={(e) => { e.preventDefault(); handleRunButtonRelease(); }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleRunButtonActivate();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleRunButtonRelease();
              }
            }}
            className={`px-10 py-4 rounded-full font-black text-lg tracking-wide transition-all duration-200 shadow-2xl border-4 border-emerald-400/70 focus:outline-none focus:ring-4 focus:ring-emerald-300/60 ${
              isRunButtonPressed ? 'scale-105 bg-emerald-400 text-slate-900' : 'bg-emerald-500/90 text-slate-900 hover:bg-emerald-400'
            }`}
            aria-pressed={isRunButtonPressed}
            tabIndex={0}
          >
            Mantén pulsado para correr
          </button>
          <p className="text-sm text-slate-200/80 max-w-xl text-center">
            También puedes usar la tecla <kbd className="font-sans px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Flecha Derecha</kbd>.
            Suelta el botón o la tecla para detenerte antes de la luz roja.
          </p>
        </div>

     </div>
  );


  return (
    <main className="min-h-screen text-white font-sans antialiased flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at top, rgba(56, 189, 248, 0.15), transparent 60%),
          radial-gradient(circle at bottom, rgba(217, 119, 6, 0.2), transparent 65%)`
      }}
    >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-10 pointer-events-none"></div>
        {gameStatus === GameStatus.NotStarted && maxLives === 0 && <LifeSelectionScreen />}
        {gameStatus === GameStatus.NotStarted && maxLives > 0 && <CharacterSelectionScreen />}
        {gameStatus !== GameStatus.NotStarted && <GameScreen />}
    </main>
  );
};

export default App;
