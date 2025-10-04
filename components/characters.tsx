
import React, { useEffect, useState } from 'react';

interface CharacterProps {
  isMoving: boolean;
}

const RunnerSVG: React.FC<{ pose: 1 | 2 }> = ({ pose }) => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="20" r="10" stroke="#06b6d4" strokeWidth="6"/>
    {pose === 1 ? (
      <>
        <line x1="50" y1="30" x2="50" y2="60" stroke="#06b6d4" strokeWidth="6"/>
        <line x1="50" y1="45" x2="30" y2="35" stroke="#06b6d4" strokeWidth="6"/>
        <line x1="50" y1="45" x2="70" y2="55" stroke="#06b6d4" strokeWidth="6"/>
        <line x1="50" y1="60" x2="70" y2="85" stroke="#06b6d4" strokeWidth="6"/>
        <line x1="50" y1="60" x2="30" y2="80" stroke="#06b6d4" strokeWidth="6"/>
      </>
    ) : (
      <>
        <line x1="50" y1="30" x2="50" y2="60" stroke="#06b6d4" strokeWidth="6"/>
        <line x1="50" y1="45" x2="70" y2="35" stroke="#06b6d4" strokeWidth="6"/>
        <line x1="50" y1="45" x2="30" y2="55" stroke="#06b6d4" strokeWidth="6"/>
        <line x1="50" y1="60" x2="30" y2="85" stroke="#06b6d4" strokeWidth="6"/>
        <line x1="50" y1="60" x2="70" y2="80" stroke="#06b6d4" strokeWidth="6"/>
      </>
    )}
  </svg>
);

const WaverSVG: React.FC = () => (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="50" cy="20" r="10" stroke="#facc15" strokeWidth="6"/>
        <line x1="50" y1="30" x2="50" y2="60" stroke="#facc15" strokeWidth="6"/>
        <line x1="50" y1="40" x2="30" y2="25" stroke="#facc15" strokeWidth="6" className={'animate-wave'}/>
        <line x1="50" y1="40" x2="70" y2="55" stroke="#facc15" strokeWidth="6"/>
        <line x1="50" y1="60" x2={'65'} y2={'85'} stroke="#facc15" strokeWidth="6"/>
        <line x1="50" y1="60" x2={'35'} y2={'85'} stroke="#facc15" strokeWidth="6"/>
    </svg>
);

export const RunnerCharacter: React.FC<CharacterProps> = ({ isMoving }) => {
  const [pose, setPose] = useState<1 | 2>(1);

  useEffect(() => {
    if (!isMoving) return;
    const interval = setInterval(() => {
      setPose(p => (p === 1 ? 2 : 1));
    }, 150);
    return () => clearInterval(interval);
  }, [isMoving]);
  
  return <RunnerSVG pose={isMoving ? pose : 1} />;
};

export const WaverCharacter: React.FC<CharacterProps> = ({ isMoving }) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('character-animations')) return;

    const style = document.createElement('style');
    style.id = 'character-animations';
    style.innerHTML = `
      @keyframes wave {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(25deg); }
      }
      .animate-wave {
        animation: wave 1s ease-in-out infinite;
        transform-origin: 35px 35px;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return <WaverSVG />;
};
