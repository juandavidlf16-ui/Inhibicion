
import React from 'react';
import { Character } from '../types';
import { RunnerCharacter, WaverCharacter } from './characters';

interface PlayerTrackProps {
  progress: number;
  selectedCharacter: Character;
  isMoving: boolean;
}

const CharacterComponent: React.FC<{ character: Character; isMoving: boolean;}> = ({ character, isMoving }) => {
  const Comp = character === Character.Runner ? RunnerCharacter : WaverCharacter;
  return <Comp isMoving={isMoving} />;
};


export const PlayerTrack: React.FC<PlayerTrackProps> = ({ progress, selectedCharacter, isMoving }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <>
      <div 
        className="absolute bottom-4 transition-all duration-100 ease-linear z-20"
        style={{ 
            left: `calc(${clampedProgress}% - ${clampedProgress / 100 * 48}px)`,
            filter: 'drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.4))'
        }}
      >
        <CharacterComponent character={selectedCharacter} isMoving={isMoving} />
      </div>
      {/* Finish Line */}
      <div 
        className="absolute right-0 top-0 h-full w-5 z-10"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: `
            linear-gradient(45deg, #1f2937 25%, transparent 25%), 
            linear-gradient(-45deg, #1f2937 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #1f2937 75%), 
            linear-gradient(-45deg, transparent 75%, #1f2937 75%)`,
          backgroundSize: '20px 20px',
        }}
      >
      </div>
    </>
  );
};
